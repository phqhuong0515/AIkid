import React, { useEffect } from 'react';
import { Platform, View, Text } from 'react-native';
import { useAuth } from '@/core/auth/useAuth';
import { useWorkspace } from '@/core/workspace/useWorkspace';
import { GATEWAY_BASE_URL } from '@/core/api/config';
import { HtmlEmbed } from './HtmlEmbed';

export function AuthenticatedEmbed({ src, title, nativeHint = 'Mở trên trình duyệt' }: { src: string, title: string, nativeHint?: string }) {
  const token = useAuth((s) => s.token);
  const activeIpId = useWorkspace((s) => s.activeIpId);

  useEffect(() => {
    if (Platform.OS !== 'web') return;
    try {
      if (token) localStorage.setItem('storymee.access_token', token);
      if (activeIpId) localStorage.setItem('storymee.active_ip_id', activeIpId);
      localStorage.setItem('aikid.api_url', GATEWAY_BASE_URL);
    } catch {}
  }, [token, activeIpId]);

  if (Platform.OS !== 'web') {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <Text style={{ fontSize: 18, color: '#4A3728', textAlign: 'center' }}>
          {nativeHint}
        </Text>
      </View>
    );
  }

  return <HtmlEmbed src={src} title={title} />;
}
