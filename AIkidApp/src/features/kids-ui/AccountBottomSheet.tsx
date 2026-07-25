import { ReactNode } from 'react';
import { View, Text, Pressable, Modal, StyleSheet, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { useAuth } from '@/core/auth/useAuth';
import { useFamily } from '@/features/family/store/useFamily';
import { AikidTheme } from './theme';

export function AccountBottomSheet({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const { user, logout } = useAuth();
  const children = useFamily((s) => s.children);
  const activeChild = useFamily((s) => s.getActiveChild());
  const setActiveChild = useFamily((s) => s.setActiveChild);

  const parentAvatar = (typeof user?.avatarUrl === 'string' ? user.avatarUrl : null) ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'Phụ huynh')}`;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View style={styles.sheet}>
          <View style={styles.handleBar} />
          
          <Text style={styles.title}>Chuyển hồ sơ</Text>

          <View style={styles.list}>
            {/* Parent Profile */}
            <TouchableOpacity
              style={[
                styles.item,
                !activeChild ? styles.activeItem : null,
              ]}
              onPress={() => {
                void setActiveChild(null);
                onClose();
              }}
            >
              <Image
                source={{
                  uri: parentAvatar,
                }}
                style={styles.avatar}
              />
              <View style={styles.info}>
                <Text style={styles.name}>{user?.name || 'Phụ huynh'}</Text>
                <Text style={styles.role}>Quản lý</Text>
              </View>
              {!activeChild && <Text style={styles.check}>✓</Text>}
            </TouchableOpacity>

            {/* Children Profiles */}
            {children.map((child) => {
              const isActive = activeChild?.id === child.id;
              return (
                <TouchableOpacity
                  key={child.id}
                  style={[styles.item, isActive ? styles.activeItem : null]}
                  onPress={() => {
                    void setActiveChild(child.id);
                    onClose();
                  }}
                >
                  <Image
                    source={{
                      uri: child.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(child.name || 'Bé')}`,
                    }}
                    style={styles.avatar}
                  />
                  <View style={styles.info}>
                    <Text style={styles.name}>{child.name}</Text>
                    <Text style={styles.role}>Thành viên</Text>
                  </View>
                  {isActive && <Text style={styles.check}>✓</Text>}
                </TouchableOpacity>
              );
            })}
          </View>
          
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={() => {
              onClose();
              void logout();
            }}
          >
            <Text style={styles.logoutText}>Đăng xuất</Text>
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
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: '#E2E8F0',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  title: {
    fontFamily: AikidTheme.fonts.bold,
    fontSize: 18,
    color: AikidTheme.colors.ink,
    marginBottom: 16,
    textAlign: 'center',
  },
  list: {
    marginBottom: 24,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 16,
    marginBottom: 8,
    backgroundColor: '#F8FAFC',
  },
  activeItem: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECDD3',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E2E8F0',
    marginRight: 12,
  },
  info: {
    flex: 1,
  },
  name: {
    fontFamily: AikidTheme.fonts.bold,
    fontSize: 16,
    color: AikidTheme.colors.ink,
  },
  role: {
    fontSize: 13,
    color: AikidTheme.colors.inkMuted,
  },
  check: {
    fontSize: 18,
    color: '#E11D48',
    fontFamily: AikidTheme.fonts.bold,
  },
  logoutButton: {
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
  },
  logoutText: {
    fontFamily: AikidTheme.fonts.bold,
    fontSize: 16,
    color: '#64748B',
  },
});
