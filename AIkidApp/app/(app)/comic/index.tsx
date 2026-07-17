import { HtmlEmbed } from '@/features/kids-ui/HtmlEmbed';

/** Comic hub — original art/comic.html (Truyện Chữ / Truyện Tranh) */
export default function ComicHubScreen() {
  return (
    <HtmlEmbed
      title="Sáng tác truyện"
      src="/art/comic.html"
      nativeHint="Truyện dùng layout web gốc. Mở trên trình duyệt."
    />
  );
}
