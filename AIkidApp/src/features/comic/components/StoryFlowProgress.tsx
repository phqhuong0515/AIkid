import { Ionicons } from '@expo/vector-icons';
import { useEffect } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';

const PLOT_STEPS = [
  ['Thể loại', 'Chọn tinh thần câu chuyện'],
  ['Nhân vật', 'Chọn ai sẽ xuất hiện'],
  ['Bối cảnh', 'Chọn nơi câu chuyện diễn ra'],
  ['Sự kiện', 'Chọn chuyện gì sẽ xảy ra'],
] as const;

type StoryFlowProgressProps = {
  currentStep?: number;
  onStepPress?: (step: number) => void;
};

export function StoryFlowProgress({
  currentStep = 1,
  onStepPress,
}: StoryFlowProgressProps) {
  const currentPlotStep = PLOT_STEPS[Math.max(0, Math.min(3, currentStep - 1))];

  useEffect(() => {
    if (Platform.OS === 'web') {
      window.requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
    }
  }, [currentStep]);

  return (
    <View style={styles.wrapper}>
      <View style={styles.steps}>
        {PLOT_STEPS.map(([label], index) => {
          const step = index + 1;
          const completed = step < currentStep;
          const active = step === currentStep;
          return (
            <Pressable
              key={label}
              accessibilityRole="button"
              accessibilityLabel={`Bước ${step}: ${label}`}
              disabled={!completed || !onStepPress}
              onPress={() => onStepPress?.(step)}
              style={styles.step}
            >
              <View style={[styles.dot, completed && styles.dotCompleted, active && styles.dotActive]}>
                {completed
                  ? <Ionicons name="checkmark" size={14} color="#FFF" />
                  : <Text style={[styles.dotText, active && styles.dotTextActive]}>{step}</Text>}
              </View>
              <Text style={[styles.label, completed && styles.labelCompleted, active && styles.labelActive]}>{label}</Text>
            </Pressable>
          );
        })}
      </View>
      <View style={styles.current}>
        <Text style={styles.eyebrow}>BƯỚC {currentStep}/4 · {currentPlotStep[0].toUpperCase()}</Text>
        <Text style={styles.description}>{currentPlotStep[1]}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: '100%', maxWidth: 1120, alignSelf: 'center', borderWidth: 5, borderColor: '#FFF',
    borderRadius: 24, backgroundColor: '#FDFAF4', padding: 10, marginBottom: 18,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 12, elevation: 3, zIndex: 50,
  },
  steps: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 8 },
  step: { flex: 1, minWidth: 0, alignItems: 'center', gap: 4 },
  dot: { width: 25, height: 25, borderRadius: 13, alignItems: 'center', justifyContent: 'center', backgroundColor: '#E9DDD3' },
  dotCompleted: { backgroundColor: '#43B97F' },
  dotActive: { backgroundColor: '#FF5E97' },
  dotText: { color: '#8A7463', fontSize: 11, fontWeight: '900' },
  dotTextActive: { color: '#FFF' },
  label: { color: '#8A7463', fontSize: 9, fontWeight: '800', textAlign: 'center' },
  labelCompleted: { color: '#27845A' },
  labelActive: { color: '#FF5E97' },
  current: { alignItems: 'center', borderWidth: 1, borderColor: '#F2D5DD', borderRadius: 13, backgroundColor: '#FFFDFB', padding: 7, marginTop: 8 },
  eyebrow: { color: '#FF5E97', fontSize: 10, fontWeight: '900', letterSpacing: 0.35 },
  description: { color: '#475569', fontSize: 11, fontWeight: '700', lineHeight: 16, textAlign: 'center', marginTop: 1 },
});
