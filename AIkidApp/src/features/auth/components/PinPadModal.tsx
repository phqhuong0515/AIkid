import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, TouchableOpacity, Modal, StyleSheet,
  TextInput, Platform, Pressable,
} from 'react-native';

type PinPadModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (pin: string) => void;
  title: string;
  subtitle?: string;
  busy?: boolean;
  error?: string | null;
  closeLabel?: string;
  // Legacy props - ignored, kept for backward compat
  pin?: string;
  setPin?: (pin: string) => void;
};

export function PinPadModal({
  isOpen,
  onClose,
  onSubmit,
  title,
  subtitle,
  busy,
  error,
  closeLabel = 'Hủy',
}: PinPadModalProps) {
  const inputRef = useRef<TextInput>(null);
  // Internal pin state - self-contained
  const [pin, setPin] = useState('');

  // Reset pin & focus khi modal mở/đóng
  useEffect(() => {
    if (!isOpen) {
      setPin('');
      return;
    }
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 150);
    return () => clearTimeout(timer);
  }, [isOpen]);

  // Nhận input từ bàn phím (vật lý hoặc ảo) — lọc chỉ lấy số
  const handleChangeText = (raw: string) => {
    if (busy) return;
    const digitsOnly = raw.replace(/\D/g, '').slice(0, 6);
    setPin(digitsOnly);
    if (digitsOnly.length === 6) {
      onSubmit(digitsOnly);
    }
  };

  // Bàn phím ảo UI — bấm số
  function onPinDigit(d: string) {
    if (busy || pin.length >= 6) return;
    const next = (pin + d).slice(0, 6);
    setPin(next);
    // Giữ focus để keyboard tiếp tục nhận input
    inputRef.current?.focus();
    if (next.length === 6) {
      onSubmit(next);
    }
  }

  // Bàn phím ảo UI — xóa
  function onPinBack() {
    if (busy) return;
    setPin(pin.slice(0, -1));
    inputRef.current?.focus();
  }

  return (
    <Modal visible={isOpen} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={() => inputRef.current?.focus()}>
        <Pressable style={styles.card} onPress={() => {}}>

          {/* Title */}
          <Text style={styles.title}>{title}</Text>
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}

          {/* Error */}
          {error && <Text style={styles.errorText}>{error}</Text>}

          {/* PIN dots + ẩn TextInput bên dưới để nhận keyboard */}
          <Pressable
            style={styles.dotsContainer}
            onPress={() => inputRef.current?.focus()}
            accessibilityLabel="Nhập mã PIN 6 số"
          >
            {/* Input ẩn — chỉ để nhận keyboard events (vật lý + ảo hệ thống) */}
            <TextInput
              ref={inputRef}
              value={pin}
              onChangeText={handleChangeText}
              keyboardType="number-pad"
              maxLength={6}
              caretHidden
              style={styles.hiddenInput}
              editable={!busy}
              autoFocus={Platform.OS !== 'web'}
              // Web: bàn phím vật lý; Mobile: keypad số
              {...(Platform.OS === 'web' && { inputMode: 'numeric' } as any)}
            />

            {/* Dots hiển thị */}
            <View style={styles.dotsRow}>
              {Array.from({ length: 6 }).map((_, i) => {
                const isFilled = pin.length > i;
                const isCurrent = pin.length === i || (pin.length === 6 && i === 5);
                return (
                  <View
                    key={i}
                    style={[
                      styles.dotBox,
                      isFilled && styles.dotBoxFilled,
                      !isFilled && isCurrent && styles.dotBoxCurrent,
                    ]}
                  >
                    {isFilled && <Text style={styles.dotText}>•</Text>}
                  </View>
                );
              })}
            </View>
          </Pressable>

          {/* Bàn phím ảo UI (vẫn giữ để dễ dùng trên mobile) */}
          <View style={styles.keypad}>
            {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'del', '0', 'ok'].map((key) => {
              if (key === 'del') {
                return (
                  <TouchableOpacity
                    key={key}
                    style={styles.keyBtnSec}
                    onPress={onPinBack}
                    disabled={busy}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.keyBtnSecText}>⌫</Text>
                  </TouchableOpacity>
                );
              }
              if (key === 'ok') {
                return (
                  <TouchableOpacity
                    key={key}
                    style={[styles.keyBtnPri, pin.length !== 6 && styles.keyBtnDisabled]}
                    onPress={() => pin.length === 6 && !busy && onSubmit(pin)}
                    disabled={busy || pin.length !== 6}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.keyBtnPriText}>{busy ? '…' : '✓ Vào'}</Text>
                  </TouchableOpacity>
                );
              }
              return (
                <TouchableOpacity
                  key={key}
                  style={styles.keyBtnSec}
                  onPress={() => onPinDigit(key)}
                  disabled={busy}
                  activeOpacity={0.7}
                >
                  <Text style={styles.keyBtnText}>{key}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Hủy */}
          <TouchableOpacity style={styles.closeBtn} onPress={onClose} disabled={busy}>
            <Text style={styles.closeBtnText}>{closeLabel}</Text>
          </TouchableOpacity>

        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  card: {
    backgroundColor: '#FDFAF4',
    width: '100%',
    maxWidth: 480,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 32,
    alignItems: 'center',
    // White border + shadow giống các screens khác
    borderWidth: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#475569',
    marginBottom: 4,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#8A7463',
    marginBottom: 20,
    textAlign: 'center',
  },
  errorText: {
    color: '#E11D48',
    backgroundColor: '#FFF1F2',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
    width: '100%',
  },
  dotsContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 28,
    position: 'relative',
  },
  // Input ẩn: nhận keyboard events, không hiển thị cho người dùng
  hiddenInput: {
    position: 'absolute',
    opacity: 0,
    width: 1,
    height: 1,
    top: 0,
    left: 0,
    // Web: pointer-events để click vào dots vẫn trigger focus
    ...(Platform.OS === 'web' && { pointerEvents: 'none' } as any),
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  dotBox: {
    width: 46,
    height: 54,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#E2D9CF',
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dotBoxFilled: {
    borderColor: '#FF7597',
    backgroundColor: '#FFEAEF',
  },
  dotBoxCurrent: {
    borderColor: '#FF9EB5',
    backgroundColor: '#fff',
    shadowColor: '#FF7597',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  dotText: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#FF7597',
    lineHeight: 30,
  },
  keypad: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 4,
  },
  keyBtnSec: {
    width: '30%',
    height: 62,
    backgroundColor: '#F0ECE6',
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  keyBtnPri: {
    width: '30%',
    height: 62,
    backgroundColor: '#FF7597',
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    shadowColor: '#FF7597',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 4,
  },
  keyBtnDisabled: {
    backgroundColor: '#E2D9CF',
    shadowOpacity: 0,
    elevation: 0,
  },
  keyBtnText: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#475569',
  },
  keyBtnSecText: {
    fontSize: 22,
    fontWeight: '600',
    color: '#8A7463',
  },
  keyBtnPriText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  closeBtn: {
    marginTop: 12,
    paddingVertical: 10,
    paddingHorizontal: 24,
  },
  closeBtnText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#8A7463',
    textAlign: 'center',
  },
});
