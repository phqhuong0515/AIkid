import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { AikidButton, AikidIcon, AikidText } from '@/ui';

export type AiResultPanelProps = {
  styleName: string;
  onGenerate: () => void;
  aiState: 'idle' | 'generating' | 'done' | 'error';
  aiImageUrl?: string | null;
  onDownload: () => void;
  errorMessage?: string | null;
  onChooseStyle?: () => void;
};

export function AiResultPanel({
  styleName,
  onGenerate,
  aiState,
  aiImageUrl,
  onDownload,
  errorMessage,
  onChooseStyle,
}: AiResultPanelProps) {
  return (
    <View style={styles.container}>
      <View style={styles.actionBar}>
        <AikidButton variant="feature" size="sm" onPress={onChooseStyle} leftIcon={<AikidIcon name="palette" size={18} color="#704E48" />}>
          Phong cách
        </AikidButton>
        <AikidButton variant="feature" size="sm" onPress={onGenerate} leftIcon={<AikidIcon name="refresh" size={18} color="#704E48" />}>
          Làm lại
        </AikidButton>
        <AikidButton variant="feature" size="sm" onPress={onDownload} leftIcon={<AikidIcon name="download" size={18} color="#704E48" />}>
          Tải về
        </AikidButton>
      </View>

      <View style={styles.content}>
        {aiState === 'idle' && (
          <View style={styles.idleContainer}>
            <AikidIcon name="wand" size={48} color="#FF6B93" />
            <AikidText variant="body" style={styles.idleText}>
              Hãy vẽ tranh hoặc tải ảnh lên, sau đó bấm AI Vẽ Lại để xem phép thuật nhé!
            </AikidText>
            <AikidButton
              variant="cta"
              size="lg"
              leftIcon={<AikidIcon name="wand" size={20} color="#FFFFFF" />}
              onPress={onGenerate}
            >
              AI VẼ LẠI
            </AikidButton>
          </View>
        )}

        {aiState === 'generating' && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FF6B93" />
            <AikidText variant="brand" style={styles.loadingText}>Đang dùng phép thuật AI...</AikidText>
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
            <AikidText variant="body" style={styles.errorText}>{errorMessage || 'Đã có lỗi xảy ra'}</AikidText>
            <AikidButton variant="delete" onPress={onGenerate}>Thử lại</AikidButton>
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
  actionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EBDCD0',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  idleContainer: {
    alignItems: 'center',
    padding: 24,
    maxWidth: 440,
  },
  idleText: {
    textAlign: 'center',
    marginBottom: 24,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 16,
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
    color: '#EF4444',
    marginBottom: 16,
    textAlign: 'center',
  },
});
