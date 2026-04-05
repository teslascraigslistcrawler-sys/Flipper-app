import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../theme';
import { formatCurrency } from '../utils/profitCalculator';

/**
 * Displays estimated value range with a visual slider-style bar.
 */
export default function ValueRangeDisplay({ low, high, mid }) {
  return (
    <View style={styles.container}>
      <Text style={styles.sectionLabel}>ESTIMATED RESALE VALUE</Text>
      <View style={styles.rangeRow}>
        <View style={styles.rangeBox}>
          <Text style={styles.rangeLabel}>LOW</Text>
          <Text style={styles.rangeValue}>{formatCurrency(low)}</Text>
        </View>

        <View style={styles.midBox}>
          <Text style={styles.midLabel}>MID</Text>
          <Text style={styles.midValue}>{formatCurrency(mid)}</Text>
        </View>

        <View style={[styles.rangeBox, styles.rangeBoxRight]}>
          <Text style={styles.rangeLabel}>HIGH</Text>
          <Text style={styles.rangeValue}>{formatCurrency(high)}</Text>
        </View>
      </View>

      {/* Visual range bar */}
      <View style={styles.track}>
        <View style={styles.fill} />
        <View style={styles.midDot} />
      </View>

      <Text style={styles.note}>Based on recent sold listings</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surfaceHigh,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  sectionLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    marginBottom: SPACING.md,
  },
  rangeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  rangeBox: {
    flex: 1,
  },
  rangeBoxRight: {
    alignItems: 'flex-end',
  },
  rangeLabel: {
    ...TYPOGRAPHY.micro,
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  rangeValue: {
    ...TYPOGRAPHY.heading,
    color: COLORS.textPrimary,
    fontSize: 18,
  },
  midBox: {
    flex: 1,
    alignItems: 'center',
  },
  midLabel: {
    ...TYPOGRAPHY.micro,
    color: COLORS.accent,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  midValue: {
    ...TYPOGRAPHY.heading,
    color: COLORS.accent,
    fontSize: 22,
  },
  track: {
    height: 4,
    backgroundColor: COLORS.border,
    borderRadius: RADIUS.full,
    marginBottom: SPACING.sm,
    position: 'relative',
    justifyContent: 'center',
  },
  fill: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: '100%',
    backgroundColor: COLORS.surfaceHigh,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.accent,
  },
  midDot: {
    position: 'absolute',
    alignSelf: 'center',
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.accent,
    borderWidth: 2,
    borderColor: COLORS.background,
  },
  note: {
    ...TYPOGRAPHY.micro,
    color: COLORS.textMuted,
  },
});
