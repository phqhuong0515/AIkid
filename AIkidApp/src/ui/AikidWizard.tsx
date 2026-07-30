import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { AikidSafeBox } from './AikidSafeBox';
import { AikidText } from './AikidText';

type Props = {
  step: number;
  total: number;
  badge?: string;
  children: ReactNode;
  footer?: ReactNode;
  showProgress?: boolean;
};

/** Shared compact frame for multi-step creation flows. */
export function AikidWizard({ step, total, badge, children, footer, showProgress = true }: Props) {
  const progress = `${Math.min(100, Math.max(0, (step / total) * 100))}%` as `${number}%`;

  return (
    <AikidSafeBox variant="panel" style={styles.frame}>
      {showProgress ? <View style={styles.progressHeader}>
        <View style={styles.progressRow}>
          <AikidText variant="brand">Bước {step}/{total}</AikidText>
          {badge ? (
            <View style={styles.badge}>
              <AikidText variant="caption" style={styles.badgeText}>{badge}</AikidText>
            </View>
          ) : null}
        </View>
        <View style={styles.track}>
          <LinearGradient
            colors={['#FF9EB5', '#FF9040']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.fill, { width: progress }]}
          />
        </View>
      </View> : null}
      <View style={styles.content}>{children}</View>
      {footer ? <View style={styles.footer}>{footer}</View> : null}
    </AikidSafeBox>
  );
}

const styles = StyleSheet.create({
  frame: {
    width: '100%',
    alignSelf: 'center',
    minHeight: 0,
  },
  progressHeader: {
    gap: 8,
    marginBottom: 20,
  },
  progressRow: {
    minHeight: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  badge: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: '#E8F5F0',
  },
  badgeText: {
    color: '#25845F',
    fontFamily: 'Mali_600SemiBold',
  },
  track: {
    height: 8,
    borderRadius: 999,
    overflow: 'hidden',
    backgroundColor: '#E8EDF5',
  },
  fill: {
    height: '100%',
    borderRadius: 999,
  },
  content: {
    minHeight: 320,
  },
  footer: {
    minHeight: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#EBDCD0',
  },
});
