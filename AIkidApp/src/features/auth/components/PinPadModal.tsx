import React from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, Dimensions } from 'react-native';

type PinPadModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (pin: string) => void;
  title: string;
  subtitle?: string;
  busy?: boolean;
  pin: string;
  setPin: (pin: string) => void;
  closeLabel?: string;
};

const { width } = Dimensions.get('window');

export function PinPadModal({
  isOpen,
  onClose,
  onSubmit,
  title,
  subtitle,
  busy,
  pin,
  setPin,
  closeLabel = 'Hủy',
}: PinPadModalProps) {
  
  function onPinDigit(d: string) {
    if (busy || pin.length >= 6) return;
    const next = (pin + d).substring(0, 6);
    setPin(next);
    if (next.length === 6) {
      onSubmit(next);
    }
  }

  function onPinBack() {
    if (busy) return;
    const next = pin.slice(0, -1);
    setPin(next);
  }

  return (
    <Modal visible={isOpen} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>{title}</Text>
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}

          <View style={styles.dotsContainer}>
            {Array.from({ length: 6 }).map((_, i) => {
              const isFilled = pin.length > i;
              const isCurrentIndex = pin.length === i || (pin.length === 6 && i === 5);
              return (
                <View
                  key={i}
                  style={[
                    styles.dotBox,
                    isFilled && styles.dotBoxFilled,
                    !isFilled && isCurrentIndex && styles.dotBoxCurrent,
                  ]}
                >
                  {isFilled && <Text style={styles.dotText}>•</Text>}
                </View>
              );
            })}
          </View>

          <View style={styles.keypad}>
            {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'del', '0', 'ok'].map((key) => {
              if (key === 'del') {
                return (
                  <TouchableOpacity key={key} style={styles.keyBtnSec} onPress={onPinBack} disabled={busy}>
                    <Text style={styles.keyBtnSecText}>Xóa</Text>
                  </TouchableOpacity>
                );
              }
              if (key === 'ok') {
                return (
                  <TouchableOpacity key={key} style={styles.keyBtnPri} onPress={() => onSubmit(pin)} disabled={busy || pin.length !== 6}>
                    <Text style={styles.keyBtnPriText}>{busy ? '…' : 'Vào'}</Text>
                  </TouchableOpacity>
                );
              }
              return (
                <TouchableOpacity key={key} style={styles.keyBtnSec} onPress={() => onPinDigit(key)} disabled={busy}>
                  <Text style={styles.keyBtnText}>{key}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <TouchableOpacity style={styles.closeBtn} onPress={onClose} disabled={busy}>
            <Text style={styles.closeBtnText}>{closeLabel}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  card: {
    backgroundColor: '#fff',
    width: '100%',
    maxWidth: 500,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4A3D3C',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#A99586',
    marginBottom: 24,
  },
  dotsContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 32,
  },
  dotBox: {
    width: 44,
    height: 52,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5D9CE',
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dotBoxFilled: {
    borderColor: '#ff7597',
    backgroundColor: '#fff5f7',
  },
  dotBoxCurrent: {
    borderColor: '#ffb3c6',
  },
  dotText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ff7597',
  },
  keypad: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  keyBtnSec: {
    width: '30%',
    height: 60,
    backgroundColor: '#f7f5ff',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  keyBtnPri: {
    width: '30%',
    height: 60,
    backgroundColor: '#ff7597',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  keyBtnText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#4A3D3C',
  },
  keyBtnSecText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4A3D3C',
  },
  keyBtnPriText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  closeBtn: {
    marginTop: 16,
    padding: 12,
  },
  closeBtnText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#A99586',
  },
});
