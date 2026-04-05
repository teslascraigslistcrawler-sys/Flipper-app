import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet, View } from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../theme';

/**
 * Primary button component.
 * Variants: 'primary' | 'secondary' | 'ghost' | 'danger'
 */
export default function Button({
  label,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  icon = null,
  style,
  labelStyle,
  size = 'md',
}) {
  const isDisabled = disabled || loading;

  const containerStyle = [
    styles.base,
    styles[variant],
    styles[`size_${size}`],
    isDisabled && styles.disabled,
    style,
  ];

  const textStyle = [
    styles.label,
    styles[`label_${variant}`],
    styles[`labelSize_${size}`],
    labelStyle,
  ];

  return (
    <TouchableOpacity
      style={containerStyle}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.75}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'primary' ? COLORS.background : COLORS.accent}
          size="small"
        />
      ) : (
        <View style={styles.inner}>
          {icon && <View style={styles.iconWrap}>{icon}</View>}
          <Text style={textStyle}>{label}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  iconWrap: {
    marginRight: 2,
  },

  // Variants
  primary: {
    backgroundColor: COLORS.accent,
  },
  secondary: {
    backgroundColor: COLORS.surfaceHigh,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  danger: {
    backgroundColor: COLORS.loss,
  },

  // Sizes
  size_sm: { paddingVertical: SPACING.sm, paddingHorizontal: SPACING.md, borderRadius: RADIUS.sm },
  size_md: { paddingVertical: 14, paddingHorizontal: SPACING.lg },
  size_lg: { paddingVertical: 18, paddingHorizontal: SPACING.xl },

  // Labels
  label: {
    ...TYPOGRAPHY.subheading,
  },
  label_primary:   { color: COLORS.background },
  label_secondary: { color: COLORS.textPrimary },
  label_ghost:     { color: COLORS.accent },
  label_danger:    { color: COLORS.white },

  labelSize_sm: { fontSize: 13, fontWeight: '600' },
  labelSize_md: { fontSize: 15, fontWeight: '700' },
  labelSize_lg: { fontSize: 17, fontWeight: '700' },

  disabled: {
    opacity: 0.4,
  },
});
