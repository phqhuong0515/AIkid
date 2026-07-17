import AsyncStorage from '@react-native-async-storage/async-storage';

import type { CharacterDraft, SavedCharacter } from './types';

export const DRAFT_KEY = 'aikid.character.draft.v1';
export const SAVED_KEY = 'aikid.character.saved.v1';

/** Legacy prototype keys (migrate once) */
const LEGACY = {
  categoryInputs: 'storymee_generate_category_inputs',
  activeCategory: 'storymee_generate_active_category',
  name: 'storymee_char_name',
  age: 'storymee_char_age',
  gender: 'storymee_char_gender',
  birthday: 'storymee_char_birthday',
  species: 'storymee_char_species',
  description: 'storymee_char_description',
  generated: 'storymee_generated_character_img',
  uploaded: 'storymee_uploaded_image',
  saved: 'storymee_saved_characters',
} as const;

export async function loadDraftJson(): Promise<string | null> {
  return AsyncStorage.getItem(DRAFT_KEY);
}

export async function saveDraftJson(json: string): Promise<void> {
  await AsyncStorage.setItem(DRAFT_KEY, json);
}

export async function loadSavedJson(): Promise<string | null> {
  return AsyncStorage.getItem(SAVED_KEY);
}

export async function saveSavedJson(json: string): Promise<void> {
  await AsyncStorage.setItem(SAVED_KEY, json);
}

/** Best-effort web localStorage read for prototype migration */
function webLocalGet(key: string): string | null {
  try {
    if (typeof globalThis !== 'undefined' && globalThis.localStorage) {
      return globalThis.localStorage.getItem(key);
    }
  } catch {
    // ignore
  }
  return null;
}

export async function readLegacyFragments(): Promise<Partial<CharacterDraft>> {
  const partial: Partial<CharacterDraft> = {};

  const pick = async (key: string) =>
    (await AsyncStorage.getItem(key)) ?? webLocalGet(key);

  const name = await pick(LEGACY.name);
  if (name) partial.name = name;
  const age = await pick(LEGACY.age);
  if (age) partial.age = age;
  const gender = await pick(LEGACY.gender);
  if (gender) partial.gender = gender;
  const birthday = await pick(LEGACY.birthday);
  if (birthday) partial.birthday = birthday;
  const species = await pick(LEGACY.species);
  if (species) partial.species = species;
  const description = await pick(LEGACY.description);
  if (description) partial.description = description;

  const active = await pick(LEGACY.activeCategory);
  if (
    active === 'shape' ||
    active === 'parts' ||
    active === 'face' ||
    active === 'hair' ||
    active === 'clothes'
  ) {
    partial.activeCategory = active;
  }

  const catRaw = await pick(LEGACY.categoryInputs);
  if (catRaw) {
    try {
      partial.categoryInputs = JSON.parse(catRaw);
    } catch {
      // ignore
    }
  }

  // Skip multi-MB data URLs for generated/uploaded to avoid blowing AsyncStorage
  return partial;
}

export async function readLegacySaved(): Promise<SavedCharacter[] | null> {
  const raw =
    (await AsyncStorage.getItem(LEGACY.saved)) ?? webLocalGet(LEGACY.saved);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return null;
    return parsed as SavedCharacter[];
  } catch {
    return null;
  }
}
