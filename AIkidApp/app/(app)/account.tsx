import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
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

// ─── Local Reward & Asset Mappings ──────────────────────────────────────────────

const TROPHY_GOLD = require('../../public/assets/trophy-clay-gold.png');
const STAR_ICON = require('../../public/assets/aikid-ui/generated/star.webp');
const DEFAULT_BOY_AVATAR = require('../../public/assets/optimized/lobby-mii-character.webp');

const REWARD_LOCAL_ASSETS: Record<string, any> = {
  // Backgrounds
  'profile-edge-ocean': require('../../public/assets/rewards/backgrounds/profile-edge-ocean.webp'),
  'profile-edge-ai-gate': require('../../public/assets/rewards/backgrounds/profile-edge-ai-gate.webp'),
  'profile-edge-forest': require('../../public/assets/rewards/backgrounds/profile-edge-forest.webp'),
  'profile-edge-island': require('../../public/assets/rewards/backgrounds/profile-edge-island.webp'),
  'profile-edge-stars': require('../../public/assets/rewards/backgrounds/profile-edge-stars.webp'),
  'profile-edge-playground': require('../../public/assets/rewards/backgrounds/profile-edge-playground.webp'),
  'background-ocean': require('../../public/assets/rewards/backgrounds/profile-edge-ocean.webp'),
  'background-ai-gate': require('../../public/assets/rewards/backgrounds/profile-edge-ai-gate.webp'),
  'background-forest': require('../../public/assets/rewards/backgrounds/profile-edge-forest.webp'),
  'background-island': require('../../public/assets/rewards/backgrounds/profile-edge-island.webp'),
  'theme-legend': require('../../public/assets/rewards/backgrounds/profile-edge-stars.webp'),
  'theme-workshop': require('../../public/assets/rewards/backgrounds/profile-edge-playground.webp'),

  // Frames
  'frame-rainbow': require('../../public/assets/rewards/frames/frame-rainbow.webp'),
  'frame-galaxy': require('../../public/assets/rewards/frames/frame-galaxy.webp'),
  'frame-cloud-summer': require('../../public/assets/rewards/frames/frame-cloud-summer.webp'),
  'frame-summit-gold': require('../../public/assets/rewards/frames/frame-summit-gold.webp'),
  'frame-galaxy-storyteller': require('../../public/assets/rewards/frames/frame-galaxy-storyteller.webp'),
  'frame-language-kingdom': require('../../public/assets/rewards/frames/frame-language-kingdom.webp'),

  // Companions
  'avatar-paco-blue': require('../../public/assets/rewards/companions/avatar-paco-blue.webp'),
  'companion-paco-cloud': require('../../public/assets/rewards/companions/paco-cloud-companion.webp'),
  'companion-paco-sea': require('../../public/assets/rewards/companions/paco-sea-companion.webp'),
  'companion-paco-fire': require('../../public/assets/rewards/companions/paco-fire-companion.webp'),
  'companion-paco-leaf': require('../../public/assets/rewards/companions/paco-leaf-companion.webp'),
  'companion-paco-star': require('../../public/assets/rewards/companions/paco-star-companion.webp'),
  'companion-paco-inventor': require('../../public/assets/rewards/companions/paco-inventor.webp'),
  'companion-paco-storyteller': require('../../public/assets/rewards/companions/paco-storyteller.webp'),

  // Effects
  'perk-sticker-sparkle': require('../../public/assets/rewards/effects/perk-sticker-sparkle.webp'),
  'effect-rainbow': require('../../public/assets/rewards/effects/effect-rainbow.webp'),
  'effect-galaxy': require('../../public/assets/rewards/effects/effect-galaxy.webp'),
  'effect-sunrise': require('../../public/assets/rewards/effects/effect-sunrise.webp'),

  // Avatars
  'avatar-bo-boy': require('../../public/assets/optimized/lobby-mii-character.webp'),
  'avatar-paco-cat': require('../../public/assets/rewards/companions/avatar-paco-blue.webp'),
};

const BACKGROUND_DEFS: Record<string, { image: any; color: string; tone: 'light' | 'dark'; name: string }> = {
  'profile-edge-ocean': {
    image: REWARD_LOCAL_ASSETS['profile-edge-ocean'],
    color: '#daf8f7',
    tone: 'light',
    name: 'Đại Dương Kỳ Thú',
  },
  'background-ocean': {
    image: REWARD_LOCAL_ASSETS['profile-edge-ocean'],
    color: '#daf8f7',
    tone: 'light',
    name: 'Đại Dương Kỳ Thú',
  },
  'profile-edge-ai-gate': {
    image: REWARD_LOCAL_ASSETS['profile-edge-ai-gate'],
    color: '#f7e8e5',
    tone: 'light',
    name: 'Cổng Trời AI',
  },
  'background-ai-gate': {
    image: REWARD_LOCAL_ASSETS['profile-edge-ai-gate'],
    color: '#f7e8e5',
    tone: 'light',
    name: 'Cổng Trời AI',
  },
  'profile-edge-forest': {
    image: REWARD_LOCAL_ASSETS['profile-edge-forest'],
    color: '#f5f3dc',
    tone: 'light',
    name: 'Rừng Phép Thuật',
  },
  'background-forest': {
    image: REWARD_LOCAL_ASSETS['profile-edge-forest'],
    color: '#f5f3dc',
    tone: 'light',
    name: 'Rừng Phép Thuật',
  },
  'profile-edge-island': {
    image: REWARD_LOCAL_ASSETS['profile-edge-island'],
    color: '#f8ddbd',
    tone: 'light',
    name: 'Đảo Khám Phá',
  },
  'background-island': {
    image: REWARD_LOCAL_ASSETS['profile-edge-island'],
    color: '#f8ddbd',
    tone: 'light',
    name: 'Đảo Khám Phá',
  },
  'profile-edge-stars': {
    image: REWARD_LOCAL_ASSETS['profile-edge-stars'],
    color: '#50489d',
    tone: 'dark',
    name: 'Vũ Trụ Ánh Sao',
  },
  'theme-legend': {
    image: REWARD_LOCAL_ASSETS['profile-edge-stars'],
    color: '#50489d',
    tone: 'dark',
    name: 'Vũ Trụ Ánh Sao',
  },
  'profile-edge-playground': {
    image: REWARD_LOCAL_ASSETS['profile-edge-playground'],
    color: '#fff8e8',
    tone: 'light',
    name: 'Xưởng Sáng Tạo',
  },
  'theme-workshop': {
    image: REWARD_LOCAL_ASSETS['profile-edge-playground'],
    color: '#fff8e8',
    tone: 'light',
    name: 'Xưởng Sáng Tạo',
  },
};

function getBackgroundDef(bgId?: string) {
  if (bgId && BACKGROUND_DEFS[bgId]) {
    return BACKGROUND_DEFS[bgId];
  }
  return BACKGROUND_DEFS['profile-edge-ocean'];
}

// ─── Level Calculation Formula ────────────────────────────────────────────────

function computeExplorerLevel(xp: number) {
  const safeXp = Math.max(0, xp);
  const level = Math.floor(safeXp / 100) + 1;
  const xpIntoLevel = safeXp % 100;
  const xpToNext = 100 - xpIntoLevel;
  const percent = Math.min(100, Math.max(0, Math.round((xpIntoLevel / 100) * 100)));
  const nextLevel = level + 1;
  return {
    level,
    nextLevel,
    xpIntoLevel,
    xpToNext,
    percent,
    totalXp: safeXp,
  };
}

// ─── Decoration Catalog ───────────────────────────────────────────────────────

type DecorationKind = 'background' | 'frame' | 'title' | 'companion' | 'effect' | 'avatar';

type DecorationItem = {
  id: string;
  kind: DecorationKind;
  name: string;
  icon: string;
  assetKey?: string;
  description: string;
  rarity: 'Thường' | 'Hiếm' | 'Sử thi' | 'Huyền thoại';
};

const DECORATION_CATALOG: DecorationItem[] = [
  // 🌄 Nền thẻ hồ sơ (background)
  {
    id: 'profile-edge-ocean',
    kind: 'background',
    name: 'Đại Dương Kỳ Thú',
    icon: '🌊',
    assetKey: 'profile-edge-ocean',
    description: 'Minh họa Clay phong cảnh đại dương tươi mát và trong lành.',
    rarity: 'Thường',
  },
  {
    id: 'profile-edge-ai-gate',
    kind: 'background',
    name: 'Cổng Trời AI',
    icon: '🚪',
    assetKey: 'profile-edge-ai-gate',
    description: 'Cổng không gian huyền ảo lung linh dẫn lối vào tương lai.',
    rarity: 'Hiếm',
  },
  {
    id: 'profile-edge-forest',
    kind: 'background',
    name: 'Rừng Phép Thuật',
    icon: '🌲',
    assetKey: 'profile-edge-forest',
    description: 'Khu rừng kỳ diệu với những loài sinh vật phát sáng.',
    rarity: 'Sử thi',
  },
  {
    id: 'profile-edge-island',
    kind: 'background',
    name: 'Đảo Khám Phá',
    icon: '🏝️',
    assetKey: 'profile-edge-island',
    description: 'Hòn đảo nhiệt đới với vô vàn bí mật chờ con khai phá.',
    rarity: 'Hiếm',
  },
  {
    id: 'profile-edge-stars',
    kind: 'background',
    name: 'Vũ Trụ Ánh Sao',
    icon: '⭐',
    assetKey: 'profile-edge-stars',
    description: 'Bầu trời đêm vô tận phủ đầy bụi sao lấp lánh nhiệm màu.',
    rarity: 'Huyền thoại',
  },
  {
    id: 'profile-edge-playground',
    kind: 'background',
    name: 'Xưởng Sáng Tạo',
    icon: '🛠️',
    assetKey: 'profile-edge-playground',
    description: 'Không gian ấm cúng ngập tràn màu vẽ và ý tưởng.',
    rarity: 'Thường',
  },

  // 🖼️ Khung ảnh (frame)
  {
    id: 'frame-rainbow',
    kind: 'frame',
    name: 'Cầu Vồng Rực Rỡ',
    icon: '🌈',
    assetKey: 'frame-rainbow',
    description: 'Khung viền 7 sắc cầu vồng tươi vui rực rỡ.',
    rarity: 'Hiếm',
  },
  {
    id: 'frame-galaxy',
    kind: 'frame',
    name: 'Thiên Hà Lấp Lánh',
    icon: '🌌',
    assetKey: 'frame-galaxy',
    description: 'Ánh sáng các vì sao bao quanh khung avatar.',
    rarity: 'Sử thi',
  },
  {
    id: 'frame-cloud-summer',
    kind: 'frame',
    name: 'Mây Mùa Hè',
    icon: '☁️',
    assetKey: 'frame-cloud-summer',
    description: 'Những đám mây bồng bềnh êm ái ngày hè.',
    rarity: 'Thường',
  },
  {
    id: 'frame-summit-gold',
    kind: 'frame',
    name: 'Đỉnh Hoàng Kim',
    icon: '👑',
    assetKey: 'frame-summit-gold',
    description: 'Huy hoàng như chiếc vương miện của nhà vô địch.',
    rarity: 'Huyền thoại',
  },
  {
    id: 'frame-galaxy-storyteller',
    kind: 'frame',
    name: 'Người Kể Chuyện Vũ Trụ',
    icon: '🪐',
    assetKey: 'frame-galaxy-storyteller',
    description: 'Dành riêng cho những nhà sáng tạo truyện tài ba.',
    rarity: 'Huyền thoại',
  },
  {
    id: 'frame-language-kingdom',
    kind: 'frame',
    name: 'Vương Quốc Ngôn Ngữ',
    icon: '🏰',
    assetKey: 'frame-language-kingdom',
    description: 'Khung lâu đài nguy nga của vùng đất tri thức.',
    rarity: 'Hiếm',
  },

  // 👑 Danh hiệu (title)
  {
    id: 'title-starter',
    kind: 'title',
    name: 'Tia Sáng Đầu Tiên',
    icon: '✨',
    description: 'Bước chân đầu tiên khám phá vũ trụ tri thức AIkid.',
    rarity: 'Thường',
  },
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

  // 🐾 Bạn đồng hành (companion)
  {
    id: 'avatar-paco-blue',
    kind: 'companion',
    name: 'Mèo Paco Xanh',
    icon: '🐱',
    assetKey: 'avatar-paco-blue',
    description: 'Chú mèo Paco thông thái đồng hành cùng con sáng tạo.',
    rarity: 'Hiếm',
  },
  {
    id: 'companion-paco-cloud',
    kind: 'companion',
    name: 'Paco Mây',
    icon: '☁️',
    assetKey: 'companion-paco-cloud',
    description: 'Người bạn mây trắng lơ lửng luôn mang lại niềm vui.',
    rarity: 'Thường',
  },
  {
    id: 'companion-paco-sea',
    kind: 'companion',
    name: 'Paco Biển',
    icon: '🌊',
    assetKey: 'companion-paco-sea',
    description: 'Chú cá heo Paco dũng cảm khám phá đại dương.',
    rarity: 'Sử thi',
  },
  {
    id: 'companion-paco-fire',
    kind: 'companion',
    name: 'Paco Lửa',
    icon: '🔥',
    assetKey: 'companion-paco-fire',
    description: 'Ngọn lửa đam mê thắp sáng mọi ý tưởng sáng tạo.',
    rarity: 'Huyền thoại',
  },

  // ✨ Hiệu ứng (effect)
  {
    id: 'perk-sticker-sparkle',
    kind: 'effect',
    name: 'Bụi Sao Lấp Lánh',
    icon: '✨',
    assetKey: 'perk-sticker-sparkle',
    description: 'Ánh hào quang lấp lánh tỏa ra từ avatar của con.',
    rarity: 'Hiếm',
  },
  {
    id: 'effect-rainbow',
    kind: 'effect',
    name: 'Vệt Cầu Vồng',
    icon: '🌈',
    assetKey: 'effect-rainbow',
    description: 'Dải màu cầu vồng lung linh uốn quanh.',
    rarity: 'Sử thi',
  },
  {
    id: 'effect-galaxy',
    kind: 'effect',
    name: 'Vòng Xoáy Ngân Hà',
    icon: '🌌',
    assetKey: 'effect-galaxy',
    description: 'Những tinh tú lấp lánh xoay vần huyền ảo.',
    rarity: 'Huyền thoại',
  },

  // 👦 Avatar (avatar)
  {
    id: 'avatar-bo-boy',
    kind: 'avatar',
    name: 'Bo Khám Phá',
    icon: '👦',
    assetKey: 'avatar-bo-boy',
    description: 'Avatar 3D năng động của nhà thám hiểm Bo.',
    rarity: 'Thường',
  },
  {
    id: 'avatar-paco-cat',
    kind: 'avatar',
    name: 'Mèo Paco Thông Thái',
    icon: '🐱',
    assetKey: 'avatar-paco-cat',
    description: 'Mèo Paco đáng yêu với đôi mắt sáng ngời.',
    rarity: 'Hiếm',
  },
];

// Fallback sample works matching app.aikid
const SAMPLE_WORKS = [
  {
    id: 'sample-paco-object',
    title: 'Tìm thấy một vật lạ của Vẹt Paco',
    imageUrl: '',
    type: 'comic' as const,
    date: 'Mới xong',
    description: 'Cuốn truyện tranh sáng tạo cùng Vẹt Paco khám phá hòn đảo.',
  },
  {
    id: 'sample-comic-plot',
    title: 'storyPlot comic...',
    imageUrl: '',
    type: 'comic' as const,
    date: 'Hôm qua',
    description: 'Tác phẩm kịch bản truyện tranh thiếu nhi trên AIKid.',
  },
  {
    id: 'sample-forest-art',
    title: 'Khu rừng kỳ diệu của Paco',
    imageUrl: '',
    type: 'drawing' as const,
    date: '3 ngày trước',
    description: 'Bức tranh vẽ tay kết hợp AI của con.',
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

export default function AccountScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width: viewportWidth } = useWindowDimensions();
  const compactProfile = viewportWidth < 768;

  // Active section tab: 'profile' (Hồ sơ) | 'decorations' (Trang trí) | 'backpack'
  const [activeTab, setActiveTab] = useState<'profile' | 'decorations' | 'backpack'>('profile');

  // Responsive column widths for recent works & decorations
  const workCardWidth = useMemo(() => {
    if (viewportWidth >= 900) return '31.5%';
    if (viewportWidth >= 600) return '48%';
    return '100%';
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

  // ─── Gamification Queries with Fallback to Bo Profile ────────────────────────

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

  const rawXp = gamificationQuery.data?.totalXp || activeChild?.xp || 0;
  // Fallback to Bo's standard 10,650 XP as in spec
  const learnerXp = rawXp > 0 ? rawXp : 10650;
  const levelInfo = useMemo(() => computeExplorerLevel(learnerXp), [learnerXp]);

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
  const displayStreak = learnerStats.streak > 0 ? learnerStats.streak : 2;
  const displayAchievements = learnerStats.achievements > 0 ? learnerStats.achievements : 5;

  // ─── Rewards Equipment & Catalog Sync ────────────────────────────────────────

  const [localEquipment, setLocalEquipment] = useState<Record<string, string>>({
    background: 'profile-edge-ocean',
    title: 'title-starter',
    avatar: 'avatar-bo-boy',
  });

  useEffect(() => {
    const storageKey = `aikid.equipped.${activeChildId || 'current'}`;
    void AsyncStorage.getItem(storageKey).then((val) => {
      if (val) {
        try {
          const parsed = JSON.parse(val);
          setLocalEquipment((prev) => ({ ...prev, ...parsed }));
        } catch {}
      }
    });
  }, [activeChildId]);

  const activeEquipment = localEquipment;

  const bgDef = useMemo(() => {
    return getBackgroundDef(activeEquipment.background);
  }, [activeEquipment.background]);

  const activeTitleName = useMemo(() => {
    const titleId = activeEquipment.title || 'title-starter';
    const found = DECORATION_CATALOG.find((d) => d.kind === 'title' && d.id === titleId);
    return found?.name || 'Tia Sáng Đầu Tiên';
  }, [activeEquipment.title]);

  const frameAsset = useMemo(() => {
    if (!activeEquipment.frame) return null;
    return REWARD_LOCAL_ASSETS[activeEquipment.frame] || null;
  }, [activeEquipment.frame]);

  const companionAsset = useMemo(() => {
    if (!activeEquipment.companion) return null;
    return REWARD_LOCAL_ASSETS[activeEquipment.companion] || null;
  }, [activeEquipment.companion]);

  const effectAsset = useMemo(() => {
    if (!activeEquipment.effect) return null;
    return REWARD_LOCAL_ASSETS[activeEquipment.effect] || null;
  }, [activeEquipment.effect]);

  // ─── Equip / Unequip Handlers ───────────────────────────────────────────────

  const handleEquipItem = async (item: DecorationItem) => {
    const updated = { ...localEquipment, [item.kind]: item.id };
    setLocalEquipment(updated);
    const storageKey = `aikid.equipped.${activeChildId || 'current'}`;
    await AsyncStorage.setItem(storageKey, JSON.stringify(updated));
    try {
      await apiClient.post('/api/v1/gamification/me/storybook/equip', {
        kind: item.kind,
        rewardId: item.id,
      });
    } catch {
      // Offline safe fallback
    }
  };

  const handleUnequipItem = async (kind: DecorationKind) => {
    const updated = { ...localEquipment };
    delete updated[kind];
    setLocalEquipment(updated);
    const storageKey = `aikid.equipped.${activeChildId || 'current'}`;
    await AsyncStorage.setItem(storageKey, JSON.stringify(updated));
    try {
      await apiClient.post('/api/v1/gamification/me/storybook/unequip', { kind });
    } catch {
      // Offline safe fallback
    }
  };

  // ─── Backpack & Works Data ──────────────────────────────────────────────────

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

  const displayWorks = learnerStats.works > 0
    ? learnerStats.works
    : (backpackItems.length > 0 ? backpackItems.length : 3);

  const displayWorksList = useMemo(() => {
    if (backpackItems.length > 0) {
      return backpackItems.slice(0, 6);
    }
    return SAMPLE_WORKS;
  }, [backpackItems]);

  // ─── Avatar Resolution ──────────────────────────────────────────────────────

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

  const studentUploadedAvatar = actor === 'child' ? activeChild?.avatarUrl : profileData?.profile.avatarUrl;
  const avatarSource = studentUploadedAvatar
    ? { uri: String(studentUploadedAvatar) }
    : activeEquipment.avatar && REWARD_LOCAL_ASSETS[activeEquipment.avatar]
    ? REWARD_LOCAL_ASSETS[activeEquipment.avatar]
    : DEFAULT_BOY_AVATAR;

  const rawName = (actor === 'child' ? activeChild?.name : profileData?.profile?.name) || user?.name;
  const displayNameClean = (!rawName || rawName === 'Phụ huynh') ? 'Bo' : rawName;

  useEffect(() => {
    if (actor === 'parent') void loadFamily();
  }, [actor, loadFamily]);

  // ─── Actions Handlers ────────────────────────────────────────────────────────

  const handleShareProfile = useCallback(() => {
    const shareUrl = `https://app.aikid.vn/u/${activeChildId || 'bo'}`;
    if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.clipboard) {
      void navigator.clipboard.writeText(shareUrl).then(() => {
        Alert.alert('Đã sao chép liên kết', `Đã sao chép liên kết chia sẻ hồ sơ:\n${shareUrl}`);
      }).catch(() => {
        Alert.alert('Bản chia sẻ hồ sơ', shareUrl);
      });
    } else {
      Alert.alert(
        'Bản chia sẻ hồ sơ',
        `Đường dẫn chia sẻ hồ sơ của con:\n${shareUrl}`,
        [
          { text: 'Đóng', style: 'cancel' },
          {
            text: 'Mở liên kết',
            onPress: () => {
              void Linking.openURL(shareUrl).catch(() => {});
            },
          },
        ],
      );
    }
  }, [activeChildId]);

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

  // ─── Decoration Kind Filter in Tab [ Trang trí ] ─────────────────────────────
  const [decorationKind, setDecorationKind] = useState<DecorationKind>('background');

  const filteredDecorations = useMemo(() => {
    return DECORATION_CATALOG.filter((item) => item.kind === decorationKind);
  }, [decorationKind]);

  const isItemEquipped = (item: DecorationItem) => {
    if (item.kind === 'background') {
      return (activeEquipment.background || 'profile-edge-ocean') === item.id;
    }
    if (item.kind === 'title') {
      return (activeEquipment.title || 'title-starter') === item.id;
    }
    if (item.kind === 'avatar') {
      return (activeEquipment.avatar || 'avatar-bo-boy') === item.id;
    }
    return activeEquipment[item.kind] === item.id;
  };

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <View style={styles.container}>
      <ImageBackground
        source={require('../../public/lobby-assets/images/bg-art.png')}
        style={styles.bgImage}
        resizeMode="cover"
      >
        <View style={{ paddingTop: Math.max(16, insets.top), flex: 1 }}>
          <View style={{ paddingHorizontal: 16, zIndex: 10, paddingBottom: 12 }}>
            <GlobalHeader />
          </View>

          <View style={[styles.mainCard, compactProfile && styles.mainCardCompact]}>
            <ScrollView
              contentContainerStyle={{ padding: compactProfile ? 12 : 20, paddingBottom: 60, gap: 16 }}
              refreshControl={
                <RefreshControl
                  refreshing={profileLoading || galleryQuery.isRefetching}
                  onRefresh={() => {
                    void gamificationQuery.refetch();
                    void learnerStatsQuery.refetch();
                    void galleryQuery.refetch();
                  }}
                />
              }
            >
              {/* ════════════════════════════════════════════════════════════════
                  1. HERO BANNER PROFILE (CHỈNH CHU THEO APP.AIKID)
              ════════════════════════════════════════════════════════════════ */}
              <View
                style={[
                  styles.profileCard,
                  { backgroundColor: bgDef.color },
                  compactProfile && styles.profileCardCompact,
                ]}
              >
                {/* Clay Ocean Background Image */}
                <Image
                  source={bgDef.image}
                  style={styles.profileRewardBackground}
                  contentFit="cover"
                />

                {/* Main Hero Header */}
                <View style={[styles.profileHero, compactProfile && styles.profileHeroCompact]}>
                  {/* Left Column: Avatar & Details */}
                  <View style={[styles.avatarAndInfoGroup, compactProfile && styles.avatarAndInfoGroupCompact]}>
                    {/* Avatar Column */}
                    <View style={styles.avatarColumn}>
                      {effectAsset ? (
                        <Image
                          source={effectAsset}
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
                        <Image
                          source={avatarSource}
                          style={styles.profileAvatar}
                          contentFit="cover"
                        />
                        <View style={styles.cameraBadge}>
                          <FontAwesome6 name="camera" size={14} color="#FFFFFF" />
                        </View>
                        {frameAsset ? (
                          <Image
                            source={frameAsset}
                            style={styles.avatarRewardFrame}
                            contentFit="contain"
                          />
                        ) : null}
                      </Pressable>

                      {companionAsset ? (
                        <View style={styles.companionBadge}>
                          <Image source={companionAsset} style={styles.companionImage} contentFit="contain" />
                        </View>
                      ) : null}
                    </View>

                    {/* Student Info */}
                    <View style={[styles.profileCopy, compactProfile && styles.profileCopyCompact]}>
                      <Text style={styles.profileEyebrow}>HỒ SƠ NHÀ KHÁM PHÁ</Text>
                      
                      <View style={[styles.nameAndLevelRow, compactProfile && styles.nameAndLevelRowCompact]}>
                        <Text style={styles.profileName} numberOfLines={1}>
                          {displayNameClean}
                        </Text>
                        <View style={styles.levelPillBadge}>
                          <Text style={styles.levelPillText}>Cấp {levelInfo.level}</Text>
                        </View>
                      </View>

                      {/* Title Pill Badge with gold gradient */}
                      <LinearGradient
                        colors={['#FEF3C7', '#FDE68A', '#FFEDD5']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={[styles.titlePillGradient, compactProfile && styles.titlePillGradientCompact]}
                      >
                        <Text style={styles.titlePillText}>
                          {`✨ ${activeTitleName} ✦`}
                        </Text>
                      </LinearGradient>
                    </View>
                  </View>

                  {/* Right Column: Glassmorphic Stats Strip */}
                  <View style={[styles.profileStats, compactProfile && styles.profileStatsCompact]}>
                    <View style={styles.profileStatItem}>
                      <Text style={styles.profileStatIcon}>🔥</Text>
                      <Text style={styles.profileStatValue}>{displayStreak}</Text>
                      <Text style={styles.profileStatLabel}>Ngày học</Text>
                    </View>
                    <View style={styles.profileStatDivider} />
                    <View style={styles.profileStatItem}>
                      <Text style={styles.profileStatIcon}>🏅</Text>
                      <Text style={styles.profileStatValue}>{displayAchievements}</Text>
                      <Text style={styles.profileStatLabel}>Huy hiệu</Text>
                    </View>
                    <View style={styles.profileStatDivider} />
                    <View style={styles.profileStatItem}>
                      <Text style={styles.profileStatIcon}>🎨</Text>
                      <Text style={styles.profileStatValue}>{displayWorks}</Text>
                      <Text style={styles.profileStatLabel}>Tác phẩm</Text>
                    </View>
                  </View>
                </View>

                {/* Bottom Section Bar Integrated in Banner */}
                <View style={[styles.profileSectionBar, compactProfile && styles.profileSectionBarCompact]}>
                  <View style={styles.sectionTabControl}>
                    <TouchableOpacity
                      style={[
                        styles.sectionTabBtn,
                        activeTab === 'profile' && styles.sectionTabBtnActive,
                      ]}
                      onPress={() => setActiveTab('profile')}
                      activeOpacity={0.85}
                    >
                      <Text
                        style={[
                          styles.sectionTabText,
                          activeTab === 'profile' && styles.sectionTabTextActive,
                        ]}
                      >
                        Hồ sơ
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.sectionTabBtn,
                        activeTab === 'decorations' && styles.sectionTabBtnActive,
                      ]}
                      onPress={() => setActiveTab('decorations')}
                      activeOpacity={0.85}
                    >
                      <Text
                        style={[
                          styles.sectionTabText,
                          activeTab === 'decorations' && styles.sectionTabTextActive,
                        ]}
                      >
                        Trang trí
                      </Text>
                    </TouchableOpacity>
                  </View>

                  <TouchableOpacity
                    style={styles.shareBtn}
                    onPress={handleShareProfile}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.shareBtnText}>Xem bản chia sẻ</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* ════════════════════════════════════════════════════════════════
                  2. NỘI DUNG KHI TAB [ HỒ SƠ ] ĐƯỢC CHỌN
              ════════════════════════════════════════════════════════════════ */}
              {activeTab === 'profile' && (
                <>
                  {/* THẺ 1: HÀNH TRÌNH CẤP ĐỘ (LEVEL JOURNEY CARD) */}
                  <View style={[styles.levelJourneyCard, compactProfile && styles.levelJourneyCardCompact]}>
                    <View style={styles.trophyBox}>
                      <Image
                        source={TROPHY_GOLD}
                        style={styles.trophyImage}
                        contentFit="contain"
                      />
                    </View>

                    <View style={styles.levelJourneyMiddle}>
                      <Text style={styles.levelJourneyEyebrow}>Hành trình cấp độ</Text>
                      <Text style={styles.levelJourneyTitle}>
                        Cấp {levelInfo.level} · {levelInfo.totalXp.toLocaleString('vi-VN')} XP
                      </Text>

                      {/* Progress Header */}
                      <View style={styles.progressHeaderRow}>
                        <Text style={styles.progressLabel}>
                          TIẾN ĐỘ LÊN CẤP {levelInfo.nextLevel}
                        </Text>
                        <View style={styles.progressBadge}>
                          <Text style={styles.progressBadgeText}>{levelInfo.percent}%</Text>
                        </View>
                      </View>

                      {/* Progress Bar with Gradient and Smiling Star */}
                      <View style={styles.progressBarTrack}>
                        <LinearGradient
                          colors={['#1E1B4B', '#312E81']}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 0 }}
                          style={[styles.progressBarFill, { width: `${levelInfo.percent}%` }]}
                        />
                        <View
                          style={[
                            styles.progressStarContainer,
                            { left: `${Math.min(96, Math.max(4, levelInfo.percent))}%` },
                          ]}
                        >
                          <Image
                            source={STAR_ICON}
                            style={styles.progressStarImage}
                            contentFit="contain"
                          />
                        </View>
                      </View>

                      <Text style={styles.levelJourneyHint}>
                        Còn {levelInfo.xpToNext.toLocaleString('vi-VN')} XP để lên Cấp {levelInfo.nextLevel}
                      </Text>
                    </View>

                    <TouchableOpacity
                      style={styles.viewJourneyBtn}
                      onPress={() => router.push('/(app)/plans')}
                      activeOpacity={0.85}
                    >
                      <Text style={styles.viewJourneyBtnText}>Xem hành trình</Text>
                    </TouchableOpacity>
                  </View>

                  {/* THẺ 2: TÁC PHẨM GẦN ĐÂY (RECENT WORKS CARD) */}
                  <View style={styles.recentWorksCard}>
                    <View style={styles.recentWorksHeader}>
                      <View>
                        <Text style={styles.recentWorksTitle}>Tác phẩm gần đây</Text>
                        <Text style={styles.recentWorksSubtitle}>
                          Những tác phẩm đã sẵn sàng để giới thiệu.
                        </Text>
                      </View>
                      <TouchableOpacity
                        onPress={() => router.push('/(app)/gallery')}
                        activeOpacity={0.8}
                      >
                        <Text style={styles.recentWorksViewAll}>Xem tất cả</Text>
                      </TouchableOpacity>
                    </View>

                    <View style={styles.recentWorksGrid}>
                      {displayWorksList.map((work) => (
                        <TouchableOpacity
                          key={work.id}
                          style={[styles.workCard, { width: workCardWidth }]}
                          onPress={() => setSelectedBackpackItem(work)}
                          activeOpacity={0.88}
                        >
                          <View style={styles.workThumbnailContainer}>
                            {work.imageUrl ? (
                              <Image
                                source={{ uri: work.imageUrl }}
                                style={styles.workThumbnail}
                                contentFit="cover"
                              />
                            ) : (
                              <View style={styles.workPlaceholder}>
                                <Text style={{ fontSize: 36 }}>🖌️</Text>
                              </View>
                            )}
                          </View>
                          <View style={styles.workMeta}>
                            <Text style={styles.workTitle} numberOfLines={1}>
                              {work.title}
                            </Text>
                          </View>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>

                  {/* PHẦN DÀNH CHO PHỤ HUYNH & CÀI ĐẶT (GIỮ NGUYÊN NGHIỆP VỤ) */}
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

                  <View style={styles.sectionCard}>
                    <Text style={[styles.sectionSubtitle, { marginBottom: 12 }]}>Pháp lý & Hỗ trợ</Text>
                    <LinkRow label="Chính sách bảo mật" onPress={() => void Linking.openURL(PRIVACY_POLICY_URL)} />
                    <LinkRow label="Điều khoản sử dụng" onPress={() => void Linking.openURL(TERMS_OF_SERVICE_URL)} />
                    <LinkRow label={`Hỗ trợ học tập · ${SUPPORT_EMAIL}`} onPress={() => void Linking.openURL(SUPPORT_MAILTO)} />
                    {actor === 'parent' && (
                      <LinkRow label="Xóa tài khoản (web)" onPress={() => void Linking.openURL(DELETE_ACCOUNT_WEB_URL)} />
                    )}
                  </View>

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

              {/* ════════════════════════════════════════════════════════════════
                  3. NỘI DUNG KHI TAB [ TRANG TRÍ ] ĐƯỢC CHỌN
              ════════════════════════════════════════════════════════════════ */}
              {activeTab === 'decorations' && (
                <View style={styles.decorationsContainer}>
                  {/* Banner hướng dẫn */}
                  <View style={styles.decorationNoticeBox}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.decorationNoticeTitle}>Chỉnh phong cách hồ sơ</Text>
                      <Text style={styles.decorationNoticeSub}>
                        Chọn từng slot bên dưới; profile phía trên cập nhật ngay sau khi trang bị.
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={styles.viewProfileBtn}
                      onPress={() => setActiveTab('profile')}
                      activeOpacity={0.85}
                    >
                      <Text style={styles.viewProfileBtnText}>Xem hồ sơ</Text>
                    </TouchableOpacity>
                  </View>

                  {/* Studio Mee Invite Card */}
                  <TouchableOpacity
                    style={styles.studioInviteCard}
                    onPress={() => router.push('/(app)/mee')}
                    activeOpacity={0.9}
                  >
                    <View style={styles.studioInviteIconBox}>
                      <Text style={{ fontSize: 32 }}>🧸</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.studioInviteTitle}>Tạo avatar của con</Text>
                      <Text style={styles.studioInviteSub}>
                        Chọn tóc, mắt, trang phục, phụ kiện và phối một Mee thật riêng.
                      </Text>
                    </View>
                    <View style={styles.studioInviteBtn}>
                      <Text style={styles.studioInviteBtnText}>Mở Studio</Text>
                    </View>
                  </TouchableOpacity>

                  {/* Category Filter Pills */}
                  <View style={styles.filterChipRow}>
                    {([
                      ['background', '🌄 Nền hồ sơ'],
                      ['frame', '🖼️ Khung ảnh'],
                      ['title', '👑 Danh hiệu'],
                      ['companion', '🐾 Bạn đồng hành'],
                      ['effect', '✨ Hiệu ứng'],
                      ['avatar', '👦 Avatar'],
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

                  {/* Decorations Grid */}
                  <View style={styles.decorationsGrid}>
                    {filteredDecorations.map((item) => {
                      const isEquipped = isItemEquipped(item);
                      const asset = item.assetKey ? REWARD_LOCAL_ASSETS[item.assetKey] : null;

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
                            {asset ? (
                              <Image source={asset} style={styles.decorationThumb} contentFit="contain" />
                            ) : (
                              <Text style={{ fontSize: 32 }}>{item.icon}</Text>
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

              {selectedBackpackItem.imageUrl ? (
                <Image
                  source={{ uri: selectedBackpackItem.imageUrl }}
                  style={styles.previewImage}
                  contentFit="contain"
                />
              ) : (
                <View style={[styles.previewImage, { alignItems: 'center', justifyContent: 'center', backgroundColor: '#EFF6FF' }]}>
                  <Text style={{ fontSize: 60 }}>🖌️</Text>
                </View>
              )}

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
                  onPress={() => {
                    setSelectedBackpackItem(null);
                    router.push('/(app)/gallery');
                  }}
                >
                  <Text style={styles.downloadBtnText}>🎨 Mở Gallery</Text>
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

// ─── Stylesheet ───────────────────────────────────────────────────────────────

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

  // ─── 1. HERO BANNER PROFILE ─────────────────────────────────────────────────
  profileCard: {
    overflow: 'hidden',
    borderRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.8)',
    shadowColor: '#0284C7',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 4,
    position: 'relative',
  },
  profileCardCompact: {
    borderRadius: 24,
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
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 22,
    paddingBottom: 20,
    gap: 20,
  },
  profileHeroCompact: {
    flexDirection: 'column',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 16,
  },
  avatarAndInfoGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
    flex: 1,
    minWidth: 0,
  },
  avatarAndInfoGroupCompact: {
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
    gap: 12,
  },
  avatarColumn: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarEffect: {
    position: 'absolute',
    top: -20,
    left: -20,
    width: 148,
    height: 148,
    zIndex: 0,
  },
  avatarFrame: {
    position: 'relative',
    height: 106,
    width: 106,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 999,
    borderWidth: 4,
    borderColor: '#FFFFFF',
    backgroundColor: '#FFFFFF',
    shadowColor: 'rgba(0, 0, 0, 0.12)',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 14,
    elevation: 5,
  },
  profileAvatar: {
    height: '100%',
    width: '100%',
    borderRadius: 999,
  },
  avatarRewardFrame: {
    position: 'absolute',
    top: -8,
    right: -8,
    bottom: -8,
    left: -8,
    width: 122,
    height: 122,
    zIndex: 3,
  },
  cameraBadge: {
    position: 'absolute',
    right: -2,
    top: -2,
    height: 30,
    width: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    backgroundColor: '#0284C7',
    zIndex: 5,
  },
  companionBadge: {
    position: 'absolute',
    right: -12,
    bottom: -2,
    zIndex: 8,
    height: 40,
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    borderWidth: 2.5,
    borderColor: '#FFFFFF',
    backgroundColor: '#E0F2FE',
  },
  companionImage: {
    height: 34,
    width: 34,
  },
  profileCopy: {
    flex: 1,
    minWidth: 0,
  },
  profileCopyCompact: {
    width: '100%',
    alignItems: 'center',
  },
  profileEyebrow: {
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 1.4,
    color: '#0284C7',
  },
  nameAndLevelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 4,
  },
  nameAndLevelRowCompact: {
    justifyContent: 'center',
  },
  profileName: {
    fontSize: 30,
    fontWeight: '900',
    color: '#0F172A',
  },
  levelPillBadge: {
    backgroundColor: '#FFFFFF',
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: '#E0F2FE',
    paddingHorizontal: 12,
    paddingVertical: 4,
    shadowColor: 'rgba(0, 0, 0, 0.04)',
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 1,
  },
  levelPillText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0369A1',
  },
  titlePillGradient: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: '#F59E0B',
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginTop: 8,
    shadowColor: 'rgba(245, 158, 11, 0.3)',
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 8,
    elevation: 2,
  },
  titlePillGradientCompact: {
    alignSelf: 'center',
  },
  titlePillText: {
    fontSize: 13,
    fontWeight: '900',
    color: '#78350F',
  },

  // Stats Box on right
  profileStats: {
    backgroundColor: 'rgba(255, 255, 255, 0.88)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.95)',
    shadowColor: 'rgba(0, 0, 0, 0.06)',
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 2,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  profileStatsCompact: {
    width: '100%',
    justifyContent: 'space-around',
    marginTop: 8,
  },
  profileStatItem: {
    flex: 1,
    minWidth: 70,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  profileStatDivider: {
    width: 1,
    height: 36,
    backgroundColor: '#F1F5F9',
  },
  profileStatIcon: {
    fontSize: 20,
  },
  profileStatValue: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0284C7',
    marginTop: 2,
  },
  profileStatLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    marginTop: 2,
  },

  // Section Bar bottom
  profileSectionBar: {
    backgroundColor: 'rgba(255, 250, 235, 0.92)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.75)',
    paddingVertical: 10,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 2,
  },
  profileSectionBarCompact: {
    flexDirection: 'column',
    gap: 10,
    paddingVertical: 12,
  },
  sectionTabControl: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
    borderRadius: 14,
    padding: 3,
    gap: 4,
  },
  sectionTabBtn: {
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTabBtnActive: {
    backgroundColor: '#FB7185',
    shadowColor: '#FB7185',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 2,
  },
  sectionTabText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#475569',
  },
  sectionTabTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  shareBtn: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingVertical: 8,
    paddingHorizontal: 16,
    shadowColor: 'rgba(0, 0, 0, 0.04)',
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 1,
  },
  shareBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0284C7',
  },

  // ─── 2. HÀNH TRÌNH CẤP ĐỘ CARD ──────────────────────────────────────────────
  levelJourneyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 22,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: 'rgba(0, 0, 0, 0.05)',
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 16,
    elevation: 3,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  levelJourneyCardCompact: {
    flexDirection: 'column',
    alignItems: 'stretch',
    padding: 16,
    gap: 16,
  },
  trophyBox: {
    width: 68,
    height: 68,
    borderRadius: 20,
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  trophyImage: {
    width: 58,
    height: 58,
  },
  levelJourneyMiddle: {
    flex: 1,
    minWidth: 0,
  },
  levelJourneyEyebrow: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0284C7',
  },
  levelJourneyTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#0F172A',
    marginTop: 2,
  },
  progressHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 6,
  },
  progressLabel: {
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    color: '#475569',
  },
  progressBadge: {
    backgroundColor: '#E0E7FF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  progressBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#4338CA',
  },
  progressBarTrack: {
    height: 12,
    borderRadius: 999,
    backgroundColor: '#EDE9FE',
    position: 'relative',
    overflow: 'visible',
    marginVertical: 4,
  },
  progressBarFill: {
    height: 12,
    borderRadius: 999,
  },
  progressStarContainer: {
    position: 'absolute',
    top: -8,
    marginLeft: -14,
    width: 28,
    height: 28,
    zIndex: 10,
  },
  progressStarImage: {
    width: 28,
    height: 28,
  },
  levelJourneyHint: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 8,
  },
  viewJourneyBtn: {
    backgroundColor: '#FB7185',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    shadowColor: '#FB7185',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  viewJourneyBtnText: {
    fontSize: 15,
    fontWeight: '900',
    color: '#FFFFFF',
  },

  // ─── 3. TÁC PHẨM GẦN ĐÂY CARD ───────────────────────────────────────────────
  recentWorksCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 22,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: 'rgba(0, 0, 0, 0.05)',
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 16,
    elevation: 3,
  },
  recentWorksHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 18,
  },
  recentWorksTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#0F172A',
  },
  recentWorksSubtitle: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 4,
  },
  recentWorksViewAll: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0284C7',
  },
  recentWorksGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
  },
  workCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    shadowColor: 'rgba(0, 0, 0, 0.04)',
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 4,
  },
  workThumbnailContainer: {
    width: '100%',
    aspectRatio: 4 / 3,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  workThumbnail: {
    width: '100%',
    height: '100%',
  },
  workPlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EFF6FF',
  },
  workMeta: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: '#FFFFFF',
  },
  workTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },

  // ─── 4. TRANG TRÍ (DECORATIONS TAB) ─────────────────────────────────────────
  decorationsContainer: {
    gap: 16,
  },
  decorationNoticeBox: {
    backgroundColor: '#F0FDF4',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#DCFCE7',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  decorationNoticeTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#15803D',
  },
  decorationNoticeSub: {
    fontSize: 13,
    color: '#166534',
    marginTop: 2,
  },
  viewProfileBtn: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  viewProfileBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#15803D',
  },
  studioInviteCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 18,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    shadowColor: 'rgba(0, 0, 0, 0.04)',
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 2,
  },
  studioInviteIconBox: {
    width: 54,
    height: 54,
    borderRadius: 16,
    backgroundColor: '#FFF1F2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  studioInviteTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: '#0F172A',
  },
  studioInviteSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  studioInviteBtn: {
    backgroundColor: '#0284C7',
    borderRadius: 14,
    paddingVertical: 9,
    paddingHorizontal: 16,
  },
  studioInviteBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
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
    backgroundColor: '#0284C7',
    borderColor: '#0284C7',
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
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
    borderColor: '#FB7185',
    backgroundColor: '#FFF1F2',
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
    backgroundColor: '#FB7185',
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

  // ─── PARENT & COMMON STYLES ────────────────────────────────────────────────
  sectionCard: {
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#FFEDD5',
    backgroundColor: '#FFFFFF',
    padding: 20,
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

  // ─── MODAL PREVIEW ──────────────────────────────────────────────────────────
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
    backgroundColor: '#0284C7',
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
    backgroundColor: '#FB7185',
    alignItems: 'center',
    justifyContent: 'center',
  },
  downloadBtnText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
