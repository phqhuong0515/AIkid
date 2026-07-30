import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import Slider from '@react-native-community/slider';
import { LinearGradient } from 'expo-linear-gradient';
import { AikidTheme } from '@/features/kids-ui/theme';
import { DrawTool } from './SkiaCanvasTypes';
import { AikidIcon, type AikidIconName } from '@/ui/AikidIcon';

export type DrawingToolbarProps = {
  tool: DrawTool;
  onToolChange: (t: DrawTool) => void;
  color: string;
  onColorChange: (c: string) => void;
  strokeWidth: number;
  onStrokeWidthChange: (w: number) => void;
  activeStamp: string;
  onStampChange: (s: string) => void;
  orientation?: 'horizontal' | 'vertical';
};

const COLORS = ['#000000','#FFFFFF','#FF0000','#FF8C00','#FFD700','#00AA00','#0066CC','#9933CC','#FF69B4','#8B4513'];
const STAMPS = ['⭐','🌸','🦋','🌈','❤️','🐱','🐶','🌺','🎵','🏆','🌙','🍀','🦄','🐠','🎨'];
const TOOLS: { id: DrawTool; icon: AikidIconName; label: string }[] = [
  { id: 'brush', icon: 'brush', label: 'Cọ' },
  { id: 'pencil', icon: 'pencil', label: 'Chì' },
  { id: 'eraser', icon: 'eraser', label: 'Tẩy' },
  { id: 'stamp', icon: 'stamp', label: 'Dấu' },
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
  orientation = 'vertical',
}: DrawingToolbarProps) {
  const horizontal = orientation === 'horizontal';
  return (
    <View style={[styles.container, horizontal && styles.containerHorizontal]}>
      <ScrollView
        horizontal={horizontal}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, horizontal && styles.scrollContentHorizontal]}
      >
        {/* Tools */}
        <View style={[styles.section, horizontal && styles.sectionHorizontal]}>
          {TOOLS.map((t) => (
            <TouchableOpacity key={t.id} onPress={() => onToolChange(t.id)} style={styles.toolBtnContainer}>
              {tool === t.id ? (
                <LinearGradient colors={['#FF5C8A', '#FF8E53']} style={[styles.activeToolBg, { borderRadius: 12 }]}>
                  <AikidIcon name={t.icon} size={22} color="#FFFFFF" />
                </LinearGradient>
              ) : (
                <View style={styles.inactiveToolBg}>
                  <AikidIcon name={t.icon} size={22} color="#334155" />
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        <View style={[styles.divider, horizontal && styles.dividerHorizontal]} />

        {/* Colors (only if not eraser/stamp) */}
        {(tool === 'brush' || tool === 'pencil') && (
          <View style={[styles.section, horizontal && styles.sectionHorizontal]}>
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
          <View style={[styles.section, horizontal && styles.sectionHorizontal]}>
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

        {!horizontal && <View style={styles.divider} />}

        {/* Stroke Width */}
        {!horizontal && (tool === 'brush' || tool === 'pencil' || tool === 'eraser') && (
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
    width: 64,
    backgroundColor: '#FDFAFA',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#EBDCD0',
    paddingVertical: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    maxHeight: 560,
  },
  containerHorizontal: {
    width: '100%',
    maxHeight: 68,
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 18,
  },
  scrollContent: {
    alignItems: 'center',
    gap: 12,
  },
  scrollContentHorizontal: {
    flexDirection: 'row',
    paddingRight: 8,
  },
  section: {
    alignItems: 'center',
    gap: 8,
  },
  sectionHorizontal: {
    flexDirection: 'row',
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
  divider: {
    width: 32,
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 4,
  },
  dividerHorizontal: {
    width: 1,
    height: 32,
    marginHorizontal: 4,
    marginVertical: 0,
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
