import { HtmlEmbed } from '@/features/kids-ui/HtmlEmbed';

export default function StoryComicScreen() {
  return (
    <HtmlEmbed
      title="Truyện Tranh"
      src="/art/story/genre.html"
      nativeHint="Truyện tranh."
    />
  );
}
