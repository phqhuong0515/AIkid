export type CharacterCategoryId =
  | 'shape'
  | 'parts'
  | 'face'
  | 'hair'
  | 'clothes';

export type CategoryQuestionDef = {
  label: string;
  subject: string;
  choices: string[];
  placeholder: string;
};

/** Per-category answers — index-aligned to CATEGORY_QUESTIONS[cat] */
export type CategoryAnswers = Record<CharacterCategoryId, string[]>;

export type CharacterDraft = {
  schemaVersion: 1;
  name: string;
  age: string;
  gender: string;
  birthday: string;
  species: string;
  description: string;
  activeCategory: CharacterCategoryId;
  categoryInputs: CategoryAnswers;
  ideaNotes?: { shape?: string };
  uploadedImageUri: string | null;
  generatedImageUri: string | null;
  updatedAt: string;
};

export type SavedCharacter = {
  id: string;
  name: string;
  age?: string;
  gender?: string;
  species?: string;
  description?: string;
  birthday?: string;
  avatarUri: string;
  profileImgUri?: string;
  fullbodyImgUri?: string;
  source: 'ai' | 'mee' | 'seed' | 'draft';
  childProfileId?: string | null;
  createdAt: string;
  /** Snapshot of prompt at save time (offline) */
  userPrompt?: string;
};

export const CATEGORY_LABELS: Record<CharacterCategoryId, string> = {
  shape: 'Hình dáng',
  parts: 'Bộ phận',
  face: 'Khuôn mặt',
  hair: 'Tóc / lông',
  clothes: 'Trang phục',
};

export const CATEGORY_ORDER: CharacterCategoryId[] = [
  'shape',
  'parts',
  'face',
  'hair',
  'clothes',
];
