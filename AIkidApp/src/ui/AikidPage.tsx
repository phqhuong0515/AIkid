import type { ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
  type ImageSourcePropType,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAikidTemplate } from '@/design-system';
import {
  AIKID_CONTAINERS,
  useResponsiveLayout,
} from '@/features/kids-ui/useResponsiveLayout';

import { AikidBackButton } from './AikidBackButton';
import { AikidText } from './AikidText';
import { PageBackground, type BgScene } from './PageBackground';

export type PageContainer = 'reading' | 'standard' | 'wide' | 'workspace' | 'full';

type AikidPageProps = {
  scene: BgScene;
  children: ReactNode;
  title?: string;
  subtitle?: string;
  backHref?: string;
  showBack?: boolean;
  rightAction?: ReactNode;
  actions?: ReactNode;
  container?: PageContainer;
  scroll?: boolean;
  keyboardAware?: boolean;
  backgroundSource?: ImageSourcePropType;
  backgroundOverlayOpacity?: number;
};

const containerWidths: Record<Exclude<PageContainer, 'full'>, number> = {
  reading: AIKID_CONTAINERS.reading,
  standard: AIKID_CONTAINERS.standard,
  wide: AIKID_CONTAINERS.wide,
  workspace: AIKID_CONTAINERS.workspace,
};

export function AikidPage({
  scene,
  children,
  title,
  subtitle,
  backHref,
  showBack = true,
  rightAction,
  actions,
  container = 'standard',
  scroll = true,
  keyboardAware = false,
  backgroundSource,
  backgroundOverlayOpacity,
}: AikidPageProps) {
  const insets = useSafeAreaInsets();
  const template = useAikidTemplate();
  const maxContent =
    container === 'full' ? Number.MAX_SAFE_INTEGER : containerWidths[container];
  const contentMaxWidth = container === 'full' ? undefined : maxContent;
  const responsive = useResponsiveLayout({ maxContent });

  const content = (
    <View
      style={[
        styles.content,
        {
          maxWidth: contentMaxWidth,
          paddingHorizontal: responsive.gutter,
          paddingTop: responsive.isCompact
            ? template.spacing.base
            : template.spacing.xl,
          paddingBottom: Math.max(insets.bottom, template.spacing.xl),
          gap: responsive.gap,
        },
      ]}
    >
      {children}
    </View>
  );

  const body = scroll ? (
    <ScrollView
      style={styles.flex}
      contentContainerStyle={styles.scrollContent}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {content}
    </ScrollView>
  ) : (
    content
  );

  return (
    <PageBackground
      scene={scene}
      source={backgroundSource}
      overlayOpacity={backgroundOverlayOpacity}
    >
      <SafeAreaView style={styles.flex} edges={['top', 'bottom']}>
        {(showBack || title || subtitle || rightAction) && (
          <View
            style={[
              styles.header,
              {
                backgroundColor: `${template.colors.frame.paper}F2`,
                borderBottomColor: template.colors.frame.bgLight,
                paddingHorizontal: responsive.gutter,
              },
            ]}
          >
            <View
              style={[
                styles.headerInner,
                {
                  maxWidth: contentMaxWidth,
                  minHeight: responsive.isCompact
                    ? 56
                    : responsive.isDesktopUp
                      ? 72
                      : 64,
                },
              ]}
            >
              <View
                style={[
                  styles.headerSide,
                  { minWidth: responsive.isCompact ? 44 : 120 },
                ]}
              >
                {showBack ? (
                  <AikidBackButton href={backHref} />
                ) : null}
              </View>
              <View style={styles.headerTitle}>
                {title ? (
                  <AikidText
                    variant="heading"
                    numberOfLines={1}
                    style={[
                      styles.title,
                      { fontSize: responsive.isCompact ? 16 : responsive.isDesktopUp ? 20 : 18 },
                    ]}
                  >
                    {title}
                  </AikidText>
                ) : null}
                {subtitle ? (
                  <AikidText variant="caption" numberOfLines={1} style={styles.subtitle}>
                    {subtitle}
                  </AikidText>
                ) : null}
              </View>
              <View
                style={[
                  styles.headerSide,
                  styles.headerRight,
                  { minWidth: responsive.isCompact ? 44 : 120 },
                ]}
              >
                {rightAction}
              </View>
            </View>
          </View>
        )}

        <KeyboardAvoidingView
          behavior={keyboardAware && Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.flex}
        >
          {body}
          {actions ? (
            <View
              style={[
                styles.actions,
                {
                  backgroundColor: `${template.colors.frame.paper}F5`,
                  borderTopColor: template.colors.frame.bgLight,
                  paddingHorizontal: responsive.gutter,
                  paddingBottom: Math.max(insets.bottom, template.spacing.base),
                },
              ]}
            >
              <View style={[styles.actionsInner, { maxWidth: contentMaxWidth }]}>{actions}</View>
            </View>
          ) : null}
        </KeyboardAvoidingView>
      </SafeAreaView>
    </PageBackground>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: {
    width: '100%',
    borderBottomWidth: 1,
    alignItems: 'center',
    zIndex: 100,
  },
  headerInner: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  headerSide: {
    flex: 1,
    alignItems: 'flex-start',
  },
  headerRight: { alignItems: 'flex-end' },
  headerTitle: {
    flex: 2,
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  title: { textAlign: 'center', fontSize: 18 },
  subtitle: { textAlign: 'center', marginTop: 2 },
  scrollContent: { flexGrow: 1 },
  content: {
    width: '100%',
    alignSelf: 'center',
    flex: 1,
  },
  actions: {
    width: '100%',
    alignItems: 'center',
    borderTopWidth: 1,
    paddingTop: 12,
  },
  actionsInner: {
    width: '100%',
    alignSelf: 'center',
    alignItems: 'flex-end',
  },
});
