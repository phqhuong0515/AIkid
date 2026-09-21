import { ReactNode, useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { usePathname } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { useFamily } from '@/features/family/store/useFamily';
import { useAuth } from '@/core/auth/useAuth';
import { useProfile } from '@/features/account/api/accountHooks';
import { AccountBottomSheet } from './AccountBottomSheet';

import { useAikidTemplate } from '@/design-system';

function AppHeader() {
  const { user, actor } = useAuth();
  const activeChild = useFamily((s) => s.getActiveChild());
  const { data: profileData } = useProfile();
  const [sheetVisible, setSheetVisible] = useState(false);
  const template = useAikidTemplate();

  const isChild = actor === 'child' || !!activeChild;
  
  // Decide what avatar and name to show
  const displayName = isChild ? activeChild?.name || 'Học sinh' : user?.name || 'Phụ huynh';
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
          backgroundColor: template.colors.frame.paper,
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
            backgroundColor: template.colors.frame.white,
            padding: 6,
            paddingRight: 12,
            borderRadius: template.radius.pill,
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
                fontFamily: template.fonts.headingBold,
                fontSize: 14,
                color: template.colors.text.heading,
              }}
              numberOfLines={1}
            >
              {displayName}
            </Text>
            <Text style={{ fontFamily: template.fonts.bodyReg, fontSize: 11, color: template.colors.text.body }}>
              {isChild ? 'Thành viên' : 'Quản lý'}
            </Text>
          </View>
          <Ionicons name="chevron-down" size={16} color={template.colors.text.body} />
        </Pressable>

        {/* RIGHT: Stats / Ví phụ huynh */}
        <View style={{ alignItems: 'flex-end' }}>
          <View
            style={{
              backgroundColor: template.colors.frame.white,
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: template.radius.pill,
              borderWidth: 1,
              borderColor: 'rgba(255, 92, 138, 0.2)',
            }}
          >
            <Text style={{ fontSize: 12, fontFamily: template.fonts.headingBold, color: template.colors.brand.coral }}>
              ✨ {profileData?.stats.imagesGenerated ?? 0} <Text style={{ fontFamily: template.fonts.bodyReg, color: template.colors.text.body }}>lượt</Text>
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
