import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

const ITEM_WIDTH = 116;
const ITEM_GAP = 6;

type Props = {
  steps: readonly string[];
  currentStep: number;
  maxVisitedStep?: number;
  onStepPress?: (step: number) => void;
};

export function AikidStepNavigator({
  steps,
  currentStep,
  maxVisitedStep = currentStep,
  onStepPress,
}: Props) {
  const scrollRef = useRef<ScrollView>(null);
  const [viewportWidth, setViewportWidth] = useState(0);
  const [scrollX, setScrollX] = useState(0);
  const contentWidth = steps.length * ITEM_WIDTH + Math.max(0, steps.length - 1) * ITEM_GAP + 8;
  const maxScroll = Math.max(0, contentWidth - viewportWidth);

  const scrollTo = (x: number, animated = true) => {
    scrollRef.current?.scrollTo({ x: Math.max(0, Math.min(maxScroll, x)), animated });
  };

  useEffect(() => {
    if (!viewportWidth) return;
    const activeCenter = (currentStep - 1) * (ITEM_WIDTH + ITEM_GAP) + ITEM_WIDTH / 2;
    scrollTo(activeCenter - viewportWidth / 2);
  // scrollTo intentionally derives from the latest measured dimensions.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStep, viewportWidth]);

  return (
    <View style={styles.container}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Xem các bước trước"
        disabled={scrollX <= 2}
        onPress={() => scrollTo(scrollX - (ITEM_WIDTH + ITEM_GAP))}
        style={[styles.arrow, styles.arrowLeft, scrollX <= 2 && styles.arrowDisabled]}
      >
        <Ionicons name="chevron-back" size={20} color="#FF5E97" />
      </Pressable>
      <View
        style={styles.viewport}
        onLayout={(event) => setViewportWidth(event.nativeEvent.layout.width)}
      >
        <ScrollView
          ref={scrollRef}
          horizontal
          bounces={false}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.content}
          onScroll={(event) => setScrollX(event.nativeEvent.contentOffset.x)}
          scrollEventThrottle={16}
        >
          {steps.map((label, index) => {
            const value = index + 1;
            const active = value === currentStep;
            const completed = value < currentStep;
            const unlocked = value <= maxVisitedStep;
            return (
              <Pressable
                key={`${value}-${label}`}
                disabled={!unlocked || !onStepPress}
                accessibilityRole="button"
                accessibilityLabel={`Bước ${value}: ${label}`}
                accessibilityState={{ disabled: !unlocked, selected: active }}
                onPress={() => onStepPress?.(value)}
                style={[styles.step, active && styles.stepActive, !unlocked && styles.stepLocked]}
              >
                <View style={[styles.dot, completed && styles.dotCompleted, active && styles.dotActive]}>
                  {completed
                    ? <Ionicons name="checkmark" size={14} color="#FFF" />
                    : <Text style={[styles.dotText, active && styles.dotTextActive]}>{value}</Text>}
                </View>
                <Text style={[styles.label, completed && styles.labelCompleted, active && styles.labelActive]} numberOfLines={2}>
                  {label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Xem các bước tiếp theo"
        disabled={scrollX >= maxScroll - 2}
        onPress={() => scrollTo(scrollX + (ITEM_WIDTH + ITEM_GAP))}
        style={[styles.arrow, styles.arrowRight, scrollX >= maxScroll - 2 && styles.arrowDisabled]}
      >
        <Ionicons name="chevron-forward" size={20} color="#FF5E97" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { position: 'relative', width: '100%', paddingHorizontal: 36 },
  viewport: { width: '100%', overflow: 'hidden' },
  content: { gap: ITEM_GAP, paddingHorizontal: 4, paddingBottom: 4 },
  step: { width: ITEM_WIDTH, minHeight: 66, paddingVertical: 8, paddingHorizontal: 5, borderRadius: 16, alignItems: 'center', opacity: 0.78 },
  stepActive: { backgroundColor: '#FFF0F4', opacity: 1 },
  stepLocked: { opacity: 0.35 },
  dot: { width: 26, height: 26, borderRadius: 13, backgroundColor: '#E9DED4', alignItems: 'center', justifyContent: 'center' },
  dotActive: { backgroundColor: '#FF5E97' },
  dotCompleted: { backgroundColor: '#48BB78' },
  dotText: { color: '#6D5A4E', fontWeight: '900' },
  dotTextActive: { color: '#FFF' },
  label: { color: '#756459', fontWeight: '700', fontSize: 10, lineHeight: 13, marginTop: 5, textAlign: 'center' },
  labelActive: { color: '#FF5E97' },
  labelCompleted: { color: '#2F855A' },
  arrow: { position: 'absolute', top: 14, zIndex: 4, width: 32, height: 38, borderRadius: 16, borderWidth: 1, borderColor: '#F2D5DD', backgroundColor: '#FFF', alignItems: 'center', justifyContent: 'center' },
  arrowLeft: { left: 0 },
  arrowRight: { right: 0 },
  arrowDisabled: { opacity: 0.25 },
});
