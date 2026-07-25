import { ReactNode, useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { usePathname } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { useFamily } from '@/features/family/store/useFamily';
import { useAuth } from '@/core/auth/useAuth';
import { useProfile } from '@/features/account/api/accountHooks';
import { AikidTheme } from './theme';
import { AccountBottomSheet } from './AccountBottomSheet';

function AppHeader() {
  const { user, actor } = useAuth();
  const activeChild = useFamily((s) => s.getActiveChild());
  const { data: profileData } = useProfile();
  const [sheetVisible, setSheetVisible] = useState(false);

  const isChild = actor === 'child' || !!activeChild;
  
  // Decide what avatar and name to show
  const displayName = isChild ? activeChild?.name || 'Bé' : user?.name || 'Phụ huynh';
  const avatarUrl = !isChild && user?.avatarUrl ? user.avatarUrl : (activeChild?.avatarUrl || null);

  return (
    <>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 20,
          paddingVertical: 12,
          backgroundColor: 'rgba(253, 250, 244, 0.94)',
          borderBottomWidth: 1,
          borderBottomColor: 'rgba(255, 92, 138, 0.12)',
          zIndex: 10,
        }}
      >
        {/* LEFT: User Profile Button */}
        <Pressable
          onPress={() => setSheetVisible(true)}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: '#FFF',
            padding: 6,
            paddingRight: 12,
            borderRadius: 999,
            shadowColor: '#4A3728',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.05,
            shadowRadius: 4,
            elevation: 2,
            borderWidth: 1,
            borderColor: '#F1F5F9',
          }}
        >
          <Image
            source={{ uri: (avatarUrl as string) || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}` }}
            style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: '#E2E8F0' }}
          />
          <View style={{ marginLeft: 10, marginRight: 4 }}>
            <Text
              style={{
                fontFamily: AikidTheme.fonts.bold,
                fontSize: 14,
                color: AikidTheme.colors.ink,
              }}
              numberOfLines={1}
            >
              {displayName}
            </Text>
            <Text style={{ fontSize: 11, color: AikidTheme.colors.inkMuted }}>
              {isChild ? 'Thành viên' : 'Quản lý'}
            </Text>
          </View>
          <Ionicons name="chevron-down" size={16} color={AikidTheme.colors.inkMuted} />
        </Pressable>

        {/* RIGHT: Stats / Ví phụ huynh */}
        <View style={{ alignItems: 'flex-end' }}>
          <View
            style={{
              backgroundColor: '#FFF',
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 999,
              borderWidth: 1,
              borderColor: 'rgba(255, 92, 138, 0.2)',
            }}
          >
            <Text style={{ fontSize: 12, fontFamily: AikidTheme.fonts.bold, color: '#FF8E53' }}>
              ✨ {profileData?.stats.imagesGenerated ?? 0} <Text style={{ fontFamily: AikidTheme.fonts.main, color: AikidTheme.colors.inkMuted }}>lượt</Text>
            </Text>
          </View>
        </View>
      </View>

      <AccountBottomSheet visible={sheetVisible} onClose={() => setSheetVisible(false)} />
    </>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  // Only show AppHeader on the main lobby screen
  const showHeader = pathname.includes('lobby');

  return (
    <View style={{ flex: 1 }}>
      {showHeader && (
        <SafeAreaView edges={['top']} style={{ backgroundColor: 'rgba(253, 250, 244, 0.94)' }}>
          <AppHeader />
        </SafeAreaView>
      )}
      <View style={{ flex: 1 }}>
        {children}
      </View>
    </View>
  );
}
