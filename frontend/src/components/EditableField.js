import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../theme';

/**
 * A field that looks like a label but becomes an input when tapped.
 * Signals editability with a subtle pencil icon.
 */
export default function EditableField({
  label,
  value,
  onChangeText,
  placeholder = '—',
  keyboardType = 'default',
  prefix = '',       // e.g. '$' for currency fields
  style,
  valueStyle,
  multiline = false,
}) {
  const [focused, setFocused] = useState(false);

  return (
    <View style={[styles.container, style]}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.inputRow, focused && styles.inputRowFocused]}>
        {prefix ? <Text style={styles.prefix}>{prefix}</Text> : null}
        <TextInput
          style={[styles.input, valueStyle]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={COLORS.textMuted}
          keyboardType={keyboardType}
          returnKeyType="done"
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          multiline={multiline}
          selectTextOnFocus
        />
        <Ionicons
          name="pencil"
          size={12}
          color={focused ? COLORS.accent : COLORS.textMuted}
          style={styles.pencil}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.md,
  },
  label: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    marginBottom: SPACING.xs,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.inputBg,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    borderRadius: RADIUS.sm,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm + 2,
  },
  inputRowFocused: {
    borderColor: COLORS.inputFocus,
  },
  prefix: {
    ...TYPOGRAPHY.subheading,
    color: COLORS.textSecondary,
    marginRight: 4,
  },
  input: {
    flex: 1,
    ...TYPOGRAPHY.subheading,
    color: COLORS.textPrimary,
    padding: 0,
  },
  pencil: {
    marginLeft: SPACING.sm,
  },
});
