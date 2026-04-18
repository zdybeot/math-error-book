import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '@/src/theme';
import { units } from '@/src/data/units';
import { questionBank, defaultQuestionBank } from '@/src/data/questionBank';
import { useData } from '@/src/contexts/DataContext';
import { ErrorCard } from '@/src/components/ErrorCard';
import Ionicons from '@expo/vector-icons/Ionicons';

function formatDate(timestamp: number): string {
  const d = new Date(timestamp);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export default function UnitDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const unitId = parseInt(id || '0');
  const unit = units.find(u => u.id === unitId) || units[0];
  const { getErrorsByUnit } = useData();
  const [activeTab, setActiveTab] = useState<'errors' | 'practice'>('errors');

  const unitErrors = getErrorsByUnit(unitId);
  const errorCount = unitErrors.length;
  const masteredCount = unitErrors.filter(e => e.status === 'mastered').length;
  const rate = errorCount > 0 ? Math.round((masteredCount / errorCount) * 100) : 0;

  const pool = questionBank[unitId] || defaultQuestionBank;
  const practiceQuestions = [...pool].sort(() => Math.random() - 0.5).slice(0, 5);

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
                  <View style={styles.errorImagePlaceholder}>
                    <Text style={styles.errorImageText}>原始照片</Text>
                  </View>
                  <View style={styles.errorBody}>
                    <Text style={styles.errorQuestion}>{error.question}</Text>
                    <View style={styles.errorAnswers}>
                      <Text style={styles.answerText}>
                        你的答案：<Text style={styles.wrongText}>{error.userAnswer}</Text>
                      </Text>
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
            <>
              {practiceQuestions.map((q, i) => (
                <TouchableOpacity key={i} style={styles.practiceItem}>
                  <Text style={styles.practiceType}>同类题型</Text>
                  <Text style={styles.practiceQuestion}>{q.question}</Text>
                  <Text style={styles.practiceMeta}>{q.type}</Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity
                style={styles.startBtn}
                onPress={() => router.push(`/practice/${unitId}`)}
              >
                <Text style={styles.startBtnText}>开始练习（{practiceQuestions.length}题）</Text>
              </TouchableOpacity>
            </>
          )}

          <View style={{ height: theme.spacing.xxl }} />
        </ScrollView>
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
  errorImagePlaceholder: {
    height: 100,
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
  practiceItem: {
    marginHorizontal: theme.spacing.xl,
    marginBottom: theme.spacing.sm,
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.sm,
    padding: theme.spacing.lg,
  },
  practiceType: { fontSize: theme.fontSize.sm, color: theme.colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: theme.spacing.sm },
  practiceQuestion: { fontSize: theme.fontSize.xl, fontWeight: '500', marginBottom: theme.spacing.sm },
  practiceMeta: { fontSize: theme.fontSize.md, color: theme.colors.textSecondary },
  startBtn: {
    marginHorizontal: theme.spacing.xl,
    marginTop: theme.spacing.lg,
    paddingVertical: theme.spacing.lg,
    backgroundColor: theme.colors.accent,
    borderRadius: theme.radius.sm,
    alignItems: 'center',
  },
  startBtnText: { color: 'white', fontSize: theme.fontSize.xl, fontWeight: '600' },
});
