import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Alert, Platform,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLot } from '../context/LotContext';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../theme';

export default function CameraScreen({ navigation }) {
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState('back');
  const [flash, setFlash] = useState('off');
  const cameraRef = useRef(null);
  const insets = useSafeAreaInsets();
  const { itemCount } = useLot();

  const handlePermissionRequest = useCallback(async () => {
    const result = await requestPermission();
    if (!result.granted) {
      Alert.alert(
        'Camera Access Needed',
        'Flipper needs camera access to scan items. Enable it in Settings.',
        [{ text: 'OK' }]
      );
    }
  }, [requestPermission]);

  useEffect(() => {
    if (permission && !permission.granted) {
      handlePermissionRequest();
    }
  }, [permission, handlePermissionRequest]);

  const handleCapture = useCallback(async () => {
    if (!cameraRef.current) return;
    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.85,
        skipProcessing: false,
      });
      navigation.navigate('Preview', { imageUri: photo.uri, mimeType: 'image/jpeg' });
    } catch (err) {
      Alert.alert('Capture Failed', 'Could not take photo. Please try again.');
    }
  }, [navigation]);

  const handleGalleryPick = useCallback(async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Allow photo library access to pick images.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.85,
      allowsEditing: false,
    });

    if (!result.canceled && result.assets?.[0]) {
      const asset = result.assets[0];
      navigation.navigate('Preview', {
        imageUri: asset.uri,
        mimeType: asset.mimeType || 'image/jpeg',
      });
    }
  }, [navigation]);

  if (!permission) {
    return <View style={styles.centered}><Text style={styles.permText}>Checking camera...</Text></View>;
  }

  if (!permission.granted) {
    return (
      <View style={styles.centered}>
        <Ionicons name="camera-outline" size={64} color={COLORS.textMuted} />
        <Text style={styles.permText}>Camera access required</Text>
        <TouchableOpacity style={styles.permBtn} onPress={handlePermissionRequest}>
          <Text style={styles.permBtnText}>Grant Access</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        facing={facing}
        flash={flash}
      />

      {/* Top bar */}
      <View style={[styles.topBar, { paddingTop: insets.top + SPACING.sm }]}>
        <View style={styles.logoRow}>
          <Text style={styles.logo}>FLIPPER</Text>
          <Text style={styles.logoTag}>resale intel</Text>
        </View>

        {/* Lot badge */}
        <TouchableOpacity
          style={styles.lotBadge}
          onPress={() => navigation.navigate('Lot')}
          activeOpacity={0.8}
        >
          <Ionicons name="layers-outline" size={18} color={COLORS.textPrimary} />
          {itemCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{itemCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Scanning reticle */}
      <View style={styles.reticleContainer} pointerEvents="none">
        <View style={styles.reticle}>
          <View style={[styles.corner, styles.topLeft]} />
          <View style={[styles.corner, styles.topRight]} />
          <View style={[styles.corner, styles.bottomLeft]} />
          <View style={[styles.corner, styles.bottomRight]} />
        </View>
        <Text style={styles.reticleHint}>Center the item in frame</Text>
      </View>

      {/* Bottom controls */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + SPACING.lg }]}>
        {/* Gallery */}
        <TouchableOpacity style={styles.sideBtn} onPress={handleGalleryPick}>
          <Ionicons name="images-outline" size={26} color={COLORS.textPrimary} />
          <Text style={styles.sideBtnLabel}>Gallery</Text>
        </TouchableOpacity>

        {/* Shutter */}
        <TouchableOpacity style={styles.shutter} onPress={handleCapture} activeOpacity={0.8}>
          <View style={styles.shutterInner} />
        </TouchableOpacity>

        {/* Flash + flip */}
        <View style={styles.sideControls}>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => setFlash(f => f === 'off' ? 'on' : 'off')}
          >
            <Ionicons
              name={flash === 'on' ? 'flash' : 'flash-off'}
              size={22}
              color={flash === 'on' ? COLORS.accent : COLORS.textPrimary}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => setFacing(f => f === 'back' ? 'front' : 'back')}
          >
            <Ionicons name="camera-reverse-outline" size={22} color={COLORS.textPrimary} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const CORNER_SIZE = 22;
const CORNER_THICKNESS = 3;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.black,
  },
  centered: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.lg,
    padding: SPACING.xl,
  },
  permText: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  permBtn: {
    backgroundColor: COLORS.accent,
    paddingVertical: 14,
    paddingHorizontal: SPACING.xl,
    borderRadius: RADIUS.md,
  },
  permBtnText: {
    ...TYPOGRAPHY.subheading,
    color: COLORS.background,
    fontWeight: '700',
  },

  // Top bar
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  logo: {
    fontSize: 20,
    fontWeight: '900',
    color: COLORS.accent,
    letterSpacing: 2,
  },
  logoTag: {
    ...TYPOGRAPHY.micro,
    color: COLORS.textMuted,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  lotBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: COLORS.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.background,
  },

  // Reticle
  reticleContainer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reticle: {
    width: 260,
    height: 260,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: CORNER_SIZE,
    height: CORNER_SIZE,
    borderColor: COLORS.accent,
  },
  topLeft:     { top: 0, left: 0, borderTopWidth: CORNER_THICKNESS, borderLeftWidth: CORNER_THICKNESS },
  topRight:    { top: 0, right: 0, borderTopWidth: CORNER_THICKNESS, borderRightWidth: CORNER_THICKNESS },
  bottomLeft:  { bottom: 0, left: 0, borderBottomWidth: CORNER_THICKNESS, borderLeftWidth: CORNER_THICKNESS },
  bottomRight: { bottom: 0, right: 0, borderBottomWidth: CORNER_THICKNESS, borderRightWidth: CORNER_THICKNESS },
  reticleHint: {
    ...TYPOGRAPHY.micro,
    color: 'rgba(255,255,255,0.6)',
    marginTop: SPACING.md,
    letterSpacing: 0.5,
  },

  // Bottom bar
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.xl,
  },
  sideBtn: {
    alignItems: 'center',
    gap: 4,
    width: 64,
  },
  sideBtnLabel: {
    ...TYPOGRAPHY.micro,
    color: COLORS.textSecondary,
  },
  shutter: {
    width: 78,
    height: 78,
    borderRadius: 39,
    borderWidth: 4,
    borderColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shutterInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.white,
  },
  sideControls: {
    width: 64,
    gap: SPACING.sm,
    alignItems: 'center',
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
