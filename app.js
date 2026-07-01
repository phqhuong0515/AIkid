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
  dress: 0  // 0 = None, 1 to 2
};

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

// State history tracking for undo functionality
let stateHistory = [];
const maxHistory = 50;

function pushStateToHistory() {
  const stateClone = JSON.stringify(state);
  // Only push if different from last item
  if (stateHistory.length === 0 || stateHistory[stateHistory.length - 1] !== stateClone) {
    stateHistory.push(stateClone);
    if (stateHistory.length > maxHistory) {
      stateHistory.shift();
    }
  }
}

function undoState() {
  if (stateHistory.length > 1) {
    stateHistory.pop(); // Remove current state
    const previousState = JSON.parse(stateHistory[stateHistory.length - 1]);
    Object.assign(state, previousState);
    syncUIControls();
    recolorAndRefreshEars();
  } else {
    alert("Không có thao tác nào để hoàn tác!");
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

  // 1.5. Bind Custom Color inputs
  const customBase = document.getElementById('custom-skin-base');
  const customShading = document.getElementById('custom-skin-shading');
  const enableCustomSkin = document.getElementById('enable-custom-skin');
  const customPickersDiv = document.querySelector('.custom-color-pickers');

  if (enableCustomSkin && customPickersDiv && customBase && customShading) {
    enableCustomSkin.addEventListener('change', (e) => {
      if (e.target.checked) {
        customPickersDiv.style.display = 'flex';
        state.customPrimaryColor = customBase.value;
        state.customShadowColor = customShading.value;
      } else {
        customPickersDiv.style.display = 'none';
        state.customPrimaryColor = null;
        state.customShadowColor = null;
      }
      recolorAndRefreshEars();
    });

    customBase.addEventListener('input', (e) => {
      state.customPrimaryColor = e.target.value;
      document.querySelectorAll('.skin-swatch').forEach(s => s.classList.remove('active'));
      document.getElementById('active-skin-hex').textContent = e.target.value.toUpperCase();
      recolorAndRefreshEars();
    });

    customShading.addEventListener('input', (e) => {
      state.customShadowColor = e.target.value;
      document.querySelectorAll('.skin-swatch').forEach(s => s.classList.remove('active'));
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
  renderCustomGrid('pants-picker', 'outfit', Object.keys(meeAssets.outfit.pants).length, 'pants', true, 'pants');
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
      // Re-render gender-specific grids dynamically
      renderCustomGrid('shirt-picker', 'outfit', Object.keys(meeAssets.outfit.shirt[state.gender]).length, 'shirt', true, 'shirt');
      renderCustomGrid('dress-picker', 'outfit', 1 + Object.keys(meeAssets.outfit.dress[state.gender] || {}).length, 'dress', true, 'dress');
      updatePreview();
    });
  });

  // 5. Action buttons
  const btnRotate = document.getElementById('btn-rotate');
  if (btnRotate) {
    btnRotate.addEventListener('click', () => {
      document.getElementById('svg-preview-container').classList.toggle('flipped');
    });
  }

  const btnReset = document.getElementById('btn-reset');
  if (btnReset) {
    btnReset.addEventListener('click', resetCharacter);
  }

  const btnUndo = document.getElementById('btn-undo');
  if (btnUndo) {
    btnUndo.addEventListener('click', undoState);
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
      exportAsPNG();
      setTimeout(exportAsSVG, 500);
    });
  }

  // Add hair and eyebrows color pickers
  addHairColorPicker();
  addEyebrowsColorPicker();
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
      svgStr = svgStr['default'] || svgStr[1] || '';
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
        svgStr = meeAssets.outfit.shirt[state.gender][i];
      } else if (subCategory === 'pants') {
        svgStr = meeAssets.outfit.pants[i];
      } else if (subCategory === 'dress') {
        if (i === 1) {
          svgStr = meeAssets.outfit.dress.unisex[1];
        } else if (i === 2) {
          svgStr = meeAssets.outfit.dress[state.gender][1];
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
      <span class="card-label">${subCategory === 'dress' ? (i === 1 ? 'Unisex' : 'Dress') : i}</span>
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
    <label class="group-subtitle" style="font-size: 0.9rem; font-weight:600; color: var(--text-muted); margin-top: 10px; display: block;">
      <i class="fa-solid fa-paintbrush"></i> Màu Tóc (Hair Color)
    </label>
    <div class="hair-colors-grid"></div>
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
    <div class="eyebrows-sync-header" style="margin-top: 15px; margin-bottom: 10px; display: flex; align-items: center; justify-content: space-between;">
      <label class="group-subtitle" style="font-size: 0.9rem; font-weight:600; color: var(--text-muted); margin: 0;">
        <i class="fa-solid fa-paintbrush"></i> Màu Lông Mày (Eyebrows)
      </label>
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

// Helper to clean unisex dress
function cleanDressChung(svgStr) {
  if (!svgStr) return '';
  return svgStr.replace(/<path[^>]*?fill=["'](?:#FFF1CC|white|black|#005C00|#090D56|#8FA6B5)["'][^>]*?>/gi, '');
}

// Compose final character SVG
function composeCharacterSVG() {
  const stylesArray = [];
  const defsArray = [];

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

  if (state.dress > 0) {
    // Hide default underwear/pants to prevent showing under the dress
    bodySvg = bodySvg
      .replace(/\.cls-10\s*\{\s*fill\s*:\s*url\(#linear-gradient-3\);?\s*\}/i, `.cls-10{display:none;}`)
      .replace(/\.cls-11\s*\{\s*fill\s*:\s*url\(#linear-gradient-4\);?\s*\}/i, `.cls-11{display:none;}`)
      .replace(/\.cls-12\s*\{\s*fill\s*:\s*url\(#linear-gradient-5\);?\s*\}/i, `.cls-12{display:none;}`);
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
    const faceGroup = `<g id="mee-face-shape">${getSvgInnerContent(faceSvg)}</g>`;
    
    bodySvg = bodySvg.replace(headEllipseRegex, faceGroup);
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

  // Load facial features
  let eyesSvg = meeAssets.facial.eyes[state.eyes] || '';
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

  // 3. Outfit Layering
  let outfitGroup = '';
  if (state.dress > 0) {
    let dressSvg = '';
    let dressTransform = '';
    if (state.dress === 1) {
      dressSvg = cleanDressChung(meeAssets.outfit.dress.unisex[1]);
      if (dressSvg) {
        dressSvg = makeSvgIdsUnique(dressSvg, 'mee-dress');
        dressSvg = extractStylesAndDefs(dressSvg, stylesArray, defsArray, '#mee-outfit-dress');
        dressTransform = 'translate(-7.72, -47.23)';
      }
    } else if (state.dress === 2) {
    dressSvg = meeAssets.outfit.dress[state.gender][1];
    if (dressSvg) {
      dressSvg = makeSvgIdsUnique(dressSvg, 'mee-dress');
      dressSvg = extractStylesAndDefs(dressSvg, stylesArray, defsArray, '#mee-outfit-dress');
      const dressCenter = getSvgElementCenter(dressSvg) || { x: 69.53, y: 145 };
      const dressTranslateX = 90.32 - dressCenter.x;
      const dressTranslateY = state.gender === 'female' ? 136.32 : 136.42;
      dressTransform = `translate(${dressTranslateX.toFixed(2)}, ${dressTranslateY.toFixed(2)})`;
    }
  }

  if (dressSvg) {
    outfitGroup = `<g id="mee-outfit-dress" transform="${dressTransform}">${getSvgInnerContent(dressSvg)}</g>`;
  }
} else {
  // Render shirt and pants
  let shirtSvg = '';
  let pantsSvg = '';

  if (state.shirt > 0) {
    shirtSvg = meeAssets.outfit.shirt[state.gender][state.shirt];
  }
  if (state.pants > 0) {
    pantsSvg = meeAssets.outfit.pants[state.pants];
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
    const shirtTranslateY = state.shirt === 3
      ? (state.gender === 'female' ? 129.93 : 129.91)
      : (state.gender === 'female' ? 139.93 : 139.91);
    shirtTransform = `translate(${shirtTranslateX.toFixed(2)}, ${shirtTranslateY.toFixed(2)})`;
  }

  let pantsTransform = '';
  if (pantsSvg) {
    const pantsCenter = getSvgElementCenter(pantsSvg) || { x: 62.0, y: 97 };
    const pantsTranslateX = 90.32 - pantsCenter.x;
    const pantsTranslateY = 246.8;
    pantsTransform = `translate(${pantsTranslateX.toFixed(2)}, ${pantsTranslateY.toFixed(2)})`;
  }

  let pantsGroup = pantsSvg ? `<g id="mee-outfit-pants" transform="${pantsTransform}">${getSvgInnerContent(pantsSvg)}</g>` : '';
  let shirtGroup = shirtSvg ? `<g id="mee-outfit-shirt" transform="${shirtTransform}">${getSvgInnerContent(shirtSvg)}</g>` : '';

  outfitGroup = pantsGroup + shirtGroup;
}

  // Inject outfit and facial groups right before the closing </svg> tag
  const injectIndex = bodySvg.lastIndexOf('</svg>');
  if (injectIndex === -1) return bodySvg;

  let composedSvg = bodySvg.substring(0, injectIndex) +
    outfitGroup +
    faceGroup +
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
    
    // Add margin parameters: left/right = 30px, top = 45px (for tall hair), bottom = 35px (for feet)
    const paddingX = 30;
    const paddingTop = 45;
    const paddingBottom = 35;
    
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

  setTimeout(() => {
    const finalSvg = composeCharacterSVG();
    container.innerHTML = finalSvg;
  }, 50);
}

// Randomize Character
function randomizeCharacter() {
  state.skinTone = Math.floor(Math.random() * 10) + 1;
  state.face = Math.floor(Math.random() * 6) + 1;
  state.eyes = Math.floor(Math.random() * 11) + 1;
  state.eyebrows = Math.floor(Math.random() * 7) + 1;
  state.nose = Math.floor(Math.random() * 7) + 1;
  state.mouth = Math.floor(Math.random() * 14) + 1;
  state.gender = Math.random() > 0.5 ? 'male' : 'female';

  const colorIndex = Math.floor(Math.random() * hairColors.length);
  state.hairColor = hairColors[colorIndex].index;
  state.syncEyebrowsColor = Math.random() > 0.3; // 70% chance to sync
  if (state.syncEyebrowsColor) {
    state.eyebrowsColorIndex = state.hairColor;
  } else {
    state.eyebrowsColorIndex = hairColors[Math.floor(Math.random() * hairColors.length)].index;
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

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const img = new Image();
  const svgBlob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(svgBlob);

  img.onload = function () {
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
