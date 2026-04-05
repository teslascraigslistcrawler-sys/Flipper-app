import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../theme';

/**
 * Visual bar showing Vision API confidence score.
 */
export default function ConfidenceBar({ score, isMock }) {
  const pct = Math.round((score || 0) * 100);

  const barColor =
    pct >= 70 ? COLORS.profit :
    pct >= 40 ? COLORS.warning :
    COLORS.loss;

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Text style={styles.label}>
          AI Confidence{isMock ? ' (Demo)' : ''}
        </Text>
        <Text style={[styles.pct, { color: barColor }]}>{pct}%</Text>
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${pct}%`, backgroundColor: barColor }]} />
      </View>
      {isMock && (
        <Text style={styles.mockNote}>Using demo data — connect Vision API for real results</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.md,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.xs,
  },
  label: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
  },
  pct: {
    ...TYPOGRAPHY.caption,
    fontWeight: '700',
  },
  track: {
    height: 4,
    backgroundColor: COLORS.border,
    borderRadius: RADIUS.full,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: RADIUS.full,
  },
  mockNote: {
    ...TYPOGRAPHY.micro,
    color: COLORS.warning,
    marginTop: SPACING.xs,
  },
});
