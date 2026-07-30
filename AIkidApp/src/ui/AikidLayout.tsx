/**
 * Compatibility adapter for routes that still import AikidLayout.
 * New routes should use AikidPage directly.
 */
import type { ReactNode } from 'react';
import { View } from 'react-native';

import { GlobalHeader } from '@/components/GlobalHeader';

import { AikidPage, type PageContainer } from './AikidPage';
import type { BgScene } from './PageBackground';

export type LayoutMode = 'feed' | 'wide' | 'full';

type AikidLayoutProps = {
  scene: BgScene;
  children: ReactNode;
  showHeader?: boolean;
  showBack?: boolean;
  onBack?: () => void;
  rightAction?: ReactNode;
  title?: string;
  layoutMode?: LayoutMode;
};

const containerByMode: Record<LayoutMode, PageContainer> = {
  feed: 'reading',
  wide: 'standard',
  full: 'full',
};

export function AikidLayout({
  scene,
  children,
  showHeader = false,
  showBack = true,
  rightAction,
  title,
  layoutMode = 'feed',
}: AikidLayoutProps) {
  return (
    <AikidPage
      scene={scene}
      title={title}
      showBack={showBack}
      rightAction={rightAction}
      container={containerByMode[layoutMode]}
      scroll
      keyboardAware
    >
      {showHeader ? (
        <View>
          <GlobalHeader noMargin />
        </View>
      ) : null}
      {children}
    </AikidPage>
  );
}
