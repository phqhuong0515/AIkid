import { useEffect } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';

import { AikidStepNavigator } from '@/ui';

const PLOT_STEPS = [
  ['Thể loại', 'Chọn tinh thần câu chuyện'],
  ['Nhân vật', 'Chọn ai sẽ xuất hiện'],
  ['Bối cảnh', 'Chọn thời gian và không gian'],
  ['Khởi đầu', 'Chọn hành động và cảm xúc mở đầu'],
  ['Điều bất ngờ', 'Chọn biến cố làm câu chuyện chuyển động'],
  ['Mục đích', 'Chọn điều nhân vật muốn đạt được'],
  ['Trở ngại', 'Chọn thử thách và cách xử lý'],
  ['Cao trào', 'Chọn khoảnh khắc căng thẳng nhất'],
  ['Kết thúc', 'Chọn cách câu chuyện được giải quyết'],
  ['Bài học', 'Chọn điều nhân vật học được'],
] as const;

type StoryFlowProgressProps = {
  currentStep?: number;
  onStepPress?: (step: number) => void;
};

export function StoryFlowProgress({
  currentStep = 1,
  onStepPress,
}: StoryFlowProgressProps) {
  const currentPlotStep = PLOT_STEPS[Math.max(0, Math.min(PLOT_STEPS.length - 1, currentStep - 1))];

  useEffect(() => {
    if (Platform.OS === 'web') {
      window.requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
    }
  }, [currentStep]);

  return (
    <View style={styles.wrapper}>
      <AikidStepNavigator
        steps={PLOT_STEPS.map(([label]) => label)}
        currentStep={currentStep}
        maxVisitedStep={currentStep}
        onStepPress={onStepPress}
      />
      <View style={styles.current}>
        <Text style={styles.eyebrow}>BƯỚC {currentStep}/10 · {currentPlotStep[0].toUpperCase()}</Text>
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
  current: { alignItems: 'center', borderWidth: 1, borderColor: '#F2D5DD', borderRadius: 13, backgroundColor: '#FFFDFB', padding: 7, marginTop: 8 },
  eyebrow: { color: '#FF5E97', fontSize: 10, fontWeight: '900', letterSpacing: 0.35 },
  description: { color: '#475569', fontSize: 11, fontWeight: '700', lineHeight: 16, textAlign: 'center', marginTop: 1 },
});
