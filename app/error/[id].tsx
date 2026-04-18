import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '@/src/theme';
import { useData } from '@/src/contexts/DataContext';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function ErrorDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { errors, updateErrorStatus, deleteError } = useData();
  const error = errors.find(e => e.id === id);

  if (!error) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.nav}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={20} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={styles.navTitle}>错题详情</Text>
        </View>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: theme.colors.textSecondary }}>找不到该错题</Text>
        </View>
      </SafeAreaView>
    );
  }

  const handleDelete = () => {
    Alert.alert('删除错题', '确定要删除这道错题吗？', [
      { text: '取消', style: 'cancel' },
      { text: '删除', style: 'destructive', onPress: () => { deleteError(error.id); router.back(); } },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        <View style={styles.nav}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={20} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={styles.navTitle}>错题详情</Text>
          <TouchableOpacity onPress={handleDelete}>
            <Ionicons name="trash-outline" size={20} color={theme.colors.danger} />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Photo placeholder */}
          <View style={styles.photoCard}>
            <Text style={styles.photoLabel}>原始照片</Text>
            <View style={styles.photoImage}>
              <Text style={styles.photoImageText}>点击放大查看</Text>
            </View>
          </View>

          {/* Question */}
          <View style={styles.card}>
            <Text style={styles.cardLabel}>题目</Text>
            <Text style={styles.questionText}>{error.question}</Text>
          </View>

          {/* Answers */}
          <View style={styles.card}>
            <Text style={styles.cardLabel}>答案与解析</Text>
            <Text style={styles.answerLine}>
              你的答案：<Text style={styles.wrongText}>{error.userAnswer}</Text>
            </Text>
            <Text style={styles.answerLine}>
              正确答案：<Text style={styles.correctText}>{error.correctAnswer}</Text>
            </Text>
            <Text style={styles.explanationText}>{error.explanation}</Text>
          </View>

          {/* Steps */}
          <View style={styles.card}>
            <Text style={styles.cardLabel}>解题步骤</Text>
            {error.steps.map((step, i) => (
              <Text key={i} style={styles.stepText}>{i + 1}. {step}</Text>
            ))}
          </View>

          {/* Practice button */}
          <TouchableOpacity
            style={styles.practiceBtn}
            onPress={() => router.push(`/unit/${error.unitId}`)}
          >
            <Text style={styles.practiceBtnText}>延伸练习</Text>
          </TouchableOpacity>

          {/* Mastery buttons */}
          <View style={styles.masteryRow}>
            <TouchableOpacity
              style={[styles.masteryBtn, { borderColor: theme.colors.success }]}
              onPress={() => updateErrorStatus(error.id, 'mastered')}
            >
              <Text style={[styles.masteryBtnText, { color: theme.colors.success }]}>已掌握</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.masteryBtn, { borderColor: theme.colors.danger }]}
              onPress={() => updateErrorStatus(error.id, 'unmastered')}
            >
              <Text style={[styles.masteryBtnText, { color: theme.colors.danger }]}>未掌握</Text>
            </TouchableOpacity>
          </View>

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
    justifyContent: 'space-between',
  },
  backBtn: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  navTitle: { fontSize: theme.fontSize['2xl'], fontWeight: '600', flex: 1, marginLeft: theme.spacing.md, textAlign: 'center' },
  photoCard: { padding: theme.spacing.lg },
  photoLabel: { fontSize: theme.fontSize.sm, color: theme.colors.textSecondary, marginBottom: theme.spacing.sm },
  photoImage: { height: 160, backgroundColor: theme.colors.accentLight, borderRadius: theme.radius.sm, alignItems: 'center', justifyContent: 'center' },
  photoImageText: { color: theme.colors.textSecondary, fontSize: theme.fontSize.lg },
  card: {
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.sm,
    padding: theme.spacing.lg,
  },
  cardLabel: { fontSize: theme.fontSize.sm, color: theme.colors.textSecondary, marginBottom: theme.spacing.sm, textTransform: 'uppercase', letterSpacing: 0.5 },
  questionText: { fontSize: theme.fontSize.xxl, fontWeight: '500', lineHeight: 24 },
  answerLine: { fontSize: theme.fontSize.lg, lineHeight: 24, marginBottom: 4 },
  wrongText: { color: theme.colors.danger },
  correctText: { color: theme.colors.success, fontWeight: '500' },
  explanationText: { fontSize: theme.fontSize.lg, color: theme.colors.textSecondary, lineHeight: 22, marginTop: 8 },
  stepText: { fontSize: theme.fontSize.lg, color: theme.colors.textSecondary, lineHeight: 24, marginBottom: 4 },
  practiceBtn: {
    marginHorizontal: theme.spacing.lg,
    marginTop: theme.spacing.lg,
    paddingVertical: theme.spacing.lg,
    backgroundColor: theme.colors.accent,
    borderRadius: theme.radius.sm,
    alignItems: 'center',
  },
  practiceBtnText: { color: 'white', fontSize: theme.fontSize.xl, fontWeight: '600' },
  masteryRow: { flexDirection: 'row', gap: theme.spacing.md, paddingHorizontal: theme.spacing.lg, marginTop: theme.spacing.md },
  masteryBtn: { flex: 1, paddingVertical: theme.spacing.lg, borderWidth: 1, borderRadius: theme.radius.sm, alignItems: 'center' },
  masteryBtnText: { fontSize: theme.fontSize.xl, fontWeight: '600' },
});
