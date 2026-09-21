import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ImageBackground,
  Linking,
  Modal,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { FontAwesome6 } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { apiClient } from '@/core/api/client';
import { extractErrorMessage } from '@/core/api/unwrap';
import { useAuth } from '@/core/auth/useAuth';
import {
  DELETE_ACCOUNT_WEB_URL,
  PRIVACY_POLICY_URL,
  SUPPORT_EMAIL,
  SUPPORT_MAILTO,
  TERMS_OF_SERVICE_URL,
} from '@/core/legal/links';
import { queryClient } from '@/core/query/queryClient';
import { useWorkspace } from '@/core/workspace/useWorkspace';
import { useProfile } from '@/features/account/api/accountHooks';
import { familyApi, mediaApi, profileApi } from '@/core/storymee';
import { ageBandLabel } from '@/features/family/types';
import { useFamily } from '@/features/family/store/useFamily';
import { useRecentAiImages } from '@/features/jobs/store/recentAiImages';
import { GlobalHeader } from '@/components/GlobalHeader';
import { useCharacterDraft } from '@/features/character';
import { mergeComicStories, parseRemoteComicStories } from '@/features/comic/api/comicRemoteLibrary';

// ─── Level Definitions ─────────────────────────────────────────────────────────

const EXPLORER_LEVELS = [
  { level: 1, title: 'Tia Sáng Đầu Tiên', xpRequired: 0 },
  { level: 2, title: 'Người Tìm Tòi', xpRequired: 100 },
  { level: 3, title: 'Nhà Khám Phá', xpRequired: 400 },
  { level: 4, title: 'Người Săn Ý Tưởng', xpRequired: 900 },
  { level: 5, title: 'Nhà Thám Hiểm Ánh Sao', xpRequired: 1600 },
  { level: 6, title: 'Người Dẫn Đường', xpRequired: 2500 },
  { level: 7, title: 'Kiến Trúc Sư Thế Giới', xpRequired: 3600 },
  { level: 8, title: 'Người Truyền Lửa', xpRequired: 4900 },
  { level: 9, title: 'Người Giữ Ánh Sao', xpRequired: 6400 },
  { level: 10, title: 'Huyền Thoại Trẻ', xpRequired: 8100 },
] as const;

function levelProgress(xp: number) {
  const safeXp = Math.max(0, xp);
  const current = [...EXPLORER_LEVELS].reverse().find((item) => safeXp >= item.xpRequired) ?? EXPLORER_LEVELS[0];
  const next = EXPLORER_LEVELS.find((item) => item.xpRequired > safeXp) ?? null;
  const percent = next
    ? Math.round(((safeXp - current.xpRequired) / (next.xpRequired - current.xpRequired)) * 100)
    : 100;
  return { current, next, percent };
}

// ─── Reward Assets & Catalog ───────────────────────────────────────────────────

const REWARD_ASSET_BASE = 'https://app.aikid.vn/assets/rewards';
const REWARD_ASSETS: Record<string, string> = {
  'frame-rainbow': `${REWARD_ASSET_BASE}/frame-rainbow.svg`,
  'frame-galaxy': `${REWARD_ASSET_BASE}/frame-galaxy.svg`,
  'frame-cloud-summer': `${REWARD_ASSET_BASE}/frame-cloud-summer.svg`,
  'frame-language-kingdom': `${REWARD_ASSET_BASE}/frame-language-kingdom.svg`,
  'frame-summit-gold': `${REWARD_ASSET_BASE}/frame-summit-gold.svg`,
  'frame-galaxy-storyteller': `${REWARD_ASSET_BASE}/frame-galaxy-storyteller.svg`,
  'avatar-paco-blue': `${REWARD_ASSET_BASE}/paco-blue-companion.svg`,
  'perk-sticker-sparkle': `${REWARD_ASSET_BASE}/effect-sparkle.svg`,
  'background-ai-gate': `${REWARD_ASSET_BASE}/bg-ai-gate.svg`,
  'theme-workshop': `${REWARD_ASSET_BASE}/theme-workshop.svg`,
  'theme-legend': `${REWARD_ASSET_BASE}/theme-legend.svg`,
};

type DecorationKind = 'frame' | 'background' | 'effect' | 'companion' | 'title';

type DecorationItem = {
  id: string;
  kind: DecorationKind;
  name: string;
  icon: string;
  assetUrl?: string;
  description: string;
  rarity: 'Thường' | 'Hiếm' | 'Sử thi' | 'Huyền thoại';
};

const DECORATION_CATALOG: DecorationItem[] = [
  // Khung ảnh
  {
    id: 'frame-rainbow',
    kind: 'frame',
    name: 'Cầu Vồng Rực Rỡ',
    icon: '🌈',
    assetUrl: `${REWARD_ASSET_BASE}/frame-rainbow.svg`,
    description: 'Khung viền 7 sắc cầu vồng tươi vui rực rỡ.',
    rarity: 'Hiếm',
  },
  {
    id: 'frame-galaxy',
    kind: 'frame',
    name: 'Thiên Hà Lấp Lánh',
    icon: '🌌',
    assetUrl: `${REWARD_ASSET_BASE}/frame-galaxy.svg`,
    description: 'Ánh sáng các vì sao bao quanh khung avatar.',
    rarity: 'Sử thi',
  },
  {
    id: 'frame-cloud-summer',
    kind: 'frame',
    name: 'Mây Mùa Hè',
    icon: '☁️',
    assetUrl: `${REWARD_ASSET_BASE}/frame-cloud-summer.svg`,
    description: 'Những đám mây bồng bềnh êm ái ngày hè.',
    rarity: 'Thường',
  },
  {
    id: 'frame-summit-gold',
    kind: 'frame',
    name: 'Đỉnh Hoàng Kim',
    icon: '👑',
    assetUrl: `${REWARD_ASSET_BASE}/frame-summit-gold.svg`,
    description: 'Huy hoàng như chiếc vương miện của nhà vô địch.',
    rarity: 'Huyền thoại',
  },
  {
    id: 'frame-galaxy-storyteller',
    kind: 'frame',
    name: 'Người Kể Chuyện Vũ Trụ',
    icon: '🪐',
    assetUrl: `${REWARD_ASSET_BASE}/frame-galaxy-storyteller.svg`,
    description: 'Dành riêng cho những nhà sáng tạo truyện tài ba.',
    rarity: 'Huyền thoại',
  },

  // Nền thẻ hồ sơ
  {
    id: 'background-ai-gate',
    kind: 'background',
    name: 'Cổng Trời Phép Thuật',
    icon: '🚪',
    assetUrl: `${REWARD_ASSET_BASE}/bg-ai-gate.svg`,
    description: 'Nền cổng không gian huyền ảo lung linh.',
    rarity: 'Hiếm',
  },
  {
    id: 'theme-workshop',
    kind: 'background',
    name: 'Xưởng Sáng Tạo Nhí',
    icon: '🛠️',
    assetUrl: `${REWARD_ASSET_BASE}/theme-workshop.svg`,
    description: 'Không gian ấm cúng ngập tràn màu vẽ và ý tưởng.',
    rarity: 'Thường',
  },
  {
    id: 'theme-legend',
    kind: 'background',
    name: 'Huyền Thoại Ánh Sao',
    icon: '⭐',
    assetUrl: `${REWARD_ASSET_BASE}/theme-legend.svg`,
    description: 'Bầu trời đêm vô tận phủ đầy bụi sao lấp lánh.',
    rarity: 'Huyền thoại',
  },

  // Hiệu ứng
  {
    id: 'perk-sticker-sparkle',
    kind: 'effect',
    name: 'Bụi Sao Lấp Lánh',
    icon: '✨',
    assetUrl: `${REWARD_ASSET_BASE}/effect-sparkle.svg`,
    description: 'Ánh hào quang lấp lánh tỏa ra từ avatar của con.',
    rarity: 'Hiếm',
  },

  // Bạn đồng hành
  {
    id: 'avatar-paco-blue',
    kind: 'companion',
    name: 'Mèo Paco Xanh',
    icon: '🐱',
    assetUrl: `${REWARD_ASSET_BASE}/paco-blue-companion.svg`,
    description: 'Chú mèo Paco thông thái đồng hành cùng con sáng tạo.',
    rarity: 'Hiếm',
  },

  // Danh hiệu
  {
    id: 'title-explorer',
    kind: 'title',
    name: 'Nhà Khám Phá',
    icon: '🧭',
    description: 'Luôn tò mò và yêu thích khám phá những điều mới lạ.',
    rarity: 'Thường',
  },
  {
    id: 'title-artist',
    kind: 'title',
    name: 'Họa Sĩ Nhí Tài Ba',
    icon: '🎨',
    description: 'Đam mê vẽ tranh và sáng tạo những tác phẩm tuyệt đẹp.',
    rarity: 'Hiếm',
  },
  {
    id: 'title-storyteller',
    kind: 'title',
    name: 'Bậc Thầy Kể Chuyện',
    icon: '📖',
    description: 'Sáng tác những cuốn truyện tranh đầy cuốn hút.',
    rarity: 'Sử thi',
  },
  {
    id: 'title-legend',
    kind: 'title',
    name: 'Huyền Thoại Trẻ',
    icon: '🏆',
    description: 'Danh hiệu cao quý dành cho học sinh xuất sắc nhất.',
    rarity: 'Huyền thoại',
  },
];

type StoredComicStory = {
  id: string;
  title?: string;
  artStyle?: string;
  coverImageUrl?: string;
  pages?: { id?: string; imageUrl?: string; jobId?: string }[];
  panels?: { imageUrl?: string; jobId?: string }[];
};

const COMIC_STORY_KEY = 'aikid.comic.stories.v1';

type MainTab = 'profile' | 'backpack' | 'decorations';

export default function AccountScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width: viewportWidth } = useWindowDimensions();
  const compactProfile = viewportWidth < 720;

  // Responsive column widths for backpack & decorations
  const backpackCardWidth = useMemo(() => {
    if (viewportWidth >= 1200) return '18.5%';
    if (viewportWidth >= 1024) return '23.5%';
    if (viewportWidth >= 768) return '31.3%';
    return '48%';
  }, [viewportWidth]);

  const decorationCardWidth = useMemo(() => {
    if (viewportWidth >= 768) return '48.8%';
    return '100%';
  }, [viewportWidth]);

  const { user, actor, logout, deleteAccount, isLoading: authBusy } = useAuth();
  const {
    workspaces,
    activeIpId,
    isLoading: wsLoading,
    error: wsError,
    selectWorkspace,
    loadWorkspaces,
  } = useWorkspace();

  const [activeTab, setActiveTab] = useState<MainTab>('profile');

  const {
    data: profileData,
    isLoading: profileLoading,
    refetch: refetchProfile,
  } = useProfile({ enabled: actor === 'parent' });

  const {
    children,
    activeChildId,
    loadFamily,
    setActiveChild,
    replaceChild,
  } = useFamily();
  const setRecentScope = useRecentAiImages((s) => s.setScope);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [avatarBusy, setAvatarBusy] = useState(false);
  const activeChild = children.find((child) => child.id === activeChildId);

  // Gamification Query
  const gamificationQuery = useQuery({
    queryKey: ['gamification', 'profile', activeChildId],
    enabled: Boolean(activeChildId),
    queryFn: async () => {
      try {
        const { data } = await apiClient.get('/api/v1/gamification/me');
        const payload = data && typeof data === 'object' && 'data' in data
          ? (data as { data?: unknown }).data
          : data;
        const record = (payload && typeof payload === 'object' ? payload : {}) as Record<string, unknown>;
        return {
          totalXp: Number(record.totalXp ?? record.xp ?? activeChild?.xp ?? 0) || 0,
        };
      } catch {
        return { totalXp: Number(activeChild?.xp ?? 0) };
      }
    },
  });
  const learnerXp = gamificationQuery.data?.totalXp ?? activeChild?.xp ?? 0;
  const learnerLevel = levelProgress(learnerXp);

  // Learner Stats (Streak, Achievements, Works)
  const learnerStatsQuery = useQuery({
    queryKey: ['gamification', 'profile-card-stats', activeChildId],
    enabled: Boolean(activeChildId),
    queryFn: async () => {
      const [streakResult, achievementsResult, worksResult] = await Promise.allSettled([
        apiClient.get('/api/v1/gamification/me/streak'),
        apiClient.get('/api/v1/gamification/me/achievements'),
        apiClient.get('/api/v1/media/gallery', { params: { limit: 100 } }),
      ]);
      const unwrapRecord = (value: unknown) => {
        const raw = value && typeof value === 'object' && 'data' in value
          ? (value as { data?: unknown }).data
          : value;
        return (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
      };
      const streakResponse = streakResult.status === 'fulfilled' ? unwrapRecord(streakResult.value.data) : {};
      const achievementResponse = achievementsResult.status === 'fulfilled' ? unwrapRecord(achievementsResult.value.data) : {};
      const worksResponse = worksResult.status === 'fulfilled' ? unwrapRecord(worksResult.value.data) : {};
      const rows = Array.isArray(achievementResponse.achievements) ? achievementResponse.achievements : [];
      const works = Array.isArray(worksResponse.items) ? worksResponse.items : [];
      return {
        streak: Number(streakResponse.current ?? 0) || 0,
        achievements: rows.filter((row) => row && typeof row === 'object' && Boolean((row as { unlocked?: unknown }).unlocked)).length,
        works: works.length,
      };
    },
  });
  const learnerStats = learnerStatsQuery.data ?? { streak: 0, achievements: 0, works: 0 };

  // Rewards Equipment & Catalog
  const rewardsQuery = useQuery({
    queryKey: ['gamification', 'equipped-profile', activeChildId],
    enabled: Boolean(activeChildId),
    queryFn: async () => {
      try {
        const [storybookResponse, catalogResponse] = await Promise.all([
          apiClient.get('/api/v1/gamification/me/storybook'),
          apiClient.get('/api/v1/gamification/catalog'),
        ]);
        const unwrap = (value: unknown): Record<string, unknown> => {
          const inner = value && typeof value === 'object' && 'data' in value
            ? (value as { data?: unknown }).data
            : value;
          return (inner && typeof inner === 'object' ? inner : {}) as Record<string, unknown>;
        };
        const storybook = unwrap(storybookResponse.data);
        const catalogPayload = unwrap(catalogResponse.data);
        const equipmentRows = Array.isArray(storybook.equipment) ? storybook.equipment : [];
        const catalogRows = Array.isArray(catalogPayload.rewards)
          ? catalogPayload.rewards
          : Array.isArray(catalogResponse.data)
            ? catalogResponse.data
            : [];
        const equipment = Object.fromEntries(equipmentRows.flatMap((row) => {
          if (!row || typeof row !== 'object') return [];
          const item = row as Record<string, unknown>;
          return item.kind && item.rewardId ? [[String(item.kind), String(item.rewardId)]] : [];
        })) as Record<string, string>;
        const catalog = new Map(catalogRows.flatMap((row) => {
          if (!row || typeof row !== 'object') return [];
          const item = row as Record<string, unknown>;
          return item.id ? [[String(item.id), item]] : [];
        }));
        return { equipment, catalog };
      } catch {
        return { equipment: {}, catalog: new Map() };
      }
    },
  });

  // Local equipped state synced with AsyncStorage + API
  const [localEquipment, setLocalEquipment] = useState<Record<string, string>>({});

  useEffect(() => {
    const storageKey = `aikid.equipped.${activeChildId || 'current'}`;
    void AsyncStorage.getItem(storageKey).then((val) => {
      if (val) {
        try {
          const parsed = JSON.parse(val);
          setLocalEquipment((prev) => ({ ...parsed, ...prev }));
        } catch {}
      }
    });
  }, [activeChildId]);

  useEffect(() => {
    if (rewardsQuery.data?.equipment && Object.keys(rewardsQuery.data.equipment).length > 0) {
      setLocalEquipment((prev) => ({ ...rewardsQuery.data?.equipment, ...prev }));
    }
  }, [rewardsQuery.data]);

  const activeEquipment = useMemo<Record<string, string>>(() => {
    return {
      ...(rewardsQuery.data?.equipment || {}),
      ...localEquipment,
    };
  }, [rewardsQuery.data?.equipment, localEquipment]);

  const profileBackgroundId = activeEquipment.background ?? activeEquipment.theme;
  const profileBackgroundAsset = profileBackgroundId ? REWARD_ASSETS[profileBackgroundId] : undefined;
  const frameAsset = activeEquipment.frame ? REWARD_ASSETS[activeEquipment.frame] : undefined;
  const effectAsset = activeEquipment.effect ? REWARD_ASSETS[activeEquipment.effect] : undefined;
  const companionAsset = activeEquipment.companion ? REWARD_ASSETS[activeEquipment.companion] : undefined;
  const activeTitleItem = DECORATION_CATALOG.find((d) => d.kind === 'title' && d.id === activeEquipment.title);

  // Equip / Unequip handlers
  const handleEquipItem = async (item: DecorationItem) => {
    const updated: Record<string, string> = { ...activeEquipment, [item.kind]: item.id };
    setLocalEquipment(updated);
    const storageKey = `aikid.equipped.${activeChildId || 'current'}`;
    await AsyncStorage.setItem(storageKey, JSON.stringify(updated));
    try {
      await apiClient.post('/api/v1/gamification/me/storybook/equip', {
        kind: item.kind,
        rewardId: item.id,
      });
    } catch {
      // Offline fallback preserved in AsyncStorage
    }
  };

  const handleUnequipItem = async (kind: DecorationKind) => {
    const updated: Record<string, string> = { ...activeEquipment };
    delete updated[kind];
    setLocalEquipment(updated);
    const storageKey = `aikid.equipped.${activeChildId || 'current'}`;
    await AsyncStorage.setItem(storageKey, JSON.stringify(updated));
    try {
      await apiClient.post('/api/v1/gamification/me/storybook/unequip', { kind });
    } catch {
      // Offline fallback preserved in AsyncStorage
    }
  };

  // ─── Backpack Data ─────────────────────────────────────────────────────────

  const [backpackFilter, setBackpackFilter] = useState<'all' | 'drawings' | 'characters' | 'comics'>('all');
  const [selectedBackpackItem, setSelectedBackpackItem] = useState<{
    id: string;
    title: string;
    imageUrl: string;
    type: 'drawing' | 'character' | 'comic';
    date?: string;
    description?: string;
    comicId?: string;
  } | null>(null);

  const { saved: allCharacters, hydrate: hydrateCharacters } = useCharacterDraft();
  const characters = allCharacters.filter(
    (character) => !character.childProfileId || character.childProfileId === activeChildId,
  );
  const [comicStories, setComicStories] = useState<StoredComicStory[]>([]);

  const loadComicStories = useCallback(async () => {
    try {
      const raw = await AsyncStorage.getItem(COMIC_STORY_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      const stories: StoredComicStory[] = Array.isArray(parsed)
        ? parsed.filter((story) => story?.id)
        : [];
      setComicStories(stories);
    } catch {
      setComicStories([]);
    }
  }, []);

  useEffect(() => {
    void hydrateCharacters();
    void loadComicStories();
  }, [hydrateCharacters, loadComicStories]);

  const galleryQuery = useQuery({
    queryKey: ['media', 'gallery-backpack', activeChildId, activeIpId],
    enabled: !!activeChildId,
    queryFn: () => mediaApi.listGallery({
      ipId: activeIpId || undefined,
      tag: `child:${activeChildId}`,
      limit: 60,
      offset: 0,
    }),
  });

  const remoteComics = useMemo(() => {
    return parseRemoteComicStories(galleryQuery.data?.items ?? []);
  }, [galleryQuery.data?.items]);

  const visibleComics = useMemo(() => {
    return mergeComicStories(comicStories, remoteComics) as StoredComicStory[];
  }, [comicStories, remoteComics]);

  const backpackItems = useMemo(() => {
    const items: {
      id: string;
      title: string;
      imageUrl: string;
      type: 'drawing' | 'character' | 'comic';
      date?: string;
      description?: string;
      comicId?: string;
    }[] = [];

    // Drawings
    if (backpackFilter === 'all' || backpackFilter === 'drawings') {
      galleryQuery.data?.items.forEach((item, idx) => {
        const url = String(item.url || item.imageUrl || item.previewUrl || '');
        if (url) {
          items.push({
            id: `draw-${item.id || idx}`,
            title: `Tranh vẽ #${idx + 1}`,
            imageUrl: url,
            type: 'drawing',
            date: item.createdAt ? new Date(item.createdAt).toLocaleDateString('vi-VN') : undefined,
          });
        }
      });
    }

    // Characters
    if (backpackFilter === 'all' || backpackFilter === 'characters') {
      characters.forEach((char) => {
        if (char.avatarUri) {
          items.push({
            id: `char-${char.id}`,
            title: char.name || 'Nhân vật nhí',
            imageUrl: char.avatarUri,
            type: 'character',
            date: char.createdAt ? new Date(char.createdAt).toLocaleDateString('vi-VN') : undefined,
            description: char.userPrompt,
          });
        }
      });
    }

    // Comics
    if (backpackFilter === 'all' || backpackFilter === 'comics') {
      visibleComics.forEach((story) => {
        const cover = story.coverImageUrl || story.pages?.[0]?.imageUrl || story.panels?.[0]?.imageUrl;
        if (cover) {
          items.push({
            id: `comic-${story.id}`,
            title: story.title || 'Truyện tranh của con',
            imageUrl: cover,
            type: 'comic',
            comicId: story.id,
            description: `${story.pages?.length || 1} trang · ${story.artStyle || 'Nét vẽ tự do'}`,
          });
        }
      });
    }

    return items;
  }, [backpackFilter, galleryQuery.data?.items, characters, visibleComics]);

  // Download / Save Media
  const handleDownloadMedia = async (uri: string, filename?: string) => {
    try {
      if (Platform.OS === 'web') {
        const response = await fetch(uri);
        const blob = await response.blob();
        const objectUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = objectUrl;
        a.download = filename || `aikid_${Date.now()}.png`;
        a.click();
        URL.revokeObjectURL(objectUrl);
        Alert.alert('Thành công', 'Tác phẩm đã được tải về máy của con!');
      } else {
        await Linking.openURL(uri);
      }
    } catch {
      await Linking.openURL(uri);
    }
  };

  // Avatar Change
  const changeAvatar = useCallback(async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return Alert.alert('Cần quyền truy cập thư viện ảnh');
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.85 });
    const asset = result.canceled ? null : result.assets[0];
    if (!asset) return;
    setAvatarBusy(true);
    try {
      const form = new FormData();
      form.append('file', { uri: asset.uri, name: asset.fileName || 'avatar.jpg', type: asset.mimeType || 'image/jpeg' } as unknown as Blob);
      const upload = await mediaApi.upload(form, { ipId: activeIpId || undefined, assetType: 'avatar', permanent: 'true', tags: actor === 'child' && activeChildId ? `child:${activeChildId}` : undefined });
      const avatarUrl = String(upload.url || upload.imageUrl || upload.urls?.[0] || '');
      if (!avatarUrl) throw new Error('Upload không trả URL ảnh');
      if (actor === 'child') replaceChild(await familyApi.updateMyAvatar(avatarUrl) as never);
      else await profileApi.updateProfile({ avatarUrl });
      if (actor === 'parent') await refetchProfile();
    } catch (error) { Alert.alert('Không đổi được avatar', error instanceof Error ? error.message : 'Thử lại sau'); }
    finally { setAvatarBusy(false); }
  }, [activeChildId, activeIpId, actor, refetchProfile, replaceChild]);

  const displayName =
    (actor === 'child' ? activeChild?.name : profileData?.profile?.name) ||
    user?.name ||
    user?.email ||
    'Phụ huynh';

  useEffect(() => {
    if (actor === 'parent') void loadFamily();
  }, [actor, loadFamily]);

  const handleLogout = useCallback(() => {
    Alert.alert('Đăng xuất', 'Bạn muốn đăng xuất khỏi thiết bị này?', [
      { text: 'Huỷ', style: 'cancel' },
      {
        text: 'Đăng xuất',
        style: 'destructive',
        onPress: () => {
          void (async () => {
            queryClient.clear();
            await logout();
            router.replace('/(auth)/login');
          })();
        },
      },
    ]);
  }, [logout, router]);

  const openDeleteFlow = useCallback(() => {
    Alert.alert(
      'Xóa tài khoản',
      'Toàn bộ dữ liệu tài khoản sẽ bị xóa và không khôi phục được. Bạn chắc chắn?',
      [
        { text: 'Huỷ', style: 'cancel' },
        {
          text: 'Tiếp tục',
          style: 'destructive',
          onPress: () => {
            setDeletePassword('');
            setDeleteError(null);
            setDeleteOpen(true);
          },
        },
      ],
    );
  }, []);

  const confirmDelete = useCallback(async () => {
    if (!deletePassword.trim()) {
      setDeleteError('Nhập mật khẩu để xác nhận');
      return;
    }
    setDeleting(true);
    setDeleteError(null);
    try {
      await deleteAccount(deletePassword);
      queryClient.clear();
      setDeleteOpen(false);
      Alert.alert('Đã xóa tài khoản', 'Cảm ơn bạn đã dùng AIkid / StoryMee.');
      router.replace('/(auth)/login');
    } catch (err: unknown) {
      setDeleteError(
        extractErrorMessage(err, 'Không xóa được. Kiểm tra mật khẩu và thử lại.'),
      );
    } finally {
      setDeleting(false);
    }
  }, [deleteAccount, deletePassword, router]);

  const handleSelectWorkspace = useCallback(
    async (ipId: string) => {
      if (ipId === activeIpId) return;
      await selectWorkspace(ipId);
      void queryClient.invalidateQueries({ queryKey: ['media'] });
      void queryClient.invalidateQueries({ queryKey: ['account', 'profile'] });
      void queryClient.invalidateQueries({ queryKey: ['jobs'] });
    },
    [activeIpId, selectWorkspace],
  );

  // ─── Decoration Kind Filter in Tab 🎨 ─────────────────────────────────────────
  const [decorationKind, setDecorationKind] = useState<DecorationKind>('frame');

  const filteredDecorations = useMemo(() => {
    return DECORATION_CATALOG.filter((item) => item.kind === decorationKind);
  }, [decorationKind]);

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <View style={styles.container}>
      <ImageBackground
        source={require('../../public/lobby-assets/images/bg-art.png')}
        style={styles.bgImage}
        resizeMode="cover"
      >
        <View style={{ paddingTop: Math.max(20, insets.top), flex: 1 }}>
          <View style={{ paddingHorizontal: 16, zIndex: 10, paddingBottom: 12 }}>
            <GlobalHeader />
          </View>

          <View style={[styles.mainCard, compactProfile && styles.mainCardCompact]}>
            {/* 3 TABS HEADER */}
            <View style={styles.tabContainer}>
              <TouchableOpacity
                style={[styles.tabButton, activeTab === 'profile' && styles.tabButtonActive]}
                onPress={() => setActiveTab('profile')}
                activeOpacity={0.8}
              >
                <Text style={[styles.tabButtonText, activeTab === 'profile' && styles.tabButtonTextActive]}>
                  🌟 Hồ Sơ
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.tabButton, activeTab === 'backpack' && styles.tabButtonActive]}
                onPress={() => setActiveTab('backpack')}
                activeOpacity={0.8}
              >
                <Text style={[styles.tabButtonText, activeTab === 'backpack' && styles.tabButtonTextActive]}>
                  🎒 Ba Lô
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.tabButton, activeTab === 'decorations' && styles.tabButtonActive]}
                onPress={() => setActiveTab('decorations')}
                activeOpacity={0.8}
              >
                <Text style={[styles.tabButtonText, activeTab === 'decorations' && styles.tabButtonTextActive]}>
                  🎨 Trang Trí
                </Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              contentContainerStyle={{ padding: compactProfile ? 10 : 20, paddingBottom: 60, gap: 16 }}
              refreshControl={
                <RefreshControl
                  refreshing={rewardsQuery.isRefetching || galleryQuery.isRefetching}
                  onRefresh={() => {
                    void rewardsQuery.refetch();
                    void galleryQuery.refetch();
                  }}
                />
              }
            >
              {/* STUDENT PROFILE CARD (Shown in Hồ Sơ and Trang Trí) */}
              {(activeTab === 'profile' || activeTab === 'decorations') && (
                <View
                  style={[
                    styles.profileCard,
                    profileBackgroundAsset && styles.profileCardWithReward,
                    compactProfile && styles.profileCardCompact,
                  ]}
                >
                  {profileBackgroundAsset ? (
                    <Image
                      source={{ uri: profileBackgroundAsset }}
                      style={styles.profileRewardBackground}
                      contentFit="cover"
                    />
                  ) : null}
                  {profileLoading ? (
                    <ActivityIndicator style={{ marginTop: 12 }} color="#FF7597" />
                  ) : (
                    <View
                      style={[
                        styles.profileHero,
                        profileBackgroundAsset && styles.profileHeroReward,
                        compactProfile && styles.profileHeroCompact,
                      ]}
                    >
                      {/* Avatar with equipped items */}
                      <View style={styles.avatarColumn}>
                        {effectAsset ? (
                          <Image
                            source={{ uri: effectAsset }}
                            style={styles.avatarEffect}
                            contentFit="contain"
                          />
                        ) : null}
                        <Pressable
                          accessibilityRole="button"
                          accessibilityLabel="Đổi ảnh đại diện"
                          onPress={() => void changeAvatar()}
                          disabled={avatarBusy}
                          style={styles.avatarFrame}
                        >
                          {(actor === 'child' ? activeChild?.avatarUrl : profileData?.profile.avatarUrl) ? (
                            <Image
                              source={{ uri: String(actor === 'child' ? activeChild?.avatarUrl : profileData?.profile.avatarUrl) }}
                              style={styles.profileAvatar}
                              contentFit="cover"
                            />
                          ) : (
                            <View style={styles.avatarFallback}>
                              <Text style={styles.avatarFallbackText}>{String(displayName).charAt(0).toUpperCase()}</Text>
                            </View>
                          )}
                          <View style={styles.cameraBadge}>
                            <Text style={{ fontSize: 16 }}>📷</Text>
                          </View>
                          {frameAsset ? (
                            <Image
                              source={{ uri: frameAsset }}
                              style={styles.avatarRewardFrame}
                              contentFit="contain"
                            />
                          ) : null}
                        </Pressable>
                        <View style={styles.levelBadge}>
                          <Text style={styles.levelBadgeText}>CẤP {learnerLevel.current.level}</Text>
                        </View>
                        {companionAsset ? (
                          <View style={styles.companionBadge}>
                            <Image source={{ uri: companionAsset }} style={styles.companionImage} contentFit="contain" />
                          </View>
                        ) : null}
                      </View>

                      {/* Info & XP Track */}
                      <View style={[styles.profileCopy, compactProfile && styles.profileCopyCompact]}>
                        <Text style={[styles.profileEyebrow, compactProfile && styles.profileTextCompact]}>
                          {actor === 'child' ? 'Hồ sơ Nhà Sáng Tạo Nhí' : 'Tài khoản phụ huynh'}
                        </Text>
                        <Text style={[styles.profileName, compactProfile && styles.profileTextCompact]}>
                          {String(displayName)}
                        </Text>
                        <View style={[styles.titlePill, compactProfile && styles.titlePillCompact]}>
                          <Text style={styles.titlePillText}>
                            {String(activeTitleItem?.icon ?? '✨')}{' '}
                            {String(activeTitleItem?.name ?? learnerLevel.current.title)}
                          </Text>
                        </View>
                        <Text style={[styles.profileMeta, compactProfile && styles.profileTextCompact]}>
                          {actor === 'child' && activeChild ? `${ageBandLabel(String(activeChild.ageBand))} · ` : ''}
                          Hồ sơ học tập & sáng tạo AIKid
                        </Text>
                        <View style={[styles.xpCard, compactProfile && styles.xpCardCompact]}>
                          <View style={styles.xpHeader}>
                            <Text style={styles.xpLabel}>⚡ Cấp {learnerLevel.current.level}</Text>
                            <Text style={styles.xpValue}>
                              {learnerXp.toLocaleString('vi-VN')}
                              {learnerLevel.next ? `/${learnerLevel.next.xpRequired.toLocaleString('vi-VN')}` : ''} XP
                            </Text>
                          </View>
                          <View style={styles.xpTrack}>
                            <View style={[styles.xpFill, { width: `${learnerLevel.percent}%` }]} />
                          </View>
                          <Text style={styles.xpHint}>
                            {learnerLevel.next
                              ? `Còn ${Math.max(0, learnerLevel.next.xpRequired - learnerXp).toLocaleString('vi-VN')} XP để lên Cấp ${learnerLevel.next.level}`
                              : 'Đã đạt cấp cao nhất'}
                          </Text>
                        </View>
                      </View>

                      {/* 3 Stats: Chuỗi, Huy hiệu, Tác phẩm */}
                      <View style={[styles.profileStats, compactProfile && styles.profileStatsCompact]}>
                        {[
                          ['🔥', learnerStats.streak, 'Chuỗi học'],
                          ['🏅', learnerStats.achievements, 'Huy hiệu'],
                          ['🎨', learnerStats.works, 'Tác phẩm'],
                        ].map(([icon, value, label]) => (
                          <View key={String(label)} style={styles.profileStat}>
                            <Text style={styles.profileStatIcon}>{icon}</Text>
                            <Text style={styles.profileStatValue}>{value}</Text>
                            <Text style={styles.profileStatLabel}>{label}</Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  )}
                </View>
              )}

              {/* ═══════════ TAB 1: HỒ SƠ CONTENT ═══════════ */}
              {activeTab === 'profile' && (
                <>
                  {/* Family children (if Parent) */}
                  {actor === 'parent' ? (
                    <View style={styles.sectionCard}>
                      <View style={{ marginBottom: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Text style={styles.sectionSubtitle}>Hồ sơ học sinh trong gia đình</Text>
                        <Pressable onPress={() => router.push('/(app)/family')}>
                          <Text style={{ fontSize: 13, fontWeight: 'bold', color: '#FF7597' }}>Quản lý</Text>
                        </Pressable>
                      </View>
                      {children.length === 0 ? (
                        <Pressable
                          onPress={() => router.push('/(app)/family/create-child')}
                          style={styles.dashedBtn}
                        >
                          <Text style={{ textAlign: 'center', fontSize: 14, fontWeight: 'bold', color: '#FF7597' }}>
                            + Tạo hồ sơ học sinh
                          </Text>
                          <Text style={{ marginTop: 4, textAlign: 'center', fontSize: 12, color: '#64748B' }}>
                            Dành cho độ tuổi học sinh · Quản lý an toàn
                          </Text>
                        </Pressable>
                      ) : (
                        children.map((c) => {
                          const on = c.id === activeChildId;
                          return (
                            <Pressable
                              key={c.id}
                              onPress={() => {
                                void (async () => {
                                  await setActiveChild(c.id);
                                  await setRecentScope(c.id);
                                })();
                              }}
                              style={[styles.itemRow, on ? styles.itemRowActive : styles.itemRowInactive]}
                            >
                              <Text style={[styles.itemRowTitle, on ? styles.itemRowTitleActive : styles.itemRowTitleInactive]}>
                                {c.name}
                                {on ? ' · đang chọn' : ''}
                              </Text>
                              <Text style={styles.itemRowSubtitle}>
                                {ageBandLabel(String(c.ageBand))} · Quyền AI{' '}
                                {c.consent.allowAiCreate ? 'bật' : 'tắt'}
                              </Text>
                            </Pressable>
                          );
                        })
                      )}
                    </View>
                  ) : null}

                  {/* Workspace (if Parent) */}
                  {actor === 'parent' ? (
                    <View style={styles.sectionCard}>
                      <View style={{ marginBottom: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Text style={styles.sectionSubtitle}>Không gian sáng tạo (Workspace)</Text>
                        <Pressable onPress={() => void loadWorkspaces()}>
                          <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#FF7597' }}>Làm mới</Text>
                        </Pressable>
                      </View>
                      {wsError ? (
                        <Text style={{ marginBottom: 8, fontSize: 12, color: '#EF4444' }}>{wsError}</Text>
                      ) : null}
                      {wsLoading && !workspaces.length ? (
                        <ActivityIndicator color="#FF7597" />
                      ) : workspaces.length === 0 ? (
                        <Text style={{ fontSize: 13, color: '#64748B' }}>
                          Chưa có workspace — dùng ipId mặc định khi tạo ảnh.
                        </Text>
                      ) : (
                        workspaces.map((ws) => {
                          const active = ws.ipId === activeIpId;
                          return (
                            <Pressable
                              key={ws.ipId}
                              onPress={() => void handleSelectWorkspace(ws.ipId)}
                              style={[styles.itemRow, active ? styles.itemRowActive : styles.itemRowInactive]}
                            >
                              <Text style={[styles.itemRowTitle, active ? styles.itemRowTitleActive : styles.itemRowTitleInactive]}>
                                {ws.name || 'Workspace'}
                                {active ? ' · đang chọn' : ''}
                              </Text>
                              <Text style={{ marginTop: 2, fontFamily: 'monospace', fontSize: 11, color: '#94A3B8' }}>
                                {ws.ipId}
                              </Text>
                            </Pressable>
                          );
                        })
                      )}
                    </View>
                  ) : null}

                  {/* Legal / support */}
                  <View style={styles.sectionCard}>
                    <Text style={[styles.sectionSubtitle, { marginBottom: 12 }]}>Pháp lý & Hỗ trợ</Text>
                    <LinkRow label="Chính sách bảo mật" onPress={() => void Linking.openURL(PRIVACY_POLICY_URL)} />
                    <LinkRow label="Điều khoản sử dụng" onPress={() => void Linking.openURL(TERMS_OF_SERVICE_URL)} />
                    <LinkRow label={`Hỗ trợ học tập · ${SUPPORT_EMAIL}`} onPress={() => void Linking.openURL(SUPPORT_MAILTO)} />
                    {actor === 'parent' && (
                      <LinkRow label="Xóa tài khoản (web)" onPress={() => void Linking.openURL(DELETE_ACCOUNT_WEB_URL)} />
                    )}
                  </View>

                  {/* Actions */}
                  <Pressable
                    onPress={handleLogout}
                    disabled={authBusy}
                    style={styles.logoutBtn}
                  >
                    <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#1E293B' }}>Đăng xuất</Text>
                  </Pressable>

                  {actor === 'parent' ? (
                    <Pressable
                      onPress={openDeleteFlow}
                      style={styles.deleteBtn}
                    >
                      <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#DC2626' }}>Xóa tài khoản</Text>
                    </Pressable>
                  ) : null}
                </>
              )}

              {/* ═══════════ TAB 2: BA LÔ (GALLERY & WORKS) ═══════════ */}
              {activeTab === 'backpack' && (
                <View style={styles.backpackContainer}>
                  {/* Category Filter Chips */}
                  <View style={styles.filterChipRow}>
                    {([
                      ['all', 'Tất cả tác phẩm'],
                      ['drawings', '🎨 Tranh vẽ'],
                      ['characters', '🧸 Nhân vật'],
                      ['comics', '📖 Truyện tranh'],
                    ] as const).map(([k, label]) => (
                      <TouchableOpacity
                        key={k}
                        style={[styles.filterChip, backpackFilter === k && styles.filterChipActive]}
                        onPress={() => setBackpackFilter(k)}
                        activeOpacity={0.8}
                      >
                        <Text style={[styles.filterChipText, backpackFilter === k && styles.filterChipTextActive]}>
                          {label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  {/* Items Grid */}
                  {galleryQuery.isLoading ? (
                    <ActivityIndicator size="large" color="#FF7597" style={{ marginTop: 40 }} />
                  ) : backpackItems.length === 0 ? (
                    <View style={styles.emptyBox}>
                      <Text style={{ fontSize: 44 }}>🎒</Text>
                      <Text style={styles.emptyTitle}>Ba lô còn trống!</Text>
                      <Text style={styles.emptySub}>
                        Con hãy vào Xưởng vẽ tranh, tạo Nhân vật Mee hoặc sáng tác Truyện tranh để lưu tác phẩm vào ba lô nhé!
                      </Text>
                    </View>
                  ) : (
                    <View style={styles.backpackGrid}>
                      {backpackItems.map((item) => (
                        <TouchableOpacity
                          key={item.id}
                          style={[styles.backpackCard, { width: backpackCardWidth }]}
                          onPress={() => setSelectedBackpackItem(item)}
                          activeOpacity={0.85}
                        >
                          <Image
                            source={{ uri: item.imageUrl }}
                            style={styles.backpackThumb}
                            contentFit="cover"
                            transition={200}
                          />
                          <View style={styles.backpackMeta}>
                            <Text style={styles.backpackItemTitle} numberOfLines={1}>
                              {item.title}
                            </Text>
                            <Text style={styles.backpackItemSub}>
                              {item.type === 'drawing' ? 'Tranh vẽ' : item.type === 'character' ? 'Nhân vật' : 'Truyện tranh'}
                              {item.date ? ` · ${item.date}` : ''}
                            </Text>
                          </View>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>
              )}

              {/* ═══════════ TAB 3: TRANG TRÍ (DECORATION INVENTORY) ═══════════ */}
              {activeTab === 'decorations' && (
                <View style={styles.decorationsContainer}>
                  {/* Category Filter Pills */}
                  <View style={styles.filterChipRow}>
                    {([
                      ['frame', '🖼️ Khung ảnh'],
                      ['background', '🌄 Nền hồ sơ'],
                      ['effect', '✨ Hiệu ứng'],
                      ['companion', '🐾 Bạn đồng hành'],
                      ['title', '👑 Danh hiệu'],
                    ] as const).map(([k, label]) => (
                      <TouchableOpacity
                        key={k}
                        style={[styles.filterChip, decorationKind === k && styles.filterChipActive]}
                        onPress={() => setDecorationKind(k)}
                        activeOpacity={0.8}
                      >
                        <Text style={[styles.filterChipText, decorationKind === k && styles.filterChipTextActive]}>
                          {label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  <Text style={styles.decorationHint}>
                    {'Bấm "Trang bị" để làm đẹp thẻ hồ sơ của con ngay phía trên!'}
                  </Text>

                  {/* Decorations Grid */}
                  <View style={styles.decorationsGrid}>
                    {filteredDecorations.map((item) => {
                      const isEquipped = activeEquipment[item.kind] === item.id;
                      return (
                        <View
                          key={item.id}
                          style={[
                            styles.decorationCard,
                            { width: decorationCardWidth },
                            isEquipped && styles.decorationCardEquipped,
                          ]}
                        >
                          <View style={styles.decorationIconBox}>
                            {item.assetUrl ? (
                              <Image source={{ uri: item.assetUrl }} style={styles.decorationThumb} contentFit="contain" />
                            ) : (
                              <Text style={{ fontSize: 36 }}>{item.icon}</Text>
                            )}
                          </View>

                          <View style={styles.decorationInfo}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                              <Text style={styles.decorationName} numberOfLines={1}>{item.name}</Text>
                              <View style={[styles.rarityPill, item.rarity === 'Huyền thoại' && { backgroundColor: '#FEF08A' }]}>
                                <Text style={styles.rarityText}>{item.rarity}</Text>
                              </View>
                            </View>
                            <Text style={styles.decorationDesc} numberOfLines={2}>{item.description}</Text>
                          </View>

                          {/* Action button: Equip / Unequip */}
                          {isEquipped ? (
                            <TouchableOpacity
                              style={styles.unequipBtn}
                              onPress={() => void handleUnequipItem(item.kind)}
                              activeOpacity={0.8}
                            >
                              <Text style={styles.unequipBtnText}>Gỡ bỏ</Text>
                            </TouchableOpacity>
                          ) : (
                            <TouchableOpacity
                              style={styles.equipBtn}
                              onPress={() => void handleEquipItem(item)}
                              activeOpacity={0.8}
                            >
                              <Text style={styles.equipBtnText}>Trang bị</Text>
                            </TouchableOpacity>
                          )}
                        </View>
                      );
                    })}
                  </View>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </ImageBackground>

      {/* Backpack Item Preview Modal */}
      {selectedBackpackItem ? (
        <Modal
          visible={Boolean(selectedBackpackItem)}
          transparent
          animationType="fade"
          onRequestClose={() => setSelectedBackpackItem(null)}
        >
          <View style={styles.modalOverlay}>
            <Pressable style={styles.modalBackdrop} onPress={() => setSelectedBackpackItem(null)} />
            <View style={styles.previewCard}>
              <View style={styles.previewHeader}>
                <Text style={styles.previewTitle} numberOfLines={1}>
                  {selectedBackpackItem.title}
                </Text>
                <TouchableOpacity
                  style={styles.previewCloseBtn}
                  onPress={() => setSelectedBackpackItem(null)}
                >
                  <FontAwesome6 name="xmark" size={18} color="#64748B" />
                </TouchableOpacity>
              </View>

              <Image
                source={{ uri: selectedBackpackItem.imageUrl }}
                style={styles.previewImage}
                contentFit="contain"
              />

              {selectedBackpackItem.description ? (
                <Text style={styles.previewDesc}>{selectedBackpackItem.description}</Text>
              ) : null}

              <View style={styles.previewActionRow}>
                {selectedBackpackItem.comicId ? (
                  <TouchableOpacity
                    style={styles.openComicBtn}
                    onPress={() => {
                      const id = selectedBackpackItem.comicId;
                      setSelectedBackpackItem(null);
                      router.push({
                        pathname: '/(app)/comic/story-reader',
                        params: { id, type: 'comic' },
                      });
                    }}
                  >
                    <Text style={styles.openComicBtnText}>📖 Đọc truyện</Text>
                  </TouchableOpacity>
                ) : null}

                <TouchableOpacity
                  style={styles.downloadBtn}
                  onPress={() => void handleDownloadMedia(selectedBackpackItem.imageUrl, `${selectedBackpackItem.title}.png`)}
                >
                  <Text style={styles.downloadBtnText}>📥 Tải về máy</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      ) : null}

      {/* Delete confirm modal */}
      <Modal visible={deleteOpen} transparent animationType="fade">
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.4)', paddingHorizontal: 24 }}>
          <View style={{ width: '100%', maxWidth: 400, borderRadius: 24, backgroundColor: '#FFFFFF', padding: 24 }}>
            <Text style={{ fontSize: 20, fontWeight: '800', color: '#0F172A' }}>Xác nhận xóa</Text>
            <Text style={{ marginTop: 8, fontSize: 13, lineHeight: 20, color: '#475569' }}>
              Nhập mật khẩu tài khoản phụ huynh để xóa vĩnh viễn (DELETE /api/v1/account/me).
            </Text>
            <TextInput
              style={{ marginTop: 16, height: 48, borderRadius: 16, borderWidth: 1, borderColor: '#E2E8F0', backgroundColor: '#F8FAFC', paddingHorizontal: 16, fontSize: 16, color: '#0F172A' }}
              secureTextEntry
              placeholder="Mật khẩu"
              placeholderTextColor="#94A3B8"
              value={deletePassword}
              onChangeText={(v) => {
                setDeletePassword(v);
                setDeleteError(null);
              }}
            />
            {deleteError ? (
              <Text style={{ marginTop: 8, fontSize: 13, fontWeight: '500', color: '#DC2626' }}>{deleteError}</Text>
            ) : null}
            <View style={{ marginTop: 24, flexDirection: 'row', gap: 12 }}>
              <Pressable
                onPress={() => setDeleteOpen(false)}
                style={{ flex: 1, height: 48, alignItems: 'center', justifyContent: 'center', borderRadius: 16, borderWidth: 1, borderColor: '#E2E8F0' }}
              >
                <Text style={{ fontWeight: 'bold', color: '#334155' }}>Huỷ</Text>
              </Pressable>
              <Pressable
                onPress={() => void confirmDelete()}
                disabled={deleting}
                style={{ flex: 1, height: 48, alignItems: 'center', justifyContent: 'center', borderRadius: 16, backgroundColor: '#EF4444' }}
              >
                {deleting ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={{ fontWeight: 'bold', color: '#FFFFFF' }}>Xóa</Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function LinkRow({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={{ borderBottomWidth: 1, borderBottomColor: '#F1F5F9', paddingVertical: 14 }}
    >
      <Text style={{ fontSize: 14, fontWeight: '600', color: '#1E293B' }}>{label}</Text>
    </Pressable>
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
    width: '100%',
    maxWidth: 1100,
    alignSelf: 'center',
    backgroundColor: '#FDFAF4',
    borderRadius: 32,
    borderWidth: 6,
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
  mainCardCompact: {
    marginHorizontal: 6,
    marginBottom: 6,
    borderWidth: 3,
    borderRadius: 24,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1.5,
    borderBottomColor: '#FFE5EC',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 10,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 18,
    backgroundColor: '#FFF3F6',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FFE0E8',
  },
  tabButtonActive: {
    backgroundColor: '#FF7597',
    borderColor: '#FF5C8A',
    shadowColor: '#FF7597',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 3,
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#832840',
  },
  tabButtonTextActive: {
    color: '#FFFFFF',
  },
  sectionCard: {
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#FFEDD5',
    backgroundColor: '#FFFFFF',
    padding: 20,
  },
  profileCard: {
    overflow: 'hidden',
    borderRadius: 28,
    borderWidth: 1,
    borderColor: '#5B36C9',
    backgroundColor: '#4B35AE',
    padding: 22,
    shadowColor: '#7C2D12',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 3,
  },
  profileCardCompact: {
    borderRadius: 24,
    padding: 12,
  },
  profileCardWithReward: {
    backgroundColor: '#F5F3FF',
  },
  profileRewardBackground: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    width: '100%',
    height: '100%',
  },
  profileHero: {
    position: 'relative',
    zIndex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
    borderRadius: 24,
    backgroundColor: 'transparent',
    padding: 22,
  },
  profileHeroCompact: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: 20,
    padding: 12,
  },
  profileHeroReward: {
    borderRadius: 24,
    backgroundColor: 'rgba(49,46,129,0.48)',
  },
  avatarColumn: {
    position: 'relative',
    zIndex: 2,
    alignItems: 'center',
    paddingBottom: 12,
  },
  avatarEffect: {
    position: 'absolute',
    top: -22,
    left: -22,
    width: 168,
    height: 168,
    zIndex: 0,
  },
  avatarFrame: {
    position: 'relative',
    height: 124,
    width: 124,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 62,
    borderWidth: 6,
    borderColor: '#FFFFFF',
    backgroundColor: '#FFE3ED',
    padding: 5,
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 22,
    elevation: 6,
  },
  profileAvatar: {
    height: '100%',
    width: '100%',
    borderRadius: 56,
  },
  avatarRewardFrame: {
    position: 'absolute',
    top: -8,
    right: -8,
    bottom: -8,
    left: -8,
    width: 140,
    height: 140,
    zIndex: 3,
  },
  avatarFallback: {
    height: '100%',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 56,
    backgroundColor: '#FFE3ED',
  },
  avatarFallbackText: {
    fontSize: 44,
    fontWeight: '900',
    color: '#FF5C8A',
  },
  cameraBadge: {
    position: 'absolute',
    right: -3,
    top: -3,
    height: 34,
    width: 34,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 17,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    backgroundColor: '#FF7597',
    zIndex: 5,
  },
  levelBadge: {
    position: 'absolute',
    bottom: 0,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    backgroundColor: '#6D5EFC',
    paddingHorizontal: 14,
    paddingVertical: 6,
    zIndex: 6,
  },
  levelBadgeText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  profileCopy: {
    flex: 1,
    minWidth: 0,
  },
  profileCopyCompact: {
    width: '100%',
    alignItems: 'center',
  },
  profileTextCompact: {
    width: '100%',
    textAlign: 'center',
  },
  profileEyebrow: {
    fontSize: 11,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    color: '#D9D2FF',
  },
  profileName: {
    marginTop: 3,
    fontSize: 30,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  titlePill: {
    alignSelf: 'flex-start',
    marginTop: 6,
    borderRadius: 999,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  titlePillCompact: {
    alignSelf: 'center',
  },
  titlePillText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#B45309',
  },
  profileMeta: {
    marginTop: 9,
    fontSize: 12,
    fontWeight: '600',
    color: '#E4DFFF',
  },
  xpCard: {
    marginTop: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
    backgroundColor: 'rgba(255,255,255,0.12)',
    padding: 12,
  },
  xpCardCompact: {
    width: '100%',
    alignSelf: 'stretch',
  },
  xpHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  xpLabel: {
    fontSize: 12,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  xpValue: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  xpTrack: {
    marginTop: 8,
    height: 11,
    overflow: 'hidden',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#D8D1FF',
    backgroundColor: '#EDE9FE',
  },
  xpFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: '#6D5EFC',
  },
  xpHint: {
    marginTop: 6,
    fontSize: 10,
    fontWeight: '700',
    color: '#E4DFFF',
  },
  profileStats: {
    position: 'relative',
    zIndex: 2,
    flexDirection: 'row',
    gap: 9,
  },
  profileStatsCompact: {
    width: '100%',
    alignSelf: 'stretch',
  },
  companionBadge: {
    position: 'absolute',
    right: -18,
    bottom: 4,
    zIndex: 8,
    height: 48,
    width: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 24,
    borderWidth: 3,
    borderColor: '#FFFFFF',
    backgroundColor: '#E0F2FE',
  },
  companionImage: {
    height: 40,
    width: 40,
  },
  profileStat: {
    flex: 1,
    minWidth: 74,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: 12,
    paddingVertical: 13,
  },
  profileStatIcon: {
    fontSize: 18,
  },
  profileStatValue: {
    marginTop: 4,
    fontSize: 16,
    fontWeight: '900',
    color: '#312E81',
  },
  profileStatLabel: {
    marginTop: 2,
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
  },
  sectionSubtitle: {
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    color: '#94A3B8',
  },
  dashedBtn: {
    borderRadius: 16,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#FED7AA',
    backgroundColor: '#FFF7ED',
    paddingHorizontal: 12,
    paddingVertical: 16,
  },
  itemRow: {
    marginBottom: 8,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  itemRowActive: {
    borderColor: '#FF7597',
    backgroundColor: '#FFF7ED',
  },
  itemRowInactive: {
    borderColor: '#F1F5F9',
    backgroundColor: '#F8FAFC',
  },
  itemRowTitle: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  itemRowTitleActive: {
    color: '#FF7597',
  },
  itemRowTitleInactive: {
    color: '#1E293B',
  },
  itemRowSubtitle: {
    marginTop: 2,
    fontSize: 12,
    color: '#64748B',
  },
  logoutBtn: {
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  deleteBtn: {
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    backgroundColor: '#FEF2F2',
  },

  // Backpack styles
  backpackContainer: {
    gap: 16,
  },
  filterChipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  filterChipActive: {
    backgroundColor: '#FF7597',
    borderColor: '#FF5C8A',
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },
  backpackGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  backpackCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    marginBottom: 8,
  },
  backpackThumb: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: '#F8FAFC',
  },
  backpackMeta: {
    padding: 10,
  },
  backpackItemTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  backpackItemSub: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
  emptyBox: {
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: '#F1F5F9',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 10,
  },
  emptySub: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 20,
    maxWidth: 360,
  },

  // Decorations styles
  decorationsContainer: {
    gap: 14,
  },
  decorationHint: {
    fontSize: 13,
    color: '#64748B',
    fontStyle: 'italic',
  },
  decorationsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  decorationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 14,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    gap: 12,
    marginBottom: 4,
  },
  decorationCardEquipped: {
    borderColor: '#FF7597',
    backgroundColor: '#FFF7F9',
  },
  decorationIconBox: {
    width: 60,
    height: 60,
    borderRadius: 16,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  decorationThumb: {
    width: 50,
    height: 50,
  },
  decorationInfo: {
    flex: 1,
    minWidth: 0,
  },
  decorationName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  rarityPill: {
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  rarityText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#0369A1',
  },
  decorationDesc: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 3,
    lineHeight: 16,
  },
  equipBtn: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 14,
    backgroundColor: '#FF7597',
  },
  equipBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  unequipBtn: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  unequipBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
  },

  // Modal Preview styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFill,
  },
  previewCard: {
    width: '100%',
    maxWidth: 520,
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 10,
  },
  previewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  previewTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    flex: 1,
  },
  previewCloseBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewImage: {
    width: '100%',
    aspectRatio: 1.2,
    borderRadius: 16,
    backgroundColor: '#F8FAFC',
    marginBottom: 12,
  },
  previewDesc: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 20,
    marginBottom: 14,
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 12,
  },
  previewActionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  openComicBtn: {
    flex: 1,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#6D5EFC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  openComicBtnText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  downloadBtn: {
    flex: 1,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#FF7597',
    alignItems: 'center',
    justifyContent: 'center',
  },
  downloadBtnText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
