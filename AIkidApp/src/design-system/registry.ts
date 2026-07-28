import { storymeeTemplate } from './templates/storymee';
import type { AikidTemplate } from './types';

/**
 * Compile-time template registry.
 *
 * Import a new template here and add it to this map. The same selection is used
 * by React Native Web, iOS and Android.
 */
export const templateRegistry = {
  storymee: storymeeTemplate,
} satisfies Record<string, AikidTemplate>;

export type TemplateId = keyof typeof templateRegistry;

export function resolveTemplate(id?: string): AikidTemplate {
  if (id && id in templateRegistry) {
    return templateRegistry[id as TemplateId];
  }
  return storymeeTemplate;
}
