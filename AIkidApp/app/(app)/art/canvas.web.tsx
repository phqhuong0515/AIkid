import React from 'react';
import { useFamily } from '@/features/family/store/useFamily';
import { ScreenChrome } from '@/features/kids-ui/ScreenChrome';
import { AuthenticatedEmbed } from '@/features/kids-ui/AuthenticatedEmbed';

export default function CanvasScreen() {
  const activeChild = useFamily((s) => s.children.find(c => c.id === s.activeChildId));
  const displayName = activeChild?.name || 'Bé';

  return (
    <ScreenChrome title={displayName} backHref="/(app)/art/style-v2">
      <AuthenticatedEmbed src="/_art_backup_html/image-generate.html" title={displayName} />
    </ScreenChrome>
  );
}
