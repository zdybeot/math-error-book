import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '@/src/theme';
import { units } from '@/src/data/units';
import { useData } from '@/src/contexts/DataContext';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function ExtractScreen() {
  const { addError } = useData();
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [selectedUnit, setSelectedUnit] = useState(0);

  const handleSave = () => {
    if (!question.trim()) return;
    addError({
      question: question.trim(),
      userAnswer: '',
      correctAnswer: answer.trim() || '—',
      explanation: '',
      steps: [],
      photoUri: null,
      unitId: selectedUnit,
      tags: [units.find(u => u.id === selectedUnit)?.name || ''],
      status: 'unmastered',
    });
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        <View style={styles.nav}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={20} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={styles.navTitle}>添加错题</Text>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} style={styles.body}>
          {/* Question input */}
          <View style={styles.card}>
            <Text style={styles.cardLabel}>题目</Text>
            <TextInput
              style={styles.input}
              placeholder="输入错题题目内容"
              placeholderTextColor={theme.colors.textSecondary}
              multiline
              value={question}
              onChangeText={setQuestion}
            />
          </View>

          {/* Answer input */}
          <View style={styles.card}>
            <Text style={styles.cardLabel}>正确答案</Text>
            <TextInput
              style={styles.input}
              placeholder="输入正确答案"
              placeholderTextColor={theme.colors.textSecondary}
              value={answer}
              onChangeText={setAnswer}
            />
          </View>

          {/* Unit selector */}
          <View style={styles.card}>
            <Text style={styles.cardLabel}>选择所属单元</Text>
            <View style={styles.tagRow}>
              {units.map(unit => (
                <TouchableOpacity
                  key={unit.id}
                  style={[styles.tag, selectedUnit === unit.id && styles.tagSelected]}
                  onPress={() => setSelectedUnit(unit.id)}
                >
                  <Text style={[styles.tagText, selectedUnit === unit.id && styles.tagTextSelected]}>
                    {unit.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>

        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
          <Text style={styles.saveBtnText}>保存</Text>
        </TouchableOpacity>
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
  body: { flex: 1, padding: theme.spacing.lg },
  card: {
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.sm,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  cardLabel: { fontSize: theme.fontSize.sm, color: theme.colors.textSecondary, marginBottom: theme.spacing.sm, textTransform: 'uppercase', letterSpacing: 0.5 },
  input: { fontSize: theme.fontSize.xl, minHeight: 60, textAlignVertical: 'top' },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm },
  tag: { paddingHorizontal: theme.spacing.lg, paddingVertical: theme.spacing.sm, borderWidth: 1, borderColor: theme.colors.border, borderRadius: 20, backgroundColor: theme.colors.card },
  tagSelected: { borderColor: theme.colors.accent, backgroundColor: theme.colors.accentLight },
  tagText: { fontSize: theme.fontSize.base },
  tagTextSelected: { color: theme.colors.text, fontWeight: '500' },
  saveBtn: {
    marginHorizontal: theme.spacing.xl,
    marginBottom: theme.spacing.lg,
    paddingVertical: theme.spacing.lg,
    backgroundColor: theme.colors.accent,
    borderRadius: theme.radius.sm,
    alignItems: 'center',
  },
  saveBtnText: { color: 'white', fontSize: theme.fontSize.xl, fontWeight: '600' },
});
