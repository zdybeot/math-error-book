import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { theme } from '@/src/theme';
import { setPendingPhoto } from '@/src/contexts/DataContext';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function CameraScreen() {
  const [picking, setPicking] = useState(false);

  useEffect(() => {
    pickSource();
  }, []);

  const pickSource = () => {
    Alert.alert('选择照片来源', '', [
      {
        text: '拍照',
        onPress: () => takePhoto(),
      },
      {
        text: '从相册选择',
        onPress: () => pickImage(),
      },
      {
        text: '手动输入',
        onPress: () => {
          setPicking(false);
          setPendingPhoto(null);
          router.replace('/extract');
        },
      },
      {
        text: '取消',
        onPress: () => {
          setPicking(false);
          router.back();
        },
        style: 'cancel',
      },
    ]);
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('权限不足', '需要相机权限才能拍照', [
        { text: '确定', onPress: () => { setPicking(false); router.back(); } },
      ]);
      return;
    }

    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.8,
      });

      setPicking(false);

      if (!result.canceled && result.assets[0]) {
        setPendingPhoto(result.assets[0].uri);
        router.replace('/extract');
      } else {
        router.back();
      }
    } catch {
      setPicking(false);
      router.back();
    }
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.8,
      });

      setPicking(false);

      if (!result.canceled && result.assets[0]) {
        setPendingPhoto(result.assets[0].uri);
        router.replace('/extract');
      } else {
        router.back();
      }
    } catch {
      setPicking(false);
      router.back();
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        <View style={styles.nav}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={20} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={styles.navTitle}>拍照录入</Text>
        </View>

        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={theme.colors.accent} />
          <Text style={styles.loadingText}>正在调起相机...</Text>
        </View>
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
  centerContent: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: theme.spacing.md },
  loadingText: { fontSize: theme.fontSize.base, color: theme.colors.textSecondary },
});
