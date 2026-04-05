import React, { useCallback } from 'react';
import {
  View, Text, FlatList, StyleSheet, Alert, TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import ScreenHeader from '../components/ScreenHeader';
import LotItemCard from '../components/LotItemCard';
import Button from '../components/Button';

import { useLot } from '../context/LotContext';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../theme';
import { formatCurrency } from '../utils/profitCalculator';

export default function LotScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { items, removeItem, clearLot, itemCount, totalInvested, totalEstimatedValue, totalProfit } = useLot();

  const handleClearLot = useCallback(() => {
    Alert.alert(
      'Clear Lot',
      'Remove all items from your lot? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear All', style: 'destructive', onPress: clearLot },
      ]
    );
  }, [clearLot]);

  const handleScanAnother = useCallback(() => {
    navigation.navigate('Camera');
  }, [navigation]);

  const isPositive = totalProfit >= 0;

  return (
    <View style={styles.container}>
      <ScreenHeader
        title={`My Lot (${itemCount})`}
        onBack={() => navigation.goBack()}
        rightAction={
          itemCount > 0
            ? { label: 'Clear', onPress: handleClearLot }
            : undefined
        }
      />

      {/* Summary banner */}
      {itemCount > 0 && (
        <View style={styles.summary}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Invested</Text>
            <Text style={styles.summaryValue}>{formatCurrency(totalInvested)}</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Est. Value</Text>
            <Text style={styles.summaryValue}>{formatCurrency(totalEstimatedValue)}</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Est. Profit</Text>
            <Text style={[styles.summaryValue, { color: isPositive ? COLORS.profit : COLORS.loss }]}>
              {isPositive ? '+' : ''}{formatCurrency(totalProfit)}
            </Text>
          </View>
        </View>
      )}

      {/* Item list */}
      {itemCount === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="layers-outline" size={64} color={COLORS.textMuted} />
          <Text style={styles.emptyTitle}>Your lot is empty</Text>
          <Text style={styles.emptySubtitle}>
            Scan items and add them to your lot to track your buying decisions.
          </Text>
          <Button
            label="Scan First Item"
            onPress={handleScanAnother}
            style={styles.scanBtn}
          />
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <LotItemCard item={item} onRemove={removeItem} />
          )}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: insets.bottom + SPACING.xl },
          ]}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={
            <Button
              label="Scan Another Item"
              onPress={handleScanAnother}
              variant="secondary"
              style={{ marginTop: SPACING.md }}
              icon={<Ionicons name="scan-outline" size={18} color={COLORS.textPrimary} />}
            />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  // Summary
  summary: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingVertical: SPACING.md,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  summaryLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
  },
  summaryValue: {
    ...TYPOGRAPHY.subheading,
    color: COLORS.textPrimary,
    fontSize: 18,
  },
  summaryDivider: {
    width: 1,
    backgroundColor: COLORS.border,
    marginVertical: SPACING.xs,
  },

  // List
  listContent: {
    padding: SPACING.md,
  },

  // Empty state
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
    gap: SPACING.md,
  },
  emptyTitle: {
    ...TYPOGRAPHY.heading,
    color: COLORS.textPrimary,
  },
  emptySubtitle: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  scanBtn: {
    marginTop: SPACING.sm,
    paddingHorizontal: SPACING.xl,
  },
});
