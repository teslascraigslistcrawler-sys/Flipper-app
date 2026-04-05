import React, { useState, useCallback, useMemo } from 'react';
import {
  View, ScrollView, Text, Image, TouchableOpacity,
  StyleSheet, Alert, Linking,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import ScreenHeader from '../components/ScreenHeader';
import EditableField from '../components/EditableField';
import ProfitBadge from '../components/ProfitBadge';
import ValueRangeDisplay from '../components/ValueRangeDisplay';
import ConfidenceBar from '../components/ConfidenceBar';
import Button from '../components/Button';

import { useLot } from '../context/LotContext';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../theme';
import { calcAll, formatCurrency } from '../utils/profitCalculator';

export default function ResultScreen({ navigation, route }) {
  const { imageUri, analysisResult } = route.params;
  const insets = useSafeAreaInsets();
  const { addItem } = useLot();

  // Editable item fields
  const [name, setName]   = useState(analysisResult.suggestedName || '');
  const [brand, setBrand] = useState(analysisResult.possibleBrand || '');
  const [model, setModel] = useState(analysisResult.possibleModel || '');
  const [buyPrice, setBuyPrice] = useState('');

  // Financials derived from analysis + buy price
  const { valueEstimateMid, fees, profit, roi } = useMemo(() => {
    return calcAll({
      valueEstimateLow:  analysisResult.valueEstimateLow,
      valueEstimateHigh: analysisResult.valueEstimateHigh,
      buyPrice: parseFloat(buyPrice) || 0,
    });
  }, [analysisResult.valueEstimateLow, analysisResult.valueEstimateHigh, buyPrice]);

  const handleAddToLot = useCallback(() => {
    const parsedBuyPrice = parseFloat(buyPrice);
    if (!parsedBuyPrice || parsedBuyPrice <= 0) {
      Alert.alert('Enter Buy Price', 'Please enter what you paid (or will pay) for this item.');
      return;
    }

    addItem({
      imageUri,
      suggestedName: name,
      possibleBrand: brand,
      possibleModel: model,
      category: analysisResult.category,
      buyPrice: parsedBuyPrice,
      valueEstimateLow: analysisResult.valueEstimateLow,
      valueEstimateHigh: analysisResult.valueEstimateHigh,
      valueEstimateMid,
      fees,
      profit,
      roi,
      confidenceScore: analysisResult.confidenceScore,
    });

    Alert.alert(
      'Added to Lot ✓',
      `${name} has been saved to your lot.`,
      [
        { text: 'View Lot', onPress: () => navigation.navigate('Lot') },
        { text: 'Scan Another', onPress: () => navigation.navigate('Camera') },
      ]
    );
  }, [
    buyPrice, name, brand, model, imageUri, analysisResult,
    valueEstimateMid, fees, profit, roi, addItem, navigation,
  ]);

  const handleSearch = useCallback(() => {
    const query = encodeURIComponent(analysisResult.suggestedSearchQuery || `${brand} ${name} resale`);
    Linking.openURL(`https://www.ebay.com/sch/i.html?_nkw=${query}&LH_Sold=1&LH_Complete=1`);
  }, [analysisResult.suggestedSearchQuery, brand, name]);

  const handleScanAnother = useCallback(() => {
    navigation.navigate('Camera');
  }, [navigation]);

  return (
    <View style={styles.container}>
      <ScreenHeader
        title="Item Analysis"
        onBack={() => navigation.goBack()}
        rightAction={{ icon: 'layers-outline', onPress: () => navigation.navigate('Lot') }}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Item image + category chip */}
        <View style={styles.imageRow}>
          <Image source={{ uri: imageUri }} style={styles.thumb} />
          <View style={styles.categoryChip}>
            <Text style={styles.categoryText}>{analysisResult.category}</Text>
          </View>
        </View>

        {/* Confidence */}
        <ConfidenceBar
          score={analysisResult.confidenceScore}
          isMock={analysisResult._isMock}
        />

        {/* Editable item details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Item Details</Text>
          <EditableField label="Item Name" value={name} onChangeText={setName} />
          <EditableField label="Brand" value={brand} onChangeText={setBrand} />
          <EditableField label="Model" value={model} onChangeText={setModel} />
        </View>

        {/* Value range */}
        <ValueRangeDisplay
          low={analysisResult.valueEstimateLow}
          high={analysisResult.valueEstimateHigh}
          mid={valueEstimateMid}
        />

        {/* Buy price input */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Cost</Text>
          <EditableField
            label="Buy Price (what you'll pay)"
            value={buyPrice}
            onChangeText={setBuyPrice}
            keyboardType="decimal-pad"
            prefix="$"
            placeholder="0"
          />
        </View>

        {/* Fee breakdown */}
        <View style={styles.feeRow}>
          <Text style={styles.feeLabel}>Est. Fees (13%)</Text>
          <Text style={styles.feeValue}>{formatCurrency(fees)}</Text>
        </View>

        {/* Profit hero */}
        <ProfitBadge
          profit={profit}
          roi={roi}
          buyPrice={parseFloat(buyPrice) || null}
        />

        {/* Search eBay */}
        <TouchableOpacity style={styles.searchRow} onPress={handleSearch}>
          <Ionicons name="search" size={16} color={COLORS.accent} />
          <Text style={styles.searchText}>Verify on eBay Sold Listings</Text>
          <Ionicons name="open-outline" size={14} color={COLORS.textMuted} />
        </TouchableOpacity>
      </ScrollView>

      {/* Fixed bottom CTA */}
      <View style={[styles.bottomCTA, { paddingBottom: insets.bottom + SPACING.md }]}>
        <Button
          label="Add to Lot"
          onPress={handleAddToLot}
          size="lg"
          style={styles.addBtn}
          icon={<Ionicons name="add" size={20} color={COLORS.background} />}
        />
        <Button
          label="Scan Another"
          onPress={handleScanAnother}
          variant="secondary"
          size="lg"
          style={styles.addBtn}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: SPACING.md,
  },

  // Image
  imageRow: {
    marginBottom: SPACING.md,
    position: 'relative',
  },
  thumb: {
    width: '100%',
    height: 200,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.surfaceHigh,
  },
  categoryChip: {
    position: 'absolute',
    bottom: SPACING.sm,
    left: SPACING.sm,
    backgroundColor: 'rgba(10,10,15,0.8)',
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  categoryText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
  },

  // Sections
  section: {
    marginBottom: SPACING.sm,
  },
  sectionTitle: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    marginBottom: SPACING.md,
  },

  // Fees
  feeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    backgroundColor: COLORS.surfaceHigh,
    borderRadius: RADIUS.sm,
    marginBottom: SPACING.sm,
  },
  feeLabel: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
  },
  feeValue: {
    ...TYPOGRAPHY.subheading,
    color: COLORS.textSecondary,
  },

  // Search link
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.md,
    justifyContent: 'center',
    marginTop: SPACING.sm,
  },
  searchText: {
    ...TYPOGRAPHY.body,
    color: COLORS.accent,
    textDecorationLine: 'underline',
  },

  // Bottom CTA
  bottomCTA: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.background,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  addBtn: {
    flex: 1,
  },
});
