const fs = require('fs');
const path = require('path');

const WORKSPACE = __dirname;
const FACIAL_DIR = path.join(WORKSPACE, 'facial');
const CLOTHES_DIR = path.join(WORKSPACE, 'Skin tone (clothes)');
const NO_CLOTHES_DIR = path.join(WORKSPACE, 'Skin tone (no clothes)');
const HAIR_DIR = path.join(WORKSPACE, 'Hair');
const OUFIT_DIR = path.join(WORKSPACE, 'oufit');

const assets = {
  skinToneColors: {}, // map of skinIndex -> { primary, shadow }
  body: {
    clothes: { female: {}, male: {} },
    noClothes: { female: {}, male: {} }
  },
  facial: {
    ears: {},
    eyebrow: {},
    eyes: {},
    face: {},
    mouth: {},
    nose: {}
  },
  hair: {
    bang: {},
    behind: {}
  },
  outfit: {
    shirt: { female: {}, male: {} },
    pants: { female: {}, male: {} },
    dress: { female: {}, male: {}, unisex: {} }
  }
};

// Extract skin tone colors from a style block
function extractSkinColors(svgContent) {
  const styleMatch = svgContent.match(/<style>([\s\S]*?)<\/style>/i);
  if (!styleMatch) return null;
  const styleContent = styleMatch[1];
  
  // Find .cls-6{fill: #...} or .cls-6{fill:#...}
  const cls6Match = styleContent.match(/\.cls-6\s*\{\s*fill\s*:\s*([^;\}]+)/);
  const cls7Match = styleContent.match(/\.cls-7\s*\{\s*fill\s*:\s*([^;\}]+)/);
  
  if (cls6Match && cls7Match) {
    return {
      primary: cls6Match[1].trim(),
      shadow: cls7Match[1].trim()
    };
  }
  return null;
}

// Helper to read and clean SVG content
function readSvg(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    // Remove XML declaration and comments
    content = content.replace(/<\?xml[\s\S]*?\?>/g, '');
    content = content.replace(/<!--[\s\S]*?-->/g, '');
    return content.trim();
  } catch (err) {
    console.error(`Error reading ${filePath}:`, err);
    return '';
  }
}

// 1. Process skin tone SVGs (clothes and no clothes)
function processSkinTones(dir, type) {
  if (!fs.existsSync(dir)) {
    console.warn(`Directory not found: ${dir}`);
    return;
  }
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    if (!file.endsWith('.svg')) return;
    
    const filePath = path.join(dir, file);
    const content = readSvg(filePath);
    
    // Parse filename, e.g. "female_skin_1.svg", "male_skin_10.svg", "female.svg", "male.svg"
    const name = path.basename(file, '.svg');
    const gender = name.startsWith('female') ? 'female' : 'male';
    
    const skinIndexMatch = name.match(/skin_(\d+)/);
    if (skinIndexMatch) {
      const index = parseInt(skinIndexMatch[1], 10);
      assets.body[type][gender][index] = content;
      
      // Extract skin colors from female_skin_x.svg to build color map
      if (gender === 'female' && type === 'noClothes') {
        const colors = extractSkinColors(content);
        if (colors) {
          assets.skinToneColors[index] = colors;
          console.log(`Extracted colors for skin ${index}: Primary=${colors.primary}, Shadow=${colors.shadow}`);
        }
      }
    } else {
      // Fallback base file, e.g., "female.svg"
      assets.body[type][gender]['default'] = content;
    }
  });
}

// 2. Process facial SVGs
function processFacial() {
  if (!fs.existsSync(FACIAL_DIR)) {
    console.warn(`Facial directory not found: ${FACIAL_DIR}`);
    return;
  }
  const files = fs.readdirSync(FACIAL_DIR);
  files.forEach(file => {
    if (!file.endsWith('.svg')) return;
    
    const filePath = path.join(FACIAL_DIR, file);
    const content = readSvg(filePath);
    
    const name = path.basename(file, '.svg');
    
    // Special check for face variant files e.g. "face_1_skin_1.svg"
    const faceSkinMatch = name.match(/^face_(\d+)_skin_(\d+)$/i);
    const faceDefaultMatch = name.match(/^face_(\d+)$/i);
    
    if (faceSkinMatch) {
      const styleId = parseInt(faceSkinMatch[1], 10);
      const skinId = parseInt(faceSkinMatch[2], 10);
      assets.facial.face[styleId] = assets.facial.face[styleId] || {};
      assets.facial.face[styleId][skinId] = content;
      return;
    } else if (faceDefaultMatch) {
      const styleId = parseInt(faceDefaultMatch[1], 10);
      assets.facial.face[styleId] = assets.facial.face[styleId] || {};
      assets.facial.face[styleId]['default'] = content;
      return;
    }
    
    // Categorize by prefix, e.g. "ears_1.svg" -> ears, "eyebrow_2.svg" -> eyebrow
    const categories = ['ears', 'eyebrow', 'eyes', 'mouth', 'nose'];
    let matched = false;
    
    for (const cat of categories) {
      if (name.startsWith(cat)) {
        const indexMatch = name.match(/\d+/);
        const key = indexMatch ? parseInt(indexMatch[0], 10) : 'default';
        
        if (cat === 'eyes') {
          const colorMatch = name.match(/_Color\s+(\d+)/i);
          const colorKey = colorMatch ? parseInt(colorMatch[1], 10) : 'default';
          if (!assets.facial.eyes[key]) assets.facial.eyes[key] = {};
          assets.facial.eyes[key][colorKey] = content;
        } else {
          assets.facial[cat][key] = content;
        }
        
        matched = true;
        break;
      }
    }
    
    if (!matched) {
      // Any other SVG files, like "positioning.svg" or "eyes color.svg"
      if (!assets.facial.others) assets.facial.others = {};
      assets.facial.others[name] = content;
    }
  });
}

// 3. Process Hair SVGs (Bangs & Behind) recursively
function processHair() {
  if (!fs.existsSync(HAIR_DIR)) {
    console.warn(`Hair directory not found: ${HAIR_DIR}`);
    return;
  }
  
  function scanDir(dir) {
    const items = fs.readdirSync(dir);
    items.forEach(item => {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        scanDir(fullPath);
      } else if (stat.isFile() && item.endsWith('.svg')) {
        const content = readSvg(fullPath);
        const name = path.basename(item, '.svg');
        
        // Parse style index (e.g. "Bang 1" -> styleKey = 1)
        const styleMatch = name.match(/^(Bang|Behind)\s+(\d+)/i);
        if (!styleMatch) return;
        
        const styleType = styleMatch[1].toLowerCase(); // "bang" or "behind"
        const styleKey = parseInt(styleMatch[2], 10);
        
        // Parse color index (e.g. "Bang 1_Color 5" -> colorKey = 5)
        const colorMatch = name.match(/_Color\s+(\d+)/i);
        const colorKey = colorMatch ? parseInt(colorMatch[1], 10) : 'default';
        
        if (!assets.hair[styleType][styleKey]) {
          assets.hair[styleType][styleKey] = {};
        }
        assets.hair[styleType][styleKey][colorKey] = content;
      }
    });
  }
  
  scanDir(HAIR_DIR);
}

// Gradient stops helper for dynamically colorizing skirts
const colorStops = {
  1: `<stop stop-color="#262626"/><stop offset="0.21" stop-color="#242424"/><stop offset="0.47" stop-color="#1C1C1C"/><stop offset="0.77" stop-color="#101010"/><stop offset="1" stop-color="#050505"/>`,
  2: `<stop stop-color="#FF201C"/><stop offset="0.21" stop-color="#FF1A16"/><stop offset="0.47" stop-color="#FF0A06"/><stop offset="0.77" stop-color="#EA0400"/><stop offset="1" stop-color="#D10300"/>`,
  3: `<stop stop-color="#FFD97B"/><stop offset="0.21" stop-color="#FFD775"/><stop offset="0.47" stop-color="#FFD365"/><stop offset="0.77" stop-color="#FFCB4A"/><stop offset="1" stop-color="#FFC431"/>`,
  4: `<stop stop-color="#12C646"/><stop offset="0.21" stop-color="#12C144"/><stop offset="0.47" stop-color="#10B23F"/><stop offset="0.77" stop-color="#0E9936"/><stop offset="1" stop-color="#0C822E"/>`,
  5: `<stop stop-color="#6ECFAC"/><stop offset="0.21" stop-color="#6ACEA9"/><stop offset="0.47" stop-color="#5ECAA2"/><stop offset="0.77" stop-color="#49C397"/><stop offset="1" stop-color="#3DB78A"/>`,
  6: `<stop stop-color="#70CEF4"/><stop offset="0.21" stop-color="#6ACDF4"/><stop offset="0.47" stop-color="#5BC8F3"/><stop offset="0.77" stop-color="#42BFF1"/><stop offset="1" stop-color="#2BB7EF"/>`,
  7: `<stop stop-color="#3362D6"/><stop offset="0.21" stop-color="#2E5ED5"/><stop offset="0.47" stop-color="#2857CB"/><stop offset="0.77" stop-color="#244DB4"/><stop offset="1" stop-color="#2045A0"/>`,
  8: `<stop stop-color="#7532CC"/><stop offset="0.21" stop-color="#7231C7"/><stop offset="0.47" stop-color="#6B2EBA"/><stop offset="0.77" stop-color="#5E28A5"/><stop offset="1" stop-color="#532491"/>`,
  9: `<stop stop-color="#FF89B0"/><stop offset="0.21" stop-color="#FF83AB"/><stop offset="0.47" stop-color="#FF73A1"/><stop offset="0.77" stop-color="#FF588E"/><stop offset="1" stop-color="#FF3F7E"/>`,
  10: `<stop stop-color="#E6E6E6"/><stop offset="0.21" stop-color="#E1E1E1"/><stop offset="0.47" stop-color="#D6D6D6"/><stop offset="0.77" stop-color="#C4C4C4"/><stop offset="1" stop-color="#B3B3B3"/>`
};

function replaceGradientStops(svgContent, colorIndex) {
  const stopsHtml = colorStops[colorIndex];
  return svgContent.replace(/(<linearGradient[^>]*>)([\s\S]*?)(<\/linearGradient>)/i, (match, p1, p2, p3) => {
    return p1 + '\n' + stopsHtml + '\n' + p3;
  });
}

// 4. Process Outfit SVGs (Shirts, Pants, Dresses) recursively
function processOutfit() {
  if (!fs.existsSync(OUFIT_DIR)) {
    console.warn(`Outfit directory not found: ${OUFIT_DIR}`);
    return;
  }
  
  function scanDir(dir) {
    const items = fs.readdirSync(dir);
    items.forEach(item => {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        scanDir(fullPath);
      } else if (stat.isFile() && item.endsWith('.svg')) {
        const content = readSvg(fullPath);
        const name = path.basename(item, '.svg');
        
        const indexMatch = name.match(/\d+/);
        if (!indexMatch) return;
        const key = parseInt(indexMatch[0], 10);
        
        const colorMatch = name.match(/_Color\s+(\d+)/i);
        const colorKey = colorMatch ? parseInt(colorMatch[1], 10) : 'default';
        
        const lowerName = name.toLowerCase();
        if (lowerName.startsWith('pants')) {
          if (!assets.outfit.pants.female[key]) assets.outfit.pants.female[key] = {};
          if (!assets.outfit.pants.male[key]) assets.outfit.pants.male[key] = {};
          assets.outfit.pants.female[key][colorKey] = content;
          assets.outfit.pants.male[key][colorKey] = content;
        } else if (lowerName.startsWith('skirt')) {
          const skirtKey = key + 3; // skirt 1 -> index 4, skirt 2 -> index 5, etc.
          if (!assets.outfit.pants.female[skirtKey]) assets.outfit.pants.female[skirtKey] = {};
          for (let c = 1; c <= 10; c++) {
            assets.outfit.pants.female[skirtKey][c] = replaceGradientStops(content, c);
          }
          assets.outfit.pants.female[skirtKey]['default'] = content;
        } else if (lowerName.startsWith('shirt male')) {
          if (!assets.outfit.shirt.male[key]) assets.outfit.shirt.male[key] = {};
          assets.outfit.shirt.male[key][colorKey] = content;
        } else if (lowerName.startsWith('shirt female') || lowerName.startsWith('shirt frmale')) {
          if (!assets.outfit.shirt.female[key]) assets.outfit.shirt.female[key] = {};
          assets.outfit.shirt.female[key][colorKey] = content;
        } else if (lowerName.startsWith('dress chung')) {
          assets.outfit.dress.unisex[key] = content;
        } else if (lowerName.startsWith('dress female')) {
          assets.outfit.dress.female[key] = content;
        } else if (lowerName.startsWith('dress male')) {
          assets.outfit.dress.male[key] = content;
        }
      }
    });
  }
  
  scanDir(OUFIT_DIR);
}

console.log('Bundling assets...');
processSkinTones(CLOTHES_DIR, 'clothes');
processSkinTones(NO_CLOTHES_DIR, 'noClothes');
processFacial();
processHair();
processOutfit();

// Add manual color fallbacks if any extraction failed or was incomplete
const defaultColors = {
  1: { primary: '#ffe7e6', shadow: '#ffcccc' },
  2: { primary: '#f6d9d4', shadow: '#ebb7b1' },
  3: { primary: '#ebd1c6', shadow: '#dcb1a1' },
  4: { primary: '#dfc2b6', shadow: '#d09f8f' },
  5: { primary: '#d7b3a4', shadow: '#c48f7b' },
  6: { primary: '#cfa995', shadow: '#bb8166' },
  7: { primary: '#bf967f', shadow: '#ab6f52' },
  8: { primary: '#ac8168', shadow: '#965a3d' },
  9: { primary: '#956b54', shadow: '#7d4930' },
  10: { primary: '#724c3a', shadow: '#593221' }
};

// Ensure all indices from 1 to 10 have colors
for (let i = 1; i <= 10; i++) {
  if (!assets.skinToneColors[i]) {
    assets.skinToneColors[i] = defaultColors[i];
  }
}

const outputPath = path.join(WORKSPACE, 'assets.js');
const jsContent = `// Auto-generated SVG assets file. Do not edit directly.
const meeAssets = ${JSON.stringify(assets, null, 2)};
`;

fs.writeFileSync(outputPath, jsContent, 'utf8');
console.log(`Assets bundled successfully to ${outputPath}`);
