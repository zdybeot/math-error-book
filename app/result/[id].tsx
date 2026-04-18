import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '@/src/theme';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function ResultScreen() {
  const { id, rate, correct, wrong, total } = useLocalSearchParams();
  const unitId = parseInt(id as string || '0');

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        <View style={styles.nav}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={20} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={styles.navTitle}>练习记录</Text>
        </View>

        <View style={styles.resultBody}>
          <Text style={styles.score}>{rate}%</Text>
          <Text style={styles.label}>正确率</Text>
        </View>

        <View style={styles.resultRow}>
          <View style={styles.resultItem}>
            <Text style={[styles.resultNum, { color: theme.colors.success }]}>{correct}</Text>
            <Text style={styles.resultLabel}>答对</Text>
          </View>
          <View style={styles.resultItem}>
            <Text style={[styles.resultNum, { color: theme.colors.danger }]}>{wrong}</Text>
            <Text style={styles.resultLabel}>答错</Text>
          </View>
          <View style={styles.resultItem}>
            <Text style={styles.resultNum}>{total}题</Text>
            <Text style={styles.resultLabel}>共练习</Text>
          </View>
        </View>

        <View style={styles.btnRow}>
          <TouchableOpacity
            style={[styles.btn, { backgroundColor: theme.colors.card, borderWidth: 1, borderColor: theme.colors.border }]}
            onPress={() => router.push(`/unit/${unitId}`)}
          >
            <Text style={[styles.btnText, { color: theme.colors.text }]}>返回单元</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.btn, { backgroundColor: theme.colors.accent }]}
            onPress={() => router.replace(`/practice/${unitId}`)}
          >
            <Text style={[styles.btnText, { color: 'white' }]}>再出一组</Text>
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
  resultBody: { alignItems: 'center', paddingVertical: theme.spacing.xxl * 2 },
  score: { fontSize: 64, fontWeight: '700', letterSpacing: -2 },
  label: { fontSize: theme.fontSize.xxl, color: theme.colors.textSecondary, marginTop: 4 },
  resultRow: { flexDirection: 'row', marginHorizontal: theme.spacing.xl, marginBottom: theme.spacing.xxl, borderRadius: theme.radius.sm, overflow: 'hidden', backgroundColor: theme.colors.border },
  resultItem: { flex: 1, paddingVertical: theme.spacing.xl, backgroundColor: theme.colors.card, alignItems: 'center' },
  resultNum: { fontSize: theme.fontSize['4xl'], fontWeight: '700' },
  resultLabel: { fontSize: theme.fontSize.base, color: theme.colors.textSecondary, marginTop: 2 },
  btnRow: { flexDirection: 'row', gap: theme.spacing.sm, paddingHorizontal: theme.spacing.xl },
  btn: { flex: 1, paddingVertical: theme.spacing.lg, borderRadius: theme.radius.sm, alignItems: 'center' },
  btnText: { fontSize: theme.fontSize.lg, fontWeight: '600' },
});
