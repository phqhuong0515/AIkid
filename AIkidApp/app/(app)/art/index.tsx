import { HtmlEmbed } from '@/features/kids-ui/HtmlEmbed';

/**
 * Xưởng vẽ hub — original HTML (art/index.html):
 * Vẽ Tranh → style → canvas | Sáng Tác Truyện → comic
 */
export default function ArtHubScreen() {
  return (
    <HtmlEmbed
      title="Xưởng vẽ"
      src="/art/index.html"
      nativeHint="Xưởng vẽ dùng layout web gốc (chọn style, canvas). Mở trên trình duyệt."
    />
  );
}
