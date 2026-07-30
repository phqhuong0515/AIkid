import type { ReactNode } from 'react';

import type { AikidScene } from '@/design-system';
import { AikidPage } from '@/ui/AikidPage';

type Props = {
  title: string;
  subtitle?: string;
  children: ReactNode;
  backHref?: string;
  right?: ReactNode;
  scene?: AikidScene;
};

/**
 * Backward-compatible adapter.
 *
 * AikidPage is the single owner of background, safe area, header and back
 * navigation. Keep this adapter only while older routes are being migrated.
 */
export function ScreenChrome({
  title,
  subtitle,
  children,
  backHref,
  right,
  scene = 'lobby',
}: Props) {
  return (
    <AikidPage
      scene={scene}
      title={title}
      subtitle={subtitle}
      backHref={backHref}
      rightAction={right}
      container="standard"
      scroll={false}
    >
      {children}
    </AikidPage>
  );
}
