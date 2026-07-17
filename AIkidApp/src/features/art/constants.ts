export type ArtStyleId =
  | 'watercolor'
  | 'cartoon'
  | 'crayon'
  | 'anime'
  | 'manga'
  | 'comic'
  | 'sketch'
  | '3d'
  | 'pixel'
  | 'chibi'
  | 'clay'
  | 'fabric'
  | 'manhwa'
  | 'semirealistic';

export const ART_STYLES: {
  id: ArtStyleId;
  labelVi: string;
  templateKey: string;
}[] = [
  { id: 'watercolor', labelVi: 'Màu Nước', templateKey: 'aikid.art.watercolor' },
  { id: 'cartoon', labelVi: 'Hoạt Hình', templateKey: 'aikid.art.cartoon' },
  { id: 'crayon', labelVi: 'Bút Sáp', templateKey: 'aikid.art.crayon' },
  { id: 'anime', labelVi: 'Anime', templateKey: 'aikid.art.anime' },
  { id: 'manga', labelVi: 'Manga', templateKey: 'aikid.art.manga' },
  { id: 'comic', labelVi: 'Truyện Tranh', templateKey: 'aikid.art.comic' },
  { id: 'sketch', labelVi: 'Tranh Chì', templateKey: 'aikid.art.sketch' },
  { id: '3d', labelVi: '3D', templateKey: 'aikid.art.3d' },
  { id: 'pixel', labelVi: 'Pixel', templateKey: 'aikid.art.pixel' },
  { id: 'chibi', labelVi: 'Chibi', templateKey: 'aikid.art.chibi' },
  { id: 'clay', labelVi: 'Đất Sét', templateKey: 'aikid.art.clay' },
  { id: 'fabric', labelVi: 'Vải Nỉ', templateKey: 'aikid.art.fabric' },
  { id: 'manhwa', labelVi: 'Manhwa', templateKey: 'aikid.art.manhwa' },
  {
    id: 'semirealistic',
    labelVi: 'Bán Tả Thực',
    templateKey: 'aikid.art.semirealistic',
  },
];
