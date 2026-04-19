import React, { useState, useEffect, useRef, useCallback } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '@/src/theme';
import { units } from '@/src/data/units';
import { useData } from '@/src/contexts/DataContext';
import { generateSimilarQuestions } from '@/src/services/practice';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function PracticeScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const unitId = parseInt(id || '0');
  const unit = units.find(u => u.id === unitId) || units[0];
  const { getErrorsByUnit } = useData();

  const unitErrors = getErrorsByUnit(unitId);

  const [questions, setQuestions] = useState<any[]>([]);
  const [showAnswers, setShowAnswers] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generateError, setGenerateError] = useState('');
  const generatedRef = useRef(false);

  const handleGenerate = useCallback(async () => {
    if (unitErrors.length === 0) return;
    if (generating) return;
    setGenerating(true);
    setGenerateError('');
    setShowAnswers(false);

    try {
      const errorQuestions = unitErrors.map(e => ({
        question: e.question,
        correctAnswer: e.correctAnswer,
        tags: e.tags,
      }));
      const result = await generateSimilarQuestions(errorQuestions);
      setQuestions(result.map((q, i) => ({ ...q, marked: null as 'correct' | 'wrong' | null })));
    } catch (e: any) {
      setGenerateError(e?.message || '生成失败');
    } finally {
      setGenerating(false);
    }
  }, [unitErrors, generating]);

  // 进入页面自动生成一次（依赖 unitErrors 是因为数据从 storage 异步加载）
  useEffect(() => {
    if (!generatedRef.current && unitErrors.length > 0) {
      generatedRef.current = true;
      handleGenerate();
    }
  }, [unitErrors.length]);

  const handleMark = (index: number, result: 'correct' | 'wrong') => {
    setQuestions(prev =>
      prev.map((q, i) => (i === index ? { ...q, marked: result } : q))
    );
  };

  const handleFinish = () => {
    const correct = questions.filter(q => q.marked === 'correct').length;
    const wrong = questions.filter(q => q.marked === 'wrong').length;
    const total = questions.length;
    const rate = total > 0 ? Math.round((correct / total) * 100) : 0;

    router.replace({
      pathname: '/result/[id]',
      params: { id: unitId, rate: rate.toString(), correct: correct.toString(), wrong: wrong.toString(), total: total.toString() },
    });
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        {/* 导航栏 */}
        <View style={styles.nav}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={20} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={styles.navTitle}>{unit.name} · 延伸练习</Text>
          <TouchableOpacity style={styles.refreshBtn} onPress={handleGenerate} disabled={generating}>
            <Ionicons name="refresh-outline" size={20} color={generating ? theme.colors.textSecondary : theme.colors.text} />
          </TouchableOpacity>
        </View>

        {/* 提示 */}
        <View style={styles.hint}>
          <Text style={styles.hintText}>AI 根据你的错题生成相似练习，请在纸上完成后对照答案标记结果。</Text>
        </View>

        {/* 题目列表 */}
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
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>暂无练习题目</Text>
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

            {/* 换一组 */}
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
            <TouchableOpacity
              style={[styles.bottomBtn, { backgroundColor: theme.colors.card, borderWidth: 1, borderColor: theme.colors.border }]}
              onPress={handleFinish}
            >
              <Text style={[styles.bottomBtnText, { color: theme.colors.text }]}>记录结果</Text>
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
  navTitle: { fontSize: theme.fontSize['2xl'], fontWeight: '600', flex: 1, marginLeft: theme.spacing.md },
  refreshBtn: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  hint: { margin: theme.spacing.lg, padding: theme.spacing.lg, backgroundColor: theme.colors.accentLight, borderRadius: theme.radius.sm },
  hintText: { fontSize: theme.fontSize.base, color: theme.colors.textSecondary, lineHeight: 20 },
  generatingState: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: theme.spacing.md },
  generatingText: { fontSize: theme.fontSize.lg, color: theme.colors.textSecondary },
  errorState: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: theme.spacing.md },
  errorText: { fontSize: theme.fontSize.base, color: theme.colors.danger },
  retryBtn: { paddingHorizontal: theme.spacing.xl, paddingVertical: theme.spacing.md, borderWidth: 1, borderColor: theme.colors.danger, borderRadius: theme.radius.sm },
  retryBtnText: { fontSize: theme.fontSize.base, color: theme.colors.danger },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyText: { fontSize: theme.fontSize.lg, color: theme.colors.textSecondary },
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
