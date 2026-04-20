import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '@/src/theme';
import { useData } from '@/src/contexts/DataContext';
import { generatePracticeForSingleQuestion } from '@/src/services/practice';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function SinglePracticeScreen() {
  const { errorId } = useLocalSearchParams<{ errorId: string }>();
  const { getErrorsByUnit, units } = useData();

  // Find the error entry by ID
  const allErrors = units.flatMap(u => getErrorsByUnit(u.id));
  const error = allErrors.find(e => e.id === errorId);

  const unit = units.find(u => u.id === error?.unitId);

  const [questions, setQuestions] = useState<any[]>([]);
  const [showAnswers, setShowAnswers] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generateError, setGenerateError] = useState('');
  const [hasGenerated, setHasGenerated] = useState(false);

  const handleGenerate = async () => {
    if (!error) return;
    if (generating) return;
    setGenerating(true);
    setGenerateError('');
    setShowAnswers(false);
    setHasGenerated(true);

    try {
      const result = await generatePracticeForSingleQuestion(
        error.question,
        error.correctAnswer,
        error.tags,
        2
      );
      setQuestions(result.map((q, i) => ({ ...q, marked: null as 'correct' | 'wrong' | null })));
    } catch (e: any) {
      setGenerateError(e?.message || '生成失败');
    } finally {
      setGenerating(false);
    }
  };

  const handleMark = (index: number, result: 'correct' | 'wrong') => {
    setQuestions(prev =>
      prev.map((q, i) => (i === index ? { ...q, marked: result } : q))
    );
  };

  if (!error) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.container}>
          <View style={styles.nav}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
              <Ionicons name="chevron-back" size={20} color={theme.colors.text} />
            </TouchableOpacity>
            <Text style={styles.navTitle}>延伸练习</Text>
          </View>
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>找不到对应的错题</Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        {/* 导航栏 */}
        <View style={styles.nav}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={20} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={styles.navTitle}>延伸练习</Text>
          <View style={{ width: 32 }} />
        </View>

        {/* 原题目 */}
        <View style={styles.originalCard}>
          <Text style={styles.originalLabel}>原题目</Text>
          <Text style={styles.originalQuestion}>{error.question}</Text>
          <Text style={styles.originalAnswer}>正确答案：{error.correctAnswer}</Text>
        </View>

        {/* 提示 */}
        <View style={styles.hint}>
          <Text style={styles.hintText}>AI 根据当前题目生成 2 道相似练习</Text>
        </View>

        {/* 题目区域 */}
        {generating ? (
          <View style={styles.generatingState}>
            <ActivityIndicator size="large" color={theme.colors.accent} />
            <Text style={styles.generatingText}>AI 正在出题...</Text>
          </View>
        ) : generateError ? (
          <View style={styles.errorState}>
            <Ionicons name="alert-circle-outline" size={32} color={theme.colors.danger} />
            <Text style={styles.errorText}>{generateError}</Text>
            <TouchableOpacity style={styles.retryBtn} onPress={handleGenerate}>
              <Text style={styles.retryBtnText}>重新生成</Text>
            </TouchableOpacity>
          </View>
        ) : questions.length === 0 ? (
          <View style={styles.promptState}>
            <TouchableOpacity style={styles.startBtn} onPress={handleGenerate} disabled={generating}>
              <Ionicons name="bulb-outline" size={24} color="white" />
              <Text style={styles.startBtnText}>开始出题</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <ScrollView showsVerticalScrollIndicator={false} style={styles.questionsList}>
            {questions.map((q, i) => (
              <View key={i} style={styles.qCard}>
                <View style={styles.qHeader}>
                  <Text style={styles.qNum}>第 {i + 1} 题</Text>
                  <Text style={styles.qType}>{q.type}</Text>
                </View>
                <Text style={styles.qQuestion}>{q.question}</Text>
                {showAnswers && (
                  <View style={styles.qAnswer}>
                    <Text style={styles.qAnswerText}>答案：<Text style={{ fontWeight: '600' }}>{q.answer}</Text></Text>
                  </View>
                )}
                <View style={styles.qActions}>
                  <TouchableOpacity
                    style={[
                      styles.qBtn,
                      q.marked === 'correct' && styles.qBtnCorrect,
                      q.marked === 'wrong' && styles.qBtnWrong,
                      !showAnswers && { opacity: 0.4 },
                    ]}
                    disabled={!showAnswers}
                    onPress={() => handleMark(i, 'correct')}
                  >
                    <Text style={[styles.qBtnText, q.marked === 'correct' && { color: 'white' }]}>
                      ✔ 做对了
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.qBtn,
                      q.marked === 'wrong' && styles.qBtnWrong,
                      !showAnswers && { opacity: 0.4 },
                    ]}
                    disabled={!showAnswers}
                    onPress={() => handleMark(i, 'wrong')}
                  >
                    <Text style={[styles.qBtnText, q.marked === 'wrong' && { color: 'white' }]}>
                      ✘ 做错了
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}

            <TouchableOpacity style={styles.changeGroupBtn} onPress={handleGenerate}>
              <Ionicons name="shuffle-outline" size={18} color={theme.colors.accent} />
              <Text style={styles.changeGroupBtnText}>换一组（重新出2题）</Text>
            </TouchableOpacity>

            <View style={{ height: 80 }} />
          </ScrollView>
        )}

        {/* 底部按钮 */}
        {questions.length > 0 && !generating && (
          <View style={styles.bottomBtns}>
            <TouchableOpacity
              style={[styles.bottomBtn, { backgroundColor: theme.colors.accent }]}
              onPress={() => setShowAnswers(true)}
            >
              <Text style={styles.bottomBtnText}>查看答案</Text>
            </TouchableOpacity>
          </View>
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
  navTitle: { fontSize: theme.fontSize['2xl'], fontWeight: '600', flex: 1, marginLeft: theme.spacing.md, textAlign: 'center' },
  // 原题目卡片
  originalCard: {
    marginHorizontal: theme.spacing.lg,
    marginTop: theme.spacing.lg,
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.accentLight,
    borderRadius: theme.radius.sm,
  },
  originalLabel: { fontSize: theme.fontSize.sm, color: theme.colors.textSecondary, fontWeight: '600', marginBottom: theme.spacing.sm },
  originalQuestion: { fontSize: theme.fontSize.xl, fontWeight: '500', lineHeight: 24, marginBottom: theme.spacing.sm },
  originalAnswer: { fontSize: theme.fontSize.base, color: theme.colors.textSecondary },
  hint: { marginHorizontal: theme.spacing.lg, marginVertical: theme.spacing.md, padding: theme.spacing.lg, backgroundColor: theme.colors.accentLight, borderRadius: theme.radius.sm },
  hintText: { fontSize: theme.fontSize.base, color: theme.colors.textSecondary, lineHeight: 20, textAlign: 'center' },
  // 状态
  generatingState: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: theme.spacing.md },
  generatingText: { fontSize: theme.fontSize.lg, color: theme.colors.textSecondary },
  errorState: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: theme.spacing.md },
  errorText: { fontSize: theme.fontSize.base, color: theme.colors.danger },
  retryBtn: { paddingHorizontal: theme.spacing.xl, paddingVertical: theme.spacing.md, borderWidth: 1, borderColor: theme.colors.danger, borderRadius: theme.radius.sm },
  retryBtnText: { fontSize: theme.fontSize.base, color: theme.colors.danger },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyText: { fontSize: theme.fontSize.lg, color: theme.colors.textSecondary },
  promptState: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  startBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    paddingHorizontal: theme.spacing.xxl,
    paddingVertical: theme.spacing.lg,
    backgroundColor: theme.colors.accent,
    borderRadius: theme.radius.sm,
  },
  startBtnText: { fontSize: theme.fontSize.xl, fontWeight: '600', color: 'white' },
  // 题目列表
  questionsList: { flex: 1, paddingHorizontal: theme.spacing.lg },
  qCard: {
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.sm,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  qHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: theme.spacing.sm },
  qNum: { fontSize: theme.fontSize.sm, color: theme.colors.textSecondary, fontWeight: '600' },
  qType: { fontSize: theme.fontSize.sm, color: theme.colors.textSecondary, paddingHorizontal: theme.spacing.sm, paddingVertical: 2, backgroundColor: theme.colors.accentLight, borderRadius: 4 },
  qQuestion: { fontSize: theme.fontSize.xl, fontWeight: '500', lineHeight: 24, marginBottom: theme.spacing.md, paddingBottom: theme.spacing.md, borderBottomWidth: 1, borderBottomColor: theme.colors.border },
  qAnswer: { marginBottom: theme.spacing.md },
  qAnswerText: { fontSize: theme.fontSize.base, color: theme.colors.textSecondary },
  qActions: { flexDirection: 'row', gap: theme.spacing.sm },
  qBtn: { flex: 1, paddingVertical: theme.spacing.md, borderWidth: 1, borderColor: theme.colors.border, borderRadius: 6, alignItems: 'center' },
  qBtnCorrect: { backgroundColor: theme.colors.success, borderColor: theme.colors.success },
  qBtnWrong: { backgroundColor: theme.colors.danger, borderColor: theme.colors.danger },
  qBtnText: { fontSize: theme.fontSize.base },
  changeGroupBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  changeGroupBtnText: { fontSize: theme.fontSize.lg, color: theme.colors.accent, fontWeight: '600' },
  bottomBtns: { flexDirection: 'row', gap: theme.spacing.sm, paddingHorizontal: theme.spacing.lg, paddingVertical: theme.spacing.lg },
  bottomBtn: { flex: 1, paddingVertical: theme.spacing.lg, borderRadius: theme.radius.sm, alignItems: 'center' },
  bottomBtnText: { fontSize: theme.fontSize.lg, fontWeight: '600', color: 'white' },
});
