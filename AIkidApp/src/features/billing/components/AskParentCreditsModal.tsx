import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Alert,
  Platform,
  Pressable,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { ParentGateModal } from '@/components/ParentGateModal';

export type AskParentCreditsModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onParentUnlocked?: () => void;
  studentName?: string;
};

export function AskParentCreditsModal({
  isOpen,
  onClose,
  onParentUnlocked,
  studentName,
}: AskParentCreditsModalProps) {
  const [parentGateOpen, setParentGateOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const friendlyMessage = studentName
    ? `Ba Mẹ ơi, con (${studentName}) đã dùng hết lượt vẽ AI tháng này rồi! Ba Mẹ nạp thêm lượt phép thuật cho con trên AIKid nhé! 💖🎨`
    : 'Ba Mẹ ơi, con đã dùng hết lượt vẽ AI tháng này rồi! Ba Mẹ nạp thêm lượt phép thuật cho con trên AIKid nhé! 💖🎨';

  const handleSendOrCopy = async () => {
    try {
      if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(friendlyMessage);
      } else {
        await Clipboard.setStringAsync(friendlyMessage);
      }
      setCopied(true);
      Alert.alert(
        '💌 Đã sao chép lời nhắn!',
        'Lời nhắn thân thiện đã được sao chép vào bộ nhớ tạm. Con có thể dán vào Zalo hoặc tin nhắn để gửi cho Phụ huynh nhé!'
      );
      setTimeout(() => setCopied(false), 3000);
    } catch {
      Alert.alert('Lời nhắn gửi Phụ huynh', friendlyMessage);
    }
  };

  const handleOpenParentGate = () => {
    setParentGateOpen(true);
  };

  const handleParentSuccess = () => {
    setParentGateOpen(false);
    onClose();
    if (onParentUnlocked) {
      onParentUnlocked();
    }
  };

  return (
    <>
      <Modal
        visible={isOpen && !parentGateOpen}
        transparent
        animationType="fade"
        onRequestClose={onClose}
      >
        <View style={styles.overlay}>
          <Pressable style={styles.backdrop} onPress={onClose} />
          <View style={styles.card}>
            {/* Mascot / Icon Badge */}
            <View style={styles.iconCircle}>
              <Text style={styles.iconEmoji}>✨🪄</Text>
            </View>

            <Text style={styles.title}>Hết Lượt Phép Thuật AI Rồi!</Text>

            <Text style={styles.message}>
              Học sinh đã dùng hết lượt phép thuật AI tháng này rồi! Con có thể tiếp tục vẽ tự do trên bảng vẽ, hoặc gửi lời nhắn nhờ Phụ huynh nạp thêm lượt nhé!
            </Text>

            {/* Action Buttons */}
            <View style={styles.buttonStack}>
              {/* Button 1: Send / copy message to parent */}
              <TouchableOpacity
                style={styles.actionBtnPrimary}
                onPress={handleSendOrCopy}
                activeOpacity={0.85}
              >
                <Text style={styles.actionBtnPrimaryText}>
                  {copied ? '✅ Đã sao chép lời nhắn!' : '💌 Gửi lời nhắn nhờ Phụ huynh'}
                </Text>
              </TouchableOpacity>

              {/* Button 2: Parent is here */}
              <TouchableOpacity
                style={styles.actionBtnSecondary}
                onPress={handleOpenParentGate}
                activeOpacity={0.85}
              >
                <Text style={styles.actionBtnSecondaryText}>
                  👨‍👩‍👧 Phụ huynh đang ở đây
                </Text>
              </TouchableOpacity>

              {/* Button 3: Keep drawing */}
              <TouchableOpacity
                style={styles.actionBtnTertiary}
                onPress={onClose}
                activeOpacity={0.85}
              >
                <Text style={styles.actionBtnTertiaryText}>
                  🎨 Con vẽ tiếp bằng cọ vẽ
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Parent Gate Modal */}
      <ParentGateModal
        isOpen={parentGateOpen}
        onClose={() => setParentGateOpen(false)}
        onSuccess={handleParentSuccess}
        title="Xác thực Phụ Huynh"
        subtitle="Nhập mật khẩu để mở trung tâm nạp lượt AI cho con"
      />
    </>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    padding: 20,
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
  },
  card: {
    backgroundColor: '#FDFAF4',
    borderRadius: 32,
    borderWidth: 4,
    borderColor: '#FFFFFF',
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 24,
    width: '100%',
    maxWidth: 420,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 10,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#FFF0F5',
    borderWidth: 3,
    borderColor: '#FFD6E4',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  iconEmoji: {
    fontSize: 34,
  },
  title: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 10,
  },
  message: {
    fontSize: 14,
    lineHeight: 22,
    color: '#475569',
    textAlign: 'center',
    marginBottom: 22,
    paddingHorizontal: 6,
  },
  buttonStack: {
    width: '100%',
    gap: 10,
  },
  actionBtnPrimary: {
    height: 52,
    borderRadius: 18,
    backgroundColor: '#FF7597',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FF7597',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 3,
  },
  actionBtnPrimaryText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  actionBtnSecondary: {
    height: 50,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#FFB5C8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtnSecondaryText: {
    color: '#E11D48',
    fontSize: 15,
    fontWeight: '700',
  },
  actionBtnTertiary: {
    height: 48,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtnTertiaryText: {
    color: '#475569',
    fontSize: 14,
    fontWeight: '700',
  },
});
