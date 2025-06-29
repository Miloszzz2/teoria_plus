import React, { useCallback, useState } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { useTheme } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from "react-native-safe-area-context";
import i18n from '../i18n';

const StatisticsScreen = () => {
  const { colors } = useTheme();
  const [stats, setStats] = useState({ finishedExams: 0, bestScore: 0, viewedQuestions: 0 });

  useFocusEffect(
    useCallback(() => {
      const fetchStats = async () => {
        try {
          const finishedExamsStr = await AsyncStorage.getItem('finished_exams');
          const bestScoreStr = await AsyncStorage.getItem('best_score');
          const keys = await AsyncStorage.getAllKeys();
          const viewedKeys = keys.filter(k => k.startsWith('learning_last_question_'));
          const viewedQuestions = await AsyncStorage.multiGet(viewedKeys);

          let totalViewed = 0;
          viewedQuestions.forEach(([_, value]) => {
            totalViewed += value ? parseInt(value, 10) + 1 : 0;
          });

          setStats({
            finishedExams: finishedExamsStr ? parseInt(finishedExamsStr, 10) : 0,
            bestScore: bestScoreStr ? parseInt(bestScoreStr, 10) : 0,
            viewedQuestions: totalViewed,
          });
        } catch (e) {
          console.error("Failed to fetch stats");
        }
      };

      fetchStats();
    }, [])
  );

  const statisticsData = [
    { label: i18n.t('finished_exams'), value: stats.finishedExams },
    { label: i18n.t('best_score'), value: stats.bestScore },
    { label: i18n.t('viewed_questions'), value: stats.viewedQuestions },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <Text style={[styles.title, { color: colors.text }]}>{i18n.t('statistics')}</Text>
      <View style={styles.statsContainer}>
        {statisticsData.map((stat, index) => (
          <View key={index} style={[styles.statItem, { backgroundColor: colors.card }]}>
            <Text style={[styles.statLabel, { color: colors.text }]}>{stat.label}</Text>
            <Text style={[styles.statValue, { color: colors.primary }]}>{stat.value}</Text>
          </View>
        ))}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'column',
    justifyContent: 'space-around',
  },
  statItem: {
    padding: 20,
    borderRadius: 10,
    marginBottom: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
    elevation: 4,
  },
  statLabel: {
    fontSize: 18,
    fontWeight: '600',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 10,
  },
});

export default StatisticsScreen;