import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { theme } from '@/src/theme';
import { useData } from '@/src/contexts/DataContext';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function CameraScreen() {
  const { addError } = useData();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('权限不足', '需要相机权限才能拍照');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const handleManualInput = () => {
    // Navigate to extract with manual input mode
    router.push('/extract');
  };

  const handleConfirm = () => {
    // For now, just navigate to extract page
    if (selectedImage) {
      router.push('/extract');
    } else {
      Alert.alert('提示', '请先选择照片或拍照');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        <View style={styles.nav}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={20} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={styles.navTitle}>收集错题</Text>
        </View>

        {selectedImage ? (
          <View style={styles.imageContainer}>
            <Text style={styles.imageLabel}>已选择照片</Text>
            {/* We'd show the actual image here, but for simplicity just a placeholder */}
            <View style={styles.imagePreview}>
              <Text style={styles.imagePreviewText}>已选择照片，点击确认</Text>
            </View>
          </View>
        ) : (
          <TouchableOpacity style={styles.cameraView} onPress={pickImage}>
            <Ionicons name="camera-outline" size={48} color={theme.colors.textSecondary} />
            <Text style={styles.cameraText}>拍照或选择照片</Text>
          </TouchableOpacity>
        )}

        <View style={styles.actions}>
          <TouchableOpacity style={styles.actionBtn} onPress={takePhoto}>
            <Ionicons name="camera" size={20} color={theme.colors.text} />
            <Text style={styles.actionText}>拍照</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={pickImage}>
            <Ionicons name="images" size={20} color={theme.colors.text} />
            <Text style={styles.actionText}>相册</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={handleManualInput}>
            <Ionicons name="create" size={20} color={theme.colors.text} />
            <Text style={styles.actionText}>手动输入</Text>
          </TouchableOpacity>
        </View>

        {selectedImage && (
          <TouchableOpacity style={styles.confirmBtn} onPress={handleConfirm}>
            <Text style={styles.confirmBtnText}>确认并识别</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.colors.bg },
  container: { flex: 1 },
  nav: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    backgroundColor: theme.colors.card,
  },
  backBtn: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  navTitle: { fontSize: theme.fontSize['2xl'], fontWeight: '600', flex: 1, marginLeft: theme.spacing.md },
  cameraView: {
    margin: theme.spacing.xl,
    height: 240,
    borderWidth: 2,
    borderColor: theme.colors.border,
    borderStyle: 'dashed',
    borderRadius: theme.radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
  },
  cameraText: { fontSize: theme.fontSize.lg, color: theme.colors.textSecondary },
  actions: { flexDirection: 'row', gap: theme.spacing.sm, paddingHorizontal: theme.spacing.xl },
  actionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: theme.spacing.sm, paddingVertical: theme.spacing.lg, borderWidth: 1, borderColor: theme.colors.border, borderRadius: theme.radius.sm, backgroundColor: theme.colors.card },
  actionText: { fontSize: theme.fontSize.lg, fontWeight: '500' },
  confirmBtn: { marginHorizontal: theme.spacing.xl, marginTop: theme.spacing.lg, paddingVertical: theme.spacing.lg, backgroundColor: theme.colors.accent, borderRadius: theme.radius.sm, alignItems: 'center' },
  confirmBtnText: { color: 'white', fontSize: theme.fontSize.xl, fontWeight: '600' },
  imageContainer: { margin: theme.spacing.xl },
  imageLabel: { fontSize: theme.fontSize.sm, color: theme.colors.textSecondary, marginBottom: theme.spacing.sm },
  imagePreview: { height: 200, backgroundColor: theme.colors.accentLight, borderRadius: theme.radius.sm, alignItems: 'center', justifyContent: 'center' },
  imagePreviewText: { color: theme.colors.textSecondary, fontSize: theme.fontSize.lg },
});
