import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, SPACING } from '../theme';

export default function ScreenHeader({
  title,
  onBack,
  rightAction,   // { icon, onPress, label }
  transparent = false,
}) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[
      styles.container,
      { paddingTop: insets.top + SPACING.sm },
      transparent && styles.transparent,
    ]}>
      <View style={styles.row}>
        {onBack ? (
          <TouchableOpacity style={styles.backBtn} onPress={onBack} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Ionicons name="chevron-back" size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
        ) : (
          <View style={styles.placeholder} />
        )}

        <Text style={styles.title}>{title}</Text>

        {rightAction ? (
          <TouchableOpacity style={styles.rightBtn} onPress={rightAction.onPress}>
            {rightAction.icon
              ? <Ionicons name={rightAction.icon} size={22} color={COLORS.accent} />
              : <Text style={styles.rightLabel}>{rightAction.label}</Text>
            }
          </TouchableOpacity>
        ) : (
          <View style={styles.placeholder} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.background,
    paddingBottom: SPACING.md,
    paddingHorizontal: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  transparent: {
    backgroundColor: 'transparent',
    borderBottomColor: 'transparent',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.surfaceHigh,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    ...TYPOGRAPHY.subheading,
    color: COLORS.textPrimary,
    flex: 1,
    textAlign: 'center',
  },
  placeholder: {
    width: 36,
  },
  rightBtn: {
    width: 36,
    alignItems: 'flex-end',
  },
  rightLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.accent,
  },
});
