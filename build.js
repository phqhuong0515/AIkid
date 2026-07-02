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
    pants: {},
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
          if (!assets.outfit.pants[key]) assets.outfit.pants[key] = {};
          assets.outfit.pants[key][colorKey] = content;
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
