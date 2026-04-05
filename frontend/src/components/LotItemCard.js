import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../theme';
import { formatCurrency } from '../utils/profitCalculator';

/**
 * A compact card for displaying a saved lot item.
 */
export default function LotItemCard({ item, onRemove }) {
  const isProfit = item.profit >= 0;

  return (
    <View style={styles.card}>
      {item.imageUri ? (
        <Image source={{ uri: item.imageUri }} style={styles.thumb} />
      ) : (
        <View style={styles.thumbPlaceholder}>
          <Ionicons name="cube-outline" size={24} color={COLORS.textMuted} />
        </View>
      )}

      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>{item.suggestedName}</Text>
        <Text style={styles.brand} numberOfLines={1}>{item.possibleBrand} · {item.category}</Text>
        <View style={styles.financials}>
          <Text style={styles.bought}>Paid {formatCurrency(item.buyPrice)}</Text>
          <Text style={[styles.profit, { color: isProfit ? COLORS.profit : COLORS.loss }]}>
            {isProfit ? '+' : ''}{formatCurrency(item.profit)}
          </Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.removeBtn}
        onPress={() => onRemove(item.id)}
        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
      >
        <Ionicons name="close" size={18} color={COLORS.textMuted} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: SPACING.md,
  },
  thumb: {
    width: 56,
    height: 56,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.surfaceHigh,
  },
  thumbPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.surfaceHigh,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
    gap: 3,
  },
  name: {
    ...TYPOGRAPHY.subheading,
    color: COLORS.textPrimary,
  },
  brand: {
    ...TYPOGRAPHY.micro,
    color: COLORS.textSecondary,
  },
  financials: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    marginTop: 4,
  },
  bought: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
  },
  profit: {
    ...TYPOGRAPHY.caption,
    fontWeight: '700',
  },
  removeBtn: {
    padding: SPACING.xs,
  },
});
