import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { SvgXml } from 'react-native-svg';

import { HAIR_COLORS, MEE_OPTIONS, meeAssetFor } from '@/features/mee/assets';
import { MeeAssetPreview } from '@/features/mee/MeeAssetPreview';
import { SKIN_TONE_COLORS } from '@/features/mee/skinTones';
import { useMeeDraft } from '@/features/mee/store/useMeeDraft';
import type { MeeDraft } from '@/features/mee/types';
import { usePopSound } from '@/hooks/usePopSound';
import { AikidPage } from '@/ui';

type CategoryId = 'body' | 'face' | 'hair' | 'shirt' | 'pants' | 'background';
type AssetKind = Parameters<typeof meeAssetFor>[0];

const categories: { id: CategoryId; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { id: 'body', label: 'Dáng', icon: 'person' },
  { id: 'face', label: 'Mặt', icon: 'happy' },
  { id: 'hair', label: 'Tóc', icon: 'cut' },
  { id: 'shirt', label: 'Áo', icon: 'shirt' },
  { id: 'pants', label: 'Quần', icon: 'layers' },
  { id: 'background', label: 'Nền', icon: 'image' },
];

const outfitColors = ['#FB7185', '#38BDF8', '#A78BFA', '#34D399', '#FBBF24'];
const backgrounds = ['#FFF8EF', '#DFF4FF', '#F0E7FF', '#DDF8E9', '#FFF0B8', '#FFE4EC'];

function OptionTile({ selected, label, onPress, children }: {
  selected: boolean;
  label: string;
  onPress: () => void;
  children: React.ReactNode;
}) {
  const scale = useRef(new Animated.Value(1)).current;
  const press = () => {
    Animated.sequence([
      Animated.timing(scale, { toValue: 0.9, duration: 70, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, speed: 24, bounciness: 8, useNativeDriver: true }),
    ]).start();
    onPress();
  };
  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityState={{ selected }}
        onPress={press}
        style={[styles.optionTile, selected && styles.optionTileSelected]}
      >
        {children}
        {selected ? (
          <View style={styles.checkBadge}>
            <Ionicons name="checkmark" size={12} color="#fff" />
          </View>
        ) : null}
      </Pressable>
    </Animated.View>
  );
}

function AssetGrid({ kind, options, value, draft, onChange }: {
  kind: AssetKind;
  options: readonly number[];
  value: number;
  draft: MeeDraft;
  onChange: (value: number) => void;
}) {
  return (
    <View style={styles.grid}>
      {options.map((option) => {
        const xml = meeAssetFor(kind, option, draft);
        return (
          <OptionTile key={`${kind}-${option}`} selected={option === value} label={`${kind} ${option}`} onPress={() => onChange(option)}>
            {option === 0 || !xml
              ? <Ionicons name={option === 0 ? 'ban-outline' : 'image-outline'} size={28} color="#A38F80" />
              : <SvgXml xml={xml} width={68} height={62} />}
          </OptionTile>
        );
      })}
    </View>
  );
}

function ColorGrid({ colors, selectedIndex, onChange, round = true }: {
  colors: readonly string[];
  selectedIndex: number;
  onChange: (index: number) => void;
  round?: boolean;
}) {
  return (
    <View style={styles.colorRow}>
      {colors.map((color, index) => (
        <OptionTile key={`${color}-${index}`} selected={selectedIndex === index} label={`Màu ${index + 1}`} onPress={() => onChange(index)}>
          <View style={[styles.colorSwatch, !round && styles.colorSwatchSquare, { backgroundColor: color }]} />
        </OptionTile>
      ))}
    </View>
  );
}

export default function NewMeeCreatorScreen() {
  const { width } = useWindowDimensions();
  const desktop = width >= 900;
  const phone = width < 600;
  const { playPop } = usePopSound();
  const { draft, isHydrated, hydrate, setGender, setField, randomize } = useMeeDraft();
  const [category, setCategory] = useState<CategoryId>('body');
  const stageScale = useRef(new Animated.Value(1)).current;
  const stageY = useRef(new Animated.Value(0)).current;
  const stageNod = useRef(new Animated.Value(0)).current;
  const idleSway = useRef(new Animated.Value(0)).current;

  useEffect(() => { void hydrate(); }, [hydrate]);
  useEffect(() => {
    const idle = Animated.loop(Animated.sequence([
      Animated.timing(idleSway, { toValue: 1, duration: 1700, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      Animated.timing(idleSway, { toValue: -1, duration: 2200, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      Animated.timing(idleSway, { toValue: 0, duration: 1700, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
    ]));
    idle.start();
    return () => idle.stop();
  }, [idleSway]);

  const animateChange = (motion: 'drop' | 'rise' | 'pop' | 'fade' = 'pop') => {
    stageScale.setValue(motion === 'fade' ? 0.965 : 0.9);
    stageY.setValue(motion === 'drop' ? -18 : motion === 'rise' ? 18 : 0);
    stageNod.setValue(0);
    Animated.sequence([
      Animated.parallel([
        Animated.timing(stageNod, { toValue: 1, duration: 120, easing: Easing.out(Easing.quad), useNativeDriver: true }),
        Animated.timing(stageY, { toValue: 8, duration: 120, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.spring(stageScale, { toValue: 1.045, speed: 28, bounciness: 7, useNativeDriver: true }),
        Animated.timing(stageY, { toValue: 0, duration: 180, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        Animated.timing(stageNod, { toValue: 0, duration: 210, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      ]),
      Animated.spring(stageScale, { toValue: 1, speed: 20, bounciness: 5, useNativeDriver: true }),
    ]).start();
  };

  const change = <K extends keyof MeeDraft>(key: K, value: MeeDraft[K], motion: 'drop' | 'rise' | 'pop' | 'fade' = 'pop') => {
    playPop();
    setField(key, value);
    animateChange(motion);
  };

  const idleRotate = idleSway.interpolate({ inputRange: [-1, 0, 1], outputRange: ['-1.6deg', '0deg', '1.6deg'] });
  const idleLift = idleSway.interpolate({ inputRange: [-1, 0, 1], outputRange: [1, 0, -2] });
  const nodRotate = stageNod.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '4deg'] });

  const panel = (() => {
    if (category === 'body') return (
      <>
        <Text style={styles.sectionTitle}>Chọn dáng</Text>
        <View style={styles.bodyChoiceRow}>
          {(['male', 'female'] as const).map((gender, index) => (
            <OptionTile key={gender} selected={draft.gender === gender} label={`Dáng ${index + 1}`} onPress={() => { playPop(); setGender(gender); animateChange('pop'); }}>
              <View style={styles.bodyChoice}>
                <Ionicons name="person" size={38} color={draft.gender === gender ? '#7C4DFF' : '#806E61'} />
                <Text style={styles.bodyChoiceText}>Dáng {index + 1}</Text>
              </View>
            </OptionTile>
          ))}
        </View>
        <Text style={styles.sectionTitle}>Màu da</Text>
        <ColorGrid
          colors={Object.values(SKIN_TONE_COLORS).slice(0, 10)}
          selectedIndex={Math.max(0, Object.keys(SKIN_TONE_COLORS).slice(0, 10).map(Number).indexOf(draft.skinTone))}
          onChange={(index) => change('skinTone', Number(Object.keys(SKIN_TONE_COLORS)[index]), 'fade')}
        />
      </>
    );
    if (category === 'face') return (
      <>
        <Text style={styles.sectionTitle}>Dáng khuôn mặt</Text>
        <AssetGrid kind="face" options={MEE_OPTIONS.faces} value={draft.face} draft={draft} onChange={(v) => change('face', v, 'fade')} />
        <Text style={styles.sectionTitle}>Đôi mắt</Text>
        <AssetGrid kind="eyes" options={MEE_OPTIONS.eyes} value={draft.eyes} draft={draft} onChange={(v) => change('eyes', v, 'fade')} />
        <Text style={styles.sectionTitle}>Miệng</Text>
        <AssetGrid kind="mouth" options={MEE_OPTIONS.mouths} value={draft.mouth} draft={draft} onChange={(v) => change('mouth', v, 'pop')} />
      </>
    );
    if (category === 'hair') return (
      <>
        <Text style={styles.sectionTitle}>Kiểu tóc</Text>
        <AssetGrid kind="bang" options={MEE_OPTIONS.bangs} value={draft.bang} draft={draft} onChange={(v) => change('bang', v, 'drop')} />
        <Text style={styles.sectionTitle}>Tóc phía sau</Text>
        <AssetGrid kind="behind" options={MEE_OPTIONS.behind} value={draft.behind} draft={draft} onChange={(v) => change('behind', v, 'drop')} />
        <Text style={styles.sectionTitle}>Màu tóc</Text>
        <ColorGrid colors={HAIR_COLORS.map((item) => item.color)} selectedIndex={Math.max(0, HAIR_COLORS.findIndex((item) => item.id === draft.hairColor))} onChange={(index) => change('hairColor', HAIR_COLORS[index].id, 'fade')} />
      </>
    );
    if (category === 'shirt') return (
      <>
        <Text style={styles.sectionTitle}>Chọn áo</Text>
        <AssetGrid kind="shirt" options={MEE_OPTIONS.shirts} value={draft.shirt} draft={draft} onChange={(v) => change('shirt', v, 'pop')} />
        <Text style={styles.sectionTitle}>Màu áo</Text>
        <ColorGrid colors={outfitColors} selectedIndex={draft.shirtColor - 1} onChange={(index) => change('shirtColor', index + 1, 'fade')} round={false} />
      </>
    );
    if (category === 'pants') return (
      <>
        <Text style={styles.sectionTitle}>Chọn quần</Text>
        <AssetGrid kind="pants" options={MEE_OPTIONS.pants} value={draft.pants} draft={draft} onChange={(v) => change('pants', v, 'rise')} />
        <Text style={styles.sectionTitle}>Màu quần</Text>
        <ColorGrid colors={outfitColors} selectedIndex={draft.pantsColor - 1} onChange={(index) => change('pantsColor', index + 1, 'fade')} round={false} />
      </>
    );
    return (
      <>
        <Text style={styles.sectionTitle}>Chọn phông nền</Text>
        <ColorGrid colors={backgrounds} selectedIndex={Math.max(0, backgrounds.indexOf(draft.backgroundColor))} onChange={(index) => change('backgroundColor', backgrounds[index], 'fade')} round={false} />
      </>
    );
  })();

  if (!isHydrated) return <AikidPage scene="mee" title="Tạo Mee mới"><View style={styles.loading}><Text style={styles.loadingText}>Đang mở tủ đồ Mee…</Text></View></AikidPage>;

  return (
    <AikidPage scene="mee" title="Tạo Mee mới" backHref="/(app)/lobby" container="workspace" scroll={false}>
      <View style={[styles.shell, desktop ? styles.shellDesktop : styles.shellMobile]}>
        <View style={[styles.stageCard, desktop ? styles.stageDesktop : phone ? styles.stagePhone : styles.stageMobile]}>
          <Animated.View style={[styles.idleWrap, phone ? styles.idleWrapPhone : desktop ? styles.idleWrapDesktop : styles.idleWrapTablet, { transform: [{ translateY: idleLift }, { rotate: idleRotate }] }]}>
          <Animated.View style={[styles.previewWrap, { transform: [{ translateY: stageY }, { rotate: nodRotate }, { scale: stageScale }] }]}>
            <MeeAssetPreview draft={draft} compact={!desktop} stage />
          </Animated.View>
          </Animated.View>
        </View>

        <View style={[styles.wardrobeColumn, desktop ? null : styles.wardrobeColumnMobile]}>
        <View style={styles.wardrobeCard}>
          <View style={styles.categoryBar}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryContent}>
              {categories.map((item) => {
                const active = category === item.id;
                return (
                  <Pressable key={item.id} accessibilityRole="tab" accessibilityState={{ selected: active }} onPress={() => { playPop(); setCategory(item.id); }} style={[styles.categoryButton, active && styles.categoryButtonActive]}>
                    <Ionicons name={item.icon} size={26} color={active ? '#5D9F39' : '#858585'} />
                    {active ? <View style={styles.categoryUnderline} /> : null}
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
          <ScrollView style={styles.optionsScroll} contentContainerStyle={styles.optionsContent} showsVerticalScrollIndicator={false}>
            {panel}
          </ScrollView>
        </View>
        <Pressable onPress={() => { playPop(); randomize(); animateChange(); }} style={styles.randomButton}>
          <Ionicons name="swap-vertical" size={22} color="#2F2F2F" />
          <Text style={styles.randomText}>Ngẫu nhiên</Text>
        </Pressable>
        </View>
      </View>
    </AikidPage>
  );
}

const styles = StyleSheet.create({
  shell: { flex: 1, width: '100%', gap: 22 },
  shellDesktop: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 },
  shellMobile: { flexDirection: 'column' },
  stageCard: { padding: 0, backgroundColor: 'transparent' },
  stageDesktop: { width: '43%', minWidth: 360, height: '82%', alignSelf: 'flex-end' },
  stageMobile: { minHeight: 315, flex: 0.85 },
  stagePhone: { height: 330, minHeight: 330 },
  idleWrap: { flex: 1, alignSelf: 'center', transformOrigin: '50% 100%' },
  idleWrapDesktop: { width: '72%', maxWidth: 340 },
  idleWrapTablet: { width: '58%', maxWidth: 280 },
  idleWrapPhone: { width: 175, maxWidth: '50%' },
  previewWrap: { flex: 1, minHeight: 250, transformOrigin: '50% 72%' },
  wardrobeColumn: { flex: 1, height: '76%', minHeight: 510, alignSelf: 'center' },
  wardrobeColumnMobile: { minHeight: 400, height: undefined },
  randomButton: { alignSelf: 'flex-end', marginTop: 12, flexDirection: 'row', alignItems: 'center', gap: 8, borderRadius: 24, backgroundColor: '#F5F5F5', paddingHorizontal: 20, paddingVertical: 12, shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 5, shadowOffset: { width: 0, height: 2 } },
  randomText: { color: '#333', fontWeight: '900', fontSize: 16 },
  wardrobeCard: { flex: 1, overflow: 'hidden', borderRadius: 22, backgroundColor: '#F5F5F5', shadowColor: '#000', shadowOpacity: 0.16, shadowRadius: 8, shadowOffset: { width: 0, height: 3 } },
  categoryBar: { backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#EEEEEE' },
  categoryContent: { minWidth: '100%', paddingHorizontal: 20, paddingVertical: 10, justifyContent: 'space-around' },
  categoryButton: { minWidth: 52, height: 50, paddingHorizontal: 7, alignItems: 'center', justifyContent: 'center' },
  categoryButtonActive: { backgroundColor: 'transparent' },
  categoryUnderline: { position: 'absolute', bottom: 0, width: 32, height: 3, borderRadius: 2, backgroundColor: '#5D9F39' },
  optionsScroll: { flex: 1 },
  optionsContent: { padding: 28, paddingBottom: 40 },
  sectionTitle: { color: '#555', fontWeight: '900', fontSize: 15, marginBottom: 12, marginTop: 5 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 18, marginBottom: 24 },
  colorRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 11, marginBottom: 24 },
  optionTile: { width: 112, height: 112, borderRadius: 20, backgroundColor: '#fff', borderWidth: 3, borderColor: 'transparent', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.13, shadowRadius: 9, shadowOffset: { width: 0, height: 4 } },
  optionTileSelected: { borderColor: '#68B645', backgroundColor: '#fff', shadowColor: '#68B645', shadowOpacity: 0.24, shadowRadius: 8, shadowOffset: { width: 0, height: 3 } },
  checkBadge: { display: 'none', position: 'absolute', right: 5, top: 5, width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: '#68B645' },
  colorSwatch: { width: 48, height: 48, borderRadius: 24, borderWidth: 2, borderColor: 'rgba(255,255,255,.9)' },
  colorSwatchSquare: { borderRadius: 14 },
  bodyChoiceRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  bodyChoice: { alignItems: 'center', gap: 3 },
  bodyChoiceText: { fontSize: 12, fontWeight: '800', color: '#6A584A' },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingText: { color: '#6B584A', fontSize: 16, fontWeight: '800' },
});
