import React, { useEffect, useState, useCallback, useMemo } from "react";
import { View, ScrollView, StyleSheet, Image, ActivityIndicator, TouchableOpacity } from "react-native";
import StyledText from "@/components/StyledText";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/utils/supabase';
import { Ionicons } from '@expo/vector-icons';
import { Client, Query, Storage } from 'react-native-appwrite';
import * as ScreenOrientation from 'expo-screen-orientation';
import { SafeAreaView } from "react-native-safe-area-context";
import { getMediaSource } from "@/assets/mediaMap";
import { ResizeMode, Video, VideoFullscreenUpdateEvent } from "expo-av";
import { useTheme } from '@react-navigation/native';

// Memoized komponenty dla lepszej wydajności
const QuestionButton = React.memo(({
   index,
   isActive,
   onPress,
   colors
}: {
   index: number;
   isActive: boolean;
   onPress: (index: number) => void;
   colors: any;
}) => (
   <TouchableOpacity
      onPress={() => onPress(index)}
      style={[
         styles.questionButton,
         {
            backgroundColor: isActive ? colors.primary : colors.card,
            borderColor: isActive ? colors.primary : colors.border,
         }
      ]}
   >
      <StyledText style={[
         styles.questionButtonText,
         { color: isActive ? '#fff' : colors.text }
      ]}>
         {index + 1}
      </StyledText>
   </TouchableOpacity>
));

const AnswerOption = React.memo(({
   letter,
   text,
   isCorrect,
   colors
}: {
   letter?: string;
   text: string;
   isCorrect: boolean;
   colors: any;
}) => (
   <View style={[styles.answer, { backgroundColor: colors.card, borderColor: colors.border }, isCorrect && styles.correct]}>
      <StyledText style={[
         styles.answerText,
         { color: isCorrect ? '#22C55E' : colors.text }
      ]}>
         {text}
      </StyledText>
   </View>
));

// Appwrite client setup
const appwrite = new Client();
appwrite
   .setEndpoint(process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT || '')
   .setProject(process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID || '');
const storage = new Storage(appwrite);
const APPWRITE_BUCKET_ID = process.env.EXPO_PUBLIC_APPWRITE_BUCKET_ID || '';

// Helper: get media source (local or Appwrite, with fileId lookup)
async function getLearningMediaSourceAsync(media: string) {
   if (!media) return undefined;
   const local = getMediaSource(media);
   if (local) return local;
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
   return {
      uri: `${process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT}/storage/buckets/${APPWRITE_BUCKET_ID}/files/${encodeURIComponent(media)}/view?project=${process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID}&mode=admin`
   };
}

export default function LearningModeScreen() {
   const [questions, setQuestions] = useState<any[]>([]);
   const [loading, setLoading] = useState(true);
   const [current, setCurrent] = useState(0);
   const [category, setCategory] = useState<string | null>(null);
   const [mediaSource, setMediaSource] = useState<any>(undefined);
   const scrollRef = React.useRef<ScrollView>(null);
   const { colors } = useTheme();

   // Load last viewed question index for selected category
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

            const cat = selected.trim();
            setCategory(cat);
            // Load last viewed question index for this category
            const lastIdxStr = await AsyncStorage.getItem(`learning_last_question_${cat}`);
            const lastIdx = lastIdxStr ? parseInt(lastIdxStr, 10) : 0;
            setCurrent(isNaN(lastIdx) ? 0 : lastIdx);

            const { data, error } = await supabase
               .from('pytania_egzaminacyjne')
               .select('*')
               .ilike('kategorie', `%${cat}%`);

            if (isMounted && !error && data) {
               setQuestions(data);
            }
         } catch (error) {
            console.error('Error fetching questions:', error);
         } finally {
            if (isMounted) {
               setLoading(false);
            }
         }
      };

      fetchQuestions();
      return () => { isMounted = false; };
   }, []);

   // Store last viewed question index on change
   useEffect(() => {
      if (!category) return;
      AsyncStorage.setItem(`learning_last_question_${category}`, String(current));
   }, [current, category]);

   // Memoized handlers dla lepszej wydajności
   const handlePrevious = useCallback(() => {
      setCurrent(c => Math.max(0, c - 1));
   }, []);

   const handleNext = useCallback(() => {
      setCurrent(c => Math.min(questions.length - 1, c + 1));
   }, [questions.length]);

   const handleQuestionSelect = useCallback((index: number) => {
      setCurrent(index);
   }, []);

   // Memoized current question
   const currentQuestion = useMemo(() => {
      return questions[current];
   }, [questions, current]);

   useEffect(() => {
      let mounted = true;
      if (currentQuestion && currentQuestion.media) {
         getLearningMediaSourceAsync(currentQuestion.media).then(src => {
            if (mounted) setMediaSource(src);
         });
      } else {
         setMediaSource(undefined);
      }
      return () => { mounted = false; };
   }, [currentQuestion]);

   // Memoized answer options
   const answerOptions = useMemo(() => {
      if (!currentQuestion) return [];

      const q = currentQuestion;

      // Sprawdź czy to pytanie Tak/Nie
      if (q.odpowiedz_a == null && q.odpowiedz_b == null && q.odpowiedz_c == null &&
         (q.poprawna_odpowiedz === 'Tak' || q.poprawna_odpowiedz === 'Nie')) {
         return ['Tak', 'Nie'].map((ans) => ({
            key: ans,
            text: ans.charAt(0).toUpperCase() + ans.slice(1),
            isCorrect: q.poprawna_odpowiedz === ans,
         }));
      }

      // Standardowe A/B/C
      return [
         ['A', q.odpowiedz_a],
         ['B', q.odpowiedz_b],
         ['C', q.odpowiedz_c],
      ]
         .filter(([_, ans]) => ans)
         .map(([letter, ans]) => ({
            key: letter,
            letter,
            text: ans,
            isCorrect: q.poprawna_odpowiedz === letter,
         }));
   }, [currentQuestion]);

   // Memoized navigation state
   const navigationState = useMemo(() => ({
      canGoPrevious: current > 0,
      canGoNext: current < questions.length - 1,
   }), [current, questions.length]);

   const handleFullscreenUpdate = async (event: VideoFullscreenUpdateEvent) => {
      if (event.fullscreenUpdate === 1) { // entering fullscreen
         await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
      } else if (event.fullscreenUpdate === 3) { // exiting fullscreen
         await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT);
      }
   };


   if (loading) {
      return (
         <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
            <ActivityIndicator size="large" color={colors.primary} />
         </View>
      );
   }

   return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
         {/* Navigation Header */}
         <View style={[styles.navigationHeader, { backgroundColor: colors.card }]}>
            <TouchableOpacity
               onPress={handlePrevious}
               disabled={!navigationState.canGoPrevious}
               style={[styles.navButton, { opacity: navigationState.canGoPrevious ? 1 : 0.4 }]}
            >
               <Ionicons name="chevron-back" size={28} color={colors.primary} />
            </TouchableOpacity>

            <ScrollView
               horizontal
               showsHorizontalScrollIndicator={false}
               contentContainerStyle={styles.questionScrollContainer}
            >
               {questions.map((_, idx) => (
                  <QuestionButton
                     key={`question-${idx}`}
                     index={idx}
                     isActive={idx === current}
                     onPress={handleQuestionSelect}
                     colors={colors}
                  />
               ))}
            </ScrollView>

            <TouchableOpacity
               onPress={handleNext}
               disabled={!navigationState.canGoNext}
               style={[styles.navButton, { opacity: navigationState.canGoNext ? 1 : 0.4 }]}
            >
               <Ionicons name="chevron-forward" size={28} color={colors.primary} />
            </TouchableOpacity>
         </View>

         {/* Question Content */}
         <ScrollView
            style={[styles.contentScroll, { backgroundColor: colors.background }]}
            contentContainerStyle={styles.contentContainer}
            ref={scrollRef}
         >
            {currentQuestion ? (
               <View style={[styles.card, { backgroundColor: colors.card }]}>
                  <StyledText style={[styles.question, { color: colors.text }]}>
                     {currentQuestion.pytanie}
                  </StyledText>

                  {/* Uncomment when media is ready */}
                  {currentQuestion.media && (currentQuestion.media.endsWith('.jpg') || currentQuestion.media.endsWith('.png')) && mediaSource && (
                     <Image
                        source={mediaSource}
                        style={styles.mediaImg}
                        resizeMode="contain"
                     />
                  )}
                  {currentQuestion.media && currentQuestion.media.endsWith('.mp4') && mediaSource && (
                     <Video
                        source={mediaSource}
                        style={styles.mediaImg}
                        useNativeControls
                        shouldPlay

                        onFullscreenUpdate={handleFullscreenUpdate}
                        resizeMode={ResizeMode.COVER}
                     />
                  )}

                  <View style={styles.answersContainer}>
                     {answerOptions.map((option) => (
                        <AnswerOption
                           key={option.key}
                           letter={option.key}
                           text={option.text}
                           isCorrect={option.isCorrect}
                           colors={colors}
                        />
                     ))}
                  </View>
               </View>
            ) : (
               <StyledText style={[styles.noQuestionsText, { color: colors.text }]}>
                  Brak pytań dla wybranej kategorii.
               </StyledText>
            )}
         </ScrollView>

         {/* Bottom Navigation - fixed to bottom */}
         <View style={[styles.bottomNavigationFixed, { backgroundColor: colors.card }]}>
            <TouchableOpacity
               onPress={handlePrevious}
               disabled={!navigationState.canGoPrevious}
               style={[
                  styles.bottomButton,
                  {
                     backgroundColor: navigationState.canGoPrevious ? colors.primary : colors.card,
                     opacity: navigationState.canGoPrevious ? 1 : 0.6,
                  }
               ]}
            >
               <StyledText style={[
                  styles.bottomButtonText,
                  { color: navigationState.canGoPrevious ? '#fff' : colors.text }
               ]}>
                  Poprzedni
               </StyledText>
            </TouchableOpacity>

            <TouchableOpacity
               onPress={handleNext}
               disabled={!navigationState.canGoNext}
               style={[
                  styles.bottomButton,
                  {
                     backgroundColor: navigationState.canGoNext ? colors.primary : colors.card,
                     opacity: navigationState.canGoNext ? 1 : 0.6,
                  }
               ]}
            >
               <StyledText style={[
                  styles.bottomButtonText,
                  { color: navigationState.canGoNext ? '#fff' : colors.text }
               ]}>
                  Następny
               </StyledText>
            </TouchableOpacity>
         </View>
      </SafeAreaView>
   );
}

const styles = StyleSheet.create({
   container: {
      flex: 1,
   },
   loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
   },
   navigationHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 8,
   },
   navButton: {
      padding: 6,
   },
   questionScrollContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
   },
   questionButton: {
      width: 50,
      height: 36,
      borderRadius: 8,
      borderWidth: 2,
      alignItems: 'center',
      justifyContent: 'center',
      marginHorizontal: 2,
   },
   questionButtonText: {
      fontWeight: 'bold',
      fontSize: 16,
   },
   contentScroll: {
      flex: 1,
   },
   contentContainer: {
      padding: 16,
   },
   card: {
      borderRadius: 16,
      padding: 18,
      marginBottom: 18,
      shadowColor: '#000',
      shadowOpacity: 0.08,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 2 },
      elevation: 2,
   },
   question: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 10,
   },
   answersContainer: {
      gap: 8,
      marginTop: 8,
   },
   answer: {
      borderRadius: 10,
      padding: 12,
      borderWidth: 1,
   },
   answerText: {
      fontWeight: '600',
   },
   correct: {
      borderColor: '#22C55E',
      backgroundColor: '#e7fbe9',
   },
   mediaImg: {
      width: '100%',
      height: 180,
      borderRadius: 12,
      marginBottom: 10,
      backgroundColor: '#eee',
   },
   noQuestionsText: {
      textAlign: 'center',
      marginTop: 32,
   },
   bottomNavigationFixed: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 16,
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 10,
   },
   bottomButton: {
      borderRadius: 12,
      paddingVertical: 14,
      paddingHorizontal: 28,
   },
   bottomButtonText: {
      fontWeight: 'bold',
      fontSize: 18,
   },
});