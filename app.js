// Global State
const state = {
  gender: 'male',
  skinTone: 1,
  eyes: 1,
  eyebrows: 1,
  nose: 1,
  mouth: 1,
  eyebrowsColor: '#4b382a', // default dark brown
  customPrimaryColor: null,
  customShadowColor: null,
  recoloredEars: null
};

// Available colors for eyebrows
const eyebrowsColors = [
  { name: 'Black', hex: '#111827' },
  { name: 'Dark Brown', hex: '#451a03' },
  { name: 'Brown', hex: '#78350f' },
  { name: 'Blonde', hex: '#d97706' },
  { name: 'Red', hex: '#b91c1c' },
  { name: 'Silver', hex: '#94a3b8' }
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
    return { x: vw / 2, y: vh / 2, top: vy, height: vh };
  }
  
  return {
    x: bbox.x + bbox.width / 2,
    y: bbox.y + bbox.height / 2,
    top: bbox.y,
    height: bbox.height
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
        const g = data[i+1];
        const b = data[i+2];
        const a = data[i+3];
        if (a === 0) continue;
        
        // Calculate Euclidean color distance to old base and shadow colors
        const distPrimary = Math.sqrt((r - oldPrimary.r)**2 + (g - oldPrimary.g)**2 + (b - oldPrimary.b)**2);
        const distShadow = Math.sqrt((r - oldShadow.r)**2 + (g - oldShadow.g)**2 + (b - oldShadow.b)**2);
        const totalDist = distPrimary + distShadow;
        
        // Smoothly interpolate between custom base and shadow based on distance ratio
        const ratio = totalDist === 0 ? 0 : distPrimary / totalDist;
        
        data[i] = Math.round(newPrimary.r * (1 - ratio) + newShadow.r * ratio);
        data[i+1] = Math.round(newPrimary.g * (1 - ratio) + newShadow.g * ratio);
        data[i+2] = Math.round(newPrimary.b * (1 - ratio) + newShadow.b * ratio);
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
      
      recolorAndRefreshEars();
    });
    skinPicker.appendChild(swatch);
  });

  // 1.5. Bind Custom Color inputs
  const customBase = document.getElementById('custom-skin-base');
  const customShading = document.getElementById('custom-skin-shading');
  if (customBase && customShading) {
    customBase.addEventListener('input', (e) => {
      state.customPrimaryColor = e.target.value;
      document.querySelectorAll('.skin-swatch').forEach(s => s.classList.remove('active'));
      recolorAndRefreshEars();
    });
    customShading.addEventListener('input', (e) => {
      state.customShadowColor = e.target.value;
      document.querySelectorAll('.skin-swatch').forEach(s => s.classList.remove('active'));
      recolorAndRefreshEars();
    });
  }

  // 2. Render Selection Grids (Card Previews)
  renderSelectorGrid('eyes-picker', 'eyes', 11, 'eyes');
  renderSelectorGrid('eyebrows-picker', 'eyebrow', 7, 'eyebrows');
  renderSelectorGrid('nose-picker', 'nose', 7, 'nose');
  renderSelectorGrid('mouth-picker', 'mouth', 14, 'mouth');

  // 3. Tab switching logic
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
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
      updatePreview();
    });
  });

  // 5. Action buttons
  document.getElementById('btn-randomize').addEventListener('click', randomizeCharacter);
  document.getElementById('btn-reset').addEventListener('click', resetCharacter);
  document.getElementById('btn-export-svg').addEventListener('click', exportAsSVG);
  document.getElementById('btn-export-png').addEventListener('click', exportAsPNG);

  // Add eyebrow color option in Eyebrow picker
  addEyebrowsColorPicker();
}

// Render selector cards with small vector icons
function renderSelectorGrid(containerId, assetKey, count, stateKey) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = '';
  
  for (let i = 1; i <= count; i++) {
    const svgStr = meeAssets.facial[assetKey][i];
    if (!svgStr) continue;

    const card = document.createElement('div');
    card.className = `selector-card ${i === state[stateKey] ? 'active' : ''}`;
    card.dataset.index = i;
    
    // Setup nested scaled SVG for preview
    const viewBox = getSvgViewBox(svgStr);
    const innerContent = getSvgInnerContent(svgStr);
    
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

// Add hair/eyebrows color picker inside eyebrows picker section
function addEyebrowsColorPicker() {
  const parent = document.getElementById('eyebrows-picker').parentElement;
  
  const colorPickerWrapper = document.createElement('div');
  colorPickerWrapper.className = 'eyebrows-color-section';
  colorPickerWrapper.innerHTML = `
    <label class="group-subtitle" style="font-size: 0.9rem; font-weight:600; color: var(--text-muted); margin-top: 10px; display: block;">
      <i class="fa-solid fa-paintbrush"></i> Hair / Eyebrow Color
    </label>
    <div class="eyebrows-colors-grid" style="display: flex; gap: 8px; margin-top: 8px;"></div>
  `;
  
  const grid = colorPickerWrapper.querySelector('.eyebrows-colors-grid');
  
  eyebrowsColors.forEach(color => {
    const swatch = document.createElement('div');
    swatch.className = 'color-swatch';
    swatch.style.cssText = `
      width: 28px;
      height: 28px;
      border-radius: 50%;
      background-color: ${color.hex};
      border: 2px solid ${state.eyebrowsColor === color.hex ? '#ffffff' : 'transparent'};
      cursor: pointer;
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      transition: var(--transition-smooth);
    `;
    swatch.title = color.name;
    
    swatch.addEventListener('click', () => {
      grid.querySelectorAll('.color-swatch').forEach(s => s.style.borderColor = 'transparent');
      swatch.style.borderColor = '#ffffff';
      state.eyebrowsColor = color.hex;
      updatePreview();
    });
    
    grid.appendChild(swatch);
  });
  
  parent.appendChild(colorPickerWrapper);
}

// Compose final character SVG
function composeCharacterSVG() {
  // Always use clothed model body template strictly
  let bodySvg = meeAssets.body['clothes'][state.gender]['default'];
  if (!bodySvg) {
    bodySvg = meeAssets.body['clothes'][state.gender][state.skinTone];
  }
  
  // Retrieve skin tone colors for the current skinTone index
  const colors = meeAssets.skinToneColors[state.skinTone];
  const primarySkinColor = state.customPrimaryColor || colors.primary;
  const shadowSkinColor = state.customShadowColor || colors.shadow;
  
  // Dynamic color replacement in base body SVG
  bodySvg = bodySvg
    // Replace style rules
    .replace(/\.cls-6\s*\{\s*fill\s*:\s*#ffe7e6\s*;?\s*\}/i, `.cls-6{fill:${primarySkinColor};}`)
    .replace(/\.cls-7\s*\{\s*fill\s*:\s*#(fcc|ffcccc)\s*;?\s*\}/i, `.cls-7{fill:${shadowSkinColor};}`)
    // Replace stops in linear-gradient with a clean 2-stop gradient
    .replace(/(<linearGradient id="linear-gradient"[\s\S]*?>)[\s\S]*?(<\/linearGradient>)/i, 
      `$1<stop offset="0" stop-color="${primarySkinColor}"/><stop offset="1" stop-color="${shadowSkinColor}"/>$2`)
    // Global color replacements
    .replace(/#ffe7e6/gi, primarySkinColor)
    .replace(/#ffcccc/gi, shadowSkinColor)
    .replace(/#fcc\b/gi, shadowSkinColor);
  
  // Extract base64 images in body template (ears) and swap with correct skin tone ears
  const bodyBase64 = extractBase64Images(bodySvg);
  const earsSvg = meeAssets.facial.ears[state.skinTone];
  if (earsSvg) {
    let earsBase64;
    if (state.recoloredEars && state.recoloredEars.length >= 2) {
      earsBase64 = state.recoloredEars;
    } else {
      earsBase64 = extractBase64Images(earsSvg);
    }
    if (earsBase64.length >= 2 && bodyBase64.length >= 2) {
      bodySvg = bodySvg.replace(bodyBase64[0], earsBase64[0]); // Right ear
      bodySvg = bodySvg.replace(bodyBase64[1], earsBase64[1]); // Left ear
    }
  }
  
  // Load facial features
  const eyesSvg = meeAssets.facial.eyes[state.eyes];
  
  let eyebrowSvg = meeAssets.facial.eyebrow[state.eyebrows];
  if (eyebrowSvg) {
    eyebrowSvg = eyebrowSvg
      .replace(/fill=["']#000000["']/gi, `fill="${state.eyebrowsColor}"`)
      .replace(/fill=["']#000["']/gi, `fill="${state.eyebrowsColor}"`);
  }
  
  let noseSvg = meeAssets.facial.nose[state.nose];
  if (noseSvg) {
    noseSvg = noseSvg.replace(/#f4b28e/gi, shadowSkinColor);
  }
  
  const mouthSvg = meeAssets.facial.mouth[state.mouth];
  
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
    y: targetNoseBottomY - (noseCenter.top + noseCenter.height)
  };
  
  const mouthOffset = {
    x: targetMouthCenter.x - mouthCenter.x,
    y: targetMouthCenter.y - mouthCenter.y
  };
  
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
    </g>
  `;
  
  // Inject facial group right before the closing </svg> tag
  const injectIndex = bodySvg.lastIndexOf('</svg>');
  if (injectIndex === -1) return bodySvg;
  
  const composedSvg = bodySvg.substring(0, injectIndex) + 
                       faceGroup + 
                       bodySvg.substring(injectIndex);
                       
  return composedSvg;
}

// Update the preview window
// Injected a slight delay so that dynamic DOM measurement (getBBox) has time to evaluate correctly
function updatePreview() {
  const container = document.getElementById('svg-preview-container');
  container.innerHTML = '<div class="loader-spinner"><i class="fa-solid fa-spinner fa-spin"></i></div>';
  
  setTimeout(() => {
    const finalSvg = composeCharacterSVG();
    container.innerHTML = finalSvg;
  }, 50);
}

// Randomize Character
function randomizeCharacter() {
  state.skinTone = Math.floor(Math.random() * 10) + 1;
  state.eyes = Math.floor(Math.random() * 11) + 1;
  state.eyebrows = Math.floor(Math.random() * 7) + 1;
  state.nose = Math.floor(Math.random() * 7) + 1;
  state.mouth = Math.floor(Math.random() * 14) + 1;
  state.gender = Math.random() > 0.5 ? 'male' : 'female';
  
  const colorIndex = Math.floor(Math.random() * eyebrowsColors.length);
  state.eyebrowsColor = eyebrowsColors[colorIndex].hex;
  
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
  state.eyes = 1;
  state.eyebrows = 1;
  state.nose = 1;
  state.mouth = 1;
  state.eyebrowsColor = '#4b382a';
  
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
  
  // Sync custom color pickers
  const colors = meeAssets.skinToneColors[state.skinTone];
  const customBase = document.getElementById('custom-skin-base');
  const customShading = document.getElementById('custom-skin-shading');
  if (customBase) customBase.value = state.customPrimaryColor || colors.primary;
  if (customShading) customShading.value = state.customShadowColor || colors.shadow;
  
  syncGridSelector('eyes-picker', state.eyes);
  syncGridSelector('eyebrows-picker', state.eyebrows);
  syncGridSelector('nose-picker', state.nose);
  syncGridSelector('mouth-picker', state.mouth);
  
  const colorGrid = document.querySelector('.eyebrows-colors-grid');
  if (colorGrid) {
    colorGrid.querySelectorAll('.color-swatch').forEach(swatch => {
      if (swatch.title === eyebrowsColors.find(c => c.hex === state.eyebrowsColor)?.name) {
        swatch.style.borderColor = '#ffffff';
      } else {
        swatch.style.borderColor = 'transparent';
      }
    });
  }
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

// Export Character as PNG file download
function exportAsPNG() {
  const svgContent = composeCharacterSVG();
  const canvas = document.getElementById('export-canvas');
  const ctx = canvas.getContext('2d');
  
  const isFemale = state.gender === 'female';
  const width = isFemale ? 179.89 : 180;
  const height = isFemale ? 442.3 : 441;
  
  const scale = 3;
  canvas.width = width * scale;
  canvas.height = height * scale;
  
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  const img = new Image();
  const svgBlob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(svgBlob);
  
  img.onload = function() {
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    
    const pngUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = pngUrl;
    link.download = `mee-character-${state.gender}-clothed.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
  };
  
  img.src = url;
}

// Initialize Application
window.addEventListener('DOMContentLoaded', () => {
  // Only initialize if we are on the main page with picker elements
  if (!document.getElementById('skin-tone-picker')) {
    return;
  }
  initUI();
  recolorAndRefreshEars();
});
