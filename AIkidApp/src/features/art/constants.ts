import type { ImageSourcePropType } from 'react-native';

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

export type ArtStyle = {
  id: ArtStyleId;
  labelVi: string;
  descriptionVi: string;
  /** Canonical English visual direction sent to the image model. */
  canonicalPrompt: string;
  templateKey: string;
  thumbnail: ImageSourcePropType;
};

export const ART_STYLES: readonly ArtStyle[] = [
  { id: 'watercolor', labelVi: 'Màu Nước', descriptionVi: 'Màu trong veo, mềm mại như tranh minh hoạ sách.', canonicalPrompt: 'Delicate children’s-book watercolor, transparent layered washes, softly bleeding pigment edges, subtle cold-press paper grain, luminous pastel palette, restrained fine ink accents.', templateKey: 'aikid.art.watercolor', thumbnail: require('../../../public/mee/PNG/art-style-watercolor.jpeg') },
  { id: 'cartoon', labelVi: 'Hoạt Hình', descriptionVi: 'Màu tươi, đường nét rõ và biểu cảm vui nhộn.', canonicalPrompt: 'Premium 2D children’s animation, clean rounded contour lines, bright flat colors with gentle cel shading, expressive friendly features, polished television-cartoon finish.', templateKey: 'aikid.art.cartoon', thumbnail: require('../../../public/mee/PNG/art-style-cartoon.jpeg') },
  { id: 'crayon', labelVi: 'Bút Sáp', descriptionVi: 'Giữ vẻ ngộ nghĩnh với nét sáp và giấy thủ công.', canonicalPrompt: 'Hand-drawn wax crayon illustration, visibly textured broken strokes, layered childlike color marks, warm off-white drawing paper, playful imperfect edges without looking unfinished.', templateKey: 'aikid.art.crayon', thumbnail: require('../../../public/mee/PNG/art-style-crayon.jpeg') },
  { id: 'anime', labelVi: 'Anime', descriptionVi: 'Nhân vật lung linh theo phong cách hoạt hình Nhật.', canonicalPrompt: 'Wholesome modern Japanese anime illustration, crisp elegant linework, expressive sparkling eyes, refined cel shading, soft cinematic light, vivid harmonious colors, age-appropriate character design.', templateKey: 'aikid.art.anime', thumbnail: require('../../../public/mee/PNG/art-style-anime.jpeg') },
  { id: 'manga', labelVi: 'Manga', descriptionVi: 'Nét mực mạnh, tương phản cao như trang truyện Nhật.', canonicalPrompt: 'Black-and-white Japanese manga artwork, confident variable-width ink lines, clean screentone shading, dynamic but readable composition, strong monochrome contrast, no panel borders or speech bubbles.', templateKey: 'aikid.art.manga', thumbnail: require('../../../public/mee/PNG/art-style-manga.jpeg') },
  { id: 'comic', labelVi: 'Truyện Tranh', descriptionVi: 'Màu sắc nổi bật và đường viền như truyện tranh.', canonicalPrompt: 'Colorful Western comic-book illustration, bold controlled outlines, energetic shapes, rich flat colors, tasteful halftone accents and dramatic lighting, single scene without panels or text.', templateKey: 'aikid.art.comic', thumbnail: require('../../../public/mee/PNG/art-style-comic.jpeg') },
  { id: 'sketch', labelVi: 'Tranh Chì', descriptionVi: 'Nét chì nhẹ, có độ đậm nhạt và chất giấy tự nhiên.', canonicalPrompt: 'Finished graphite pencil illustration, sensitive line-weight variation, soft cross-hatching and tonal shading, visible fine paper tooth, monochrome hand-drawn warmth, clean intentional contours.', templateKey: 'aikid.art.sketch', thumbnail: require('../../../public/mee/PNG/art-style-sketch.jpeg') },
  { id: '3d', labelVi: '3D', descriptionVi: 'Khối tròn mềm, ánh sáng đẹp như phim hoạt hình 3D.', canonicalPrompt: 'High-end stylized 3D animated-film render, rounded appealing forms, tactile materials, soft global illumination, gentle depth of field, colorful studio-quality lighting, friendly proportions.', templateKey: 'aikid.art.3d', thumbnail: require('../../../public/mee/PNG/art-style-3D.jpeg') },
  { id: 'pixel', labelVi: 'Pixel', descriptionVi: 'Biến bức vẽ thành thế giới trò chơi pixel cổ điển.', canonicalPrompt: 'Deliberate retro pixel-art illustration, readable low-resolution silhouette, crisp hard pixel clusters, limited harmonious game palette, selective dithering, no smoothing or vector edges.', templateKey: 'aikid.art.pixel', thumbnail: require('../../../public/mee/PNG/art-style-pixel.jpeg') },
  { id: 'chibi', labelVi: 'Chibi', descriptionVi: 'Đầu to đáng yêu, biểu cảm trong sáng và vui vẻ.', canonicalPrompt: 'Adorable chibi illustration, large expressive head and eyes, tiny simplified body, rounded silhouette, clean colorful shading, cheerful kawaii expression, polished sticker-like finish.', templateKey: 'aikid.art.chibi', thumbnail: require('../../../public/mee/PNG/art-style-chibi.jpeg') },
  { id: 'clay', labelVi: 'Đất Sét', descriptionVi: 'Nhân vật như được nặn bằng đất sét nhiều màu.', canonicalPrompt: 'Handcrafted claymation scene, softly sculpted rounded forms, visible subtle fingerprints and modeling texture, colorful polymer clay materials, warm miniature-studio lighting.', templateKey: 'aikid.art.clay', thumbnail: require('../../../public/mee/PNG/art-style-clay.jpeg') },
  { id: 'fabric', labelVi: 'Vải Nỉ', descriptionVi: 'Mềm xốp, có đường may và chất liệu đồ chơi thủ công.', canonicalPrompt: 'Handmade felt-and-fabric appliqué artwork, layered soft textile shapes, visible neat stitching, embroidered details, plush fibers, warm craft-table depth and gentle shadows.', templateKey: 'aikid.art.fabric', thumbnail: require('../../../public/mee/PNG/art-style-farbic.jpeg') },
  { id: 'manhwa', labelVi: 'Manhwa', descriptionVi: 'Màu trong, ánh sáng hiện đại như truyện tranh Hàn.', canonicalPrompt: 'Polished full-color Korean webtoon illustration, elegant clean linework, luminous gradient shading, refined facial features, modern pastel lighting, cinematic single-frame composition without text.', templateKey: 'aikid.art.manhwa', thumbnail: require('../../../public/mee/PNG/art-style-manhwa.jpeg') },
  {
    id: 'semirealistic',
    labelVi: 'Bán Tả Thực',
    descriptionVi: 'Chi tiết chân thật vừa đủ nhưng vẫn thân thiện với bé.',
    canonicalPrompt: 'Warm semi-realistic storybook illustration, believable anatomy and materials simplified for children, finely rendered eyes and hair, natural soft light, painterly edges, charming rather than photographic.',
    templateKey: 'aikid.art.semirealistic',
    thumbnail: require('../../../public/mee/PNG/art-style-semirealistic.jpeg'),
  },
];
