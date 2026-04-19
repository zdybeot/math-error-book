import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '@/src/theme';
import { useData } from '@/src/contexts/DataContext';
import ZoomableImageModal from '@/components/ZoomableImageModal';
import Ionicons from '@expo/vector-icons/Ionicons';

function formatDate(timestamp: number): string {
  const d = new Date(timestamp);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export default function UnitDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const unitId = parseInt(id || '0');
  const { getErrorsByUnit, units } = useData();
  const unit = units.find(u => u.id === unitId) || units[0];
  const [activeTab, setActiveTab] = useState<'errors' | 'practice'>('errors');

  const unitErrors = getErrorsByUnit(unitId);
  const errorCount = unitErrors.length;
  const masteredCount = unitErrors.filter(e => e.status === 'mastered').length;
  const rate = errorCount > 0 ? Math.round((masteredCount / errorCount) * 100) : 0;
  const [zoomUri, setZoomUri] = useState<string | null>(null);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        {/* Nav */}
        <View style={styles.nav}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={20} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={styles.navTitle}>{unit.num} · {unit.name}</Text>
        </View>

        {/* Unit Info */}
        <View style={styles.info}>
          <Text style={styles.unitName}>{unit.name}</Text>
          <View style={styles.statsRow}>
            <Text style={styles.statText}>错题 <Text style={styles.statBold}>{errorCount}</Text> 道</Text>
            <Text style={styles.statText}>已掌握 <Text style={styles.statBold}>{masteredCount}</Text> 道</Text>
            <Text style={styles.statText}>掌握率 <Text style={styles.statBold}>{rate}%</Text></Text>
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'errors' && styles.tabActive]}
            onPress={() => setActiveTab('errors')}
          >
            <Text style={[styles.tabText, activeTab === 'errors' && styles.tabTextActive]}>错题汇总</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'practice' && styles.tabActive]}
            onPress={() => setActiveTab('practice')}
          >
            <Text style={[styles.tabText, activeTab === 'practice' && styles.tabTextActive]}>延伸练习</Text>
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {activeTab === 'errors' && (
            <>
              {unitErrors.length === 0 && (
                <Text style={styles.emptyText}>暂无错题，去添加一些吧</Text>
              )}
              {unitErrors.map(error => (
                <View key={error.id} style={styles.errorCard}>
                  {error.photoUri ? (
                    <TouchableOpacity activeOpacity={0.7} onPress={() => setZoomUri(error.photoUri!)}>
                      <Image source={{ uri: error.photoUri }} style={styles.errorImage} resizeMode="cover" />
                    </TouchableOpacity>
                  ) : (
                    <View style={styles.errorImagePlaceholder}>
                      <Text style={styles.errorImageText}>无照片</Text>
                    </View>
                  )}
                  <View style={styles.errorBody}>
                    <Text style={styles.errorQuestion}>{error.question}</Text>
                    <View style={styles.errorAnswers}>
                      <Text style={styles.answerText}>
                        正确答案：<Text style={styles.correctText}>{error.correctAnswer}</Text>
                      </Text>
                    </View>
                  </View>
                  <View style={styles.errorFooter}>
                    <Text style={styles.errorDate}>{formatDate(error.createdAt)}</Text>
                    <TouchableOpacity style={styles.errorBtn} onPress={() => router.push(`/error/${error.id}`)}>
                      <Text style={styles.errorBtnText}>查看详情</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </>
          )}

          {activeTab === 'practice' && (
            <View style={styles.practiceSection}>
              {errorCount === 0 ? (
                <View style={styles.emptyPractice}>
                  <Ionicons name="document-text-outline" size={40} color={theme.colors.textSecondary} />
                  <Text style={styles.emptyPracticeText}>暂无错题</Text>
                  <Text style={styles.emptyPracticeHint}>先添加错题后，AI 才能为你生成相似练习</Text>
                </View>
              ) : (
                <View style={styles.practicePrompt}>
                  <Ionicons name="bulb-outline" size={48} color={theme.colors.accent} />
                  <Text style={styles.practiceTitle}>AI 智能出题</Text>
                  <Text style={styles.practiceDesc}>
                    根据你录入的 {errorCount} 道错题，AI 将生成 2 道相似练习{'\n'}考查相同知识点，但改变具体数字
                  </Text>
                  <TouchableOpacity
                    style={styles.startBtn}
                    onPress={() => router.push(`/practice/${unitId}`)}
                  >
                    <Text style={styles.startBtnText}>开始练习</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}

          <View style={{ height: theme.spacing.xxl }} />
        </ScrollView>
      </View>

      {/* 照片放大预览 */}
      {zoomUri && (
        <ZoomableImageModal
          visible={!!zoomUri}
          imageUri={zoomUri}
          onClose={() => setZoomUri(null)}
        >
          {(imgProps) => (
            <Image source={{ uri: zoomUri }} {...imgProps} />
          )}
        </ZoomableImageModal>
      )}
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
  info: {
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    backgroundColor: theme.colors.card,
  },
  unitName: { fontSize: theme.fontSize['3xl'], fontWeight: '700' },
  statsRow: { flexDirection: 'row', gap: theme.spacing.lg, marginTop: theme.spacing.sm },
  statText: { fontSize: theme.fontSize.base, color: theme.colors.textSecondary },
  statBold: { fontWeight: '600', color: theme.colors.text },
  tabs: { flexDirection: 'row', backgroundColor: theme.colors.card, borderBottomWidth: 1, borderBottomColor: theme.colors.border },
  tab: { flex: 1, paddingVertical: theme.spacing.lg, alignItems: 'center' },
  tabActive: { borderBottomWidth: 2, borderBottomColor: theme.colors.text },
  tabText: { fontSize: theme.fontSize.lg, fontWeight: '500', color: theme.colors.textSecondary },
  tabTextActive: { color: theme.colors.text },
  emptyText: { textAlign: 'center', color: theme.colors.textSecondary, marginTop: theme.spacing.xxl, fontSize: theme.fontSize.lg },
  errorCard: {
    marginHorizontal: theme.spacing.xl,
    marginBottom: theme.spacing.sm,
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.sm,
    overflow: 'hidden',
  },
  errorImage: {
    height: 120,
    width: '100%',
    backgroundColor: theme.colors.accentLight,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  errorImagePlaceholder: {
    height: 80,
    backgroundColor: theme.colors.accentLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  errorImageText: { color: theme.colors.textSecondary, fontSize: theme.fontSize.base },
  errorBody: { padding: theme.spacing.lg },
  errorQuestion: { fontSize: theme.fontSize.xl, fontWeight: '500', marginBottom: theme.spacing.sm },
  errorAnswers: {},
  answerText: { fontSize: theme.fontSize.base, color: theme.colors.textSecondary },
  wrongText: { color: theme.colors.danger, textDecorationLine: 'line-through' },
  correctText: { color: theme.colors.success, fontWeight: '500' },
  errorFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  errorDate: { fontSize: theme.fontSize.sm, color: theme.colors.textSecondary },
  errorBtn: { paddingHorizontal: theme.spacing.md, paddingVertical: theme.spacing.xs, borderWidth: 1, borderColor: theme.colors.border, borderRadius: 6 },
  errorBtnText: { fontSize: theme.fontSize.base },
  // 练习相关
  practiceSection: { paddingHorizontal: theme.spacing.lg },
  emptyPractice: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xxl * 2,
    gap: theme.spacing.sm,
  },
  emptyPracticeText: { fontSize: theme.fontSize.xl, color: theme.colors.textSecondary, fontWeight: '500' },
  emptyPracticeHint: { fontSize: theme.fontSize.base, color: theme.colors.textSecondary, textAlign: 'center', lineHeight: 20 },
  practicePrompt: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xxl,
    gap: theme.spacing.sm,
  },
  practiceTitle: { fontSize: theme.fontSize['3xl'], fontWeight: '700', marginTop: theme.spacing.sm },
  practiceDesc: {
    fontSize: theme.fontSize.lg,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginTop: theme.spacing.sm,
  },
  startBtn: {
    marginTop: theme.spacing.xl,
    paddingHorizontal: theme.spacing.xxl * 2,
    paddingVertical: theme.spacing.lg,
    backgroundColor: theme.colors.accent,
    borderRadius: theme.radius.sm,
    alignItems: 'center',
  },
  startBtnText: { color: 'white', fontSize: theme.fontSize.xl, fontWeight: '600' },
});
