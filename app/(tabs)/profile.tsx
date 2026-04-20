import React, { useState } from 'react';
import {
  StyleSheet, Text, View, ScrollView, TouchableOpacity, Alert, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Linking from 'expo-linking';
import { theme } from '@/src/theme';
import { getCurrentVersion, checkForUpdate, VersionInfo } from '@/src/services/version';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function ProfileScreen() {
  const [checking, setChecking] = useState(false);
  const currentVersion = getCurrentVersion();

  /** 检查新版本 */
  const handleCheckUpdate = async () => {
    setChecking(true);
    try {
      const update = await checkForUpdate();
      if (!update) {
        Alert.alert('已是最新版本', `当前版本 v${currentVersion}，无需更新`);
        return;
      }

      // 弹出更新对话框
      Alert.alert(
        `发现新版本 v${update.version}`,
        update.releaseNotes || '建议更新以获得更好的体验',
        [
          { text: '暂不更新', style: 'cancel' },
          {
            text: '立即下载',
            onPress: () => handleDownloadUpdate(update),
          },
        ]
      );
    } catch (e: any) {
      Alert.alert('检查失败', e?.message || '网络连接异常，请稍后重试');
    } finally {
      setChecking(false);
    }
  };

  /** 下载更新 */
  const handleDownloadUpdate = async (update: VersionInfo) => {
    if (update.downloadUrl) {
      // 有直接下载链接，在浏览器中打开
      Linking.openURL(update.downloadUrl);
    } else {
      // 没有下载链接时，打开 GitHub releases 页面
      Linking.openURL('https://github.com/zdybeot/math-error-book/releases');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* 头部 */}
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Ionicons name="book" size={32} color={theme.colors.card} />
          </View>
          <Text style={styles.headerTitle}>数学错题本</Text>
        </View>

        {/* 版本信息 */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>版本信息</Text>
          <View style={styles.versionRow}>
            <Text style={styles.versionLabel}>当前版本</Text>
            <Text style={styles.versionValue}>v{currentVersion}</Text>
          </View>

          <TouchableOpacity
            style={[styles.updateBtn, checking && styles.updateBtnDisabled]}
            onPress={handleCheckUpdate}
            disabled={checking}
          >
            {checking ? (
              <ActivityIndicator size="small" color={theme.colors.accent} />
            ) : (
              <>
                <Ionicons name="download-outline" size={20} color={theme.colors.accent} />
                <Text style={styles.updateBtnText}>检查更新</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* 使用说明 */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>使用说明</Text>
          <Text style={styles.hintText}>
            1. 拍照录入错题，AI 自动识别题目内容{'\n'}
            2. 查看错题详情，标记掌握状态{'\n'}
            3. 延伸练习，AI 生成相似题目巩固知识{'\n'}
            4. 切换学期，管理不同学期的错题数据
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.colors.bg },
  header: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xxl,
    backgroundColor: theme.colors.card,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: theme.colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { fontSize: theme.fontSize['3xl'], fontWeight: '700', marginTop: theme.spacing.md },

  card: {
    marginHorizontal: theme.spacing.lg,
    marginTop: theme.spacing.lg,
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.sm,
    padding: theme.spacing.lg,
  },
  cardTitle: { fontSize: theme.fontSize.lg, fontWeight: '600', marginBottom: theme.spacing.md },

  versionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
  },
  versionLabel: { fontSize: theme.fontSize.base, color: theme.colors.textSecondary },
  versionValue: { fontSize: theme.fontSize.base, fontWeight: '600' },

  updateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.md,
    paddingVertical: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.accent,
    borderRadius: theme.radius.sm,
  },
  updateBtnDisabled: { opacity: 0.6 },
  updateBtnText: { fontSize: theme.fontSize.lg, color: theme.colors.accent, fontWeight: '600' },

  hintText: { fontSize: theme.fontSize.base, color: theme.colors.textSecondary, lineHeight: 22 },
});
