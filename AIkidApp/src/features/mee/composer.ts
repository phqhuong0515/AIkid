import { MEE_ASSETS, meeAssetFor } from './assets';
import type { MeeDraft } from './types';

function inner(svg: string): string {
  return svg.match(/<svg[\s\S]*?>([\s\S]*?)<\/svg>/i)?.[1] || '';
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
  return `<g id="${prefix}"${transform ? ` transform="${transform}"` : ''}>${inner(prefixIds(svg, prefix))}</g>`;
}

function recolorBody(svg: string, draft: MeeDraft): string {
  const preset = MEE_ASSETS.skinToneColors[draft.skinTone] || MEE_ASSETS.skinToneColors[1];
  const primary = draft.customPrimaryColor || preset.primary;
  const shadow = draft.customShadowColor || preset.shadow;
  return svg.replace(new RegExp(preset.primary, 'gi'), primary).replace(new RegExp(preset.shadow, 'gi'), shadow);
}

/** Compose the original Illustrator layers without a DOM/WebView. */
export function buildMeeAssetSvg(draft: MeeDraft): string {
  const bodyVariant = MEE_ASSETS.body.clothes[draft.gender];
  const body = recolorBody(bodyVariant.default || bodyVariant[draft.skinTone] || '', draft);
  const behind = meeAssetFor('behind', draft.behind, draft);
  const face = meeAssetFor('face', draft.face, draft);
  const eyes = meeAssetFor('eyes', draft.eyes, draft);
  const eyebrow = meeAssetFor('eyebrow', draft.eyebrows, draft);
  const nose = MEE_ASSETS.facial.nose[draft.nose] || '';
  const mouth = meeAssetFor('mouth', draft.mouth, draft);
  const bang = meeAssetFor('bang', draft.bang, draft);
  const shirt = meeAssetFor('shirt', draft.shirt, draft);
  const pants = meeAssetFor('pants', draft.pants, draft);

  // Coordinates match the original 180 × 442 body artboard and browser
  // compositor. Back hair is first; bangs/facial details are always on top.
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-33 -48 246 528">
    <rect x="-33" y="-48" width="246" height="528" rx="28" fill="${draft.backgroundColor}"/>
    ${layer(behind, 'behind', 'translate(20.38 -12.37)')}
    ${layer(body, 'body')}
    ${layer(pants, 'pants', 'translate(28.32 246.8)')}
    ${layer(shirt, 'shirt', 'translate(26.32 139.91)')}
    ${layer(face, 'face')}
    ${layer(eyes, 'eyes', 'translate(52.32 72.37)')}
    ${layer(eyebrow, 'eyebrow', 'translate(52.32 63.06)')}
    ${layer(nose, 'nose', 'translate(75.32 92.45)')}
    ${layer(mouth, 'mouth', 'translate(65.32 99.52)')}
    ${layer(bang, 'bang', 'translate(29.05 0)')}
  </svg>`;
}
