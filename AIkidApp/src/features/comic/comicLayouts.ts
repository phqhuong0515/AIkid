export type ComicPanelCount = 3 | 4 | 5 | 6;

export type ComicLayout = {
  id: string;
  label: string;
  panelCount: ComicPanelCount;
  thumbnail: number;
};

export const COMIC_LAYOUTS: ComicLayout[] = [
  { id: 'panel-3-1', label: 'Bố cục 1', panelCount: 3, thumbnail: require('../../../public/comic-layouts/panel-3-1.png') },
  { id: 'panel-3-2', label: 'Bố cục 2', panelCount: 3, thumbnail: require('../../../public/comic-layouts/panel-3-2.png') },
  { id: 'panel-3-3', label: 'Bố cục 3', panelCount: 3, thumbnail: require('../../../public/comic-layouts/panel-3-3.png') },
  { id: 'panel-3-4', label: 'Bố cục 4', panelCount: 3, thumbnail: require('../../../public/comic-layouts/panel-3-4.png') },
  { id: 'panel-4-1', label: 'Bố cục 1', panelCount: 4, thumbnail: require('../../../public/comic-layouts/panel-4-1.png') },
  { id: 'panel-4-2', label: 'Bố cục 2', panelCount: 4, thumbnail: require('../../../public/comic-layouts/panel-4-2.png') },
  { id: 'panel-4-3', label: 'Bố cục 3', panelCount: 4, thumbnail: require('../../../public/comic-layouts/panel-4-3.png') },
  { id: 'panel-4-4', label: 'Bố cục 4', panelCount: 4, thumbnail: require('../../../public/comic-layouts/panel-4-4.png') },
  { id: 'panel-5-1', label: 'Bố cục 1', panelCount: 5, thumbnail: require('../../../public/comic-layouts/panel-5-1.png') },
  { id: 'panel-5-2', label: 'Bố cục 2', panelCount: 5, thumbnail: require('../../../public/comic-layouts/panel-5-2.png') },
  { id: 'panel-5-3', label: 'Bố cục 3', panelCount: 5, thumbnail: require('../../../public/comic-layouts/panel-5-3.png') },
  { id: 'panel-5-4', label: 'Bố cục 4', panelCount: 5, thumbnail: require('../../../public/comic-layouts/panel-5-4.png') },
  { id: 'panel-5-5', label: 'Bố cục 5', panelCount: 5, thumbnail: require('../../../public/comic-layouts/panel-5-5.png') },
  { id: 'panel-6-1', label: 'Bố cục 1', panelCount: 6, thumbnail: require('../../../public/comic-layouts/panel-6-1.png') },
  { id: 'panel-6-2', label: 'Bố cục 2', panelCount: 6, thumbnail: require('../../../public/comic-layouts/panel-6-2.png') },
  { id: 'panel-6-3', label: 'Bố cục 3', panelCount: 6, thumbnail: require('../../../public/comic-layouts/panel-6-3.png') },
  { id: 'panel-6-4', label: 'Bố cục 4', panelCount: 6, thumbnail: require('../../../public/comic-layouts/panel-6-4.png') },
];

export const DEFAULT_COMIC_LAYOUT_ID = 'panel-4-1';

export function getComicLayout(layoutId: string) {
  return COMIC_LAYOUTS.find((layout) => layout.id === layoutId)
    || COMIC_LAYOUTS.find((layout) => layout.id === DEFAULT_COMIC_LAYOUT_ID)!;
}

export function getDefaultComicLayoutForCount(panelCount: number) {
  return COMIC_LAYOUTS.find((layout) => layout.panelCount === panelCount)
    || getComicLayout(DEFAULT_COMIC_LAYOUT_ID);
}
