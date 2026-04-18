import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { theme } from '@/src/theme';
import { Unit } from '@/src/types';

interface UnitCardProps {
  unit: Unit;
  errorCount: number;
  masteredCount: number;
  onPress: () => void;
}

export function UnitCard({ unit, errorCount, masteredCount, onPress }: UnitCardProps) {
  const rate = errorCount > 0 ? Math.round((masteredCount / errorCount) * 100) : 0;
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.6}>
      <View style={styles.header}>
        <View>
          <Text style={styles.num}>{unit.num}</Text>
          <Text style={styles.name}>{unit.name}</Text>
        </View>
        <Text style={styles.count}>{errorCount}题</Text>
      </View>
      <View style={styles.progressBg}>
        <View style={[styles.progressFill, { width: `${rate}%` }]} />
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
    marginHorizontal: theme.spacing.xl,
    marginBottom: theme.spacing.md,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  num: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  name: {
    fontSize: theme.fontSize.xxl,
    fontWeight: '600',
    marginTop: 2,
  },
  count: {
    fontSize: theme.fontSize.base,
    color: theme.colors.textSecondary,
  },
  progressBg: {
    height: 3,
    backgroundColor: theme.colors.border,
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme.colors.accent,
  },
});
