import React, { useState } from 'react';
import { View, Image, StyleSheet, Text, TouchableOpacity, Platform } from 'react-native';
import Slider from '@react-native-community/slider';
import * as ImageManipulator from 'expo-image-manipulator';

type Props = {
  imageUri: string;
  onCancel: () => void;
  onCrop: (uri: string) => void;
};

export default function ImageCropper({ imageUri, onCancel, onCrop }: Props) {
  const [scale, setScale] = useState(1);

  const handleCrop = async () => {
    try {
      // Center square crop based on smallest dimension
      const result = await ImageManipulator.manipulateAsync(
        imageUri,
        [
          {
            crop: {
              originX: 0,
              originY: 0,
              width: 1000,
              height: 1000,
            },
          },
          { resize: { width: Math.round(1000 * scale), height: Math.round(1000 * scale) } },
        ],
        { compress: 0.9, format: ImageManipulator.SaveFormat.JPEG }
      );

      onCrop(result.uri);
    } catch (err) {
      console.error('crop failed', err);
      onCancel();
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.previewWrapper}>
        <Image source={{ uri: imageUri }} style={[styles.image, { transform: [{ scale }] }]} resizeMode="cover" />
      </View>

      <View style={styles.controls}>
        <Text style={styles.label}>Zoom</Text>
        {/* Slider from react-native may be platform-specific; fallback to simple +/- */}
        {Platform.OS !== 'web' ? (
          <Slider value={scale} onValueChange={setScale} minimumValue={0.5} maximumValue={2} step={0.01} style={styles.slider} />
        ) : (
          <View style={styles.zoomRow}>
            <TouchableOpacity onPress={() => setScale(s => Math.max(0.5, +(s - 0.1).toFixed(2)))} style={styles.zoomBtn}><Text>-</Text></TouchableOpacity>
            <Text style={styles.scaleText}>{scale.toFixed(2)}</Text>
            <TouchableOpacity onPress={() => setScale(s => Math.min(2, +(s + 0.1).toFixed(2)))} style={styles.zoomBtn}><Text>+</Text></TouchableOpacity>
          </View>
        )}

        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.cancelBtn} onPress={onCancel}><Text style={styles.cancelText}>Cancel</Text></TouchableOpacity>
          <TouchableOpacity style={styles.cropBtn} onPress={handleCrop}><Text style={styles.cropText}>Crop</Text></TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  buttonRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 },
  cancelBtn: { backgroundColor: '#F3F4F6', borderRadius: 8, padding: 12 },
  cancelText: { color: '#374151' },
  container: { backgroundColor: '#fff', borderRadius: 12, overflow: 'hidden' },
  controls: { padding: 12 },
  cropBtn: { backgroundColor: '#0d9488', borderRadius: 8, padding: 12 },
  cropText: { color: '#fff', fontWeight: '700' },
  image: { height: '100%', width: '100%' },
  label: { color: '#6b7280', marginBottom: 8 },
  previewWrapper: { alignItems: 'center', backgroundColor: '#000', height: 320, justifyContent: 'center' },
  scaleText: { fontWeight: '700' },
  slider: { width: '100%' },
  zoomBtn: { backgroundColor: '#F3F4F6', borderRadius: 6, marginHorizontal: 8, padding: 8 },
  zoomRow: { alignItems: 'center', flexDirection: 'row', justifyContent: 'center' },
});