import React from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import { AikidButton as BaseAikidButton, BtnVariant, BtnSize } from '@/ui/AikidButton';

export type LegacyBtnVariant = BtnVariant | 'primary' | 'secondary' | 'outline' | 'danger';

type KidsAikidButtonProps = {
  title?: string;
  label?: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: LegacyBtnVariant;
  size?: BtnSize;
  icon?: React.ReactNode;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
};

export function AikidButton({
  title,
  label,
  onPress,
  loading = false,
  disabled = false,
  variant = 'nav',
  size = 'md',
  icon,
  leftIcon,
  rightIcon,
  fullWidth,
  style,
  children,
}: KidsAikidButtonProps) {
  let mappedVariant: BtnVariant = 'nav';
  if (variant === 'primary') mappedVariant = 'cta';
  else if (variant === 'secondary' || variant === 'outline') mappedVariant = 'feature';
  else if (variant === 'danger') mappedVariant = 'delete';
  else mappedVariant = variant as BtnVariant;

  const content = children ?? title ?? label;

  return (
    <BaseAikidButton
      variant={mappedVariant}
      size={size}
      onPress={onPress}
      disabled={disabled}
      loading={loading}
      icon={icon}
      leftIcon={leftIcon}
      rightIcon={rightIcon}
      fullWidth={fullWidth}
      style={style}
    >
      {content}
    </BaseAikidButton>
  );
}

