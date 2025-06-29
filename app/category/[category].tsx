import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { View, ScrollView, ActivityIndicator, Image, TouchableOpacity, StyleSheet } from 'react-native';
import StyledText from '@/components/StyledText';
import { supabase } from '@/utils/supabase';
import { SafeAreaView } from "react-native-safe-area-context";
import { Client, Query, Storage } from 'react-native-appwrite';
import { getMediaSource } from "@/assets/mediaMap";
import * as ScreenOrientation from 'expo-screen-orientation';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@react-navigation/native';
import { useVideoPlayer, VideoView } from "expo-video";
import i18n from '../i18n';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLanguage } from "../language-provider";

// Appwrite client setup
const appwrite = new Client();
appwrite
   .setEndpoint(process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT || '')
   .setProject(process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID || '');
const storage = new Storage(appwrite);
const APPWRITE_BUCKET_ID = process.env.EXPO_PUBLIC_APPWRITE_BUCKET_ID || '';

// Helper: get media source (local or Appwrite, with fileId lookup)
async function getCategoryMediaSourceAsync(media: string) {
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
   } catch (e) { }
   return {
      uri: `${process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT}/storage/buckets/${APPWRITE_BUCKET_ID}/files/${encodeURIComponent(media)}/view?project=${process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID}&mode=admin`
   };
}

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

export default function CategoryScreen() {
   const { category } = useLocalSearchParams();
   const [questions, setQuestions] = useState<any[]>([]);
   const [loading, setLoading] = useState(true);
   const [current, setCurrent] = useState(0);
   const [mediaSource, setMediaSource] = useState<any>(undefined);
   const scrollRef = useRef<ScrollView>(null);
   const { colors } = useTheme();
   const { language } = useLanguage();
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
            // Dynamiczne kolumny na podstawie języka
            let pytanieCol = 'pytanie', odpA = 'odpowiedz_a', odpB = 'odpowiedz_b', odpC = 'odpowiedz_c';
            if (language === 'de') {
               pytanieCol = 'pytanie_de'; odpA = 'odp_a_de'; odpB = 'odp_b_de'; odpC = 'odp_c_de';
            } else if (language === 'ua') {
               pytanieCol = 'pytanie_ua'; odpA = 'odp_a_ua'; odpB = 'odp_b_ua'; odpC = 'odp_c_ua';
            } else if (language === 'en') {
               pytanieCol = 'pytanie_eng'; odpA = 'odp_a_eng'; odpB = 'odp_b_eng'; odpC = 'odp_c_eng';
            }
            console.log(category.toString())
            // Pobierz pytania
            const { data, error } = await supabase
               .from('pytania_egzaminacyjne')
               .select(`*, ${pytanieCol}, ${odpA}, ${odpB}, ${odpC}`)
               .ilike('kategorie', `%${cat}%`).eq("kategoria_pytania", category.toString());

            if (isMounted && !error && data) {
               // Mapuj pytania na wybrany język
               const mapQ = (q: any) => ({
                  ...q,
                  pytanie: q[pytanieCol] || q.pytanie,
                  odpowiedz_a: q[odpA] || q.odpowiedz_a,
                  odpowiedz_b: q[odpB] || q.odpowiedz_b,
                  odpowiedz_c: q[odpC] || q.odpowiedz_c,
               });
               setQuestions(data.map(mapQ));
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
   }, [language]);

   // Scroll to top on question change
   useEffect(() => {
      if (scrollRef.current) {
         scrollRef.current.scrollTo({ y: 0, animated: false });
      }
   }, [current]);

   // Load media for current question
   const currentQuestion = useMemo(() => questions[current], [questions, current]);
   useEffect(() => {
      let mounted = true;
      if (currentQuestion && currentQuestion.media) {
         getCategoryMediaSourceAsync(currentQuestion.media).then(src => {
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
      // Tak/Nie
      if (
         q.odpowiedz_a == null && q.odpowiedz_b == null && q.odpowiedz_c == null &&
         (q.poprawna_odpowiedz === 'Tak' || q.poprawna_odpowiedz === 'Nie')
      ) {
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
            text: `${letter}. ${ans}`,
            isCorrect: q.poprawna_odpowiedz === letter,
         }));
   }, [currentQuestion]);

   // Navigation state
   const navigationState = useMemo(() => ({
      canGoPrevious: current > 0,
      canGoNext: current < questions.length - 1,
   }), [current, questions.length]);

   const handlePrevious = useCallback(() => {
      setCurrent(c => Math.max(0, c - 1));
   }, []);

   const handleNext = useCallback(() => {
      setCurrent(c => Math.min(questions.length - 1, c + 1));
   }, [questions.length]);

   const handleQuestionSelect = useCallback((index: number) => {
      setCurrent(index);
   }, []);

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
      return (
         <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
            <ActivityIndicator size="large" color={colors.primary} />
         </View>
      );
   }

   return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
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
                  <TouchableOpacity
                     key={`question-${idx}`}
                     onPress={() => handleQuestionSelect(idx)}
                     style={[
                        styles.questionButton,
                        {
                           backgroundColor: idx === current ? colors.primary : colors.card,
                           borderColor: idx === current ? colors.primary : colors.border,
                        }
                     ]}
                  >
                     <StyledText style={[
                        styles.questionButtonText,
                        { color: idx === current ? '#fff' : colors.text }
                     ]}>
                        {idx + 1}
                     </StyledText>
                  </TouchableOpacity>
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

         {/* Main flex container: scrollable content + bottom nav */}
         <View style={styles.flexMain}>
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

                     <View style={{ flex: 1, justifyContent: "center", alignItems: 'center' }}>
                        {currentQuestion.media && (currentQuestion.media.endsWith('.jpg') || currentQuestion.media.endsWith('.png')) && mediaSource && (
                           <Image
                              source={mediaSource}
                              style={styles.mediaImg}
                              resizeMode="cover"
                           />
                        )}
                        {currentQuestion.media && currentQuestion.media.endsWith('.mp4') && mediaSource && (
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

            {/* Bottom Navigation - SafeAreaView only on bottom */}
            <SafeAreaView edges={['bottom']} style={{ backgroundColor: colors.card }}>
               <View style={[styles.bottomNavigation, { backgroundColor: colors.card }]}>
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
         </View>
      </View>
   );
}

const styles = StyleSheet.create({
   container: {
      flex: 1,

   },
   flexMain: {
      flex: 1,
      flexDirection: 'column',
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
      flexGrow: 1,
      justifyContent: 'flex-start',
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
      width: '90%',
      height: 180,
      borderRadius: 12,
      marginBottom: 10,
      backgroundColor: '#eee',
   },
   noQuestionsText: {
      textAlign: 'center',
      marginTop: 32,
   },
   bottomNavigation: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 10,
      // No absolute/fixed/positioning
   },
   bottomButton: {
      borderRadius: 12,
      paddingVertical: 14,
      paddingHorizontal: 28
   },
   bottomButtonText: {
      fontWeight: 'bold',
      fontSize: 18
   }
});