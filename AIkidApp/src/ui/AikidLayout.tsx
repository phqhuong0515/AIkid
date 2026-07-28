/**
 * AikidLayout — Giao diện khung chuẩn, responsive
 *
 * Tự động khóa chiều ngang tối đa cho Desktop/Tablet (600px).
 * Tự động chèn thanh Header và Action Bar.
 * Tự động cuộn nội dung nếu quá dài (KeyboardAware).
 *
 * Usage:
 *   <AikidLayout 
 *     scene="character"
 *     showBack
 *     rightAction={<AikidButton size="sm">Hoàn thành</AikidButton>}
 *   >
 *     ... các AikidCard ...
 *   </AikidLayout>
 */

import React from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Text } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { PageBackground, BgScene } from './PageBackground';
import { GlobalHeader } from '@/components/GlobalHeader';
import { AikidButton } from './AikidButton';
import { AikidText } from './AikidText';

export type LayoutMode = 'feed' | 'wide' | 'full';

type AikidLayoutProps = {
  scene: BgScene;
  children: React.ReactNode;
  /** Có hiển thị GlobalHeader (logo, avatar, account) không? Mặc định true */
  showHeader?: boolean;
  /** Hiển thị nút Back (`← Trở về`). Mặc định true */
  showBack?: boolean;
  /** Ghi đè hàm xử lý khi bấm Back. Mặc định dùng router.back() */
  onBack?: () => void;
  /** Nút hoặc view nằm ở bên phải thanh Action Bar */
  rightAction?: React.ReactNode;
  /** Tiêu đề (nằm giữa thanh Action Bar) */
  title?: string;
  /** Chế độ chiều rộng: feed (720px), wide (1024px), full (100%). Mặc định: feed */
  layoutMode?: LayoutMode;
};

export function AikidLayout({
  scene,
  children,
  showHeader = true,
  showBack = true,
  onBack,
  rightAction,
  title,
  layoutMode = 'feed',
}: AikidLayoutProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      if (router.canGoBack()) {
        router.back();
      } else {
        router.replace('/(app)/lobby');
      }
    }
  };

  const getMaxWidth = () => {
    if (layoutMode === 'feed') return 720;
    if (layoutMode === 'wide') return 1024;
    return '100%';
  };

  return (
    <PageBackground scene={scene}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        {/* TOP: Global Header */}
        {showHeader && (
          <View style={{ zIndex: 10, width: '100%', paddingHorizontal: 12 }}>
            <GlobalHeader noMargin />
          </View>
        )}

        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboardView}
        >
          <ScrollView
            style={styles.scrollContainer}
            contentContainerStyle={[styles.scrollContent, { paddingBottom: Math.max(insets.bottom, 24) }]}
            showsVerticalScrollIndicator={false}
          >
            {/* Nav Bar (Back + Title + Right Action) */}
            {(showBack || rightAction || title) && (
              <View style={[styles.actionBar, { maxWidth: getMaxWidth() }]}>
                <View style={styles.actionLeft}>
                  {showBack && (
                    <AikidButton
                      variant="nav"
                      size="sm"
                      onPress={handleBack}
                      leftIcon={<Text style={styles.backIcon}>←</Text>}
                    >
                      Trở về
                    </AikidButton>
                  )}
                </View>
                
                <View style={styles.actionCenter}>
                  {title && (
                    <AikidText variant="title" style={{ textAlign: 'center' }}>
                      {title}
                    </AikidText>
                  )}
                </View>

                <View style={styles.actionRight}>
                  {rightAction}
                </View>
              </View>
            )}

            {/* MAIN CONTENT (Responsive constraint) */}
            <View style={[styles.mainContent, { maxWidth: getMaxWidth() }]}>
              {children}
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </PageBackground>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
    marginTop: 12,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  actionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    width: '100%',
    alignSelf: 'center',
  },
  actionLeft: {
    flex: 1,
    alignItems: 'flex-start',
  },
  actionCenter: {
    flex: 1.5,
    alignItems: 'center',
  },
  actionRight: {
    flex: 1,
    alignItems: 'flex-end',
  },
  mainContent: {
    width: '100%',
    alignSelf: 'center',
    flex: 1, // Để có thể push content hoặc xử lý layout con
    gap: 20, // Default gap giữa các element
  },
  backIcon: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: '800',
    marginTop: -2,
    marginRight: -2, // pull text closer
  },
});
