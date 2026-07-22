import type { ComicCharacter, ComicPage } from '../store/useComicDraft';

const MAX_ACTION = 180;
const MAX_DIALOGUE = 90;
const MAX_CHARACTER = 220;

function compact(value: string, max: number): string {
  const normalized = value.replace(/\s+/g, ' ').trim();
  return normalized.length > max ? `${normalized.slice(0, max - 1)}…` : normalized;
}

export function buildComicPagePrompt(input: {
  page: ComicPage;
  genre: string;
  artStyle: string;
  cast: ComicCharacter[];
}): string {
  const { page } = input;
  const layout = page.panelCount === 2
    ? 'GRID=2x1; EXACTLY 2 panels numbered 1,2.'
    : page.panelCount === 4
      ? 'GRID=2x2; EXACTLY 4 panels numbered 1,2,3,4.'
      : 'GRID=3x2; EXACTLY 6 panels numbered 1,2,3,4,5,6. Never merge panels.';
  // Put every panel before secondary styling/context so a provider-side token cap
  // cannot silently remove the final panels.
  const panels = page.panels.map((item) => {
    const dialogue = item.dialogue
      ? `TEXT="${compact(item.speaker ? `${item.speaker}: ${item.dialogue}` : item.dialogue, MAX_DIALOGUE)}"`
      : 'TEXT=NONE';
    return `P${item.order}{VISUAL=${compact(item.action, MAX_ACTION)};${dialogue}}`;
  }).join('\n');
  const cast = input.cast.map((item) => `${compact(item.name, 40)}=${compact(item.appearancePrompt || item.personality, MAX_CHARACTER)}`).join('; ');
  return [
    `Create ONE kid-friendly comic page. ${layout}`,
    panels,
    `STYLE=${compact(input.artStyle, 80)}. GENRE=${compact(input.genre, 40)}. STORY=${compact(page.idea, 260)}.`,
    cast ? `CHARACTERS (same appearance every panel): ${cast}.` : 'Use a small consistent cast.',
    `VALIDATION: visibly count ${page.panelCount} separate rectangular panels before finalizing.`,
    'Render each supplied TEXT exactly once in its matching speech bubble. Preserve Vietnamese accents exactly. Do not invent, translate, shorten or repeat dialogue.',
    'No extra captions, sound effects, logos or watermark.',
  ].join('\n');
}
