import type { ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { AikidIcon, type AikidIconName } from './AikidIcon';
import { AikidSafeBox } from './AikidSafeBox';
import { AikidText } from './AikidText';

type Props = {
  title: string;
  icon?: AikidIconName;
  actions?: ReactNode;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
};

/**
 * Shared feature panel. Owns the title row, divider, surface and spacing.
 */
export function AikidPanel({
  title,
  icon,
  actions,
  children,
  style,
  contentStyle,
}: Props) {
  return (
    <AikidSafeBox variant="panel" style={[styles.panel, style]}>
      <View style={styles.header}>
        <View style={styles.title}>
          {icon ? <AikidIcon name={icon} size={22} color="#FF7597" /> : null}
          <AikidText variant="title" style={styles.titleText}>{title}</AikidText>
        </View>
        {actions ? <View style={styles.actions}>{actions}</View> : null}
      </View>
      <View style={[styles.content, contentStyle]}>{children}</View>
    </AikidSafeBox>
  );
}

const styles = StyleSheet.create({
  panel: {
    minWidth: 0,
  },
  header: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingBottom: 12,
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EBDCD0',
  },
  title: {
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  titleText: {
    color: '#334155',
    fontSize: 20,
    lineHeight: 26,
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
    gap: 8,
  },
  content: {
    flex: 1,
    minHeight: 0,
  },
});
