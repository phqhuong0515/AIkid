import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import type { ComponentProps, ReactNode } from 'react';
import type { ImageSourcePropType } from 'react-native';
import { Pressable, StyleSheet, View, useWindowDimensions } from 'react-native';

import { AikidCard, AikidText } from '@/ui';

export type CategoryHubItem = {
  id: string;
  title: string;
  description: string;
  icon: ComponentProps<typeof Ionicons>['name'];
  badge: string;
  action: string;
  image?: ImageSourcePropType;
  accent?: 'pink' | 'coral' | 'violet';
  disabled?: boolean;
  onPress: () => void;
};

type Props = {
  icon: ComponentProps<typeof Ionicons>['name'];
  title: string;
  description: string;
  items: CategoryHubItem[];
  hint?: ReactNode;
};

const ACCENTS = {
  pink: { color: '#FF5E97', soft: '#FFF0F4', action: '#FFF0F4' },
  coral: { color: '#FF884D', soft: '#FFF1E8', action: '#FFF1E8' },
  violet: { color: '#8B5CF6', soft: '#F3EEFF', action: '#F3EEFF' },
};

export function CategoryHub({ icon, title, description, items, hint }: Props) {
  const { width } = useWindowDimensions();
  const compact = width < 760;
  const threeColumns = width >= 1040 && items.length >= 3;

  return (
    <View style={styles.content}>
      <View style={styles.intro}>
        <View style={styles.introIcon}>
          <Ionicons name={icon} size={24} color="#FF5E97" />
        </View>
        <AikidText variant="title" style={styles.heading}>{title}</AikidText>
        <AikidText variant="body" style={styles.description}>{description}</AikidText>
      </View>

      <View style={[styles.cards, compact && styles.cardsCompact]}>
        {items.map((item) => {
          const accent = ACCENTS[item.accent || 'pink'];
          return (
            <Pressable
              key={item.id}
              accessibilityRole="button"
              accessibilityLabel={item.title}
              accessibilityState={{ disabled: item.disabled }}
              disabled={item.disabled}
              onPress={item.onPress}
              style={({ pressed }) => [
                styles.cardLink,
                threeColumns && styles.cardLinkThree,
                compact && styles.cardLinkCompact,
                item.disabled && styles.cardDisabled,
                pressed && styles.cardPressed,
              ]}
            >
              <AikidCard variant="raised" style={styles.card}>
                {item.image ? (
                  <View style={styles.cardVisual}>
                    <Image source={item.image} style={styles.cardImage} contentFit="cover" transition={180} />
                    <View style={[styles.imageIcon, { backgroundColor: accent.soft }]}>
                      <Ionicons name={item.icon} size={25} color={accent.color} />
                    </View>
                    <View style={[styles.imageBadge, { backgroundColor: accent.soft }]}>
                      <AikidText variant="brand" style={[styles.badgeText, { color: accent.color }]}>{item.badge}</AikidText>
                    </View>
                  </View>
                ) : (
                  <View style={styles.cardTop}>
                    <View style={[styles.cardIcon, { backgroundColor: accent.soft }]}>
                      <Ionicons name={item.icon} size={38} color={accent.color} />
                    </View>
                    <View style={[styles.badge, { backgroundColor: accent.soft }]}>
                      <AikidText variant="brand" style={[styles.badgeText, { color: accent.color }]}>{item.badge}</AikidText>
                    </View>
                  </View>
                )}
                <View style={styles.cardCopy}>
                  <AikidText variant="title" style={styles.cardTitle}>{item.title}</AikidText>
                  <AikidText variant="body" style={styles.cardDescription}>{item.description}</AikidText>
                </View>
                <View style={[styles.cardAction, { backgroundColor: accent.action }]}>
                  <AikidText variant="brand" style={[styles.cardActionText, { color: accent.color }]}>{item.action}</AikidText>
                  <Ionicons name={item.disabled ? 'lock-closed-outline' : 'arrow-forward'} size={18} color={accent.color} />
                </View>
              </AikidCard>
            </Pressable>
          );
        })}
      </View>

      {hint ? (
        <View style={styles.hint}>
          <Ionicons name="information-circle-outline" size={18} color="#6C7A91" />
          <AikidText variant="body" style={styles.hintText}>{hint}</AikidText>
        </View>
      ) : null}
    </View>
  );
}

export const categoryHubScreenStyles = StyleSheet.create({
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: 34,
    paddingHorizontal: 20,
  },
});

const styles = StyleSheet.create({
  content: { width: '100%', maxWidth: 980, alignSelf: 'center', alignItems: 'center' },
  intro: { width: '100%', alignItems: 'center', marginBottom: 24 },
  introIcon: { width: 48, height: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFF0F4', borderWidth: 2, borderColor: '#FFF', marginBottom: 10 },
  heading: { color: '#475569', fontSize: 28, lineHeight: 35, fontWeight: '900', textAlign: 'center' },
  description: { maxWidth: 650, color: '#6C7A91', fontSize: 15, lineHeight: 22, textAlign: 'center', marginTop: 6 },
  cards: { width: '100%', flexDirection: 'row', justifyContent: 'center', alignItems: 'stretch', flexWrap: 'wrap', gap: 18 },
  cardsCompact: { flexDirection: 'column', alignItems: 'center' },
  cardLink: { flexGrow: 1, flexBasis: 380, maxWidth: 430 },
  cardLinkThree: { flexBasis: 280, maxWidth: 310 },
  cardLinkCompact: { width: '100%', maxWidth: 560, flexBasis: 'auto' },
  card: { width: '100%', minHeight: 292, backgroundColor: '#FDFAF4', borderWidth: 5, borderColor: '#FFF', borderRadius: 30, padding: 18 },
  cardDisabled: { opacity: 0.68 },
  cardPressed: { transform: [{ scale: 0.985 }], opacity: 0.92 },
  cardTop: { minHeight: 70, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  cardVisual: { position: 'relative', width: '100%', height: 142, borderRadius: 20, overflow: 'hidden', backgroundColor: '#F5EFEA' },
  cardImage: { width: '100%', height: '100%' },
  imageIcon: { position: 'absolute', left: 10, bottom: 10, width: 45, height: 45, borderRadius: 15, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: 'rgba(255,255,255,0.9)' },
  imageBadge: { position: 'absolute', right: 10, top: 10, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6, borderWidth: 1, borderColor: 'rgba(255,255,255,0.85)' },
  cardIcon: { width: 70, height: 70, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  badge: { borderRadius: 999, paddingHorizontal: 11, paddingVertical: 7 },
  badgeText: { fontSize: 9, fontWeight: '900', letterSpacing: 0.5 },
  cardCopy: { flex: 1, justifyContent: 'center', paddingVertical: 18 },
  cardTitle: { color: '#475569', fontSize: 22, fontWeight: '900', lineHeight: 28, marginBottom: 8 },
  cardDescription: { color: '#6C7A91', fontSize: 14, lineHeight: 21 },
  cardAction: { minHeight: 46, borderRadius: 14, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  cardActionText: { flex: 1, fontSize: 12, fontWeight: '900' },
  hint: { maxWidth: 650, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.78)', paddingHorizontal: 16, paddingVertical: 10, marginTop: 20 },
  hintText: { flexShrink: 1, color: '#6C7A91', fontSize: 12, lineHeight: 17, textAlign: 'center' },
});
