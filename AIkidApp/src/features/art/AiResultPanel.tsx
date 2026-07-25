import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { AikidButton } from '@/features/kids-ui/AikidButton';
import { AikidTheme } from '@/features/kids-ui/theme';

export type AiResultPanelProps = {
  styleName: string;
  onGenerate: () => void;
  aiState: 'idle' | 'generating' | 'done' | 'error';
  aiImageUrl?: string | null;
  onDownload: () => void;
  errorMessage?: string | null;
};

export function AiResultPanel({
  styleName,
  onGenerate,
  aiState,
  aiImageUrl,
  onDownload,
  errorMessage,
}: AiResultPanelProps) {
  return (
    <View style={styles.container}>
      {/* Floating Top Bar for AI Panel */}
      <View style={styles.floatingTopBar}>
        <TouchableOpacity style={styles.pillBtn}>
          <Text style={styles.pillText}>🎨 Chọn lại phong cách vẽ</Text>
        </TouchableOpacity>
        <View style={{ flexDirection: 'row', gap: 8 }}>
           <TouchableOpacity style={styles.pillBtn} onPress={onGenerate}>
             <Text style={styles.pillText}>🔄 Làm lại</Text>
           </TouchableOpacity>
           <TouchableOpacity style={styles.pillBtn} onPress={onDownload}>
             <Text style={styles.pillText}>📥 Tải về</Text>
           </TouchableOpacity>
        </View>
      </View>

      <View style={styles.content}>
        {aiState === 'idle' && (
          <View style={styles.idleContainer}>
            <Text style={styles.magicIcon}>🪄</Text>
            <Text style={styles.idleText}>
              Hãy vẽ tranh hoặc tải ảnh lên, sau đó bấm{'\n'}
              <Text style={styles.idleTextBold}>AI Vẽ Lại</Text> để xem phép thuật nhé!
            </Text>
            <AikidButton
              title="✨ AI VẼ LẠI"
              variant="primary"
              onPress={onGenerate}
              style={[styles.generateBtn, { backgroundColor: '#FF6B93', borderColor: '#FF6B93' }]}
            />
          </View>
        )}

        {aiState === 'generating' && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FF6B93" />
            <Text style={styles.loadingText}>Đang dùng phép thuật AI...</Text>
          </View>
        )}

        {aiState === 'done' && aiImageUrl && (
          <View style={styles.resultContainer}>
            <Image
              source={{ uri: aiImageUrl }}
              style={styles.image}
              contentFit="contain"
              transition={300}
            />
          </View>
        )}

        {aiState === 'error' && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{errorMessage || 'Đã có lỗi xảy ra'}</Text>
            <AikidButton title="Thử lại" variant="danger" onPress={onGenerate} />
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  floatingTopBar: {
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    zIndex: 10,
    pointerEvents: 'box-none',
  },
  pillBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#FFFBEB',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#FDE68A',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  pillText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4A3D3C',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  idleContainer: {
    alignItems: 'center',
    padding: 32,
  },
  magicIcon: {
    fontSize: 48,
    marginBottom: 16,
    color: '#FF6B93',
  },
  idleText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  idleTextBold: {
    fontWeight: 'bold',
    color: '#FF6B93',
  },
  generateBtn: {
    paddingHorizontal: 32,
    borderRadius: 100,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#FF6B93',
    fontWeight: '600',
  },
  resultContainer: {
    flex: 1,
    width: '100%',
    padding: 16,
  },
  image: {
    flex: 1,
    width: '100%',
    height: '100%',
    borderRadius: 16,
  },
  errorContainer: {
    alignItems: 'center',
    padding: 24,
  },
  errorText: {
    fontSize: 16,
    color: '#EF4444',
    marginBottom: 16,
    textAlign: 'center',
  },
});
