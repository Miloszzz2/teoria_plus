import React, { useEffect, useState, useRef } from "react";
import { View, TouchableOpacity, StyleSheet, ActivityIndicator, Image, Alert, ScrollView } from "react-native";
import StyledText from "@/components/StyledText";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/utils/supabase';
import { ResizeMode, Video, VideoFullscreenUpdate, VideoFullscreenUpdateEvent } from "expo-av";
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from "react-native-safe-area-context";
import { getMediaSource } from "@/assets/mediaMap";
import * as ScreenOrientation from 'expo-screen-orientation';
import { Client, Query, Storage } from 'react-native-appwrite';
import { useTheme } from '@react-navigation/native';
import { useVideoPlayer, VideoView } from "expo-video";

const EXAM_TIME = 25 * 60; // 25 minut w sekundach

// 1. Typowanie shuffle
function shuffle<T>(array: T[]): T[] {
   let arr = array.slice();
   for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
   }
   return arr;
}

// Appwrite client setup
const appwrite = new Client();
appwrite
   .setEndpoint(process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT || '')
   .setProject(process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID || '');
const storage = new Storage(appwrite);
const APPWRITE_BUCKET_ID = process.env.EXPO_PUBLIC_APPWRITE_BUCKET_ID || '';

// Helper: get media source (local or Appwrite, with fileId lookup)
async function getExamMediaSourceAsync(media: string) {
   if (!media) return undefined;
   // Try local first
   const local = getMediaSource(media);
   if (local) return local;
   // Try to find fileId in Appwrite Storage
   try {
      const list = await storage.listFiles(APPWRITE_BUCKET_ID, [
         Query.equal("name", media)
      ]);
      if (list.files && list.files.length > 0) {
         const fileId = list.files[0].$id;
         return {
            uri: `${process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT}/storage/buckets/${APPWRITE_BUCKET_ID}/files/${fileId}/view?project=${process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID}&mode=admin`
         };
      }
   } catch (e) {
      // fallback below
   }
   // fallback (optional, if you want to keep it)
   return {
      uri: `${process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT}/storage/buckets/${APPWRITE_BUCKET_ID}/files/${encodeURIComponent(media)}/view?project=${process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID}&mode=admin`
   };
}

export default function ExamModeScreen() {
   const [loading, setLoading] = useState(true);
   const [questions, setQuestions] = useState<any[]>([]);
   const [current, setCurrent] = useState(0);
   const [answers, setAnswers] = useState<(string | null)[]>([]);
   const [showResult, setShowResult] = useState(false);
   const [score, setScore] = useState(0);
   const [timer, setTimer] = useState(EXAM_TIME);
   const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
   const [category, setCategory] = useState<string | null>(null);
   const [mediaSource, setMediaSource] = useState<any>(undefined);
   const { colors } = useTheme();

   // Pobierz pytania i kategorię
   useEffect(() => {
      let isMounted = true;
      const fetchQuestions = async () => {
         setLoading(true);
         try {
            const selected = await AsyncStorage.getItem('selectedCategory');
            if (!selected) {
               setLoading(false);
               return;
            }
            setCategory(selected);
            // Pobierz pytania Tak/Nie (część podstawowa)
            const { data: basic, error: err1 } = await supabase
               .from('pytania_egzaminacyjne')
               .select('*')
               .ilike('kategorie', `%${selected}%`)
               .is('odpowiedz_a', null);
            // Pobierz pytania wielokrotnego wyboru (część specjalistyczna)
            const { data: multi, error: err2 } = await supabase
               .from('pytania_egzaminacyjne')
               .select('*')
               .ilike('kategorie', `%${selected}%`)
               .not("odpowiedz_a", 'is', null);
            if (err1 || err2 || !basic || !multi) {
               setLoading(false);
               return;
            }
            // Losuj 20 Tak/Nie i 12 ABC
            const basicQ = shuffle(basic).slice(0, 20);
            const multiQ = shuffle(multi).slice(0, 12);
            // Najpierw Tak/Nie, potem ABC
            const allQ = [...basicQ, ...multiQ];
            if (isMounted) {
               setQuestions(allQ);
               setAnswers(Array(allQ.length).fill(null));
            }
         } catch (e) {
            console.error(e);
         } finally {
            if (isMounted) setLoading(false);
         }
      };
      fetchQuestions();
      return () => { isMounted = false; };
   }, []);

   // Timer
   useEffect(() => {
      if (showResult || loading) return;
      timerRef.current = setInterval(() => {
         setTimer(t => {
            if (t <= 1) {
               clearInterval(timerRef.current!);
               setShowResult(true);
               return 0;
            }
            return t - 1;
         });
      }, 1000);
      return () => clearInterval(timerRef.current!);
   }, [showResult, loading]);

   // Obsługa odpowiedzi
   const handleAnswer = (ans: string) => {
      if (showResult) return;
      const updated = [...answers];
      updated[current] = ans;
      setAnswers(updated);
      // Najpierw 20 Tak/Nie, potem 12 ABC, wynik dopiero po ostatnim pytaniu
      if (current < questions.length - 1) {
         setCurrent(current + 1);
      } else {
         setShowResult(true);
      }
   };

   // Wynik
   useEffect(() => {
      if (!showResult || questions.length === 0) return;
      let sum = 0;
      questions.forEach((q, idx) => {
         if (answers[idx] && answers[idx] === q.poprawna_odpowiedz) {
            sum += q.punkty || 1;
         }
      });
      setScore(sum);

      const saveStats = async () => {
         try {
            // Increment finished exams count
            const finishedExamsStr = await AsyncStorage.getItem('finished_exams');
            const finishedExams = finishedExamsStr ? parseInt(finishedExamsStr, 10) : 0;
            await AsyncStorage.setItem('finished_exams', String(finishedExams + 1));

            // Update best score
            const bestScoreStr = await AsyncStorage.getItem('best_score');
            const bestScore = bestScoreStr ? parseInt(bestScoreStr, 10) : 0;
            if (sum > bestScore) {
               await AsyncStorage.setItem('best_score', String(sum));
            }
         } catch (e) {
            console.error("Failed to save exam stats");
         }
      };

      saveStats();
   }, [showResult, questions, answers]);

   // Formatowanie czasu
   const formatTime = (s: number) => {
      const m = Math.floor(s / 60);
      const sec = s % 60;
      return `${m}:${sec < 10 ? '0' : ''}${sec}`;
   };

   // Always define q, isTakNieSection, isTakNie, options before any early return
   const q = questions[current];
   const isTakNieSection = current < 20;
   const isTakNie = isTakNieSection;
   const options = isTakNie ? ['Tak', 'Nie'] : ['A', 'B', 'C'].filter(l => q && q[`odpowiedz_${l.toLowerCase()}`]);

   useEffect(() => {
      let mounted = true;
      if (q && q.media) {
         getExamMediaSourceAsync(q.media).then(src => {
            if (mounted) setMediaSource(src);
         });
      } else {
         setMediaSource(undefined);
      }
      return () => { mounted = false; };
   }, [q]);

   const fullScreenEnter = async () => {
      await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
   };
   const fullScreenExit = async () => {
      await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT);
   };
   const player = useVideoPlayer(mediaSource, player => {
      player.loop = true;
      player.play();
   });

   if (loading) {
      return <View style={[styles.center, { backgroundColor: colors.background }]}><ActivityIndicator size="large" color={colors.primary} /></View>;
   }
   if (showResult) {
      return (
         <View style={[styles.center, { backgroundColor: colors.background }]}>
            <StyledText style={[styles.resultTitle, { color: colors.text }]}>Wynik egzaminu</StyledText>
            <StyledText style={[styles.resultScore, { color: colors.primary }]}>{score} pkt</StyledText>
            <StyledText style={[styles.resultDesc, { color: colors.text }]}>Twój wynik: {score} / {questions.reduce((a, q) => a + (q.punkty || 1), 0)} pkt</StyledText>
            <TouchableOpacity style={[styles.button, { backgroundColor: colors.primary }]} onPress={() => { setShowResult(false); setCurrent(0); setAnswers(Array(questions.length).fill(null)); setTimer(EXAM_TIME); }}>
               <StyledText style={styles.buttonText}>Spróbuj ponownie</StyledText>
            </TouchableOpacity>
         </View>
      );
   }

   return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
         {/* Header */}
         <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
            <StyledText style={[styles.headerTitle, { color: colors.text }]}>
               Egzamin ({current + 1}/{questions.length})
            </StyledText>
            <View style={{ flex: 1, marginLeft: 16, marginRight: 8 }}>
               {/* Progress bar */}
               <View style={styles.progressBarBg}>
                  <View style={[styles.progressBarFill, { backgroundColor: colors.primary, width: `${100 * (1 - timer / EXAM_TIME)}%` }]} />
               </View>
            </View>
            <StyledText style={[styles.headerTimer, { color: colors.primary }]}>
               <Ionicons name="time-outline" size={18} color={colors.primary} /> {formatTime(timer)}
            </StyledText>
         </View>
         {/* Pytanie */}
         <ScrollView style={[styles.card, { backgroundColor: colors.card }]}>
            <StyledText style={[styles.question, { color: colors.text }]}>{q.pytanie}</StyledText>
            <View style={{ flex: 1, justifyContent: "center", alignItems: 'center' }}>
               {q.media && (q.media.endsWith('.jpg') || q.media.endsWith('.png')) && mediaSource && (
                  <Image
                     source={mediaSource}
                     style={styles.mediaImg}
                     resizeMode="cover"
                  />
               )}
               {q.media && q.media.endsWith('.mp4') && mediaSource && (
                  <VideoView
                     player={player}
                     style={styles.mediaImg}
                     allowsFullscreen
                     onFullscreenEnter={fullScreenEnter}
                     onFullscreenExit={fullScreenExit}
                     contentFit={"cover"}
                  />
               )}
            </View>
            <View style={styles.answersContainer}>
               {options.map(opt => (
                  <TouchableOpacity
                     key={opt}
                     style={[styles.answer, { backgroundColor: colors.card, borderColor: colors.border }, answers[current] === opt && styles.selected]}
                     onPress={() => handleAnswer(opt)}
                     disabled={answers[current] !== null}
                  >
                     <StyledText style={[styles.answerText, { color: colors.text }]}>{isTakNie ? opt : `${opt}. ${q[`odpowiedz_${opt.toLowerCase()}`]}`}</StyledText>
                  </TouchableOpacity>
               ))}
            </View>
            <View style={{ height: 30 }}></View>
         </ScrollView>
      </SafeAreaView>
   );
}

const styles = StyleSheet.create({
   center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
   header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1 },
   headerTitle: { fontSize: 18, fontWeight: 'bold' },
   headerTimer: { fontSize: 16, fontWeight: 'bold' },
   progressBarBg: {
      height: 8,
      backgroundColor: '#e5e7eb',
      borderRadius: 6,
      overflow: 'hidden',
      width: '100%',
      marginVertical: 2,
   },
   progressBarFill: {
      height: 8,
      borderRadius: 6,
   },
   card: {
      borderRadius: 16,
      padding: 16,
      margin: 16,
      shadowColor: '#000',
      shadowOpacity: 0.08,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 2 },
      elevation: 2,
   },
   question: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
   mediaImg: { width: '90%', height: 180, borderRadius: 12, marginBottom: 10, backgroundColor: '#eee' },
   answersContainer: { gap: 12, marginTop: 8 },
   answer: { borderRadius: 10, padding: 16, borderWidth: 1 },
   selected: { borderColor: '#3B82F6', backgroundColor: '#e6f0fd' },
   infoBar: { alignItems: 'center', padding: 8 },
   infoText: { color: '#888', fontSize: 14 },
   resultTitle: { fontSize: 24, fontWeight: 'bold', marginBottom: 12 },
   resultScore: { fontSize: 40, fontWeight: 'bold', marginBottom: 8 },
   resultDesc: { fontSize: 16, marginBottom: 24 },
   button: { borderRadius: 12, paddingVertical: 12, paddingHorizontal: 32 },
   buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
   answerText: { fontWeight: '600', fontSize: 16 },
});