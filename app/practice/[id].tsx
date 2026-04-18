import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '@/src/theme';
import { questionBank, defaultQuestionBank } from '@/src/data/questionBank';
import { units } from '@/src/data/units';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function PracticeScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const unitId = parseInt(id || '0');
  const unit = units.find(u => u.id === unitId) || units[0];
  const pool = questionBank[unitId] || defaultQuestionBank;

  const [questions, setQuestions] = useState(
    [...pool].sort(() => Math.random() - 0.5).slice(0, 5).map((q, i) => ({
      ...q,
      index: i,
      marked: null as 'correct' | 'wrong' | null,
    }))
  );
  const [showAnswers, setShowAnswers] = useState(false);

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
        <View style={styles.nav}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={20} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={styles.navTitle}>{unit.name} · 延伸练习</Text>
        </View>

        <View style={styles.hint}>
          <Text style={styles.hintText}>以下题目请在纸上完成后，对照答案标记结果。</Text>
        </View>

        <View style={styles.questionsList}>
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
        </View>

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
  hint: { margin: theme.spacing.lg, padding: theme.spacing.lg, backgroundColor: theme.colors.accentLight, borderRadius: theme.radius.sm },
  hintText: { fontSize: theme.fontSize.base, color: theme.colors.textSecondary, lineHeight: 20 },
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
  bottomBtns: { flexDirection: 'row', gap: theme.spacing.sm, paddingHorizontal: theme.spacing.lg, paddingVertical: theme.spacing.lg },
  bottomBtn: { flex: 1, paddingVertical: theme.spacing.lg, borderRadius: theme.radius.sm, alignItems: 'center' },
  bottomBtnText: { fontSize: theme.fontSize.lg, fontWeight: '600', color: 'white' },
});
