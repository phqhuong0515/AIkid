export type ArtRedrawStyleSpec = {
  id: string;
  canonicalPrompt: string;
};

/**
 * Pure, deterministic Art prompt builder. Style/reference rules always outrank
 * the optional child instruction so free text cannot silently replace them.
 */
export function buildArtRedrawPrompt(
  style: ArtRedrawStyleSpec,
  optionalUserDetail = '',
): string {
  const canonicalStyle = style.canonicalPrompt.trim();
  if (!style.id.trim() || !canonicalStyle) {
    throw new Error('Phong cách vẽ thiếu canonical prompt');
  }
  const detail = optionalUserDetail.replace(/\s+/g, ' ').trim().slice(0, 600);
  return [
    'TASK: Transform the supplied reference image into one polished, kid-friendly illustration; do not invent an unrelated scene.',
    'REFERENCE PRESERVATION (MANDATORY): Preserve the original subject identity, pose, expression, number of characters, distinctive shapes, relative layout, and important colors. Keep recognizable child-drawn ideas while cleaning accidental scribbles only.',
    `DOMINANT STYLE REQUIREMENT [${style.id.toUpperCase()}]: ${canonicalStyle}`,
    'TRANSFORMATION: Re-render every visible element cohesively in the dominant style. Improve composition, edges, lighting, depth, and finish while retaining the reference content.',
    detail ? `OPTIONAL DETAIL (lower priority; apply only when compatible with preservation and style): ${detail}` : '',
    'OUTPUT RULES: One centered readable scene, age-appropriate, high quality, no added words, no watermark, no logo, no collage, no multi-panel sheet, no before/after comparison.',
    'If the optional detail conflicts with reference preservation, dominant style, or output rules, ignore only the conflicting portion.',
  ].filter(Boolean).join(' ');
}
