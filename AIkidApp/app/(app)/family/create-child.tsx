import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  ImageBackground,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { extractErrorMessage } from '@/core/api/unwrap';
import { AGE_BAND_OPTIONS, type AgeBand } from '@/features/family/types';
import { useFamily } from '@/features/family/store/useFamily';
import { useRecentAiImages } from '@/features/jobs/store/recentAiImages';
import { GlobalHeader } from '@/components/GlobalHeader';

export default function CreateChildScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const createChildProfile = useFamily((s) => s.createChildProfile);
  const setRecentScope = useRecentAiImages((s) => s.setScope);

  const [name, setName] = useState('');
  const [ageBand, setAgeBand] = useState<AgeBand>('9-12');
  const [allowAi, setAllowAi] = useState(true);
  const [allowPhoto, setAllowPhoto] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit() {
    const n = name.trim();
    if (!n) {
      setError('Nhập tên con');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const child = await createChildProfile({
        name: n,
        ageBand,
        allowAiCreate: allowAi,
        allowPhoto,
      });
      await setRecentScope(child.id);
      router.replace('/(app)/lobby');
    } catch (err: unknown) {
      setError(extractErrorMessage(err, 'Không tạo được hồ sơ'));
    } finally {
      setBusy(false);
    }
  }

  return (
    <View style={styles.container}>
      <ImageBackground source={require('../../../public/lobby-assets/images/bg-art.png')} style={styles.bgImage} resizeMode="cover">
        <View style={{ paddingTop: Math.max(20, insets.top), flex: 1 }}>
          <View style={{ paddingHorizontal: 16, zIndex: 10, paddingBottom: 16 }}>
            <GlobalHeader />
          </View>
          
          <View style={styles.mainCard}>
            <Text style={{ marginTop: 24, fontSize: 24, fontWeight: '800', color: '#0F172A', textAlign: 'center' }}>Thêm hồ sơ con</Text>
            <Text style={{ marginTop: 8, color: '#64748B', textAlign: 'center', paddingHorizontal: 20 }}>
              9–15 tuổi · gắn tài khoản phụ huynh · không cần email riêng
            </Text>

            <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 60 }} keyboardShouldPersistTaps="handled">
              <Text style={{ fontSize: 13, fontWeight: 'bold', color: '#334155', marginBottom: 8 }}>Tên hiển thị</Text>
              <TextInput
                value={name}
                onChangeText={(v) => {
                  setName(v);
                  setError(null);
                }}
                placeholder="Ví dụ: Bé Na"
                placeholderTextColor="#94A3B8"
                style={styles.input}
              />

              <Text style={{ fontSize: 13, fontWeight: 'bold', color: '#334155', marginTop: 20, marginBottom: 8 }}>Nhóm tuổi</Text>
              <View style={{ flexDirection: 'row', gap: 12 }}>
                {AGE_BAND_OPTIONS.map((opt) => {
                  const on = ageBand === opt.id;
                  return (
                    <Pressable
                      key={opt.id}
                      onPress={() => setAgeBand(opt.id)}
                      style={[styles.ageOption, on ? styles.ageOptionActive : styles.ageOptionInactive]}
                    >
                      <Text style={[styles.ageOptionTitle, on ? styles.ageOptionTitleActive : styles.ageOptionTitleInactive]}>
                        {opt.label}
                      </Text>
                      <Text style={styles.ageOptionHint}>{opt.hint}</Text>
                    </Pressable>
                  );
                })}
              </View>

              <View style={styles.switchGroup}>
                <View style={styles.switchRow}>
                  <Text style={styles.switchLabel}>Cho phép tạo ảnh AI</Text>
                  <Switch
                    value={allowAi}
                    onValueChange={setAllowAi}
                    trackColor={{ true: '#FFB6C1', false: '#E2E8F0' }}
                    thumbColor={allowAi ? '#FF7597' : '#F8FAFC'}
                  />
                </View>
                <View style={[styles.switchRow, { borderBottomWidth: 0 }]}>
                  <Text style={styles.switchLabel}>Camera / ảnh mẫu</Text>
                  <Switch
                    value={allowPhoto}
                    onValueChange={setAllowPhoto}
                    trackColor={{ true: '#FFB6C1', false: '#E2E8F0' }}
                    thumbColor={allowPhoto ? '#FF7597' : '#F8FAFC'}
                  />
                </View>
              </View>

              {error ? (
                <Text style={{ marginTop: 12, fontSize: 13, fontWeight: '500', color: '#DC2626' }}>{error}</Text>
              ) : null}

              <Pressable
                onPress={() => void onSubmit()}
                disabled={busy}
                style={[styles.submitBtn, busy ? styles.submitBtnDisabled : styles.submitBtnActive]}
              >
                {busy ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.submitBtnText}>Tạo hồ sơ</Text>
                )}
              </Pressable>
            </ScrollView>
          </View>
        </View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF8F2',
  },
  bgImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  mainCard: {
    flex: 1,
    backgroundColor: '#FDFAF4',
    borderRadius: 40,
    borderWidth: 8,
    borderColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 5,
    overflow: 'hidden',
  },
  input: {
    height: 52,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#FFEDD5',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#0F172A',
  },
  ageOption: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 2,
    padding: 12,
  },
  ageOptionActive: {
    borderColor: '#FF7597',
    backgroundColor: '#FFF7ED',
  },
  ageOptionInactive: {
    borderColor: '#F1F5F9',
    backgroundColor: '#FFFFFF',
  },
  ageOptionTitle: {
    textAlign: 'center',
    fontSize: 15,
    fontWeight: '800',
  },
  ageOptionTitleActive: {
    color: '#FF7597',
  },
  ageOptionTitleInactive: {
    color: '#0F172A',
  },
  ageOptionHint: {
    marginTop: 4,
    textAlign: 'center',
    fontSize: 11,
    lineHeight: 16,
    color: '#64748B',
  },
  switchGroup: {
    marginTop: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#FFEDD5',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  switchLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
  },
  submitBtn: {
    marginTop: 24,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
  },
  submitBtnActive: {
    backgroundColor: '#FF7597',
  },
  submitBtnDisabled: {
    backgroundColor: '#CBD5E1',
  },
  submitBtnText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
