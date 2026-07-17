import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { extractErrorMessage } from '@/core/api/unwrap';
import { AGE_BAND_OPTIONS, type AgeBand } from '@/features/family/types';
import { useFamily } from '@/features/family/store/useFamily';
import { useRecentAiImages } from '@/features/jobs/store/recentAiImages';

export default function CreateChildScreen() {
  const router = useRouter();
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
    <SafeAreaView className="flex-1 bg-[#FFF8F2]">
      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
      >
        <Pressable onPress={() => router.back()} hitSlop={10} className="mb-3">
          <Text className="text-[14px] font-bold text-brand">← Quay lại</Text>
        </Pressable>

        <Text className="text-[22px] font-extrabold text-slate-900">
          Thêm hồ sơ con
        </Text>
        <Text className="mt-2 text-[14px] leading-5 text-slate-500">
          9–15 tuổi · gắn tài khoản phụ huynh · không cần email riêng (giống
          StoryMee Mobile).
        </Text>

        <Text className="mb-2 mt-6 text-[13px] font-bold text-slate-700">
          Tên hiển thị
        </Text>
        <TextInput
          value={name}
          onChangeText={(v) => {
            setName(v);
            setError(null);
          }}
          placeholder="Ví dụ: Bé Na"
          placeholderTextColor="#94A3B8"
          className="h-12 rounded-xl border border-orange-100 bg-white px-4 text-base text-slate-900"
        />

        <Text className="mb-2 mt-5 text-[13px] font-bold text-slate-700">
          Nhóm tuổi
        </Text>
        <View className="flex-row gap-2">
          {AGE_BAND_OPTIONS.map((opt) => {
            const on = ageBand === opt.id;
            return (
              <Pressable
                key={opt.id}
                onPress={() => setAgeBand(opt.id)}
                className={`flex-1 rounded-xl border-2 px-3 py-3 ${
                  on ? 'border-brand bg-orange-50' : 'border-slate-100 bg-white'
                }`}
              >
                <Text
                  className={`text-center text-[14px] font-extrabold ${
                    on ? 'text-brand' : 'text-slate-900'
                  }`}
                >
                  {opt.label}
                </Text>
                <Text className="mt-1 text-center text-[11px] leading-4 text-slate-500">
                  {opt.hint}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View className="mt-5 rounded-xl border border-orange-100 bg-white px-4">
          <View className="flex-row items-center justify-between border-b border-slate-100 py-3.5">
            <Text className="flex-1 text-[14px] font-semibold text-slate-700">
              Cho phép tạo ảnh AI
            </Text>
            <Switch
              value={allowAi}
              onValueChange={setAllowAi}
              trackColor={{ true: '#FECACA', false: '#E2E8F0' }}
              thumbColor={allowAi ? '#FF6B6B' : '#F8FAFC'}
            />
          </View>
          <View className="flex-row items-center justify-between py-3.5">
            <Text className="flex-1 text-[14px] font-semibold text-slate-700">
              Camera / ảnh mẫu
            </Text>
            <Switch
              value={allowPhoto}
              onValueChange={setAllowPhoto}
              trackColor={{ true: '#FECACA', false: '#E2E8F0' }}
              thumbColor={allowPhoto ? '#FF6B6B' : '#F8FAFC'}
            />
          </View>
        </View>

        {error ? (
          <Text className="mt-3 text-[13px] font-medium text-red-600">{error}</Text>
        ) : null}

        <Pressable
          onPress={() => void onSubmit()}
          disabled={busy}
          className={`mt-6 h-12 items-center justify-center rounded-2xl ${
            busy ? 'bg-slate-300' : 'bg-brand'
          }`}
        >
          {busy ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text className="text-base font-extrabold text-white">Tạo hồ sơ</Text>
          )}
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
