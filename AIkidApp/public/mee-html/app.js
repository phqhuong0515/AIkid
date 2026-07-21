// Global State
const state = {
  gender: 'male', // 'female' or 'male'
  skinTone: 1, // 1 to 10
  eyes: 1, // 1 to 11
  eyebrows: 1, // 1 to 7
  nose: 1,
  mouth: 1,
  eyebrowsColorIndex: 1, // 1 to 20
  syncEyebrowsColor: true,
  hairColor: 1, // 1 to 20
  customPrimaryColor: null,
  customShadowColor: null,
  recoloredEars: null,
  // New Categories
  face: 1, // 1 to 6
  bang: 1, // 1 to 9
  behind: 1, // 1 to 8
  shirt: 0, // 0 = None, 1 to 3
  pants: 0, // 0 = None, 1 to 3
  dress: 0, // 0 = None, 1 to 2
  shirtColor: 2, // 2 = Red (default)
  pantsColor: 3, // 3 = Yellow (default)
  eyesColor: 1,  // 1 = Black (default)
  backgroundColor: '#ffffff',
  backgroundType: 'light',
  backgroundImageUrl: ''
};

const pastelBackgroundColors = [
  { index: 1, base: '#ffffff', name: 'Trắng (White)' },
  { index: 2, base: '#f1f3f5', name: 'Xám (Grey)' },
  { index: 3, base: '#ffe0e3', name: 'Đỏ (Red)' },
  { index: 4, base: '#fff3e0', name: 'Cam (Orange)' },
  { index: 5, base: '#fffde7', name: 'Vàng (Yellow)' },
  { index: 6, base: '#eafaf1', name: 'Xanh lá (Green)' },
  { index: 7, base: '#e0f7fa', name: 'Xanh da trời (Light Blue)' },
  { index: 8, base: '#e8f0fe', name: 'Xanh nước biển (Dark Blue)' },
  { index: 9, base: '#f3e8ff', name: 'Tím (Purple)' },
  { index: 10, base: '#fff0f6', name: 'Hồng (Pink)' }
];

const darkBackgroundColors = [
  { index: 1, base: '#5a6270', name: 'Xám pastel đậm (Dark Grey)' },
  { index: 2, base: '#8b1e22', name: 'Đỏ đô (Maroon)' },
  { index: 3, base: '#c2410c', name: 'Cam đô (Burnt Orange)' },
  { index: 4, base: '#eab308', name: 'Vàng thư (Golden Yellow)' },
  { index: 5, base: '#1b4d3e', name: 'Xanh lá đậm (Dark Green)' },
  { index: 6, base: '#0891b2', name: 'Xanh Cyan (Cyan)' },
  { index: 7, base: '#1a365d', name: 'Xanh biển đậm (Dark Blue)' },
  { index: 8, base: '#581c87', name: 'Tím đậm (Dark Purple)' },
  { index: 9, base: '#d84b65', name: 'Hồng đào đậm (Dark Peach)' },
  { index: 10, base: '#282c34', name: 'Đen xám pastel (Dark Charcoal)' }
];

// Available colors for outfits (10 colors extracted from palette)
const outfitColors = [
  { index: 1, base: '#000000', name: 'Đen (Black)' },
  { index: 2, base: '#F70400', name: 'Đỏ (Red)' },
  { index: 3, base: '#FFC431', name: 'Vàng (Yellow)' },
  { index: 4, base: '#0FA53A', name: 'Xanh lá (Green)' },
  { index: 5, base: '#53C69C', name: 'Xanh ngọc (Teal)' },
  { index: 6, base: '#4EC3F2', name: 'Xanh nhạt (Light Blue)' },
  { index: 7, base: '#2652BF', name: 'Xanh dương (Blue)' },
  { index: 8, base: '#642BAF', name: 'Tím (Purple)' },
  { index: 9, base: '#FF6597', name: 'Hồng (Pink)' },
  { index: 10, base: '#D8D8D8', name: 'Xám (Grey)' }
];

const eyeColors = [
  { index: 1, base: '#000000', name: 'Đen (Black)' },
  { index: 2, base: '#f70400', name: 'Đỏ (Red)' },
  { index: 11, base: '#5D371A', name: 'Nâu (Brown)' },
  { index: 3, base: '#fbc004', name: 'Vàng (Yellow)' },
  { index: 4, base: '#0fa53a', name: 'Xanh lá (Green)' },
  { index: 5, base: '#4df4b8', name: 'Xanh ngọc (Teal)' },
  { index: 6, base: '#4ec3f2', name: 'Xanh nhạt (Light Blue)' },
  { index: 7, base: '#2652bf', name: 'Xanh dương (Blue)' },
  { index: 8, base: '#642baf', name: 'Tím (Purple)' },
  { index: 9, base: '#ff6597', name: 'Hồng (Pink)' },
  { index: 10, base: '#d8d8d8', name: 'Xám (Grey)' }
];

// Available colors for hair and eyebrows (20 colors from Palette 1 & Palette 2)
const hairColors = [
  { index: 11, name: 'Color 11', base: '#000000', highlight: '#5f5f5f' }, // Black
  { index: 12, name: 'Color 12', base: '#ea0a08', highlight: '#f87f8e' }, // Bright Red
  { index: 1, name: 'Color 1', base: '#8a2827', highlight: '#be605e' },   // Dark Red
  { index: 5, name: 'Color 5', base: '#dd4e30', highlight: '#ee8363' },   // Orange/Red
  { index: 4, name: 'Color 4', base: '#553a2c', highlight: '#937a6f' },   // Dark Brown
  { index: 2, name: 'Color 2', base: '#d9c092', highlight: '#f1e7b4' },   // Beige
  { index: 3, name: 'Color 3', base: '#f7dd7e', highlight: '#fbf6d0' },   // Blonde/Yellow
  { index: 13, name: 'Color 13', base: '#eee646', highlight: '#f3f3b7' }, // Lime/Yellow-Green
  { index: 14, name: 'Color 14', base: '#d3f587', highlight: '#f7fdda' }, // Light Green
  { index: 15, name: 'Color 15', base: '#45c7bb', highlight: '#8eebea' }, // Mint
  { index: 6, name: 'Color 6', base: '#225358', highlight: '#3b767a' },   // Teal
  { index: 16, name: 'Color 16', base: '#7ab9ec', highlight: '#94c6f0' }, // Sky Blue
  { index: 17, name: 'Color 17', base: '#1a4592', highlight: '#2f68b6' }, // Royal Blue
  { index: 7, name: 'Color 7', base: '#222665', highlight: '#565ca6' },   // Indigo
  { index: 18, name: 'Color 18', base: '#66489a', highlight: '#a98ce5' }, // Purple
  { index: 8, name: 'Color 8', base: '#8f2f55', highlight: '#d57f98' },   // Magenta
  { index: 9, name: 'Color 9', base: '#d26673', highlight: '#dd8696' },   // Pink/Rose
  { index: 19, name: 'Color 19', base: '#fca4b4', highlight: '#fbd0e1' }, // Baby Pink
  { index: 10, name: 'Color 10', base: '#9fa3bc', highlight: '#c8cee6' }, // Lavender
  { index: 20, name: 'Color 20', base: '#d8dbe2', highlight: '#fdfeff' }  // Light Gray/White
];

// Helper to extract inner content of an SVG string (everything inside <svg>...</svg>)
function getSvgInnerContent(svgString) {
  if (!svgString) return '';
  const match = svgString.match(/<svg[\s\S]*?>([\s\S]*?)<\/svg>/i);
  return match ? match[1] : svgString;
}

// Helper to extract viewBox from SVG string
function getSvgViewBox(svgString) {
  if (!svgString) return '0 0 100 100';
  const match = svgString.match(/viewBox=["']([^"']+)["']/i);
  return match ? match[1] : '0 0 100 100';
}

// Helper to extract base64 image hrefs from an SVG string
function extractBase64Images(svgString) {
  const regex = /href=["'](data:image\/png;base64,[^"']+)["']/gi;
  const images = [];
  let match;
  while ((match = regex.exec(svgString)) !== null) {
    images.push(match[1]);
  }
  return images;
}

// Helper to extract both CSS styles and defs from an SVG string and remove them
function extractStylesAndDefs(svgString, stylesArray, defsArray, scopeSelector) {
  if (!svgString) return '';
  let cleanSvg = svgString;

  // Extract styles
  const styleRegex = /<style>([\s\S]*?)<\/style>/gi;
  let styleMatch;
  while ((styleMatch = styleRegex.exec(cleanSvg)) !== null) {
    let css = styleMatch[1];
    if (scopeSelector) {
      css = css.replace(/(\.cls-\d+)/g, `${scopeSelector} $1`);
    }
    stylesArray.push(css);
  }
  cleanSvg = cleanSvg.replace(styleRegex, '');

  // Extract defs
  const defsRegex = /<defs>([\s\S]*?)<\/defs>/gi;
  let defsMatch;
  while ((defsMatch = defsRegex.exec(cleanSvg)) !== null) {
    defsArray.push(defsMatch[1]);
  }
  cleanSvg = cleanSvg.replace(defsRegex, '');

  return cleanSvg;
}

// Helper to scope CSS selectors inside a <style> block to a specific selector
function scopeSvgStyles(svgString, scopeSelector) {
  if (!svgString) return '';
  return svgString.replace(/<style>([\s\S]*?)<\/style>/gi, (match, styleContent) => {
    // Replace class selectors like .cls-1 with scopeSelector .cls-1
    const scopedStyles = styleContent.replace(/(\.cls-\d+)/g, `${scopeSelector} $1`);
    return `<style>${scopedStyles}</style>`;
  });
}

// Helper to make IDs and their references inside an SVG string unique
function makeSvgIdsUnique(svgString, prefix) {
  if (!svgString) return '';
  let result = svgString;
  const idRegex = /\bid=["']([^"']+)["']/g;
  const ids = [];
  let match;
  while ((match = idRegex.exec(svgString)) !== null) {
    ids.push(match[1]);
  }

  if (ids.length === 0) return svgString;

  ids.sort((a, b) => b.length - a.length);
  const uniqueIds = [...new Set(ids)];

  uniqueIds.forEach(id => {
    const newId = `${prefix}-${id}`;
    result = result.replace(new RegExp(`\\bid=(["'])${id}\\1`, 'g'), `id=$1${newId}$1`);
    result = result.replace(new RegExp(`url\\(#${id}\\)`, 'g'), `url(#${newId})`);
    result = result.replace(new RegExp(`xlink:href=(["'])#${id}\\1`, 'g'), `xlink:href=$1#${newId}$1`);
    result = result.replace(new RegExp(`href=(["'])#${id}\\1`, 'g'), `href=$1#${newId}$1`);
  });

  return result;
}

// Helper to compute the geometric center (X, Y) of an SVG's visual elements
function getSvgElementCenter(svgString) {
  if (!svgString) return null;

  // Create a temporary hidden container to measure the elements via native DOM
  const tempDiv = document.createElement('div');
  tempDiv.style.cssText = 'position: absolute; top: -9999px; left: -9999px; visibility: hidden; width: 500px; height: 500px;';
  tempDiv.innerHTML = svgString;
  document.body.appendChild(tempDiv);

  const svg = tempDiv.querySelector('svg');
  if (!svg) {
    document.body.removeChild(tempDiv);
    return null;
  }

  // Wrap all children (except defs, style) in a temporary <g> element to compute bounding box including parent transforms
  const wrapperG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  const children = Array.from(svg.children).filter(el => {
    const tag = el.tagName.toLowerCase();
    return tag !== 'defs' && tag !== 'style';
  });

  children.forEach(child => wrapperG.appendChild(child));
  svg.appendChild(wrapperG);

  let bbox = null;
  try {
    bbox = wrapperG.getBBox();
  } catch (e) {
    // getBBox might fail if element is not fully renderable, ignore
  }

  document.body.removeChild(tempDiv);

  if (!bbox || (bbox.width === 0 && bbox.height === 0 && bbox.x === 0 && bbox.y === 0)) {
    // Fallback to parsing viewBox if getBBox failed
    const viewBoxStr = svg.getAttribute('viewBox') || '0 0 100 100';
    const [vx, vy, vw, vh] = viewBoxStr.split(/\s+/).map(parseFloat);
    return { x: vw / 2, y: vh / 2, top: vy, height: vh, width: vw };
  }

  return {
    x: bbox.x + bbox.width / 2,
    y: bbox.y + bbox.height / 2,
    top: bbox.y,
    height: bbox.height,
    width: bbox.width
  };
}

// Global cache for recolored ears base64 to prevent redundant calculations
const earsCache = {};

// Helper to smoothly recolor ears base64 PNG images using a canvas
function recolorEars(earsSvgString, oldPrimaryHex, oldShadowHex, newPrimaryHex, newShadowHex, callback) {
  const images = extractBase64Images(earsSvgString);
  if (images.length < 2) {
    callback(images);
    return;
  }

  let loadedCount = 0;
  const newImages = [];

  // Parse hex colors to RGB
  const parseHex = (hex) => {
    const clean = hex.replace('#', '');
    const num = parseInt(clean, 16);
    return {
      r: (num >> 16) & 255,
      g: (num >> 8) & 255,
      b: num & 255
    };
  };

  const oldPrimary = parseHex(oldPrimaryHex);
  const oldShadow = parseHex(oldShadowHex);
  const newPrimary = parseHex(newPrimaryHex);
  const newShadow = parseHex(newShadowHex);

  images.forEach((base64, index) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);

      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imgData.data;

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const a = data[i + 3];
        if (a === 0) continue;

        // Calculate Euclidean color distance to old base and shadow colors
        const distPrimary = Math.sqrt((r - oldPrimary.r) ** 2 + (g - oldPrimary.g) ** 2 + (b - oldPrimary.b) ** 2);
        const distShadow = Math.sqrt((r - oldShadow.r) ** 2 + (g - oldShadow.g) ** 2 + (b - oldShadow.b) ** 2);
        const totalDist = distPrimary + distShadow;

        // Smoothly interpolate between custom base and shadow based on distance ratio
        const ratio = totalDist === 0 ? 0 : distPrimary / totalDist;

        data[i] = Math.round(newPrimary.r * (1 - ratio) + newShadow.r * ratio);
        data[i + 1] = Math.round(newPrimary.g * (1 - ratio) + newShadow.g * ratio);
        data[i + 2] = Math.round(newPrimary.b * (1 - ratio) + newShadow.b * ratio);
      }

      ctx.putImageData(imgData, 0, 0);
      newImages[index] = canvas.toDataURL('image/png');

      loadedCount++;
      if (loadedCount === images.length) {
        callback(newImages);
      }
    };
    img.src = base64;
  });
}

function recolorAndRefreshEars() {
  const colors = meeAssets.skinToneColors[state.skinTone];
  const primarySkinColor = colors.primary;
  const shadowSkinColor = colors.shadow;

  const targetPrimary = state.customPrimaryColor || primarySkinColor;
  const targetShadow = state.customShadowColor || shadowSkinColor;

  // If no custom overrides are defined, use default skin tone preset directly
  if (!state.customPrimaryColor && !state.customShadowColor) {
    state.recoloredEars = null;
    updatePreview();
    return;
  }

  const cacheKey = `${state.skinTone}_${targetPrimary}_${targetShadow}`;
  if (earsCache[cacheKey]) {
    state.recoloredEars = earsCache[cacheKey];
    updatePreview();
    return;
  }

  const earsSvg = meeAssets.facial.ears[state.skinTone];
  if (!earsSvg) {
    state.recoloredEars = null;
    updatePreview();
    return;
  }

  recolorEars(earsSvg, primarySkinColor, shadowSkinColor, targetPrimary, targetShadow, (newImages) => {
    earsCache[cacheKey] = newImages;
    state.recoloredEars = newImages;
    updatePreview();
  });
}

// State history tracking for undo/redo functionality
let stateHistory = [];
let redoHistory = [];
const maxHistory = 50;

function pushStateToHistory() {
  const stateClone = JSON.stringify(state);
  // Only push if different from last item
  if (stateHistory.length === 0 || stateHistory[stateHistory.length - 1] !== stateClone) {
    stateHistory.push(stateClone);
    if (stateHistory.length > maxHistory) {
      stateHistory.shift();
    }
    // Clear redo history on new action
    redoHistory = [];
  }
}

function undoState() {
  if (stateHistory.length > 1) {
    const currentState = stateHistory.pop();
    redoHistory.push(currentState);
    const previousState = JSON.parse(stateHistory[stateHistory.length - 1]);
    Object.assign(state, previousState);
    syncUIControls();
    recolorAndRefreshEars();
  } else {
    alert("Không có thao tác nào để hoàn tác!");
  }
}

function redoState() {
  if (redoHistory.length > 0) {
    const nextState = redoHistory.pop();
    stateHistory.push(nextState);
    Object.assign(state, JSON.parse(nextState));
    syncUIControls();
    recolorAndRefreshEars();
  } else {
    alert("Không có thao tác nào để làm lại!");
  }
}

// Generate UI control elements
function initUI() {
  // 1. Render Skin Tones
  const skinPicker = document.getElementById('skin-tone-picker');
  skinPicker.innerHTML = '';
  Object.keys(meeAssets.skinToneColors).forEach(index => {
    const colorInfo = meeAssets.skinToneColors[index];
    const swatch = document.createElement('div');
    swatch.className = `skin-swatch ${parseInt(index) === state.skinTone ? 'active' : ''}`;
    swatch.style.backgroundColor = colorInfo.primary;
    swatch.title = `Skin Tone ${index}`;
    swatch.dataset.index = index;
    swatch.addEventListener('click', () => {
      document.querySelectorAll('.skin-swatch').forEach(s => s.classList.remove('active'));
      swatch.classList.add('active');
      state.skinTone = parseInt(index);

      // Clear custom color overrides and sync pickers to the selected preset values
      state.customPrimaryColor = null;
      state.customShadowColor = null;

      const customBase = document.getElementById('custom-skin-base');
      const customShading = document.getElementById('custom-skin-shading');
      if (customBase) customBase.value = colorInfo.primary;
      if (customShading) customShading.value = colorInfo.shadow;

      // Sync skin labels
      document.getElementById('active-skin-label').textContent = `Màu ${index}`;
      document.getElementById('active-skin-hex').textContent = colorInfo.primary.toUpperCase();

      recolorAndRefreshEars();
    });
    skinPicker.appendChild(swatch);
  });

  // Auto-calculation of shading color from skin base color
  function calculateShadingColor(hex) {
    let r = parseInt(hex.substring(1, 3), 16);
    let g = parseInt(hex.substring(3, 5), 16);
    let b = parseInt(hex.substring(5, 7), 16);

    r /= 255; g /= 255; b /= 255;
    let max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
      h = s = 0;
    } else {
      let d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }

    let hDeg = h * 360;
    if (hDeg > 15 && hDeg < 50) {
      hDeg -= 4; // Shift toward red
    }
    h = hDeg / 360;

    s = Math.min(1, s * 1.08); // Slight increase in saturation
    l = Math.max(0, l * 0.86); // Drop lightness by 14% to darken

    let q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    let p = 2 * l - q;
    function hue2rgb(p, q, t) {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    }
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);

    const toHex = val => {
      let str = Math.round(val * 255).toString(16);
      return str.length === 1 ? '0' + str : str;
    };
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  }

  // Custom Canvas Color Picker logic
  function initCanvasColorPicker() {
    try {
      const canvas = document.getElementById('skin-color-picker-canvas');
      if (!canvas) return;
      const ctx = canvas.getContext('2d');

    const sliderR = document.getElementById('rgb-slider-r');
    const sliderG = document.getElementById('rgb-slider-g');
    const sliderB = document.getElementById('rgb-slider-b');
    const valR = document.getElementById('rgb-val-r');
    const valG = document.getElementById('rgb-val-g');
    const valB = document.getElementById('rgb-val-b');
    const customBaseInput = document.getElementById('custom-skin-base');
    const customShadingInput = document.getElementById('custom-skin-shading');

    const width = canvas.width;
    const height = canvas.height;
    const center = width / 2;
    const outerRadius = width / 2 - 4;
    const innerRadius = outerRadius - 18;
    const sqSize = Math.round(innerRadius * Math.sqrt(2)) - 8;
    const sqX = center - sqSize / 2;
    const sqY = center - sqSize / 2;

    let currentHue = 0;
    let currentSat = 100;
    let currentVal = 100;

    function hexToRgb(hex) {
      let r = parseInt(hex.substring(1, 3), 16);
      let g = parseInt(hex.substring(3, 5), 16);
      let b = parseInt(hex.substring(5, 7), 16);
      return { r, g, b };
    }

    function rgbToHex(r, g, b) {
      const toHex = val => {
        let str = Math.round(val).toString(16);
        return str.length === 1 ? '0' + str : str;
      };
      return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
    }

    function rgbToHsv(r, g, b) {
      r /= 255; g /= 255; b /= 255;
      let max = Math.max(r, g, b), min = Math.min(r, g, b);
      let h, s, v = max;
      let d = max - min;
      s = max === 0 ? 0 : d / max;

      if (max === min) {
        h = 0;
      } else {
        switch (max) {
          case r: h = (g - b) / d + (g < b ? 6 : 0); break;
          case g: h = (b - r) / d + 2; break;
          case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
      }
      return { h: Math.round(h * 360), s: Math.round(s * 100), v: Math.round(v * 100) };
    }

    function hsvToRgb(h, s, v) {
      s /= 100; v /= 100;
      let c = v * s;
      let x = c * (1 - Math.abs((h / 60) % 2 - 1));
      let m = v - c;
      let r = 0, g = 0, b = 0;

      if (h >= 0 && h < 60) { r = c; g = x; }
      else if (h >= 60 && h < 120) { r = x; g = c; }
      else if (h >= 120 && h < 180) { g = c; b = x; }
      else if (h >= 180 && h < 240) { g = x; b = c; }
      else if (h >= 240 && h < 300) { r = x; b = c; }
      else if (h >= 300 && h <= 360) { r = c; b = x; }

      return {
        r: Math.round((r + m) * 255),
        g: Math.round((g + m) * 255),
        b: Math.round((b + m) * 255)
      };
    }

    function draw() {
      ctx.clearRect(0, 0, width, height);

      // 1. Draw Hue Ring
      ctx.save();
      ctx.beginPath();
      ctx.arc(center, center, outerRadius, 0, Math.PI * 2);
      ctx.arc(center, center, innerRadius, 0, Math.PI * 2, true);
      ctx.clip();

      const gradient = ctx.createConicGradient(0, center, center);
      gradient.addColorStop(0, 'hsl(0, 100%, 50%)');
      gradient.addColorStop(1 / 6, 'hsl(60, 100%, 50%)');
      gradient.addColorStop(2 / 6, 'hsl(120, 100%, 50%)');
      gradient.addColorStop(3 / 6, 'hsl(180, 100%, 50%)');
      gradient.addColorStop(4 / 6, 'hsl(240, 100%, 50%)');
      gradient.addColorStop(5 / 6, 'hsl(300, 100%, 50%)');
      gradient.addColorStop(1, 'hsl(360, 100%, 50%)');

      ctx.fillStyle = gradient;
      ctx.fill();
      ctx.restore();

      // 2. Draw Saturation-Value Square
      ctx.fillStyle = `hsl(${currentHue}, 100%, 50%)`;
      ctx.fillRect(sqX, sqY, sqSize, sqSize);

      let whiteGrad = ctx.createLinearGradient(sqX, 0, sqX + sqSize, 0);
      whiteGrad.addColorStop(0, 'rgba(255,255,255,1)');
      whiteGrad.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = whiteGrad;
      ctx.fillRect(sqX, sqY, sqSize, sqSize);

      let blackGrad = ctx.createLinearGradient(0, sqY, 0, sqY + sqSize);
      blackGrad.addColorStop(0, 'rgba(0,0,0,0)');
      blackGrad.addColorStop(1, 'rgba(0,0,0,1)');
      ctx.fillStyle = blackGrad;
      ctx.fillRect(sqX, sqY, sqSize, sqSize);

      // 3. Draw Hue Ring Target
      const angle = (currentHue * Math.PI) / 180;
      const selectorRadius = (outerRadius + innerRadius) / 2;
      const selX = center + selectorRadius * Math.cos(angle);
      const selY = center + selectorRadius * Math.sin(angle);

      ctx.beginPath();
      ctx.arc(selX, selY, 5, 0, Math.PI * 2);
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
      ctx.shadowBlur = 4;
      ctx.stroke();
      ctx.shadowColor = 'transparent';

      // 4. Draw SV Square Target
      const targetX = sqX + (currentSat / 100) * sqSize;
      const targetY = sqY + ((100 - currentVal) / 100) * sqSize;

      ctx.beginPath();
      ctx.arc(targetX, targetY, 5, 0, Math.PI * 2);
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
      ctx.shadowBlur = 4;
      ctx.stroke();
      ctx.shadowColor = 'transparent';
    }

    function updateFromHsv() {
      const rgb = hsvToRgb(currentHue, currentSat, currentVal);
      sliderR.value = rgb.r;
      sliderG.value = rgb.g;
      sliderB.value = rgb.b;
      valR.textContent = rgb.r;
      valG.textContent = rgb.g;
      valB.textContent = rgb.b;

      const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
      const shadingHex = calculateShadingColor(hex);

      customBaseInput.value = hex;
      customShadingInput.value = shadingHex;

      state.customPrimaryColor = hex;
      state.customShadowColor = shadingHex;
      document.querySelectorAll('.skin-swatch').forEach(s => s.classList.remove('active'));
      document.getElementById('active-skin-hex').textContent = hex.toUpperCase();
      recolorAndRefreshEars();

      draw();
    }

    function updateFromRgb() {
      const r = parseInt(sliderR.value);
      const g = parseInt(sliderG.value);
      const b = parseInt(sliderB.value);

      valR.textContent = r;
      valG.textContent = g;
      valB.textContent = b;

      const hsv = rgbToHsv(r, g, b);
      currentHue = hsv.h;
      currentSat = hsv.s;
      currentVal = hsv.v;

      const hex = rgbToHex(r, g, b);
      const shadingHex = calculateShadingColor(hex);

      customBaseInput.value = hex;
      customShadingInput.value = shadingHex;

      state.customPrimaryColor = hex;
      state.customShadowColor = shadingHex;
      document.querySelectorAll('.skin-swatch').forEach(s => s.classList.remove('active'));
      document.getElementById('active-skin-hex').textContent = hex.toUpperCase();
      recolorAndRefreshEars();

      draw();
    }

    function handleInput(e) {
      const rect = canvas.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;

      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      const canvasX = (clientX - rect.left) * scaleX;
      const canvasY = (clientY - rect.top) * scaleY;

      const x = canvasX - center;
      const y = canvasY - center;

      const distance = Math.sqrt(x * x + y * y);

      if (distance >= innerRadius - 2 && distance <= outerRadius + 2) {
        let angle = Math.atan2(y, x);
        if (angle < 0) angle += Math.PI * 2;
        currentHue = Math.round((angle * 180) / Math.PI) % 360;
        updateFromHsv();
        return true;
      }

      const relativeX = canvasX - sqX;
      const relativeY = canvasY - sqY;
      if (relativeX >= 0 && relativeX <= sqSize && relativeY >= 0 && relativeY <= sqSize) {
        currentSat = Math.round((relativeX / sqSize) * 100);
        currentVal = Math.round((1 - (relativeY / sqSize)) * 100);
        updateFromHsv();
        return true;
      }
      return false;
    }

    let isDragging = false;
    canvas.addEventListener('mousedown', (e) => {
      isDragging = handleInput(e);
    });
    window.addEventListener('mousemove', (e) => {
      if (isDragging) {
        handleInput(e);
      }
    });
    window.addEventListener('mouseup', () => {
      isDragging = false;
    });

    canvas.addEventListener('touchstart', (e) => {
      isDragging = handleInput(e);
      e.preventDefault();
    }, { passive: false });
    window.addEventListener('touchmove', (e) => {
      if (isDragging) {
        handleInput(e);
        e.preventDefault();
      }
    }, { passive: false });
    window.addEventListener('touchend', () => {
      isDragging = false;
    });

    sliderR.addEventListener('input', updateFromRgb);
    sliderG.addEventListener('input', updateFromRgb);
    sliderB.addEventListener('input', updateFromRgb);

    const initHex = customBaseInput.value || "#ffe7e6";
    const initRgb = hexToRgb(initHex);
    sliderR.value = initRgb.r;
    sliderG.value = initRgb.g;
    sliderB.value = initRgb.b;
    valR.textContent = initRgb.r;
    valG.textContent = initRgb.g;
    valB.textContent = initRgb.b;

    const initHsv = rgbToHsv(initRgb.r, initRgb.g, initRgb.b);
    currentHue = initHsv.h;
    currentSat = initHsv.s;
    currentVal = initHsv.v;

      draw();
    } catch (err) {
      console.error("Color Picker Init Error:", err);
      const errEl = document.createElement('div');
      errEl.style.position = 'fixed';
      errEl.style.top = '10px';
      errEl.style.left = '10px';
      errEl.style.background = 'red';
      errEl.style.color = 'white';
      errEl.style.padding = '20px';
      errEl.style.zIndex = '9999999';
      errEl.style.fontSize = '14px';
      errEl.style.whiteSpace = 'pre-wrap';
      errEl.innerText = "Error in Color Picker: " + err.message + "\nStack:\n" + err.stack;
      document.body.appendChild(errEl);
    }
  }
  window.initCanvasColorPicker = initCanvasColorPicker;

  // 1.5. Bind Custom Color inputs
  const customBase = document.getElementById('custom-skin-base');
  const customShading = document.getElementById('custom-skin-shading');
  const enableCustomSkin = document.getElementById('enable-custom-skin');
  const customPickersDiv = document.querySelector('.custom-color-pickers');

  if (enableCustomSkin && customPickersDiv && customBase && customShading) {
    enableCustomSkin.addEventListener('change', (e) => {
      if (e.target.checked) {
        customPickersDiv.style.display = 'flex';
        // Initialize/sync canvas color picker
        initCanvasColorPicker();
      } else {
        customPickersDiv.style.display = 'none';
        state.customPrimaryColor = null;
        state.customShadowColor = null;
      }
      recolorAndRefreshEars();
    });
  }

  // 2. Render Selection Grids (Card Previews)
  renderSelectorGrid('face-picker', 'face', 6, 'face');
  renderSelectorGrid('eyes-picker', 'eyes', 11, 'eyes');
  renderSelectorGrid('eyebrows-picker', 'eyebrow', 7, 'eyebrows');
  renderSelectorGrid('nose-picker', 'nose', 7, 'nose', true);
  renderSelectorGrid('mouth-picker', 'mouth', 14, 'mouth', true);

  // Render new custom grids dynamically based on loaded assets
  renderCustomGrid('bang-picker', 'hair', Object.keys(meeAssets.hair.bang).length, 'bang', false, 'bang');
  renderCustomGrid('behind-picker', 'hair', Object.keys(meeAssets.hair.behind).length, 'behind', true, 'behind');
  renderCustomGrid('shirt-picker', 'outfit', Object.keys(meeAssets.outfit.shirt[state.gender]).length, 'shirt', true, 'shirt');
  renderCustomGrid('pants-picker', 'outfit', Object.keys(meeAssets.outfit.pants[state.gender]).length, 'pants', true, 'pants');
  renderCustomGrid('dress-picker', 'outfit', 1 + Object.keys(meeAssets.outfit.dress[state.gender] || {}).length, 'dress', true, 'dress');

  // 3. Tab switching logic
  document.querySelectorAll('.sidebar-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.sidebar-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

      btn.classList.add('active');
      const tabId = `tab-${btn.dataset.tab}`;
      document.getElementById(tabId).classList.add('active');
    });
  });

  // 4. Gender switch event
  document.querySelectorAll('input[name="gender"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
      state.gender = e.target.value;

      // Reset pants to 0 if out of range for the new gender (e.g. skirt selected, switching to male)
      if (state.pants > Object.keys(meeAssets.outfit.pants[state.gender]).length) {
        state.pants = 0;
      }

      // Re-render gender-specific grids dynamically
      renderCustomGrid('shirt-picker', 'outfit', Object.keys(meeAssets.outfit.shirt[state.gender]).length, 'shirt', true, 'shirt');
      renderCustomGrid('pants-picker', 'outfit', Object.keys(meeAssets.outfit.pants[state.gender]).length, 'pants', true, 'pants');
      renderCustomGrid('dress-picker', 'outfit', 1 + Object.keys(meeAssets.outfit.dress[state.gender] || {}).length, 'dress', true, 'dress');
      updatePreview();
    });
  });

  // 5. Action buttons
  const btnRandom = document.getElementById('btn-random');
  if (btnRandom) {
    btnRandom.addEventListener('click', randomizeCharacter);
  }

  const btnReset = document.getElementById('btn-reset');
  if (btnReset) {
    btnReset.addEventListener('click', resetCharacter);
  }

  const btnUndo = document.getElementById('btn-undo');
  if (btnUndo) {
    btnUndo.addEventListener('click', undoState);
  }

  const btnRedo = document.getElementById('btn-redo');
  if (btnRedo) {
    btnRedo.addEventListener('click', redoState);
  }

  const btnExit = document.getElementById('btn-exit');
  if (btnExit) {
    btnExit.addEventListener('click', () => {
      if (confirm('Bạn có chắc muốn thoát không?')) {
        alert('Tạm biệt!');
      }
    });
  }

  const btnDone = document.getElementById('btn-done');
  if (btnDone) {
    btnDone.addEventListener('click', () => {
      exportAsJPEG();
    });
  }

  // Add hair and eyebrows color pickers
  addHairColorPicker();
  addEyebrowsColorPicker();
  addOutfitColorPickers();
  addEyesColorPicker();
  addBackgroundColorPicker();
}

// Render selector cards with small vector icons
function renderSelectorGrid(containerId, assetKey, count, stateKey, hasNone = false) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = '';

  // Add "None" option if requested
  if (hasNone) {
    const noneCard = document.createElement('div');
    noneCard.className = `selector-card ${state[stateKey] === 0 ? 'active' : ''}`;
    noneCard.dataset.index = 0;
    noneCard.innerHTML = `
      <div style="font-size: 1.8rem; color: var(--text-muted);"><i class="fa-solid fa-ban"></i></div>
      <span class="card-label">None</span>
    `;
    noneCard.addEventListener('click', () => {
      container.querySelectorAll('.selector-card').forEach(c => c.classList.remove('active'));
      noneCard.classList.add('active');
      state[stateKey] = 0;
      updatePreview();
    });
    container.appendChild(noneCard);
  }

  for (let i = 1; i <= count; i++) {
    let svgStr = meeAssets.facial[assetKey][i];
    if (svgStr && typeof svgStr === 'object') {
      if (assetKey === 'eyes') {
        svgStr = svgStr[1] || svgStr['default'] || '';
      } else {
        svgStr = svgStr['default'] || svgStr[1] || '';
      }
    }
    if (!svgStr) continue;

    const card = document.createElement('div');
    card.className = `selector-card ${i === state[stateKey] ? 'active' : ''}`;
    card.dataset.index = i;

    const cardId = `card-selector-${assetKey}-${i}`;
    card.id = cardId;

    // Scope styles and make IDs unique to prevent leakage/collisions
    let scopedSvgStr = makeSvgIdsUnique(svgStr, cardId);
    scopedSvgStr = scopeSvgStyles(scopedSvgStr, `#${cardId}`);

    // Setup nested scaled SVG for preview
    const viewBox = getSvgViewBox(scopedSvgStr);
    const innerContent = getSvgInnerContent(scopedSvgStr);

    // Modify preview colors so lines are visible on dark card backgrounds
    let previewContent = innerContent;
    if (assetKey === 'eyebrow' || assetKey === 'eyes' || assetKey === 'mouth') {
      previewContent = previewContent
        .replace(/fill=["']#000000["']/gi, 'fill="var(--text-muted)"')
        .replace(/fill=["']#000["']/gi, 'fill="var(--text-muted)"')
        .replace(/stroke=["']#000000["']/gi, 'stroke="var(--text-muted)"')
        .replace(/stroke=["']#000["']/gi, 'stroke="var(--text-muted)"');

      card.classList.add('stroke-preview');
    }

    card.innerHTML = `
      <svg viewBox="${viewBox}" xmlns="http://www.w3.org/2000/svg">
        ${previewContent}
      </svg>
      <span class="card-label">${i}</span>
    `;

    card.addEventListener('click', () => {
      container.querySelectorAll('.selector-card').forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      state[stateKey] = i;
      updatePreview();
    });

    container.appendChild(card);
  }
}

// Generic renderer for custom grids (Hair and Outfits)
function renderCustomGrid(containerId, category, count, stateKey, hasNone = false, subCategory = null) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = '';

  // 1. Add "None" option if requested
  if (hasNone) {
    const noneCard = document.createElement('div');
    noneCard.className = `selector-card ${state[stateKey] === 0 ? 'active' : ''}`;
    noneCard.dataset.index = 0;
    noneCard.innerHTML = `
      <div style="font-size: 1.8rem; color: var(--text-muted);"><i class="fa-solid fa-ban"></i></div>
      <span class="card-label">None</span>
    `;
    noneCard.addEventListener('click', () => {
      container.querySelectorAll('.selector-card').forEach(c => c.classList.remove('active'));
      noneCard.classList.add('active');
      state[stateKey] = 0;

      // UX Logic: selecting shirt or pants resets dress, and vice versa
      if (stateKey === 'shirt' || stateKey === 'pants') {
        state.dress = 0;
        const dressContainer = document.getElementById('dress-picker');
        if (dressContainer) {
          dressContainer.querySelectorAll('.selector-card').forEach(c => c.classList.remove('active'));
          const noneDress = dressContainer.querySelector('[data-index="0"]');
          if (noneDress) noneDress.classList.add('active');
        }
      }

      addOutfitColorPickers();
      updatePreview();
    });
    container.appendChild(noneCard);
  }

  // 2. Add asset options
  for (let i = 1; i <= count; i++) {
    let svgStr = '';

    // Retrieve SVG from assets structure
    if (category === 'hair') {
      const hairStyle = meeAssets.hair[subCategory][i];
      svgStr = hairStyle ? (hairStyle['default'] || hairStyle[1]) : '';
    } else if (category === 'outfit') {
      if (subCategory === 'shirt') {
        const shirtStyle = meeAssets.outfit.shirt[state.gender][i];
        svgStr = shirtStyle ? (shirtStyle[state.shirtColor] || shirtStyle['default'] || '') : '';
      } else if (subCategory === 'pants') {
        const pantsStyle = meeAssets.outfit.pants[state.gender][i];
        svgStr = pantsStyle ? (pantsStyle[state.pantsColor] || pantsStyle['default'] || '') : '';
      } else if (subCategory === 'dress') {
        if (i === 1) {
          svgStr = meeAssets.outfit.dress.unisex[1];
        } else if (i > 1) {
          svgStr = meeAssets.outfit.dress[state.gender][i - 1];
        }
      }
    }

    if (!svgStr) continue;

    const card = document.createElement('div');
    card.className = `selector-card ${i === state[stateKey] ? 'active' : ''}`;
    card.dataset.index = i;

    const cardId = `card-custom-${category}-${subCategory || ''}-${i}`;
    card.id = cardId;

    // Scope styles and make IDs unique to prevent leakage/collisions
    let scopedSvgStr = makeSvgIdsUnique(svgStr, cardId);
    scopedSvgStr = scopeSvgStyles(scopedSvgStr, `#${cardId}`);

    const viewBox = getSvgViewBox(scopedSvgStr);
    let previewContent = getSvgInnerContent(scopedSvgStr);

    // Style adjustments for the preview cards to make lines visible
    if (category === 'hair') {
      previewContent = previewContent
        .replace(/fill=["']url\(#paint0_linear_.*\)["']/gi, 'fill="var(--text-muted)"')
        .replace(/fill=["']#[0-9a-fA-F]{3,6}["']/gi, 'fill="var(--text-muted)"');
    }

    card.innerHTML = `
      <svg viewBox="${viewBox}" xmlns="http://www.w3.org/2000/svg">
        ${previewContent}
      </svg>
      <span class="card-label">${subCategory === 'dress' ? (i === 1 ? 'Unisex' : `Dress ${i - 1}`) : i}</span>
    `;

    card.addEventListener('click', () => {
      container.querySelectorAll('.selector-card').forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      state[stateKey] = i;

      // UX Logic: selecting dress clears shirt/pants, selecting shirt/pants clears dress
      if (stateKey === 'dress') {
        state.shirt = 0;
        state.pants = 0;

        // Update Shirt and Pants UI
        ['shirt-picker', 'pants-picker'].forEach(gridId => {
          const grid = document.getElementById(gridId);
          if (grid) {
            grid.querySelectorAll('.selector-card').forEach(c => c.classList.remove('active'));
            const noneCard = grid.querySelector('[data-index="0"]');
            if (noneCard) noneCard.classList.add('active');
          }
        });
      } else if (stateKey === 'shirt' || stateKey === 'pants') {
        state.dress = 0;
        const dressGrid = document.getElementById('dress-picker');
        if (dressGrid) {
          dressGrid.querySelectorAll('.selector-card').forEach(c => c.classList.remove('active'));
          const noneCard = dressGrid.querySelector('[data-index="0"]');
          if (noneCard) noneCard.classList.add('active');
        }
      }

      addOutfitColorPickers();
      updatePreview();
    });
    container.appendChild(card);
  }
}

// Render hair color swatches
function addHairColorPicker() {
  const parent = document.getElementById('hair-color-container');
  if (!parent) return;
  parent.innerHTML = '';

  const colorPickerWrapper = document.createElement('div');
  colorPickerWrapper.className = 'hair-color-section';
  colorPickerWrapper.innerHTML = `
    <div class="hair-colors-grid" style="margin-top: 10px;"></div>
  `;

  const grid = colorPickerWrapper.querySelector('.hair-colors-grid');

  hairColors.forEach(color => {
    const swatch = document.createElement('div');
    swatch.className = `color-swatch hair-swatch ${state.hairColor === color.index ? 'active' : ''}`;
    swatch.style.backgroundColor = color.base;
    swatch.title = `${color.name} (Base: ${color.base})`;

    swatch.addEventListener('click', () => {
      state.hairColor = color.index;
      if (state.syncEyebrowsColor) {
        state.eyebrowsColorIndex = color.index;
      }
      syncHairColorPickersUI();
      updatePreview();
    });

    grid.appendChild(swatch);
  });

  parent.appendChild(colorPickerWrapper);
}

// Render eyebrows color swatches and synchronization checkbox
function addEyebrowsColorPicker() {
  const parent = document.getElementById('eyebrows-color-container');
  if (!parent) return;
  parent.innerHTML = '';

  const wrapper = document.createElement('div');
  wrapper.className = 'eyebrows-color-section';
  wrapper.innerHTML = `
    <div class="eyebrows-sync-header" style="margin-top: 15px; margin-bottom: 10px; display: flex; align-items: center; justify-content: flex-start;">
      <div style="display: flex; align-items: center; gap: 6px; font-size: 0.85rem; font-weight: 500; color: var(--text-brown);">
        <input type="checkbox" id="sync-eyebrows-color" ${state.syncEyebrowsColor ? 'checked' : ''} style="cursor: pointer; width: 14px; height: 14px;">
        <label for="sync-eyebrows-color" style="cursor: pointer; user-select: none;">Đồng bộ với màu tóc</label>
      </div>
    </div>
    <div class="eyebrows-colors-grid"></div>
  `;

  const grid = wrapper.querySelector('.eyebrows-colors-grid');
  const checkbox = wrapper.querySelector('#sync-eyebrows-color');

  hairColors.forEach(color => {
    const swatch = document.createElement('div');
    const isSelected = state.syncEyebrowsColor ? (state.hairColor === color.index) : (state.eyebrowsColorIndex === color.index);
    swatch.className = `color-swatch eyebrows-swatch ${isSelected ? 'active' : ''}`;
    swatch.style.backgroundColor = color.base;
    swatch.title = `${color.name} (Base: ${color.base})`;

    swatch.addEventListener('click', () => {
      state.eyebrowsColorIndex = color.index;
      state.syncEyebrowsColor = false;
      if (checkbox) checkbox.checked = false;
      syncHairColorPickersUI();
      updatePreview();
    });

    grid.appendChild(swatch);
  });

  checkbox.addEventListener('change', (e) => {
    state.syncEyebrowsColor = e.target.checked;
    if (state.syncEyebrowsColor) {
      state.eyebrowsColorIndex = state.hairColor;
    }
    syncHairColorPickersUI();
    updatePreview();
  });

  parent.appendChild(wrapper);
}

// Keep swatches and checkbox UI in sync with global state
function syncHairColorPickersUI() {
  // Update hair swatches active class
  const hairParent = document.getElementById('hair-color-container');
  if (hairParent) {
    hairParent.querySelectorAll('.hair-swatch').forEach((swatch, idx) => {
      const colorInfo = hairColors[idx];
      if (colorInfo && colorInfo.index === state.hairColor) {
        swatch.classList.add('active');
      } else {
        swatch.classList.remove('active');
      }
    });
  }

  // Update eyebrows swatches active class
  const eyebrowsParent = document.getElementById('eyebrows-color-container');
  if (eyebrowsParent) {
    const checkbox = eyebrowsParent.querySelector('#sync-eyebrows-color');
    if (checkbox) {
      checkbox.checked = state.syncEyebrowsColor;
    }
    eyebrowsParent.querySelectorAll('.eyebrows-swatch').forEach((swatch, idx) => {
      const colorInfo = hairColors[idx];
      const currentActiveIndex = state.syncEyebrowsColor ? state.hairColor : state.eyebrowsColorIndex;
      if (colorInfo && colorInfo.index === currentActiveIndex) {
        swatch.classList.add('active');
      } else {
        swatch.classList.remove('active');
      }
    });
  }
}

function addOutfitColorPickers() {
  // Shirt color picker
  const shirtParent = document.getElementById('shirt-color-container');
  if (shirtParent) {
    if (state.shirt === 0) {
      shirtParent.style.display = 'none';
    } else {
      shirtParent.style.display = 'block';
      shirtParent.innerHTML = '';
      const wrapper = document.createElement('div');
      wrapper.className = 'outfit-color-section';
      wrapper.innerHTML = `
        <div class="outfit-colors-grid" id="shirt-colors-grid" style="margin-top: 10px;"></div>
      `;
      const grid = wrapper.querySelector('#shirt-colors-grid');
      outfitColors.forEach(color => {
        const swatch = document.createElement('div');
        swatch.className = `color-swatch shirt-color-swatch ${state.shirtColor === color.index ? 'active' : ''}`;//'
        swatch.style.backgroundColor = color.base;
        swatch.title = color.name;
        swatch.addEventListener('click', () => {
          state.shirtColor = color.index;
          syncOutfitColorPickersUI();
          renderCustomGrid('shirt-picker', 'outfit', Object.keys(meeAssets.outfit.shirt[state.gender]).length, 'shirt', true, 'shirt');
          updatePreview();
        });
        grid.appendChild(swatch);
      });
      shirtParent.appendChild(wrapper);
    }
  }

  // Pants color picker
  const pantsParent = document.getElementById('pants-color-container');
  if (pantsParent) {
    if (state.pants === 0) {
      pantsParent.style.display = 'none';
    } else {
      pantsParent.style.display = 'block';
      pantsParent.innerHTML = '';
      const wrapper = document.createElement('div');
      wrapper.className = 'outfit-color-section';
      wrapper.innerHTML = `
        <div class="outfit-colors-grid" id="pants-colors-grid" style="margin-top: 10px;"></div>
      `;
      const grid = wrapper.querySelector('#pants-colors-grid');
      outfitColors.forEach(color => {
        const swatch = document.createElement('div');
        swatch.className = `color-swatch pants-color-swatch ${state.pantsColor === color.index ? 'active' : ''}`;//'
        swatch.style.backgroundColor = color.base;
        swatch.title = color.name;
        swatch.addEventListener('click', () => {
          state.pantsColor = color.index;
          syncOutfitColorPickersUI();
          renderCustomGrid('pants-picker', 'outfit', Object.keys(meeAssets.outfit.pants[state.gender]).length, 'pants', true, 'pants');
          updatePreview();
        });
        grid.appendChild(swatch);
      });
      pantsParent.appendChild(wrapper);
    }
  }
}

function hexToRgb(hex) {
  hex = hex.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  return `${r}, ${g}, ${b}`;
}

function addBackgroundColorPicker() {
  const typePicker = document.getElementById('background-picker');
  if (typePicker) {
    typePicker.innerHTML = '';

    // 1. "Tải ảnh lên" (Upload) option card
    const uploadCard = document.createElement('div');
    uploadCard.className = `selector-card ${state.backgroundType === 'upload' ? 'active' : ''}`;
    uploadCard.dataset.type = 'upload';
    uploadCard.innerHTML = `
      <div style="font-size: 1.8rem; color: var(--text-muted);"><i class="fa-solid fa-cloud-arrow-up"></i></div>
      <span class="card-label">Tải ảnh lên</span>
      <input type="file" id="bg-image-upload-input" accept="image/*" style="display: none;" />
    `;
    uploadCard.addEventListener('click', (e) => {
      const fileInput = uploadCard.querySelector('#bg-image-upload-input');
      if (fileInput) {
        if (e.target !== fileInput) {
          fileInput.click();
        }
      }
    });
    const fileInput = uploadCard.querySelector('#bg-image-upload-input');
    if (fileInput) {
      fileInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (e) => {
            state.backgroundType = 'upload';
            state.backgroundImageUrl = e.target.result;
            syncBackgroundColorPickerUI();
            updatePreview();
          };
          reader.readAsDataURL(file);
        }
      });
    }
    typePicker.appendChild(uploadCard);

    // 2. "Nền nhạt" (Light Background) option card
    const lightCard = document.createElement('div');
    lightCard.className = `selector-card ${state.backgroundType === 'light' ? 'active' : ''}`;
    lightCard.dataset.type = 'light';
    lightCard.innerHTML = `
      <svg viewBox="0 0 100 100" style="width: 100%; height: 100%; display: block;">
        <rect x="0" y="0" width="100" height="100" rx="12" fill="#a8a8a8" />
      </svg>
      <span class="card-label">Nền nhạt</span>
    `;
    lightCard.addEventListener('click', () => {
      state.backgroundType = 'light';
      const isLightColor = pastelBackgroundColors.some(c => c.base === state.backgroundColor);
      if (!isLightColor) {
        state.backgroundColor = '#ffffff';
      }
      syncBackgroundColorPickerUI();
      updatePreview();
    });
    typePicker.appendChild(lightCard);

    // 3. "Nền đậm" (Dark Background) option card
    const darkCard = document.createElement('div');
    darkCard.className = `selector-card ${state.backgroundType === 'dark' ? 'active' : ''}`;
    darkCard.dataset.type = 'dark';
    darkCard.innerHTML = `
      <svg viewBox="0 0 100 100" style="width: 100%; height: 100%; display: block;">
        <rect x="0" y="0" width="100" height="100" rx="12" fill="#555555" />
      </svg>
      <span class="card-label">Nền đậm</span>
    `;
    darkCard.addEventListener('click', () => {
      state.backgroundType = 'dark';
      const isDarkColor = darkBackgroundColors.some(c => c.base === state.backgroundColor);
      if (!isDarkColor) {
        state.backgroundColor = '#5a6270';
      }
      syncBackgroundColorPickerUI();
      updatePreview();
    });
    typePicker.appendChild(darkCard);

    // 4. "Nền kẻ ô" (Grid Background) option card
    const gridCard = document.createElement('div');
    gridCard.className = `selector-card ${state.backgroundType === 'grid' ? 'active' : ''}`;
    gridCard.dataset.type = 'grid';
    gridCard.innerHTML = `
      <svg viewBox="0 0 100 100" style="width: 100%; height: 100%; display: block;">
        <rect x="0" y="0" width="100" height="100" rx="12" fill="#e0e0e0" />
        <line x1="25" y1="0" x2="25" y2="100" stroke="#ffffff" stroke-width="4" />
        <line x1="50" y1="0" x2="50" y2="100" stroke="#ffffff" stroke-width="4" />
        <line x1="75" y1="0" x2="75" y2="100" stroke="#ffffff" stroke-width="4" />
        <line x1="0" y1="25" x2="100" y2="25" stroke="#ffffff" stroke-width="4" />
        <line x1="0" y1="50" x2="100" y2="50" stroke="#ffffff" stroke-width="4" />
        <line x1="0" y1="75" x2="100" y2="75" stroke="#ffffff" stroke-width="4" />
      </svg>
      <span class="card-label">Nền kẻ ô</span>
    `;
    gridCard.addEventListener('click', () => {
      state.backgroundType = 'grid';
      const isLightColor = pastelBackgroundColors.some(c => c.base === state.backgroundColor);
      if (!isLightColor) {
        state.backgroundColor = '#ffffff';
      }
      syncBackgroundColorPickerUI();
      updatePreview();
    });
    typePicker.appendChild(gridCard);

    // 5. "Nền ca-rô" (Gingham Background) option card
    const ginghamCard = document.createElement('div');
    ginghamCard.className = `selector-card ${state.backgroundType === 'gingham' ? 'active' : ''}`;
    ginghamCard.dataset.type = 'gingham';
    ginghamCard.innerHTML = `
      <svg viewBox="0 0 100 100" style="width: 100%; height: 100%; display: block;">
        <defs>
          <clipPath id="gingham-card-clip">
            <rect x="0" y="0" width="100" height="100" rx="12" />
          </clipPath>
        </defs>
        <rect x="0" y="0" width="100" height="100" rx="12" fill="#ffffff" />
        <g clip-path="url(#gingham-card-clip)">
          <rect x="0" y="0" width="100" height="25" fill="#888888" opacity="0.35" />
          <rect x="0" y="50" width="100" height="25" fill="#888888" opacity="0.35" />
          <rect x="0" y="0" width="25" height="100" fill="#888888" opacity="0.35" />
          <rect x="50" y="0" width="25" height="100" fill="#888888" opacity="0.35" />
        </g>
      </svg>
      <span class="card-label">Nền ca-rô</span>
    `;
    ginghamCard.addEventListener('click', () => {
      state.backgroundType = 'gingham';
      const isLightColor = pastelBackgroundColors.some(c => c.base === state.backgroundColor);
      if (!isLightColor) {
        state.backgroundColor = '#ffffff';
      }
      syncBackgroundColorPickerUI();
      updatePreview();
    });
    typePicker.appendChild(ginghamCard);
  }

  syncBackgroundColorPickerUI();
}

function renderBackgroundSwatches() {
  const bgGrid = document.getElementById('background-colors-grid');
  if (!bgGrid) return;

  const category = (state.backgroundType === 'dark') ? 'dark' : (state.backgroundType === 'upload' ? 'upload' : 'light');
  if (bgGrid.dataset.renderedCategory === category) {
    return;
  }

  bgGrid.innerHTML = '';
  bgGrid.dataset.renderedCategory = category;

  if (state.backgroundType === 'upload') return;

  const colorList = state.backgroundType === 'dark' ? darkBackgroundColors : pastelBackgroundColors;
  colorList.forEach(color => {
    const swatch = document.createElement('div');
    swatch.className = 'color-swatch background-color-swatch';
    swatch.style.backgroundColor = color.base;
    swatch.dataset.color = color.base;
    swatch.title = color.name;
    swatch.addEventListener('click', () => {
      state.backgroundColor = color.base;
      syncBackgroundColorPickerUI();
      updatePreview();
    });
    bgGrid.appendChild(swatch);
  });
}

function syncBackgroundColorPickerUI() {
  const typePicker = document.getElementById('background-picker');
  if (typePicker) {
    typePicker.querySelectorAll('.selector-card').forEach(card => {
      if (card.dataset.type === state.backgroundType) {
        card.classList.add('active');
      } else {
        card.classList.remove('active');
      }
    });
  }

  renderBackgroundSwatches();

  const bgGrid = document.getElementById('background-colors-grid');
  if (bgGrid) {
    bgGrid.querySelectorAll('.background-color-swatch').forEach(swatch => {
      if (swatch.dataset.color === state.backgroundColor) {
        swatch.classList.add('active');
      } else {
        swatch.classList.remove('active');
      }
    });
  }

  const colorContainer = document.getElementById('background-color-container');
  if (colorContainer) {
    colorContainer.style.display = (
      state.backgroundType === 'light' ||
      state.backgroundType === 'dark' ||
      state.backgroundType === 'grid' ||
      state.backgroundType === 'gingham'
    ) ? 'block' : 'none';
  }

  const viewport = document.getElementById('svg-preview-container');
  if (viewport) {
    if (state.backgroundType === 'light' || state.backgroundType === 'dark') {
      viewport.style.backgroundColor = state.backgroundColor;
      viewport.style.backgroundImage = 'none';
    } else if (state.backgroundType === 'grid') {
      viewport.style.backgroundColor = state.backgroundColor;
      viewport.style.backgroundImage = `
        linear-gradient(to right, rgba(0, 0, 0, 0.05) 1px, transparent 1px),
        linear-gradient(to bottom, rgba(0, 0, 0, 0.05) 1px, transparent 1px)
      `;
      viewport.style.backgroundSize = '24px 24px';
    } else if (state.backgroundType === 'gingham') {
      const rgb = hexToRgb(state.backgroundColor);
      viewport.style.backgroundColor = '#ffffff';
      viewport.style.backgroundImage = `
        linear-gradient(90deg, rgba(${rgb}, 0.35) 50%, transparent 50%),
        linear-gradient(rgba(${rgb}, 0.35) 50%, transparent 50%)
      `;
      viewport.style.backgroundSize = '32px 32px';
    } else if (state.backgroundType === 'upload') {
      viewport.style.backgroundColor = '#ffffff';
      viewport.style.backgroundImage = state.backgroundImageUrl ? `url(${state.backgroundImageUrl})` : 'none';
      viewport.style.backgroundSize = 'cover';
      viewport.style.backgroundPosition = 'center';
      viewport.style.backgroundRepeat = 'no-repeat';
    } else {
      viewport.style.backgroundColor = '#ffffff';
      viewport.style.backgroundImage = 'none';
    }
  }
}

function syncOutfitColorPickersUI() {
  document.querySelectorAll('.shirt-color-swatch').forEach((swatch, idx) => {
    const color = outfitColors[idx];
    if (color && state.shirtColor === color.index) {
      swatch.classList.add('active');
    } else {
      swatch.classList.remove('active');
    }
  });
  document.querySelectorAll('.pants-color-swatch').forEach((swatch, idx) => {
    const color = outfitColors[idx];
    if (color && state.pantsColor === color.index) {
      swatch.classList.add('active');
    } else {
      swatch.classList.remove('active');
    }
  });
}

function addEyesColorPicker() {
  const parent = document.getElementById('eyes-color-container');
  if (parent) {
    parent.innerHTML = '';
    const wrapper = document.createElement('div');
    wrapper.className = 'eyes-color-section';
    wrapper.innerHTML = `
      <div class="eyes-colors-grid"></div>
    `;
    const grid = wrapper.querySelector('.eyes-colors-grid');
    eyeColors.forEach(color => {
      const swatch = document.createElement('div');
      swatch.className = `color-swatch eyes-color-swatch ${state.eyesColor === color.index ? 'active' : ''}`;
      swatch.style.backgroundColor = color.base;
      swatch.title = color.name;
      swatch.addEventListener('click', () => {
        state.eyesColor = color.index;
        syncEyesColorPickersUI();
        renderSelectorGrid('eyes-picker', 'eyes', 11, 'eyes');
        updatePreview();
      });
      grid.appendChild(swatch);
    });
    parent.appendChild(wrapper);
  }
}

function syncEyesColorPickersUI() {
  document.querySelectorAll('.eyes-color-swatch').forEach((swatch, idx) => {
    const color = eyeColors[idx];
    if (color && state.eyesColor === color.index) {
      swatch.classList.add('active');
    } else {
      swatch.classList.remove('active');
    }
  });
}

// Helper to clean unisex dress
function cleanDressChung(svgStr) {
  if (!svgStr) return '';
  return svgStr.replace(/<path[^>]*?fill=["'](?:#FFF1CC|white|black|#005C00|#090D56|#8FA6B5)["'][^>]*?>/gi, '');
}

// Split unisex dress SVG elements into back, front, and body layers
function splitUnisexDress(dressSvg) {
  const shapes = [];
  const regex = /<(path|ellipse)\b[^>]*?\/?>/gi;
  let match;
  while ((match = regex.exec(dressSvg)) !== null) {
    shapes.push(match[0]);
  }

  const backShapes = [];
  const frontShapes = [];
  const bodyShapes = [];

  shapes.forEach(shape => {
    // 1. Back Layer: cls-1
    if (shape.includes('class="cls-1"') || shape.includes("class='cls-1'")) {
      backShapes.push(shape);
      return;
    }

    // 2. Front Layer:
    // - class="cls-10" (light green hood)
    // - class="cls-11" (eyebrows)
    // - class="cls-9" (eyes and spikes)
    // - class="cls-2" with d="M96.43 (top horn)
    // - any shape with cx="51.14" or cx="143.41" (eyes)
    // - any shape with d="M43.43" or d="M134.79" (eye outlines)
    const isCls10 = shape.includes('class="cls-10"') || shape.includes("class='cls-10'");
    const isCls11 = shape.includes('class="cls-11"') || shape.includes("class='cls-11'");
    const isCls9 = shape.includes('class="cls-9"') || shape.includes("class='cls-9'");
    const isTopHorn = (shape.includes('class="cls-2"') || shape.includes("class='cls-2'")) && shape.includes('d="M96.43');
    const isEyeShape = shape.includes('cx="51.14"') || shape.includes('cx="143.41"') || shape.includes('cx=\'51.14\'') || shape.includes('cx=\'143.41\'') ||
      shape.includes('d="M43.43"') || shape.includes('d="M134.79"') || shape.includes('d=\'M43.43\'') || shape.includes('d=\'M134.79\'') ||
      shape.includes('d="M43.43,') || shape.includes('d="M134.79,');

    if (isCls10 || isCls11 || isCls9 || isTopHorn || isEyeShape) {
      frontShapes.push(shape);
      return;
    }

    // 3. Body Layer: everything else
    bodyShapes.push(shape);
  });

  return {
    back: backShapes.join('\n'),
    front: frontShapes.join('\n'),
    body: bodyShapes.join('\n')
  };
}

// Compose final character SVG
function composeCharacterSVG() {
  const stylesArray = [];
  const defsArray = [];
  let dressBackGroup = '';
  let dressFrontGroup = '';
  let faceShapeGroup = '';

  // Always use clothed model body template strictly
  let bodySvg = meeAssets.body['clothes'][state.gender]['default'];
  if (!bodySvg) {
    bodySvg = meeAssets.body['clothes'][state.gender][state.skinTone];
  }

  // Retrieve skin tone colors for the current skinTone index
  const colors = meeAssets.skinToneColors[state.skinTone];
  const primarySkinColor = state.customPrimaryColor || colors.primary;
  const shadowSkinColor = state.customShadowColor || colors.shadow;

  // Dynamic color replacement in base body SVG using current skin tone baseline colors
  const basePrimary = colors.primary;
  const baseShadow = colors.shadow;

  bodySvg = bodySvg
    // Replace style rules
    .replace(new RegExp(`\\.cls-6\\s*\\{\\s*fill\\s*:\\s*${basePrimary}\\s*;?\\s*\\}`, 'i'), `.cls-6{fill:${primarySkinColor};}`)
    .replace(new RegExp(`\\.cls-7\\s*\\{\\s*fill\\s*:\\s*#(fcc|${baseShadow.substring(1)})\\s*;?\\s*\\}`, 'i'), `.cls-7{fill:${shadowSkinColor};}`)
    // Replace stops in linear-gradient with a clean 2-stop gradient
    .replace(/(<linearGradient id="linear-gradient"[\s\S]*?>)[\s\S]*?(<\/linearGradient>)/i,
      `$1<stop offset="0" stop-color="${primarySkinColor}"/><stop offset="1" stop-color="${shadowSkinColor}"/>$2`)
    // Global color replacements
    .replace(new RegExp(basePrimary, 'gi'), primarySkinColor)
    .replace(new RegExp(baseShadow, 'gi'), shadowSkinColor)
    .replace(/#fcc\b/gi, shadowSkinColor);

  let outfitGroup = '';
  // 3. Outfit Layering
  if (state.dress > 0) {
    // Hide default underwear/pants to prevent showing under the dress
    bodySvg = bodySvg
      // Hide default underwear/pants to prevent showing under the dress (.cls-10 is neck/body shadow, keep it)
      .replace(/\.cls-11\s*\{\s*fill\s*:\s*url\(#linear-gradient-4\);?\s*\}/i, `.cls-11{display:none;}`)
      .replace(/\.cls-12\s*\{\s*fill\s*:\s*url\(#linear-gradient-5\);?\s*\}/i, `.cls-12{display:none;}`);

    let dressSvg = '';
    let dressTransform = '';
    if (state.dress === 1) {
      dressSvg = cleanDressChung(meeAssets.outfit.dress.unisex[1]);
      if (dressSvg) {
        dressSvg = makeSvgIdsUnique(dressSvg, 'mee-dress');
        dressSvg = extractStylesAndDefs(dressSvg, stylesArray, defsArray, '.mee-outfit-dress');

        const splitResult = splitUnisexDress(dressSvg);
        dressTransform = 'translate(-7.72, -44.23)';

        if (splitResult.back) {
          dressBackGroup = `<g id="mee-outfit-dress-back" class="mee-outfit-dress" transform="${dressTransform}">
            <ellipse cx="97" cy="110" rx="65" ry="85" fill="url(#mee-dress-linear-gradient)" />
            ${splitResult.back}
          </g>`;
        }
        if (splitResult.front) {
          dressFrontGroup = `<g id="mee-outfit-dress-front" class="mee-outfit-dress" transform="${dressTransform}">${splitResult.front}</g>`;
        }

        dressSvg = splitResult.body;
      }
    } else if (state.dress > 1) {
      dressSvg = meeAssets.outfit.dress[state.gender][state.dress - 1];
      if (dressSvg) {
        dressSvg = makeSvgIdsUnique(dressSvg, 'mee-dress');
        dressSvg = extractStylesAndDefs(dressSvg, stylesArray, defsArray, '.mee-outfit-dress');
        const dressCenter = getSvgElementCenter(dressSvg) || { x: 69.53, y: 145 };
        const dressTranslateX = 90.32 - dressCenter.x;
        const dressTranslateY = state.gender === 'female' ? 136.32 : 136.42;
        dressTransform = `translate(${dressTranslateX.toFixed(2)}, ${dressTranslateY.toFixed(2)})`;

        // Split red cape tail and sleeves cuffs/trim for male dress 2
        if (dressSvg.includes('M119.57 11.7625')) {
          // 1. Cape path (renders behind body/legs)
          const capeRegex = /<path\b[^>]*?M119\.57 11\.7625[^>]*?\/?>/i;
          const capeMatch = dressSvg.match(capeRegex);
          if (capeMatch) {
            dressSvg = dressSvg.replace(capeMatch[0], '');
            dressBackGroup = `<g id="mee-outfit-dress-back" class="mee-outfit-dress" transform="${dressTransform}">
              ${capeMatch[0]}
            </g>`;
          }
          
          // 2. Sleeve cuffs/trim paths (render on top of hands to hide wrist cuts)
          let frontPaths = [];
          const leftCuffRegex = /<path\b[^>]*?M3\.44003 96\.4525[^>]*?\/?>/i;
          const leftCuffMatch = dressSvg.match(leftCuffRegex);
          if (leftCuffMatch) {
            frontPaths.push(leftCuffMatch[0]);
            dressSvg = dressSvg.replace(leftCuffMatch[0], '');
          }
          const rightCuffRegex = /<path\b[^>]*?M157\.75 96\.4525[^>]*?\/?>/i;
          const rightCuffMatch = dressSvg.match(rightCuffRegex);
          if (rightCuffMatch) {
            frontPaths.push(rightCuffMatch[0]);
            dressSvg = dressSvg.replace(rightCuffMatch[0], '');
          }

          if (frontPaths.length > 0) {
            dressFrontGroup = `<g id="mee-outfit-dress-front" class="mee-outfit-dress" transform="${dressTransform}">
              ${frontPaths.join('\n')}
            </g>`;
          }
        }
      }
    }

    if (dressSvg) {
      outfitGroup = `<g id="mee-outfit-dress-body" class="mee-outfit-dress" transform="${dressTransform}">${getSvgInnerContent(dressSvg)}</g>`;
    }
  } else {
    // Render shirt and pants
    let shirtSvg = '';
    let pantsSvg = '';

    if (state.shirt > 0) {
      const shirtStyle = meeAssets.outfit.shirt[state.gender][state.shirt];
      shirtSvg = shirtStyle ? (shirtStyle[state.shirtColor] || shirtStyle['default'] || '') : '';
    }
    if (state.pants > 0) {
      const pantsStyle = meeAssets.outfit.pants[state.gender][state.pants];
      pantsSvg = pantsStyle ? (pantsStyle[state.pantsColor] || pantsStyle['default'] || '') : '';
    }

    if (shirtSvg) {
      shirtSvg = makeSvgIdsUnique(shirtSvg, 'mee-shirt');
      shirtSvg = extractStylesAndDefs(shirtSvg, stylesArray, defsArray, '#mee-outfit-shirt');
    }
    if (pantsSvg) {
      pantsSvg = makeSvgIdsUnique(pantsSvg, 'mee-pants');
      pantsSvg = extractStylesAndDefs(pantsSvg, stylesArray, defsArray, '#mee-outfit-pants');
    }

    let shirtTransform = '';
    if (shirtSvg) {
      const shirtCenter = getSvgElementCenter(shirtSvg) || { x: 66.83, y: 48 };
      const shirtTranslateX = 90.32 - shirtCenter.x;
      let shirtTranslateY;
      if (state.shirt === 3) {
        shirtTranslateY = state.gender === 'female' ? 129.93 : 129.91;
      } else if (state.shirt === 4) {
        shirtTranslateY = state.gender === 'female' ? 138.93 : 138.91;
      } else if (state.shirt === 5 || state.shirt === 6) {
        shirtTranslateY = state.gender === 'female' ? 134.93 : 134.91;
      } else {
        shirtTranslateY = state.gender === 'female' ? 139.93 : 139.91;
      }
      shirtTransform = `translate(${shirtTranslateX.toFixed(2)}, ${shirtTranslateY.toFixed(2)})`;
    }

    let pantsTransform = '';
    if (pantsSvg) {
      const pantsCenter = getSvgElementCenter(pantsSvg) || { x: 62.0, y: 97, width: 120 };
      let pantsTranslateY = 246.8;
      let scaleX = 1;
      if (state.pants === 2 || state.pants === 3) {
        pantsTranslateY = 249.8; // Raised by another 3px (from 252.8) to align under the shirt
        if (pantsCenter.width > 0) {
          scaleX = (pantsCenter.width - 4) / pantsCenter.width; // Narrow by 2px on each side (4px total)
        }
      }
      pantsTransform = `translate(90.32, ${pantsTranslateY.toFixed(2)}) scale(${scaleX.toFixed(4)}, 1) translate(${-pantsCenter.x.toFixed(2)}, 0)`;
    }

    let pantsGroup = pantsSvg ? `<g id="mee-outfit-pants" transform="${pantsTransform}">${getSvgInnerContent(pantsSvg)}</g>` : '';
    let shirtGroup = shirtSvg ? `<g id="mee-outfit-shirt" transform="${shirtTransform}">${getSvgInnerContent(shirtSvg)}</g>` : '';

    outfitGroup = pantsGroup + shirtGroup;
  }

  // Extract base body styles and defs, scoped to #mee-character-body to prevent leakage/collisions (such as clip-paths clashing with outfits)
  bodySvg = extractStylesAndDefs(bodySvg, stylesArray, defsArray, '#mee-character-body');

  // Wrap body elements in a scoped group
  bodySvg = bodySvg
    .replace(/(<svg\b[^>]*?>)/i, `$1<g id="mee-character-body">`)
    .replace(/(<\/svg>)/i, `</g>$1`);

  // Load and recolor face shape (including ears base64 images) based on current face style and skin tone
  let faceSvg = '';
  if (meeAssets.facial.face && meeAssets.facial.face[state.face]) {
    faceSvg = meeAssets.facial.face[state.face][state.skinTone] || meeAssets.facial.face[state.face]['default'] || '';
  }

  if (faceSvg) {
    // Recoloring base64 images of ears in the face shape if custom skin colors are active
    if (state.recoloredEars && state.recoloredEars.length >= 2) {
      const faceBase64 = extractBase64Images(faceSvg);
      if (faceBase64.length >= 2) {
        faceSvg = faceSvg.replace(faceBase64[0], state.recoloredEars[0]); // Right ear
        faceSvg = faceSvg.replace(faceBase64[1], state.recoloredEars[1]); // Left ear
      }
    }

    // Apply custom skin color overrides directly in the face shape path/styles
    if (state.customPrimaryColor || state.customShadowColor) {
      faceSvg = faceSvg
        .replace(new RegExp(colors.primary, 'gi'), primarySkinColor)
        .replace(new RegExp(colors.shadow, 'gi'), shadowSkinColor);
    }

    faceSvg = makeSvgIdsUnique(faceSvg, 'mee-face');
    faceSvg = extractStylesAndDefs(faceSvg, stylesArray, defsArray, '#mee-face-shape');

    // Remove default ears from body SVG to prevent overlay issues
    bodySvg = bodySvg
      .replace(/<g class="cls-2">[\s\S]*?<\/g>\s*<\/g>/gi, '')
      .replace(/<g class="cls-4">[\s\S]*?<\/g>\s*<\/g>/gi, '');

    // Replace only the default head shape ellipse with the custom face shape (keeping neck paths intact)
    const headEllipseRegex = /<ellipse class="cls-6" cx="90\.32" cy="66\.73" rx="58\.47" ry="66\.73"\s*\/?>/gi;
    if (state.shirt > 0 && state.dress === 0) {
      bodySvg = bodySvg.replace(headEllipseRegex, '');
      faceShapeGroup = `<g id="mee-face-shape">${getSvgInnerContent(faceSvg)}</g>`;
    } else {
      const tempFaceGroup = `<g id="mee-face-shape">${getSvgInnerContent(faceSvg)}</g>`;
      bodySvg = bodySvg.replace(headEllipseRegex, tempFaceGroup);
    }
  }

  // Load hair styles and calculate centers/bounds first
  const bangStyle = meeAssets.hair.bang[state.bang];
  let bangSvg = bangStyle ? (bangStyle[state.hairColor] || bangStyle['default'] || '') : '';
  if (bangSvg) {
    bangSvg = makeSvgIdsUnique(bangSvg, 'mee-bang');
    bangSvg = extractStylesAndDefs(bangSvg, stylesArray, defsArray, '#composed-bangs');
  }
  const bangCenter = getSvgElementCenter(bangSvg) || { x: 61.27, y: 43, top: 0, height: 86, width: 122.54 };

  const behindStyle = meeAssets.hair.behind[state.behind];
  let behindSvg = behindStyle ? (behindStyle[state.hairColor] || behindStyle['default'] || '') : '';
  if (behindSvg) {
    behindSvg = makeSvgIdsUnique(behindSvg, 'mee-behind');
    behindSvg = extractStylesAndDefs(behindSvg, stylesArray, defsArray, '#mee-behind-hair');
  }
  const behindCenter = getSvgElementCenter(behindSvg) || { x: 91.5, y: 75.5, top: 0, height: 151 };

  // 1. Behind Hair (Tóc sau) - Render behind body template
  if (behindSvg) {
    const behindOffsetX = 90.32 - behindCenter.x;

    // Shift behind hair based on the positioning for hair behind.svg relative to the head
    // Top of behind hair is positioned exactly 12.37px higher than the top of the head (Y = 0)
    let behindOffsetY = -12.37 - (behindCenter.top || 0);

    // For Behind 7, 12, 14: position above the top of bangs
    if (state.behind === 7) {
      const bangTop = bangCenter.top || 0;
      behindOffsetY = (bangTop - 20) - (behindCenter.top || 0);
    } else if (state.behind === 12 || state.behind === 14) {
      const bangTop = bangCenter.top || 0;
      behindOffsetY = (bangTop - 30) - (behindCenter.top || 0);
    }

    // Inject behind hair right after the opening <svg> tag of bodySvg so it sits behind body paths
    const bodyOpeningIndex = bodySvg.indexOf('>') + 1;
    if (bodyOpeningIndex > 0) {
      bodySvg = bodySvg.substring(0, bodyOpeningIndex) +
        `<g id="mee-behind-hair" transform="translate(${behindOffsetX.toFixed(2)}, ${behindOffsetY.toFixed(2)})">${getSvgInnerContent(behindSvg)}</g>` +
        bodySvg.substring(bodyOpeningIndex);
    }
  }

  // Inject dress back group right after the opening <svg> tag (under behind hair)
  if (dressBackGroup) {
    const bodyOpeningIndex = bodySvg.indexOf('>') + 1;
    if (bodyOpeningIndex > 0) {
      bodySvg = bodySvg.substring(0, bodyOpeningIndex) +
        dressBackGroup +
        bodySvg.substring(bodyOpeningIndex);
    }
  }

  // Load facial features
  const eyesStyle = meeAssets.facial.eyes[state.eyes];
  let eyesSvg = '';
  if (eyesStyle) {
    if (typeof eyesStyle === 'object') {
      if (state.eyesColor === 11) {
        const redEyes = eyesStyle[2] || eyesStyle['default'] || '';
        eyesSvg = redEyes.replace(/#f70400/gi, '#5D371A');
      } else {
        eyesSvg = eyesStyle[state.eyesColor] || eyesStyle['default'] || '';
      }
    } else {
      eyesSvg = eyesStyle;
    }
  }
  if (eyesSvg) {
    eyesSvg = makeSvgIdsUnique(eyesSvg, 'mee-eyes');
    eyesSvg = extractStylesAndDefs(eyesSvg, stylesArray, defsArray, '#composed-eyes');
  }

  let eyebrowSvg = meeAssets.facial.eyebrow[state.eyebrows] || '';
  if (eyebrowSvg) {
    const currentEyebrowsColorIndex = state.syncEyebrowsColor ? state.hairColor : state.eyebrowsColorIndex;
    const colorInfo = hairColors.find(c => c.index === currentEyebrowsColorIndex) || hairColors[0];
    const currentEyebrowsColor = colorInfo.base;

    // Push direct fill styling to handle SVG shapes without fill attributes
    stylesArray.push(`#composed-eyebrows rect, #composed-eyebrows path, #composed-eyebrows ellipse, #composed-eyebrows circle, #composed-eyebrows polygon { fill: ${currentEyebrowsColor} !important; }`);

    eyebrowSvg = eyebrowSvg
      .replace(/fill=["']#000000["']/gi, `fill="${currentEyebrowsColor}"`)
      .replace(/fill=["']#000["']/gi, `fill="${currentEyebrowsColor}"`);
    eyebrowSvg = makeSvgIdsUnique(eyebrowSvg, 'mee-eyebrow');
    eyebrowSvg = extractStylesAndDefs(eyebrowSvg, stylesArray, defsArray, '#composed-eyebrows');
  }

  let noseSvg = meeAssets.facial.nose[state.nose] || '';
  if (noseSvg) {
    noseSvg = noseSvg
      .replace(/class=["']cls-1["']/gi, `fill="${shadowSkinColor}"`)
      .replace(/#f4b28e/gi, shadowSkinColor);
    noseSvg = makeSvgIdsUnique(noseSvg, 'mee-nose');
    noseSvg = extractStylesAndDefs(noseSvg, stylesArray, defsArray, '#composed-nose');
  }
  let mouthSvg = meeAssets.facial.mouth[state.mouth] || '';
  if (mouthSvg) {
    mouthSvg = makeSvgIdsUnique(mouthSvg, 'mee-mouth');
    mouthSvg = extractStylesAndDefs(mouthSvg, stylesArray, defsArray, '#composed-mouth');
  }

  // 2. Bangs (Tóc mái) - Render on top of head
  // (bangSvg is already loaded at the top)

  // Master positioning constants relative to body center X = 90.32
  const targetEyesCenter = { x: 90.32, y: 87.37 };
  const targetEyebrowsTopY = 65;
  const targetNoseCenter = { x: 90.32, y: 101.45 };
  const targetMouthCenter = { x: 90.32, y: 112.12 };
  const targetNoseBottomY = 96.08; // Bottom-most point of eyes_3.svg Y coordinate

  // Calculate specific centers for each dynamic feature SVG
  const eyesCenter = getSvgElementCenter(eyesSvg) || { x: 38, y: 15 };
  const eyebrowCenter = getSvgElementCenter(eyebrowSvg) || { x: 38, y: 4.7 };
  const noseCenter = getSvgElementCenter(noseSvg) || { x: 15, y: 9 };
  const mouthCenter = getSvgElementCenter(mouthSvg) || { x: 25, y: 12.6 };

  // Compute X and Y offsets
  const eyesOffset = {
    x: targetEyesCenter.x - eyesCenter.x,
    y: targetEyesCenter.y - eyesCenter.y
  };

  const eyebrowsOffset = {
    x: targetEyesCenter.x - eyebrowCenter.x,
    y: targetEyebrowsTopY - (eyebrowCenter.top || 1.94)
  };

  const noseOffset = {
    x: targetNoseCenter.x - noseCenter.x,
    y: targetNoseBottomY - (noseCenter.top + noseCenter.height) + 5
  };

  const mouthOffset = {
    x: targetMouthCenter.x - mouthCenter.x,
    y: targetMouthCenter.y - mouthCenter.y
  };

  // Bangs alignment offset and scale (up by 2px)
  const bangOffset = {
    x: 90.32 - bangCenter.x,
    y: 0
  };

  const bangScale = (bangCenter.width && bangCenter.width > 0) ? (bangCenter.width + 2) / bangCenter.width : 1;
  const bangTransform = `translate(${bangOffset.x.toFixed(2)}, ${bangOffset.y.toFixed(2)}) translate(${bangCenter.x.toFixed(2)}, ${bangCenter.y.toFixed(2)}) scale(${bangScale.toFixed(4)}) translate(${(-bangCenter.x).toFixed(2)}, ${(-bangCenter.y).toFixed(2)})`;

  // Build facial group (no face shape overlay needed as it is kept in female.svg/male.svg)
  const faceGroup = `
    <g id="mee-composed-face" transform="translate(0, 0)">
      <!-- Eyes Group -->
      <g id="composed-eyes" transform="translate(${eyesOffset.x.toFixed(2)}, ${eyesOffset.y.toFixed(2)})">
        ${getSvgInnerContent(eyesSvg)}
      </g>
      
      <!-- Eyebrows Group -->
      <g id="composed-eyebrows" transform="translate(${eyebrowsOffset.x.toFixed(2)}, ${eyebrowsOffset.y.toFixed(2)})">
        ${getSvgInnerContent(eyebrowSvg)}
      </g>
      
      <!-- Nose Group -->
      <g id="composed-nose" transform="translate(${noseOffset.x.toFixed(2)}, ${noseOffset.y.toFixed(2)})">
        ${getSvgInnerContent(noseSvg)}
      </g>
      
      <!-- Mouth Group -->
      <g id="composed-mouth" transform="translate(${mouthOffset.x.toFixed(2)}, ${mouthOffset.y.toFixed(2)})">
        ${getSvgInnerContent(mouthSvg)}
      </g>
      
      <!-- Bangs (Front Hair) Group -->
      <g id="composed-bangs" transform="${bangTransform}">
        ${getSvgInnerContent(bangSvg)}
      </g>
    </g>
  `;



  // Extract and copy hand paths to render them in front of the dress layers
  let handsFrontGroup = '';
  if (state.dress > 1) {
    const rightHandShadowMatch = bodySvg.match(/<path\b[^>]*?d=["']M11\.(?:32|27)[^"']*?["'][^>]*?\/?>/i);
    const leftHandShadowMatch = bodySvg.match(/<path\b[^>]*?d=["']M168\.(?:57|52)[^"']*?["'][^>]*?\/?>/i);
    const rightHandFingersMatch = bodySvg.match(/<path\b[^>]*?d=["']M35\.(?:87|81\d*)[^"']*?["'][^>]*?\/?>/i);
    const leftHandFingersMatch = bodySvg.match(/<path\b[^>]*?d=["']M14(?:4|3\.97\d*)[^"']*?["'][^>]*?\/?>/i);
    let handsContent = '';

    // 1. Shadow paths (drawn behind the fingers/palm)
    if (rightHandShadowMatch) {
      handsContent += rightHandShadowMatch[0]
        .replace(/fill=["'].*?["']/gi, '')
        .replace(/class=["'].*?["']/gi, '')
        .replace('<path ', `<path fill="${shadowSkinColor}" `) + '\n';
    }
    if (leftHandShadowMatch) {
      handsContent += leftHandShadowMatch[0]
        .replace(/fill=["'].*?["']/gi, '')
        .replace(/class=["'].*?["']/gi, '')
        .replace('<path ', `<path fill="${shadowSkinColor}" `) + '\n';
    }

    // 2. Fingers/palm paths (should render in front, so shadow is drawn underneath them)
    if (rightHandFingersMatch) {
      handsContent += rightHandFingersMatch[0]
        .replace(/fill=["'].*?["']/gi, '')
        .replace(/class=["'].*?["']/gi, '')
        .replace('<path ', `<path fill="${primarySkinColor}" `) + '\n';
    }
    if (leftHandFingersMatch) {
      handsContent += leftHandFingersMatch[0]
        .replace(/fill=["'].*?["']/gi, '')
        .replace(/class=["'].*?["']/gi, '')
        .replace('<path ', `<path fill="${primarySkinColor}" `) + '\n';
    }

    if (handsContent) {
      handsFrontGroup = `<g id="mee-hands-front">${handsContent}</g>`;
    }
  }

  // Inject outfit, facial, and dress front groups right before the closing </svg> tag
  const injectIndex = bodySvg.lastIndexOf('</svg>');
  if (injectIndex === -1) return bodySvg;

  let composedSvg = bodySvg.substring(0, injectIndex) +
    outfitGroup +
    faceShapeGroup +
    faceGroup +
    handsFrontGroup +
    dressFrontGroup +
    bodySvg.substring(injectIndex);

  // Inject the combined defs and styles right after the opening <svg ...> tag
  const bodyOpeningIndex = composedSvg.indexOf('>') + 1;
  if (bodyOpeningIndex > 0) {
    composedSvg = composedSvg.substring(0, bodyOpeningIndex) +
      `<defs>${defsArray.join('\n')}</defs>` +
      `<style>${stylesArray.join('\n')}</style>` +
      composedSvg.substring(bodyOpeningIndex);
  }

  // Adjust viewBox dynamically to add padding (centering and shrinking the character inside the frame)
  const originalViewBoxMatch = composedSvg.match(/viewBox=["']0\s+0\s+(\d+\.?\d*)\s+(\d+\.?\d*)["']/i);
  if (originalViewBoxMatch) {
    const originalWidth = parseFloat(originalViewBoxMatch[1]);
    const originalHeight = parseFloat(originalViewBoxMatch[2]);

    // Add margin parameters: left/right = 33px, top = 48px (for tall hair), bottom = 38px (for feet)
    const paddingX = 33;
    const paddingTop = 48;
    const paddingBottom = 38;

    const newMinX = -paddingX;
    const newMinY = -paddingTop;
    const newWidth = originalWidth + (paddingX * 2);
    const newHeight = originalHeight + paddingTop + paddingBottom;

    const newViewBox = `viewBox="${newMinX} ${newMinY} ${newWidth.toFixed(2)} ${newHeight.toFixed(2)}"`;
    composedSvg = composedSvg.replace(originalViewBoxMatch[0], newViewBox);
  }

  return composedSvg;
}

// Update the preview window
// Injected a slight delay so that dynamic DOM measurement (getBBox) has time to evaluate correctly
function updatePreview() {
  const container = document.getElementById('svg-preview-container');
  container.innerHTML = '<div class="loader-spinner"><i class="fa-solid fa-spinner fa-spin"></i></div>';

  pushStateToHistory();

  // Save current state to localStorage to persist options across page navigations
  try {
    localStorage.setItem('mee_character_state', JSON.stringify(state));
  } catch (e) {
    console.error('Failed to save state to localStorage', e);
  }

  setTimeout(() => {
    const finalSvg = composeCharacterSVG();
    container.innerHTML = finalSvg;
    if (state.backgroundType === 'light' || state.backgroundType === 'dark') {
      container.style.backgroundColor = state.backgroundColor;
      container.style.backgroundImage = 'none';
    } else if (state.backgroundType === 'grid') {
      container.style.backgroundColor = state.backgroundColor;
      container.style.backgroundImage = `
        linear-gradient(to right, rgba(0, 0, 0, 0.05) 1px, transparent 1px),
        linear-gradient(to bottom, rgba(0, 0, 0, 0.05) 1px, transparent 1px)
      `;
      container.style.backgroundSize = '24px 24px';
    } else if (state.backgroundType === 'gingham') {
      const rgb = hexToRgb(state.backgroundColor);
      container.style.backgroundColor = '#ffffff';
      container.style.backgroundImage = `
        linear-gradient(90deg, rgba(${rgb}, 0.35) 50%, transparent 50%),
        linear-gradient(rgba(${rgb}, 0.35) 50%, transparent 50%)
      `;
      container.style.backgroundSize = '32px 32px';
    } else if (state.backgroundType === 'upload') {
      container.style.backgroundColor = '#ffffff';
      container.style.backgroundImage = state.backgroundImageUrl ? `url(${state.backgroundImageUrl})` : 'none';
      container.style.backgroundSize = 'cover';
      container.style.backgroundPosition = 'center';
      container.style.backgroundRepeat = 'no-repeat';
    } else {
      container.style.backgroundColor = '#ffffff';
      container.style.backgroundImage = 'none';
    }

    // Automatically generate and save transparent PNG to localStorage
    try {
      const svgContent = composeCharacterSVG();
      const canvas = document.getElementById('export-canvas');
      if (canvas) {
        const ctx = canvas.getContext('2d');
        const isFemale = state.gender === 'female';
        
        // Parse width and height from the newly adjusted viewBox dynamically
        const viewBoxMatch = svgContent.match(/viewBox=["']([^"']+)["']/i);
        let width = isFemale ? 179.89 : 180;
        let height = isFemale ? 442.3 : 441;
        if (viewBoxMatch) {
          const parts = viewBoxMatch[1].split(/\s+/).map(parseFloat);
          if (parts.length === 4) {
            width = parts[2];
            height = parts[3];
          }
        }
        
        const scale = 3;
        canvas.width = width * scale;
        canvas.height = height * scale;
        
        // Clear canvas to ensure transparency
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        const img = new Image();
        const svgBlob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(svgBlob);
        
        img.onload = function () {
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          try {
            const pngUrl = canvas.toDataURL('image/png');
            localStorage.setItem('mee_character_png', pngUrl);
          } catch (err) {
            console.error('Failed to save character PNG to localStorage', err);
          }
          URL.revokeObjectURL(url);
        };
        img.src = url;
      }
    } catch (err) {
      console.error('Failed to export character to PNG', err);
    }
  }, 50);
}

function randomizeCharacter() {
  state.skinTone = Math.floor(Math.random() * 10) + 1;
  state.face = Math.floor(Math.random() * 6) + 1;
  state.eyes = Math.floor(Math.random() * 11) + 1;
  state.eyebrows = Math.floor(Math.random() * 7) + 1;
  state.nose = Math.floor(Math.random() * 7) + 1;
  state.mouth = Math.floor(Math.random() * 14) + 1;
  // Gender is NOT randomized (only chosen by user)
  state.eyesColor = eyeColors[Math.floor(Math.random() * eyeColors.length)].index;

  const bangCount = Object.keys(meeAssets.hair.bang).length || 6;
  state.bang = Math.floor(Math.random() * bangCount) + 1;

  const behindCount = Object.keys(meeAssets.hair.behind).length || 6;
  state.behind = Math.floor(Math.random() * behindCount) + 1;

  const colorIndex = Math.floor(Math.random() * hairColors.length);
  state.hairColor = hairColors[colorIndex].index;
  state.syncEyebrowsColor = Math.random() > 0.3; // 70% chance to sync
  if (state.syncEyebrowsColor) {
    state.eyebrowsColorIndex = state.hairColor;
  } else {
    state.eyebrowsColorIndex = hairColors[Math.floor(Math.random() * hairColors.length)].index;
  }

  // Randomize Outfits (Shirt & Pants OR Dress/One-piece)
  if (Math.random() > 0.5) {
    // Shirt & Pants
    const shirtCount = Object.keys(meeAssets.outfit.shirt[state.gender]).length;
    state.shirt = Math.floor(Math.random() * shirtCount) + 1;
    state.shirtColor = outfitColors[Math.floor(Math.random() * outfitColors.length)].index;

    const pantsCount = Object.keys(meeAssets.outfit.pants[state.gender]).length;
    state.pants = Math.floor(Math.random() * pantsCount) + 1;
    state.pantsColor = outfitColors[Math.floor(Math.random() * outfitColors.length)].index;

    state.dress = 0;
  } else {
    // Dress (One-piece)
    const dressCount = 1 + Object.keys(meeAssets.outfit.dress[state.gender] || {}).length;
    state.dress = Math.floor(Math.random() * dressCount) + 1;
    
    state.shirt = 0;
    state.pants = 0;
  }

  // Clear custom overrides on randomize
  state.customPrimaryColor = null;
  state.customShadowColor = null;

  syncUIControls();
  recolorAndRefreshEars();

  const viewport = document.getElementById('svg-preview-container');
  viewport.style.transform = 'scale(0.95)';
  setTimeout(() => {
    viewport.style.transform = 'scale(1)';
  }, 150);
}

// Reset Character to default
function resetCharacter() {
  state.gender = 'male';
  state.skinTone = 1;
  state.face = 1;
  state.eyes = 1;
  state.eyebrows = 1;
  state.nose = 1;
  state.mouth = 1;
  state.hairColor = 1;
  state.eyebrowsColorIndex = 1;
  state.syncEyebrowsColor = true;
  state.eyesColor = 1;
  state.shirtColor = 2;
  state.pantsColor = 3;
  state.bang = 1;
  state.behind = 1;
  state.shirt = 0;
  state.pants = 0;
  state.dress = 0;
  state.backgroundColor = '#ffffff';
  state.backgroundType = 'light';
  state.backgroundImageUrl = '';

  // Clear custom overrides on reset
  state.customPrimaryColor = null;
  state.customShadowColor = null;

  syncUIControls();
  recolorAndRefreshEars();
}

// Synchronize radio/swatch selections with the state
function syncUIControls() {
  document.getElementById(`gender-${state.gender}`).checked = true;

  // Update preset swatch active borders
  document.querySelectorAll('.skin-swatch').forEach(swatch => {
    if (parseInt(swatch.dataset.index) === state.skinTone && !state.customPrimaryColor && !state.customShadowColor) {
      swatch.classList.add('active');
    } else {
      swatch.classList.remove('active');
    }
  });

  // Sync skin labels
  const skinInfo = meeAssets.skinToneColors[state.skinTone];
  if (skinInfo) {
    const activeLabel = document.getElementById('active-skin-label');
    const activeHex = document.getElementById('active-skin-hex');
    if (activeLabel) activeLabel.textContent = `Màu ${state.skinTone}`;
    if (activeHex) activeHex.textContent = (state.customPrimaryColor || skinInfo.primary).toUpperCase();
  }

  // Sync checkbox state
  const enableCustomSkin = document.getElementById('enable-custom-skin');
  const customPickersDiv = document.querySelector('.custom-color-pickers');
  if (enableCustomSkin && customPickersDiv) {
    const isCustom = !!(state.customPrimaryColor || state.customShadowColor);
    enableCustomSkin.checked = isCustom;
    customPickersDiv.style.display = isCustom ? 'flex' : 'none';
    if (isCustom && window.initCanvasColorPicker) {
      window.initCanvasColorPicker();
    }
  }

  // Sync custom color pickers
  const colors = meeAssets.skinToneColors[state.skinTone];
  const customBase = document.getElementById('custom-skin-base');
  const customShading = document.getElementById('custom-skin-shading');
  if (customBase) customBase.value = state.customPrimaryColor || colors.primary;
  if (customShading) customShading.value = state.customShadowColor || colors.shadow;

  syncGridSelector('face-picker', state.face);
  syncGridSelector('eyes-picker', state.eyes);
  syncGridSelector('eyebrows-picker', state.eyebrows);
  syncGridSelector('nose-picker', state.nose);
  syncGridSelector('mouth-picker', state.mouth);
  syncGridSelector('bang-picker', state.bang);
  syncGridSelector('behind-picker', state.behind);
  syncGridSelector('shirt-picker', state.shirt);
  syncGridSelector('pants-picker', state.pants);
  syncGridSelector('dress-picker', state.dress);

  syncHairColorPickersUI();
  addOutfitColorPickers();
  syncOutfitColorPickersUI();
  syncEyesColorPickersUI();
  syncBackgroundColorPickerUI();
}

function syncGridSelector(containerId, index) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.querySelectorAll('.selector-card').forEach(card => {
    if (parseInt(card.dataset.index) === index) {
      card.classList.add('active');
    } else {
      card.classList.remove('active');
    }
  });
}

// Export Character as SVG file download
function exportAsSVG() {
  const svgContent = composeCharacterSVG();
  const blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = `mee-character-${state.gender}-clothed.svg`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Export Character as JPEG file download or upload to Gallery
function exportAsJPEG() {
  const btn = document.getElementById('btn-done');
  const btnText = document.getElementById('btn-done-text');
  
  if (btn && btnText) {
    btn.disabled = true;
    btn.style.opacity = '0.7';
    btnText.textContent = 'Đang lưu...';
  }

  const svgContent = composeCharacterSVG();
  const canvas = document.getElementById('export-canvas');
  const ctx = canvas.getContext('2d');

  const isFemale = state.gender === 'female';

  // Parse width and height from the newly adjusted viewBox dynamically
  const viewBoxMatch = svgContent.match(/viewBox=["']([^"']+)["']/i);
  let width = isFemale ? 179.89 : 180;
  let height = isFemale ? 442.3 : 441;
  if (viewBoxMatch) {
    const parts = viewBoxMatch[1].split(/\s+/).map(parseFloat);
    if (parts.length === 4) {
      width = parts[2];
      height = parts[3];
    }
  }

  const scale = 3;
  canvas.width = width * scale;
  canvas.height = height * scale;

  // Fill solid white background (JPEG doesn't support transparency)
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const img = new Image();
  const svgBlob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(svgBlob);

  img.onload = async function () {
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    const jpegUrl = canvas.toDataURL('image/jpeg', 0.95);
    URL.revokeObjectURL(url);
    
    // Check if we are embedded in AIkidApp with valid session
    const token = localStorage.getItem('storymee.access_token');
    const ipId = localStorage.getItem('storymee.active_ip_id');
    const apiUrl = localStorage.getItem('aikid.api_url') || 'https://dev-hub.storymee.com';
    
    if (token && ipId) {
      try {
        // Convert base64 Data URL to Blob
        const res = await fetch(jpegUrl);
        const blob = await res.blob();
        
        const fd = new FormData();
        fd.append('ipId', ipId);
        fd.append('permanent', '1');
        fd.append('file', blob, `mee-character-${state.gender}-${Date.now()}.jpg`);
        
        const uploadRes = await fetch(`${apiUrl}/internal/v1/media/upload?assetType=character`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: fd
        });
        
        if (!uploadRes.ok) {
          throw new Error('Upload failed with status ' + uploadRes.status);
        }
        
        const data = await uploadRes.json();
        console.log('Character saved to gallery:', data);
        
        // Show success
        if (btnText) btnText.textContent = 'Đã lưu!';
        if (btn) {
          btn.style.backgroundColor = '#10AC84'; 
          btn.style.borderColor = '#0A7A5D';
        }
        
        // Optionally auto-navigate back after a short delay
        setTimeout(() => {
          if (window.isExpoEmbed && window.isExpoEmbed()) {
            if (window.parent) {
              window.parent.location.href = '/mee/next';
            }
          } else {
            window.location.href = 'next.html';
          }
        }, 1500);
        
      } catch (err) {
        console.error('Failed to save character to gallery', err);
        alert('Có lỗi khi lưu nhân vật vào thư viện.');
        if (btn && btnText) {
          btn.disabled = false;
          btn.style.opacity = '1';
          btnText.textContent = 'Thử lại';
        }
      }
    } else {
      // Fallback for standalone web desktop usage
      const link = document.createElement('a');
      link.href = jpegUrl;
      link.download = `mee-character-${state.gender}-clothed.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      if (btn && btnText) {
        btn.disabled = false;
        btn.style.opacity = '1';
        btnText.textContent = 'Đã tải về';
      }
    }
  };

  img.src = url;
}

// Initialize Application
window.addEventListener('DOMContentLoaded', () => {
  // Only initialize if we are on the main page with picker elements
  if (!document.getElementById('skin-tone-picker')) {
    return;
  }

  // Load state from localStorage if available to keep previous Mee character options
  const savedState = localStorage.getItem('mee_character_state');
  if (savedState) {
    try {
      const parsed = JSON.parse(savedState);
      Object.assign(state, parsed);
    } catch (e) {
      console.error('Failed to load state from localStorage', e);
    }
  }

  initUI();
  syncUIControls();
  recolorAndRefreshEars();
});
