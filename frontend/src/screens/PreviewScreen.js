import React, { useCallback } from 'react';
import {
  View, Image, StyleSheet, Text, ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ScreenHeader from '../components/ScreenHeader';
import Button from '../components/Button';
import { useAnalyzeItem } from '../hooks/useAnalyzeItem';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../theme';

export default function PreviewScreen({ navigation, route }) {
  const { imageUri, mimeType } = route.params;
  const insets = useSafeAreaInsets();
  const { analyze, isLoading, error } = useAnalyzeItem();

  const handleAnalyze = useCallback(async () => {
    const result = await analyze(imageUri, mimeType);
    if (result) {
      navigation.navigate('Result', { imageUri, analysisResult: result });
    }
  }, [analyze, imageUri, mimeType, navigation]);

  const handleRetake = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  return (
    <View style={styles.container}>
      <ScreenHeader
        title="Preview"
        onBack={handleRetake}
        transparent
      />

      {/* Full image preview */}
      <View style={styles.imageContainer}>
        <Image source={{ uri: imageUri }} style={styles.image} resizeMode="contain" />

        {/* Loading overlay */}
        {isLoading && (
          <View style={styles.loadingOverlay}>
            <View style={styles.loadingCard}>
              <ActivityIndicator size="large" color={COLORS.accent} />
              <Text style={styles.loadingTitle}>Analyzing Item</Text>
              <Text style={styles.loadingSubtitle}>Reading labels, brand & value signals...</Text>
            </View>
          </View>
        )}
      </View>

      {/* Bottom actions */}
      <View style={[styles.bottomSheet, { paddingBottom: insets.bottom + SPACING.md }]}>
        {error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>⚠ {error}</Text>
          </View>
        )}

        <Button
          label={error ? 'Retry Analysis' : 'Analyze Item'}
          onPress={handleAnalyze}
          loading={isLoading}
          disabled={isLoading}
          size="lg"
          style={styles.analyzeBtn}
        />

        <Button
          label="Retake Photo"
          onPress={handleRetake}
          variant="ghost"
          disabled={isLoading}
          size="md"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.black,
  },
  imageContainer: {
    flex: 1,
    position: 'relative',
  },
  image: {
    flex: 1,
    width: '100%',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(10,10,15,0.85)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingCard: {
    alignItems: 'center',
    gap: SPACING.md,
    padding: SPACING.xl,
  },
  loadingTitle: {
    ...TYPOGRAPHY.heading,
    color: COLORS.textPrimary,
  },
  loadingSubtitle: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  bottomSheet: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    padding: SPACING.lg,
    paddingTop: SPACING.xl,
    gap: SPACING.sm,
  },
  errorBox: {
    backgroundColor: 'rgba(255,77,106,0.12)',
    borderRadius: RADIUS.sm,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: 'rgba(255,77,106,0.3)',
  },
  errorText: {
    ...TYPOGRAPHY.body,
    color: COLORS.loss,
  },
  analyzeBtn: {
    width: '100%',
  },
});
