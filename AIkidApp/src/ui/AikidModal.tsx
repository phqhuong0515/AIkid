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
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Pressable,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  AikidFrameColors,
  AikidRadius,
  AikidShadows,
  AikidTextColors,
  AikidFonts,
} from '@/features/kids-ui/theme';

type ModalPosition = 'bottom' | 'center';

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
  maxWidth = 560,
  noPadding = false,
  children,
}: AikidModalProps) {
  const insets = useSafeAreaInsets();
  const isBottom = position === 'bottom';

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
            { paddingBottom: Math.max(insets.bottom, 20) },
            { maxWidth },
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
                  <Text style={styles.titleText}>{title}</Text>
                )}
                {subtitle && (
                  <Text style={styles.subtitleText}>{subtitle}</Text>
                )}
              </View>
              <TouchableOpacity
                onPress={onClose}
                style={styles.closeBtn}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Text style={styles.closeBtnText}>×</Text>
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
    ...StyleSheet.absoluteFillObject,
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
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderRightWidth: 4,
    borderColor: AikidFrameColors.white,
  },
  cardCenter: {
    borderRadius: AikidRadius.cardLg,
    borderWidth: 6,
    borderColor: AikidFrameColors.white,
  },
  cardPadding: {
    paddingHorizontal: 24,
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
    width: 36,
    height: 36,
    borderRadius: AikidRadius.pill,
    backgroundColor: '#F0ECE6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    fontSize: 22,
    lineHeight: 28,
    color: AikidTextColors.body,
    fontWeight: '400',
  },
});
