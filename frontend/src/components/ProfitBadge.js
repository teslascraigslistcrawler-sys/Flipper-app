import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../theme';
import { formatCurrency } from '../utils/profitCalculator';

/**
 * Large hero display for profit value.
 * Changes color and label based on profit sentiment.
 */
export default function ProfitBadge({ profit, roi, buyPrice }) {
  const hasBuyPrice = buyPrice !== null && buyPrice !== undefined && buyPrice !== '' && Number(buyPrice) > 0;

  const sentiment = getSentiment(profit, hasBuyPrice);
  const colors = SENTIMENT_COLORS[sentiment];

  return (
    <View style={[styles.container, { backgroundColor: colors.bg, borderColor: colors.border }]}>
      <Text style={styles.label}>{SENTIMENT_LABELS[sentiment]}</Text>
      <Text style={[styles.profitValue, { color: colors.text }]}>
        {hasBuyPrice ? formatCurrency(profit) : '—'}
      </Text>
      {hasBuyPrice && roi !== null && (
        <View style={[styles.roiBadge, { backgroundColor: colors.roiBg }]}>
          <Text style={[styles.roiText, { color: colors.text }]}>
            {roi >= 0 ? '+' : ''}{roi}% ROI
          </Text>
        </View>
      )}
      {!hasBuyPrice && (
        <Text style={styles.hint}>Enter buy price to see profit</Text>
      )}
    </View>
  );
}

function getSentiment(profit, hasBuyPrice) {
  if (!hasBuyPrice) return 'neutral';
  if (profit >= 30) return 'good';
  if (profit > 0) return 'ok';
  return 'bad';
}

const SENTIMENT_LABELS = {
  neutral: 'ESTIMATED PROFIT',
  good:    '✓ GREAT FLIP',
  ok:      '~ MARGINAL FLIP',
  bad:     '✗ PASS ON THIS',
};

const SENTIMENT_COLORS = {
  neutral: {
    bg:     'rgba(136,136,170,0.08)',
    border: COLORS.border,
    text:   COLORS.textSecondary,
    roiBg:  'rgba(136,136,170,0.15)',
  },
  good: {
    bg:     'rgba(0,229,160,0.08)',
    border: 'rgba(0,229,160,0.3)',
    text:   COLORS.profit,
    roiBg:  'rgba(0,229,160,0.15)',
  },
  ok: {
    bg:     'rgba(255,181,71,0.08)',
    border: 'rgba(255,181,71,0.3)',
    text:   COLORS.warning,
    roiBg:  'rgba(255,181,71,0.15)',
  },
  bad: {
    bg:     'rgba(255,77,106,0.08)',
    border: 'rgba(255,77,106,0.3)',
    text:   COLORS.loss,
    roiBg:  'rgba(255,77,106,0.15)',
  },
};

const styles = StyleSheet.create({
  container: {
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    padding: SPACING.lg,
    alignItems: 'center',
    marginVertical: SPACING.md,
  },
  label: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    marginBottom: SPACING.xs,
  },
  profitValue: {
    ...TYPOGRAPHY.hero,
    marginBottom: SPACING.sm,
  },
  roiBadge: {
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
  },
  roiText: {
    ...TYPOGRAPHY.caption,
    fontWeight: '700',
  },
  hint: {
    ...TYPOGRAPHY.micro,
    color: COLORS.textMuted,
    marginTop: SPACING.xs,
  },
});
