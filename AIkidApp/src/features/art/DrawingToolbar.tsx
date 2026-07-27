import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import Slider from '@react-native-community/slider';
import { LinearGradient } from 'expo-linear-gradient';
import { AikidTheme } from '@/features/kids-ui/theme';
import { DrawTool } from './SkiaCanvasTypes';

export type DrawingToolbarProps = {
  tool: DrawTool;
  onToolChange: (t: DrawTool) => void;
  color: string;
  onColorChange: (c: string) => void;
  strokeWidth: number;
  onStrokeWidthChange: (w: number) => void;
  activeStamp: string;
  onStampChange: (s: string) => void;
};

const COLORS = ['#000000','#FFFFFF','#FF0000','#FF8C00','#FFD700','#00AA00','#0066CC','#9933CC','#FF69B4','#8B4513'];
const STAMPS = ['⭐','🌸','🦋','🌈','❤️','🐱','🐶','🌺','🎵','🏆','🌙','🍀','🦄','🐠','🎨'];
const TOOLS: { id: DrawTool; icon: string; label: string }[] = [
  { id: 'brush', icon: '🖌️', label: 'Cọ' },
  { id: 'pencil', icon: '✏️', label: 'Chì' },
  { id: 'eraser', icon: '📦', label: 'Xóa' }, // Using box emoji as a placeholder for eraser since the instruction had 📦
  { id: 'stamp', icon: '🌠', label: 'Dấu' },
];

export function DrawingToolbar({
  tool,
  onToolChange,
  color,
  onColorChange,
  strokeWidth,
  onStrokeWidthChange,
  activeStamp,
  onStampChange,
}: DrawingToolbarProps) {
  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Tools */}
        <View style={styles.section}>
          {TOOLS.map((t) => (
            <TouchableOpacity key={t.id} onPress={() => onToolChange(t.id)} style={styles.toolBtnContainer}>
              {tool === t.id ? (
                <LinearGradient colors={['#FF5C8A', '#FF8E53']} style={[styles.activeToolBg, { borderRadius: 12 }]}>
                  <Text style={styles.toolIcon}>{t.icon}</Text>
                </LinearGradient>
              ) : (
                <View style={styles.inactiveToolBg}>
                  <Text style={styles.toolIcon}>{t.icon}</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.divider} />

        {/* Colors (only if not eraser/stamp) */}
        {(tool === 'brush' || tool === 'pencil') && (
          <View style={styles.section}>
            {COLORS.map((c) => (
              <TouchableOpacity
                key={c}
                onPress={() => onColorChange(c)}
                style={[
                  styles.colorBtn,
                  { backgroundColor: c, borderColor: color === c ? AikidTheme.colors.brandMain : '#E5E7EB', borderWidth: color === c ? 2 : 1 }
                ]}
              />
            ))}
          </View>
        )}

        {/* Stamps (only if stamp) */}
        {tool === 'stamp' && (
          <View style={styles.section}>
            {STAMPS.map((s) => (
              <TouchableOpacity
                key={s}
                onPress={() => onStampChange(s)}
                style={[styles.stampBtn, activeStamp === s && styles.activeStampBtn]}
              >
                <Text style={styles.stampText}>{s}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View style={styles.divider} />

        {/* Stroke Width */}
        {(tool === 'brush' || tool === 'pencil' || tool === 'eraser') && (
          <View style={styles.sliderSection}>
            <Text style={styles.sliderLabel}>Cỡ nét</Text>
            <Slider
              style={{ width: '100%', height: 40 }}
              minimumValue={3}
              maximumValue={40}
              step={1}
              value={strokeWidth}
              onValueChange={onStrokeWidthChange}
              minimumTrackTintColor={AikidTheme.colors.brandMain}
              maximumTrackTintColor="#E5E7EB"
            />
          </View>
        )}


      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 60,
    backgroundColor: '#FFFBEB',
    borderRadius: 30,
    borderWidth: 1,
    borderColor: '#FDE68A',
    paddingVertical: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    maxHeight: 500,
  },
  scrollContent: {
    alignItems: 'center',
    gap: 12,
  },
  section: {
    alignItems: 'center',
    gap: 8,
  },
  toolBtnContainer: {
    width: 44,
    height: 44,
  },
  activeToolBg: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  inactiveToolBg: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  toolIcon: {
    fontSize: 20,
  },
  divider: {
    width: 32,
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 4,
  },
  colorBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  stampBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  activeStampBtn: {
    borderColor: AikidTheme.colors.brandMain,
    borderWidth: 2,
    backgroundColor: '#FFF1F2',
  },
  stampText: {
    fontSize: 20,
  },
  sliderSection: {
    width: 140, // Increased width
    height: 140, // Set fixed height to give space for rotated slider
    alignItems: 'center',
    justifyContent: 'center',
  },
  sliderLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#6B7280',
    marginBottom: 8,
    position: 'absolute',
    top: 0,
  },
});
