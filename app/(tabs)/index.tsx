import React from 'react';
import { StyleSheet, Text, View, ScrollView, Pressable } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '@/src/theme';
import { useData } from '@/src/contexts/DataContext';
import { ErrorCard } from '@/src/components/ErrorCard';

function formatDate(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const days = Math.floor(diff / 86400000);
  if (days === 0) return '今天';
  if (days === 1) return '昨天';
  if (days === 2) return '前天';
  return `${days}天前`;
}

export default function HomeScreen() {
  const { errors } = useData();

  const total = errors.length;
  const mastered = errors.filter(e => e.status === 'mastered').length;
  const unmastered = total - mastered;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text style={styles.title}>错题本</Text>
            <Text style={styles.subtitle}>四年级下 · 人教版</Text>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Text style={styles.statNum}>{total}</Text>
              <Text style={styles.statLabel}>错题总数</Text>
            </View>
            <View style={styles.stat}>
              <Text style={[styles.statNum, { color: theme.colors.success }]}>{mastered}</Text>
              <Text style={styles.statLabel}>已掌握</Text>
            </View>
            <View style={styles.stat}>
              <Text style={[styles.statNum, { color: theme.colors.danger }]}>{unmastered}</Text>
              <Text style={styles.statLabel}>未掌握</Text>
            </View>
          </View>

          <Text style={styles.sectionLabel}>最近添加</Text>

          {errors.slice(0, 10).map(error => (
            <ErrorCard
              key={error.id}
              question={error.question}
              tags={error.tags}
              status={error.status}
              date={formatDate(error.createdAt)}
              onPress={() => router.push(`/error/${error.id}`)}
            />
          ))}

          <View style={{ height: theme.spacing.xxl }} />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.bg,
  },
  container: {
    flex: 1,
  },
  header: {
    padding: theme.spacing.xl,
    paddingTop: theme.spacing.xl,
  },
  title: {
    fontSize: theme.fontSize['5xl'],
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: theme.fontSize.lg,
    color: theme.colors.textSecondary,
    marginTop: 4,
  },
  statsRow: {
    flexDirection: 'row',
    marginHorizontal: theme.spacing.xl,
    marginBottom: theme.spacing.xxl,
    borderRadius: theme.radius.sm,
    overflow: 'hidden',
    backgroundColor: theme.colors.border,
  },
  stat: {
    flex: 1,
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: theme.colors.card,
    alignItems: 'center',
  },
  statNum: {
    fontSize: theme.fontSize['4xl'],
    fontWeight: '700',
  },
  statLabel: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  sectionLabel: {
    fontSize: theme.fontSize.base,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    paddingHorizontal: theme.spacing.xl,
    marginBottom: theme.spacing.md,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
