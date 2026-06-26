const fs = require('fs');
const path = require('path');

const WORKSPACE = __dirname;
const FACIAL_DIR = path.join(WORKSPACE, 'facial');
const CLOTHES_DIR = path.join(WORKSPACE, 'Skin tone (clothes)');
const NO_CLOTHES_DIR = path.join(WORKSPACE, 'Skin tone (no clothes)');

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
    
    // Categorize by prefix, e.g. "ears_1.svg" -> ears, "eyebrow_2.svg" -> eyebrow
    const categories = ['ears', 'eyebrow', 'eyes', 'face', 'mouth', 'nose'];
    let matched = false;
    
    for (const cat of categories) {
      if (name.startsWith(cat)) {
        const indexMatch = name.match(/\d+/);
        const key = indexMatch ? parseInt(indexMatch[0], 10) : 'default';
        assets.facial[cat][key] = content;
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

console.log('Bundling assets...');
processSkinTones(CLOTHES_DIR, 'clothes');
processSkinTones(NO_CLOTHES_DIR, 'noClothes');
processFacial();

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
