import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Alert,
  ScrollView,
  Platform,
  Pressable,
} from 'react-native';
import { Image } from 'expo-image';
import { FontAwesome6 } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';

export type VietQrPaymentModalProps = {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  planName: string;
  paymentCode?: string;
  onSuccess?: () => void;
};

const BANK_INFO = {
  bankName: 'MBBank (Ngân hàng Quân Đội)',
  accountNumber: '0382228888',
  accountHolder: 'CONG TY CONG NGHE GIAO DUC AI KIDS',
};

export function VietQrPaymentModal({
  isOpen,
  onClose,
  amount,
  planName,
  paymentCode,
  onSuccess,
}: VietQrPaymentModalProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [defaultPaymentCode] = useState(() => `AIKID${Date.now().toString().slice(-6)}`);

  if (!isOpen) return null;

  const finalPaymentCode = paymentCode || defaultPaymentCode;
  const qrUrl = `https://img.vietqr.io/image/MB-0382228888-compact2.png?amount=${amount}&addInfo=${encodeURIComponent(finalPaymentCode)}&accountName=CONG%20TY%20AI%20KIDS`;

  const copyToClipboard = async (text: string, fieldName: string) => {
    try {
      if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        await Clipboard.setStringAsync(text);
      }
      setCopiedField(fieldName);
      setTimeout(() => setCopiedField(null), 2500);
      Alert.alert('Đã sao chép', `Đã sao chép ${fieldName} vào bộ nhớ tạm.`);
    } catch {
      Alert.alert(fieldName, text);
    }
  };

  const handlePaid = () => {
    Alert.alert(
      'Xác nhận thanh toán',
      'Cảm ơn Phụ huynh! Hệ thống sẽ kiểm tra giao dịch và tự động cộng lượt / nâng cấp gói trong vòng 1-3 phút.',
      [
        {
          text: 'Hoàn tất',
          onPress: () => {
            if (onSuccess) onSuccess();
            onClose();
          },
        },
      ]
    );
  };

  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View style={styles.card}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.headerTitle}>Thanh toán VietQR</Text>
              <Text style={styles.headerSub}>{planName}</Text>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <FontAwesome6 name="xmark" size={18} color="#64748B" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollBody}>
            {/* QR Code Frame */}
            <View style={styles.qrFrame}>
              <Image
                source={{ uri: qrUrl }}
                style={styles.qrImage}
                contentFit="contain"
                transition={200}
              />
              <Text style={styles.qrHint}>Mở ứng dụng ngân hàng hoặc ví điện tử để quét mã QR</Text>
            </View>

            {/* Bank Transfer Details Box */}
            <View style={styles.detailBox}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Ngân hàng:</Text>
                <Text style={styles.detailValueBold}>{BANK_INFO.bankName}</Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Số tài khoản:</Text>
                <View style={styles.copyRow}>
                  <Text style={[styles.detailValueBold, { color: '#0F172A', fontSize: 16 }]}>
                    {BANK_INFO.accountNumber}
                  </Text>
                  <TouchableOpacity
                    style={styles.copyBadge}
                    onPress={() => copyToClipboard(BANK_INFO.accountNumber, 'Số tài khoản')}
                  >
                    <FontAwesome6
                      name={copiedField === 'Số tài khoản' ? 'check' : 'copy'}
                      size={12}
                      color="#FF7597"
                    />
                    <Text style={styles.copyText}>
                      {copiedField === 'Số tài khoản' ? 'Đã chép' : 'Sao chép'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Chủ tài khoản:</Text>
                <Text style={styles.detailValueBold}>{BANK_INFO.accountHolder}</Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Số tiền:</Text>
                <Text style={[styles.detailValueBold, { color: '#E11D48', fontSize: 17 }]}>
                  {amount.toLocaleString('vi-VN')} đ
                </Text>
              </View>

              <View style={[styles.detailRow, { borderBottomWidth: 0 }]}>
                <Text style={styles.detailLabel}>Nội dung CK:</Text>
                <View style={styles.copyRow}>
                  <Text style={[styles.detailValueBold, { color: '#2563EB', fontSize: 15 }]}>
                    {finalPaymentCode}
                  </Text>
                  <TouchableOpacity
                    style={styles.copyBadge}
                    onPress={() => copyToClipboard(finalPaymentCode, 'Nội dung CK')}
                  >
                    <FontAwesome6
                      name={copiedField === 'Nội dung CK' ? 'check' : 'copy'}
                      size={12}
                      color="#FF7597"
                    />
                    <Text style={styles.copyText}>
                      {copiedField === 'Nội dung CK' ? 'Đã chép' : 'Sao chép'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            <View style={styles.noteBox}>
              <FontAwesome6 name="shield-halved" size={14} color="#059669" style={{ marginRight: 8, marginTop: 2 }} />
              <Text style={styles.noteText}>
                Vui lòng nhập chính xác Nội dung chuyển khoản để hệ thống kích hoạt tự động nhanh nhất.
              </Text>
            </View>

            {/* Bottom Actions */}
            <TouchableOpacity
              style={styles.paidButton}
              onPress={handlePaid}
              activeOpacity={0.85}
            >
              <Text style={styles.paidButtonText}>Tôi đã chuyển khoản</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={onClose}
            >
              <Text style={styles.cancelBtnText}>Đóng</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    padding: 16,
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
  },
  card: {
    backgroundColor: '#FDFAF4',
    borderRadius: 32,
    borderWidth: 4,
    borderColor: '#FFFFFF',
    width: '100%',
    maxWidth: 460,
    maxHeight: '92%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 10,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 22,
    paddingTop: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    backgroundColor: '#FFFFFF',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0F172A',
  },
  headerSub: {
    fontSize: 13,
    color: '#FF7597',
    fontWeight: '700',
    marginTop: 2,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollBody: {
    padding: 20,
    gap: 16,
  },
  qrFrame: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  qrImage: {
    width: 240,
    height: 240,
    borderRadius: 12,
  },
  qrHint: {
    marginTop: 10,
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    fontWeight: '500',
  },
  detailBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 10,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  detailLabel: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
  },
  detailValueBold: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1E293B',
  },
  copyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  copyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFF0F3',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  copyText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FF7597',
  },
  noteBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#ECFDF5',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  noteText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
    color: '#065F46',
    fontWeight: '500',
  },
  paidButton: {
    backgroundColor: '#FF7597',
    height: 52,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FF7597',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 3,
  },
  paidButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  cancelBtn: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
});
