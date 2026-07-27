import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Platform,
} from 'react-native';

export type PinPadModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (pin: string) => void;
  title: string;
  subtitle?: string;
  busy?: boolean;
  error?: string | null;
  closeLabel?: string;
  // Legacy — ignored
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
  const [pin, setInternalPin] = useState('');
  const [internalError, setInternalError] = useState<string | null>(null);
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (!isOpen) {
      setInternalPin('');
      setInternalError(null);
      return;
    }
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 50);
    return () => clearTimeout(timer);
  }, [isOpen]);

  const handleInputChange = (rawVal: string) => {
    if (busy) return;
    const digitsOnly = rawVal.replace(/\D/g, '').slice(0, 6);

    if (/\D/.test(rawVal)) {
      setInternalError('Chỉ được phép nhập số!');
    } else {
      setInternalError(null);
    }

    setInternalPin(digitsOnly);
    if (digitsOnly.length === 6 && digitsOnly !== pin) {
      onSubmit(digitsOnly);
    }
  };

  const handleInputSubmit = () => {
    if (pin.length === 6 && !busy) {
      onSubmit(pin);
    }
  };

  const onPinDigit = (d: string) => {
    if (busy || pin.length >= 6) return;
    const next = (pin + d).slice(0, 6);
    setInternalPin(next);
    setInternalError(null);
    inputRef.current?.focus();
    if (next.length === 6) {
      onSubmit(next);
    }
  };

  const onPinBack = () => {
    if (busy) return;
    const next = pin.slice(0, -1);
    setInternalPin(next);
    setInternalError(null);
    inputRef.current?.focus();
  };

  if (!isOpen) return null;

  const displayError = error || internalError;

  const keypadKeys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'del', '0', 'ok'];

  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
          </View>

          {displayError ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{displayError}</Text>
            </View>
          ) : null}

          <TouchableOpacity
            activeOpacity={1}
            style={styles.pinDisplayContainer}
            onPress={() => inputRef.current?.focus()}
          >
            <TextInput
              ref={inputRef}
              style={styles.hiddenInput}
              keyboardType="number-pad"
              maxLength={6}
              value={pin}
              onChangeText={handleInputChange}
              returnKeyType="done"
              onSubmitEditing={handleInputSubmit}
              editable={!busy}
              autoFocus={Platform.OS !== 'web'}
            />

            {Array.from({ length: 6 }).map((_, i) => {
              const isFilled = pin.length > i;
              const isCurrentIndex = pin.length === i || (pin.length === 6 && i === 5);

              return (
                <View
                  key={i}
                  style={[
                    styles.pinBox,
                    isFilled
                      ? styles.pinBoxFilled
                      : isCurrentIndex
                      ? styles.pinBoxCurrent
                      : styles.pinBoxEmpty,
                  ]}
                >
                  <Text
                    style={[
                      styles.pinDot,
                      isFilled ? styles.pinDotFilled : styles.pinDotEmpty,
                    ]}
                  >
                    {isFilled ? '•' : ''}
                  </Text>
                </View>
              );
            })}
          </TouchableOpacity>

          <View style={styles.keypadContainer}>
            {keypadKeys.map((key) => {
              if (key === 'del') {
                return (
                  <TouchableOpacity
                    key={key}
                    style={[styles.keyButton, styles.keyButtonSecondary]}
                    onPress={onPinBack}
                    disabled={busy}
                  >
                    <Text style={[styles.keyText, styles.keyTextSecondary]}>Xóa</Text>
                  </TouchableOpacity>
                );
              }
              if (key === 'ok') {
                const isOkDisabled = busy || pin.length !== 6;
                return (
                  <TouchableOpacity
                    key={key}
                    style={[
                      styles.keyButton,
                      styles.keyButtonPrimary,
                      isOkDisabled && styles.keyButtonDisabled,
                    ]}
                    disabled={isOkDisabled}
                    onPress={() => onSubmit(pin)}
                  >
                    <Text style={styles.keyTextPrimary}>{busy ? '…' : 'Vào'}</Text>
                  </TouchableOpacity>
                );
              }
              return (
                <TouchableOpacity
                  key={key}
                  style={[styles.keyButton, styles.keyButtonSecondary]}
                  onPress={() => onPinDigit(key)}
                  disabled={busy}
                >
                  <Text style={[styles.keyText, styles.keyTextSecondary]}>{key}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
            disabled={busy}
          >
            <Text style={styles.closeButtonText}>{closeLabel}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  card: {
    backgroundColor: '#FDFAF4',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 20,
    width: '100%',
    maxWidth: 448, // max-w-md
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 10,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a', // display
  },
  subtitle: {
    fontSize: 14,
    color: '#666', // muted
    marginTop: 4,
  },
  errorContainer: {
    marginBottom: 16,
    backgroundColor: '#FFE5E5', // coral-100 equivalent
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  errorText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#E02424', // danger
  },
  pinDisplayContainer: {
    position: 'relative',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 24,
  },
  hiddenInput: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0,
    zIndex: 10,
  },
  pinBox: {
    height: 54,
    width: 46,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 2,
  },
  pinBoxFilled: {
    borderColor: '#FF7597', // brand-500
    backgroundColor: '#FFF0F3', // brand-50
  },
  pinBoxCurrent: {
    borderColor: '#FF99B0', // brand-400
    backgroundColor: '#FFFFFF',
  },
  pinBoxEmpty: {
    borderColor: '#E5E5E5', // border
    backgroundColor: '#FFFFFF',
  },
  pinDot: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  pinDotFilled: {
    color: '#E0476F', // brand-600
  },
  pinDotEmpty: {
    color: '#999999', // muted
  },
  keypadContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'space-between',
  },
  keyButton: {
    width: '31%', // roughly 3 cols with gap
    height: 62,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  keyButtonPrimary: {
    backgroundColor: '#FF7597',
  },
  keyButtonSecondary: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  keyButtonDisabled: {
    opacity: 0.5,
  },
  keyText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  keyTextPrimary: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  keyTextSecondary: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
  },
  closeButton: {
    marginTop: 16,
    paddingVertical: 12,
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#666666', // muted
  },
});
