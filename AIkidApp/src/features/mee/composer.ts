import { MEE_ASSETS, meeAssetFor } from './assets';
import type { MeeDraft } from './types';

function inner(svg: string): string {
  return svg.match(/<svg[\s\S]*?>([\s\S]*?)<\/svg>/i)?.[1] || '';
}

/** React Native SVG does not reliably apply CSS rules from embedded <style>. */
function inlineClassStyles(svg: string): string {
  const rules = new Map<string, Array<[string, string]>>();
  for (const style of svg.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)) {
    for (const rule of style[1].matchAll(/([^{}]+)\{([^{}]+)\}/g)) {
      const declarations = rule[2].split(';').map((declaration) => declaration.trim()).filter(Boolean)
        .map((declaration) => declaration.split(/:(.*)/s).slice(0, 2) as [string, string])
        .filter(([name, value]) => Boolean(name && value));
      for (const selector of rule[1].split(',')) {
        const className = selector.trim().match(/^\.([\w-]+)$/)?.[1];
        if (className) rules.set(className, declarations);
      }
    }
  }
  if (!rules.size) return svg;

  return svg
    .replace(/<([a-z][\w:-]*)([^<>]*?)\sclass=(["'])([^"']+)\3([^<>]*?)>/gi,
      (tag, name: string, before: string, quote: string, classes: string, after: string) => {
        let attributes = `${before} class=${quote}${classes}${quote}${after}`;
        const selfClosing = /\/\s*$/.test(attributes);
        if (selfClosing) attributes = attributes.replace(/\/\s*$/, '');
        for (const className of classes.split(/\s+/)) {
          for (const [property, value] of rules.get(className) || []) {
            const escapedProperty = property.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const existing = new RegExp(`\\s${escapedProperty}=(['"])[\\s\\S]*?\\1`, 'i');
            const attribute = ` ${property}="${value.trim()}"`;
            attributes = existing.test(attributes) ? attributes.replace(existing, attribute) : `${attributes}${attribute}`;
          }
        }
        return `<${name}${attributes}${selfClosing ? '/' : ''}>`;
      })
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
}

function prefixIds(svg: string, prefix: string): string {
  const ids = [...svg.matchAll(/\bid=["']([^"']+)["']/gi)].map((match) => match[1]);
  let result = ids.reduce((value, id) => value
    .replace(new RegExp(`id=["']${id}["']`, 'g'), `id="${prefix}-${id}"`)
    .replace(new RegExp(`url\\(#${id}\\)`, 'g'), `url(#${prefix}-${id})`)
    .replace(new RegExp(`(["'])#${id}(["'])`, 'g'), `$1#${prefix}-${id}$2`), svg);
  const classes = [...new Set([...result.matchAll(/class=["']([^"']+)["']/gi)]
    .flatMap((match) => match[1].split(/\s+/).filter(Boolean)))];
  for (const className of classes) {
    const renamed = `${prefix}-${className}`;
    result = result
      .replace(new RegExp(`(["'\\s])${className}(["'\\s])`, 'g'), `$1${renamed}$2`)
      .replace(new RegExp(`\\.${className}(?![\\w-])`, 'g'), `.${renamed}`);
  }
  return result;
}

function layer(svg: string, prefix: string, transform = ''): string {
  if (!svg) return '';
  return `<g id="${prefix}"${transform ? ` transform="${transform}"` : ''}>${inner(prefixIds(inlineClassStyles(svg), prefix))}</g>`;
}

function recolorBody(svg: string, draft: MeeDraft): string {
  const preset = MEE_ASSETS.skinToneColors[draft.skinTone] || MEE_ASSETS.skinToneColors[1];
  const primary = draft.customPrimaryColor || preset.primary;
  const shadow = draft.customShadowColor || preset.shadow;
  return svg.replace(new RegExp(preset.primary, 'gi'), primary).replace(new RegExp(preset.shadow, 'gi'), shadow);
}

type Bounds = readonly [centerX: number, centerY: number, top: number, width: number, height: number];

// Measured with SVGGraphicsElement.getBBox() from the original Illustrator
// catalog. These values replace the browser-only measurement used by the old
// composer while preserving its exact center/top alignment on every platform.
const BOUNDS = {
  face: [[90.11,67.34,.61,154.08,133.46],[89.94,67.34,.61,150.24,133.46],[90.51,68.48,.61,143.52,135.74],[89.65,67.17,.38,165.6,133.58],[90.06,67.395,.55,161.28,133.69],[89.91,66.74,0,165.6,133.48]],
  eyes: [[38.02,15,6.85,60.05,16.3],[38.02,15,4.305,68.3,21.39],[38.02,15,6.29,60.84,17.42],[38.02,15,11.1,68.33,7.8],[38.02,15,9.36,72.862,11.28],[38.02,15,5.663,76.021,18.673],[38.02,15,9.945,74.779,10.11],[38.02,15,9.423,68.74,11.155],[38.02,15,7.087,67.715,15.826],[38.02,15,9.61,69.173,10.78],[38.02,15,5.299,74.307,19.403]],
  eyebrow: [[38.01,10,4.606,69.169,10.788],[38.01,10,5.805,72.835,8.391],[38.01,10,2.953,50.518,14.095],[38.01,10,4.612,69.177,10.777],[38.01,10,3.864,72.28,12.272],[38.01,10,5.022,75.885,9.956],[38.01,10,8,74.83,4]],
  nose: [[14.868,9.03,6.87,13.163,4.319],[15.154,2.458,-6.1,13.024,17.115],[15,9,7.2,3.64,3.6],[15,9,3.42,12.89,11.16],[15,9,3.84,13.76,10.32],[15,9,.51,7.11,16.98]],
  mouth: [[25,12.474,10.294,18.164,4.361],[24.892,13.311,10.836,13.026,4.95],[24.889,12.313,9.835,13.023,4.956],[25,12.5,4.52,21.29,15.96],[25.084,13.562,8.935,21.122,9.253],[25.805,12.508,7.085,21.375,10.847],[25,12.5,7.85,10.74,9.3],[25,12.5,11.37,16.429,2.26],[25,12.555,8.7,21.29,7.71],[24.875,13.383,10.812,21.078,5.142],[24.242,13.633,8.14,30.063,10.985],[25.101,12.311,6.808,30.024,11.007],[14.851,12.284,9.618,11.407,5.332],[34.622,12.776,10.192,11.435,5.168]],
  bang: [[61.26,42.397,-.377,122.52,85.547],[62.445,47.615,-.31,124.89,95.85],[62.35,38.52,-.31,124.7,77.66],[61.261,42.43,-.31,122.523,85.48],[61.633,47.428,0,123.265,94.856],[61.25,42.716,0,122.5,85.432],[61.215,41.86,0,122.43,83.72],[64.36,46.935,0,128.72,93.87]],
  behind: [[69.935,75.615,0,139.87,151.23],[84.85,76.895,0,169.7,153.79],[78.995,82.422,0,157.99,164.844],[69.975,77.082,0,139.95,154.164],[91.33,128.185,0,182.66,256.37],[83.79,81.12,0,167.58,162.24],[86.733,79.492,0,173.465,158.984],[91.121,75.62,0,182.242,151.24]],
  shirt: {
    male: [[63.68,59.592,-2,127.36,123.184],[77.783,59.592,-2,155.566,123.184],[79.536,70.427,0,159.072,140.854],[63.63,64.08,-2,127.26,132.16],[72.289,67.226,-1.979,144.576,138.41],[80.032,66.338,-3.938,160.064,140.551]],
    female: [[63.66,59.681,-2,127.32,123.362],[77.767,59.681,-2,155.534,123.362],[79.535,70.427,0,159.071,140.854],[63.63,64.075,-2,127.26,132.15],[72.309,67.141,-1.979,144.617,138.24],[80.032,66.338,-3.938,160.064,140.551]],
  },
  pants: [[47.695,34.683,0,95.39,69.366],[61.065,61.694,-4,122.13,131.387],[61.24,77.701,-4,122.48,163.401]],
} as const satisfies Record<string, unknown>;

const at = (values: readonly Bounds[], option: number, fallback: Bounds): Bounds => values[option - 1] || fallback;
const translate = (x: number, y: number) => `translate(${x.toFixed(3)} ${y.toFixed(3)})`;

/** Compose the original Illustrator layers without a DOM/WebView. */
export function buildMeeAssetSvg(draft: MeeDraft): string {
  const bodyVariant = MEE_ASSETS.body.clothes[draft.gender];
  let body = recolorBody(bodyVariant[draft.skinTone] || bodyVariant.default || bodyVariant[1] || '', draft);
  const behind = meeAssetFor('behind', draft.behind, draft);
  const face = meeAssetFor('face', draft.face, draft);
  const eyes = meeAssetFor('eyes', draft.eyes, draft);
  const eyebrow = meeAssetFor('eyebrow', draft.eyebrows, draft);
  const nose = MEE_ASSETS.facial.nose[draft.nose] || '';
  const mouth = meeAssetFor('mouth', draft.mouth, draft);
  const bang = meeAssetFor('bang', draft.bang, draft);
  const shirt = meeAssetFor('shirt', draft.shirt, draft);
  const pants = meeAssetFor('pants', draft.pants, draft);

  // A selected face replaces the template head and ears; overlaying both was
  // the source of the doubled/misaligned head visible after the native port.
  if (face) {
    body = body
      .replace(/<g class=["']cls-2["']>[\s\S]*?<\/g>\s*<\/g>/gi, '')
      .replace(/<g class=["']cls-4["']>[\s\S]*?<\/g>\s*<\/g>/gi, '')
      .replace(/<ellipse class=["']cls-6["'] cx=["']90\.32["'] cy=["']66\.73["'] rx=["']58\.47["'] ry=["']66\.73["']\s*\/?>/gi, '');
  }

  const behindBounds = at(BOUNDS.behind, draft.behind, [91.5,75.5,0,183,151]);
  const shirtBounds = at(BOUNDS.shirt[draft.gender], draft.shirt, [66.83,48,0,133.66,96]);
  const pantsBounds = at(BOUNDS.pants, draft.pants, [62,97,0,120,194]);
  const eyesBounds = at(BOUNDS.eyes, draft.eyes, [38,15,0,76,30]);
  const eyebrowBounds = at(BOUNDS.eyebrow, draft.eyebrows, [38,4.7,1.94,76,9.4]);
  const noseBounds = at(BOUNDS.nose, draft.nose, [15,9,0,30,18]);
  const mouthBounds = at(BOUNDS.mouth, draft.mouth, [25,12.6,0,50,25.2]);
  const bangBounds = at(BOUNDS.bang, draft.bang, [61.27,43,0,122.54,86]);
  const shirtY = draft.shirt === 3 ? (draft.gender === 'female' ? 129.93 : 129.91)
    : draft.shirt === 4 ? (draft.gender === 'female' ? 138.93 : 138.91)
      : draft.shirt >= 5 ? (draft.gender === 'female' ? 134.93 : 134.91)
        : (draft.gender === 'female' ? 139.93 : 139.91);
  const pantsY = draft.pants >= 2 ? 249.8 : 246.8;
  const pantsScaleX = draft.pants >= 2 ? (pantsBounds[3] - 4) / pantsBounds[3] : 1;
  const bangScale = (bangBounds[3] + 2) / bangBounds[3];

  // Coordinates match the original 180 × 442 body artboard and browser
  // compositor. Back hair is first; bangs/facial details are always on top.
  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="-33 -48 246 528">
    <rect x="-33" y="-48" width="246" height="528" rx="28" fill="${draft.backgroundColor}"/>
    ${layer(behind, 'behind', translate(90.32 - behindBounds[0], -12.37 - behindBounds[2]))}
    ${layer(body, 'body')}
    ${layer(pants, 'pants', `translate(90.32 ${pantsY.toFixed(3)}) scale(${pantsScaleX.toFixed(4)} 1) translate(${-pantsBounds[0]} 0)`)}
    ${layer(shirt, 'shirt', translate(90.32 - shirtBounds[0], shirtY))}
    ${layer(face, 'face')}
    ${layer(eyes, 'eyes', translate(90.32 - eyesBounds[0], 87.37 - eyesBounds[1]))}
    ${layer(eyebrow, 'eyebrow', translate(90.32 - eyebrowBounds[0], 65 - eyebrowBounds[2]))}
    ${layer(nose, 'nose', translate(90.32 - noseBounds[0], 101.08 - (noseBounds[2] + noseBounds[4])))}
    ${layer(mouth, 'mouth', translate(90.32 - mouthBounds[0], 112.12 - mouthBounds[1]))}
    ${layer(bang, 'bang', `translate(${(90.32 - bangBounds[0]).toFixed(3)} 0) translate(${bangBounds[0]} ${bangBounds[1]}) scale(${bangScale.toFixed(4)}) translate(${-bangBounds[0]} ${-bangBounds[1]})`)}
  </svg>`;
}
