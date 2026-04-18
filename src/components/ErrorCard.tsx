import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { theme } from '@/src/theme';
import { MasteryStatus } from '@/src/types';

const statusConfig: Record<MasteryStatus, { color: string; label: string }> = {
  unmastered: { color: theme.colors.danger, label: '未掌握' },
  practicing: { color: theme.colors.warning, label: '练习中' },
  mastered: { color: theme.colors.success, label: '已掌握' },
};

interface ErrorCardProps {
  question: string;
  tags: string[];
  status: MasteryStatus;
  date: string;
  onPress: () => void;
}

export function ErrorCard({ question, tags, status, date, onPress }: ErrorCardProps) {
  const config = statusConfig[status];
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.6}>
      <Text style={styles.question} numberOfLines={1}>{question}</Text>
      <View style={styles.row}>
        <View style={[styles.dot, { backgroundColor: config.color }]} />
        <Text style={[styles.statusText, { color: config.color }]}>{config.label}</Text>
        {tags.length > 0 && <Text style={styles.tag}>{tags[0]}</Text>}
        <Text style={styles.date}>{date}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.sm,
    padding: theme.spacing.lg,
    marginHorizontal: theme.spacing.xl,
    marginBottom: theme.spacing.sm,
  },
  question: {
    fontSize: theme.fontSize.xl,
    fontWeight: '500',
    marginBottom: theme.spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: theme.fontSize.md,
  },
  tag: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
  },
  date: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
  },
});
