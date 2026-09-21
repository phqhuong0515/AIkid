import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Platform,
  ActivityIndicator,
  KeyboardAvoidingView,
  Pressable,
} from 'react-native';
import { useRouter } from 'expo-router';
import { FontAwesome6 } from '@expo/vector-icons';
import { useAuth } from '@/core/auth/useAuth';
import { extractErrorMessage } from '@/core/api/unwrap';

export type ParentGateModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  title?: string;
  subtitle?: string;
};

export function ParentGateModal({
  isOpen,
  onClose,
  onSuccess,
  title = 'Cổng Phụ Huynh',
  subtitle = 'Nhập mật khẩu phụ huynh để mở khóa thanh toán và quản lý',
}: ParentGateModalProps) {
  const router = useRouter();
  const { user, login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<TextInput>(null);

  const parentEmail = (typeof user?.email === 'string' && user.email.includes('@'))
    ? user.email
    : '';

  useEffect(() => {
    if (!isOpen) {
      setPassword('');
      setShowPassword(false);
      setError(null);
      setBusy(false);
      return;
    }
    if (parentEmail) {
      setEmail(parentEmail);
    }
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 120);
    return () => clearTimeout(timer);
  }, [isOpen, parentEmail]);

  const handleSubmit = async () => {
    if (busy) return;
    const targetLogin = (email || parentEmail).trim();
    const trimmedPassword = password.trim();

    if (!targetLogin) {
      setError('Vui lòng nhập email hoặc tài khoản phụ huynh');
      return;
    }
    if (!trimmedPassword) {
      setError('Vui lòng nhập mật khẩu phụ huynh');
      return;
    }

    setBusy(true);
    setError(null);
    try {
      await login({
        login: targetLogin,
        password: trimmedPassword,
        actorHint: 'parent',
      });
      onClose();
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      setError(extractErrorMessage(err, 'Mật khẩu phụ huynh không chính xác.'));
    } finally {
      setBusy(false);
    }
  };

  const handleForgotPassword = () => {
    onClose();
    router.push('/(auth)/forgot-password' as any);
  };

  if (!isOpen) return null;

  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View style={styles.card}>
          <View style={styles.badgeHeader}>
            <View style={styles.iconCircle}>
              <Text style={styles.iconEmoji}>🛡️</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>{title}</Text>
              <Text style={styles.subtitle}>{subtitle}</Text>
            </View>
          </View>

          {parentEmail ? (
            <View style={styles.parentInfoBox}>
              <Text style={styles.parentInfoLabel}>Tài khoản phụ huynh:</Text>
              <Text style={styles.parentInfoEmail} numberOfLines={1}>
                {parentEmail}
              </Text>
            </View>
          ) : (
            <View style={styles.inputWrapper}>
              <FontAwesome6 name="envelope" size={16} color="#A99586" style={{ marginRight: 10 }} />
              <TextInput
                style={styles.input}
                placeholder="Email tài khoản phụ huynh"
                placeholderTextColor="#A99586"
                value={email}
                onChangeText={(t) => {
                  setEmail(t);
                  setError(null);
                }}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                editable={!busy}
              />
            </View>
          )}

          <View style={styles.inputWrapper}>
            <FontAwesome6 name="lock" size={16} color="#A99586" style={{ marginRight: 10 }} />
            <TextInput
              ref={inputRef}
              style={styles.input}
              placeholder="Mật khẩu phụ huynh"
              placeholderTextColor="#A99586"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={(t) => {
                setPassword(t);
                setError(null);
              }}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="done"
              onSubmitEditing={handleSubmit}
              editable={!busy}
            />
            <TouchableOpacity
              style={styles.eyeBtn}
              onPress={() => setShowPassword((prev) => !prev)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <FontAwesome6
                name={showPassword ? 'eye-slash' : 'eye'}
                size={18}
                color="#8E7D73"
              />
            </TouchableOpacity>
          </View>

          {error ? (
            <View style={styles.errorBox}>
              <FontAwesome6 name="circle-exclamation" size={15} color="#E02424" style={{ marginRight: 8 }} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <View style={styles.actionRow}>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={onClose}
              disabled={busy}
            >
              <Text style={styles.cancelBtnText}>Quay lại</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.confirmBtn, busy && styles.confirmBtnDisabled]}
              onPress={handleSubmit}
              disabled={busy}
            >
              {busy ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.confirmBtnText}>Mở khóa</Text>
              )}
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.forgotBtn}
            onPress={handleForgotPassword}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={styles.forgotText}>Quên mật khẩu phụ huynh?</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
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
    borderRadius: 28,
    borderWidth: 3,
    borderColor: '#FFFFFF',
    padding: 24,
    width: '100%',
    maxWidth: 420,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 10,
  },
  badgeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 20,
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#FFF0F5',
    borderWidth: 2,
    borderColor: '#FFD6E4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconEmoji: {
    fontSize: 26,
  },
  title: {
    fontSize: 19,
    fontWeight: '800',
    color: '#0F172A',
  },
  subtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
    lineHeight: 18,
  },
  parentInfoBox: {
    backgroundColor: '#F1F5F9',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginBottom: 12,
  },
  parentInfoLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  parentInfoEmail: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
    marginTop: 2,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    paddingHorizontal: 14,
    height: 52,
    marginBottom: 12,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#0F172A',
    height: '100%',
    ...(Platform.OS === 'web' && ({ outlineStyle: 'none' } as any)),
  },
  eyeBtn: {
    padding: 6,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 14,
  },
  errorText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
    color: '#DC2626',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  cancelBtn: {
    flex: 1,
    height: 48,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  cancelBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#475569',
  },
  confirmBtn: {
    flex: 1,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#FF7597',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FF7597',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 3,
  },
  confirmBtnDisabled: {
    opacity: 0.6,
  },
  confirmBtnText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  forgotBtn: {
    alignSelf: 'center',
    marginTop: 14,
    paddingVertical: 4,
  },
  forgotText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FF7597',
  },
});
