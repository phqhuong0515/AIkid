/**
 * AikidModal — Base modal primitive
 *
 * Bottom-sheet style modal với:
 *   - animationType="slide" from bottom
 *   - Drag handle bar ở đầu
 *   - Header: title + close button
 *   - Backdrop mờ — tap để đóng
 *   - Border-radius top 32
 *   - Nền cream #FDFAFA, viền trắng
 *
 * Usage:
 *   <AikidModal
 *     isOpen={visible}
 *     onClose={() => setVisible(false)}
 *     title="Chọn phong cách"
 *   >
 *     ... content ...
 *   </AikidModal>
 *
 *   // Centered modal (không phải bottom sheet)
 *   <AikidModal isOpen={visible} onClose={...} position="center" title="Xác nhận">
 *     ...
 *   </AikidModal>
 */

import React from 'react';
import {
  Modal,
  View,
  TouchableOpacity,
  StyleSheet,
  Pressable,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  AikidFrameColors,
  AikidRadius,
  AikidShadows,
  AikidTextColors,
  AikidFonts,
  AikidMetrics,
} from '@/features/kids-ui/theme';
import { AikidText } from './AikidText';
import { AikidIcon } from './AikidIcon';

type ModalPosition = 'bottom' | 'center';
type ModalSize = 'sm' | 'md' | 'lg';

type AikidModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  /** Optional subtitle under title */
  subtitle?: string;
  /** Bottom sheet (default) or centered dialog */
  position?: ModalPosition;
  /** Max width for center/large screen (default 560) */
  maxWidth?: number;
  /** Shared modal width token. Ignored when maxWidth is provided. */
  size?: ModalSize;
  /** Remove default card padding */
  noPadding?: boolean;
  children: React.ReactNode;
};

export function AikidModal({
  isOpen,
  onClose,
  title,
  subtitle,
  position = 'bottom',
  maxWidth,
  size = 'md',
  noPadding = false,
  children,
}: AikidModalProps) {
  const insets = useSafeAreaInsets();
  const isBottom = position === 'bottom';
  const resolvedMaxWidth = maxWidth ?? AikidMetrics.modalWidth[size];

  return (
    <Modal
      visible={isOpen}
      transparent
      animationType={isBottom ? 'slide' : 'fade'}
      onRequestClose={onClose}
      statusBarTranslucent
    >
      {/* Backdrop */}
      <Pressable style={styles.backdrop} onPress={onClose}>
        <View style={styles.backdropInner} />
      </Pressable>

      {/* Card */}
      <View
        style={[
          styles.positionWrapper,
          isBottom ? styles.positionBottom : styles.positionCenter,
        ]}
        pointerEvents="box-none"
      >
        <View
          style={[
            styles.card,
            isBottom ? styles.cardBottom : styles.cardCenter,
            { paddingBottom: Math.max(insets.bottom, AikidMetrics.modalPadding) },
            { maxWidth: resolvedMaxWidth },
            !noPadding && styles.cardPadding,
          ]}
        >
          {/* Drag handle — only for bottom sheet */}
          {isBottom && (
            <View style={styles.dragHandle} />
          )}

          {/* Header */}
          {(title || subtitle) && (
            <View style={styles.header}>
              <View style={styles.headerText}>
                {title && (
                  <AikidText variant="title" style={styles.titleText}>{title}</AikidText>
                )}
                {subtitle && (
                  <AikidText variant="body" style={styles.subtitleText}>{subtitle}</AikidText>
                )}
              </View>
              <TouchableOpacity
                onPress={onClose}
                style={styles.closeBtn}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <AikidIcon name="close" size={20} color={AikidTextColors.body} />
              </TouchableOpacity>
            </View>
          )}

          {/* Content */}
          {children}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFill,
    zIndex: 1,
  },
  backdropInner: {
    flex: 1,
    backgroundColor: 'rgba(51, 65, 85, 0.45)',
  },
  positionWrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 2,
  },
  positionBottom: {
    bottom: 0,
    alignItems: 'center',
  },
  positionCenter: {
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  card: {
    backgroundColor: AikidFrameColors.paper,
    width: '100%',
    alignSelf: 'center',
    ...AikidShadows.modal,
  },
  cardBottom: {
    borderTopLeftRadius: AikidRadius.cardLg,
    borderTopRightRadius: AikidRadius.cardLg,
    borderTopWidth: AikidMetrics.borderWidth.panel,
    borderLeftWidth: AikidMetrics.borderWidth.panel,
    borderRightWidth: AikidMetrics.borderWidth.panel,
    borderColor: AikidFrameColors.white,
  },
  cardCenter: {
    borderRadius: AikidRadius.cardLg,
    borderWidth: AikidMetrics.borderWidth.panel,
    borderColor: AikidFrameColors.white,
  },
  cardPadding: {
    paddingHorizontal: AikidMetrics.modalPadding,
    paddingTop: 8,
  },
  dragHandle: {
    width: 48,
    height: 5,
    borderRadius: AikidRadius.pill,
    backgroundColor: '#E2D9CF',
    alignSelf: 'center',
    marginBottom: 16,
    marginTop: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 8,
  },
  headerText: {
    flex: 1,
    gap: 2,
  },
  titleText: {
    fontFamily: AikidFonts.headingSemi,
    fontSize: 22,
    color: AikidTextColors.heading,
    lineHeight: 30,
  },
  subtitleText: {
    fontFamily: AikidFonts.bodyReg,
    fontSize: 14,
    color: AikidTextColors.body,
    lineHeight: 20,
  },
  closeBtn: {
    width: AikidMetrics.minTouchTarget,
    height: AikidMetrics.minTouchTarget,
    borderRadius: AikidRadius.pill,
    backgroundColor: '#F0ECE6',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
