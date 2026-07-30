import { useRouter } from 'expo-router';

import { useResponsiveLayout } from '@/features/kids-ui/useResponsiveLayout';

import { AikidButton } from './AikidButton';
import { AikidIcon } from './AikidIcon';

type Props = {
  href?: string;
  onPress?: () => void;
};

export function AikidBackButton({ href, onPress }: Props) {
  const router = useRouter();
  const { isCompact } = useResponsiveLayout();

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else if (href) {
      router.push(href as never);
    } else if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(app)/lobby');
    }
  };

  return (
    <AikidButton
      variant={isCompact ? 'icon' : 'nav'}
      size="sm"
      icon={
        isCompact ? (
          <AikidIcon name="arrow-left" size={20} color="#FFFFFF" />
        ) : undefined
      }
      leftIcon={
        !isCompact ? (
          <AikidIcon name="arrow-left" size={18} color="#FFFFFF" />
        ) : undefined
      }
      onPress={handlePress}
    >
      {isCompact ? undefined : 'Trở về'}
    </AikidButton>
  );
}
