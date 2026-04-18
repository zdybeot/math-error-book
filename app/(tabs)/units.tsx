import React from 'react';
import { StyleSheet, Text, View, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '@/src/theme';
import { units } from '@/src/data/units';
import { useData } from '@/src/contexts/DataContext';
import { UnitCard } from '@/src/components/UnitCard';

export default function UnitsScreen() {
  const { getErrorsByUnit } = useData();

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text style={styles.title}>单元</Text>
            <Text style={styles.subtitle}>四年级下册 · 人教版</Text>
          </View>

          {units.map(unit => {
            const unitErrors = getErrorsByUnit(unit.id);
            const errorCount = unitErrors.length;
            const masteredCount = unitErrors.filter(e => e.status === 'mastered').length;
            return (
              <UnitCard
                key={unit.id}
                unit={unit}
                errorCount={errorCount}
                masteredCount={masteredCount}
                onPress={() => router.push(`/unit/${unit.id}`)}
              />
            );
          })}

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
});
