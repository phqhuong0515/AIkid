import { HtmlEmbed } from '@/features/kids-ui/HtmlEmbed';

export default function StoryTextScreen() {
  return (
    <HtmlEmbed
      title="Truyện Chữ"
      src="/art/story/genre.html"
      nativeHint="Truyện chữ."
    />
  );
}
