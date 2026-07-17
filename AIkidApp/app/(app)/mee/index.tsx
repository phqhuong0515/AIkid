import { HtmlEmbed } from '@/features/kids-ui/HtmlEmbed';

/**
 * Mee customizer — original AIkid/SVG HTML via /mee-html (or /mee alias).
 */
export default function MeeScreen() {
  return (
    <HtmlEmbed
      title="Tạo Mee"
      src="/mee-html/index.html"
      nativeHint="Customizer Mee dùng SVG web gốc. Mở trên trình duyệt."
    />
  );
}
