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
  templateKey: string;
  thumbnail: ImageSourcePropType;
};

export const ART_STYLES: readonly ArtStyle[] = [
  { id: 'watercolor', labelVi: 'Màu Nước', descriptionVi: 'Màu trong veo, mềm mại như tranh minh hoạ sách.', templateKey: 'aikid.art.watercolor', thumbnail: require('../../../public/mee/PNG/art-style-watercolor.jpeg') },
  { id: 'cartoon', labelVi: 'Hoạt Hình', descriptionVi: 'Màu tươi, đường nét rõ và biểu cảm vui nhộn.', templateKey: 'aikid.art.cartoon', thumbnail: require('../../../public/mee/PNG/art-style-cartoon.jpeg') },
  { id: 'crayon', labelVi: 'Bút Sáp', descriptionVi: 'Giữ vẻ ngộ nghĩnh với nét sáp và giấy thủ công.', templateKey: 'aikid.art.crayon', thumbnail: require('../../../public/mee/PNG/art-style-crayon.jpeg') },
  { id: 'anime', labelVi: 'Anime', descriptionVi: 'Nhân vật lung linh theo phong cách hoạt hình Nhật.', templateKey: 'aikid.art.anime', thumbnail: require('../../../public/mee/PNG/art-style-anime.jpeg') },
  { id: 'manga', labelVi: 'Manga', descriptionVi: 'Nét mực mạnh, tương phản cao như trang truyện Nhật.', templateKey: 'aikid.art.manga', thumbnail: require('../../../public/mee/PNG/art-style-manga.jpeg') },
  { id: 'comic', labelVi: 'Truyện Tranh', descriptionVi: 'Màu sắc nổi bật và đường viền như truyện tranh.', templateKey: 'aikid.art.comic', thumbnail: require('../../../public/mee/PNG/art-style-comic.jpeg') },
  { id: 'sketch', labelVi: 'Tranh Chì', descriptionVi: 'Nét chì nhẹ, có độ đậm nhạt và chất giấy tự nhiên.', templateKey: 'aikid.art.sketch', thumbnail: require('../../../public/mee/PNG/art-style-sketch.jpeg') },
  { id: '3d', labelVi: '3D', descriptionVi: 'Khối tròn mềm, ánh sáng đẹp như phim hoạt hình 3D.', templateKey: 'aikid.art.3d', thumbnail: require('../../../public/mee/PNG/art-style-3D.jpeg') },
  { id: 'pixel', labelVi: 'Pixel', descriptionVi: 'Biến bức vẽ thành thế giới trò chơi pixel cổ điển.', templateKey: 'aikid.art.pixel', thumbnail: require('../../../public/mee/PNG/art-style-pixel.jpeg') },
  { id: 'chibi', labelVi: 'Chibi', descriptionVi: 'Đầu to đáng yêu, biểu cảm trong sáng và vui vẻ.', templateKey: 'aikid.art.chibi', thumbnail: require('../../../public/mee/PNG/art-style-chibi.jpeg') },
  { id: 'clay', labelVi: 'Đất Sét', descriptionVi: 'Nhân vật như được nặn bằng đất sét nhiều màu.', templateKey: 'aikid.art.clay', thumbnail: require('../../../public/mee/PNG/art-style-clay.jpeg') },
  { id: 'fabric', labelVi: 'Vải Nỉ', descriptionVi: 'Mềm xốp, có đường may và chất liệu đồ chơi thủ công.', templateKey: 'aikid.art.fabric', thumbnail: require('../../../public/mee/PNG/art-style-farbic.jpeg') },
  { id: 'manhwa', labelVi: 'Manhwa', descriptionVi: 'Màu trong, ánh sáng hiện đại như truyện tranh Hàn.', templateKey: 'aikid.art.manhwa', thumbnail: require('../../../public/mee/PNG/art-style-manhwa.jpeg') },
  {
    id: 'semirealistic',
    labelVi: 'Bán Tả Thực',
    descriptionVi: 'Chi tiết chân thật vừa đủ nhưng vẫn thân thiện với bé.',
    templateKey: 'aikid.art.semirealistic',
    thumbnail: require('../../../public/mee/PNG/art-style-semirealistic.jpeg'),
  },
];
