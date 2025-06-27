import React from 'react';
import { StyleSheet, View, TouchableOpacity, Text } from 'react-native';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import CustomText from "@/components/StyledText";
import { useTheme } from '@react-navigation/native';

export default function Index() {
   const router = useRouter();
   const { colors } = useTheme();

   return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
         <CustomText style={[styles.title, { color: colors.text }]}>Witaj! Wybierz tryb nauki</CustomText>
         <View style={styles.buttonRow}>
            <TouchableOpacity style={[styles.button, styles.exam]} onPress={() => router.push('/(tabs)/(modes)/exam-mode')}>
               <MaterialCommunityIcons name="clock" size={40} color="#fff" style={styles.iconShadow} />
               <CustomText style={styles.buttonText}>Tryb egzaminu</CustomText>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, styles.learn]} onPress={() => router.push('/(tabs)/(modes)/learning-mode')}>
               <MaterialCommunityIcons name="book-open-variant" size={40} color="#fff" style={styles.iconShadow} />
               <CustomText style={styles.buttonText}>Tryb nauki</CustomText>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, styles.practice]} onPress={() => router.push('/(tabs)/(modes)/category-practice-mode')}>
               <FontAwesome5 name="layer-group" size={36} color="#fff" style={styles.iconShadow} />
               <CustomText style={styles.buttonText}>Praktyka kategorii</CustomText>
            </TouchableOpacity>
         </View>
      </View>
   );
}

const styles = StyleSheet.create({
   container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#f7faff',
   },
   title: {
      fontSize: 24,
      fontWeight: 'semibold',
      marginBottom: 32,
      color: '#222',
   },
   buttonRow: {
      width: '100%',
      alignItems: 'center',
   },
   button: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-start',
      width: 320,
      paddingVertical: 22,
      paddingHorizontal: 24,
      borderRadius: 18,
      marginBottom: 22,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.10,
      shadowRadius: 8,
      elevation: 4,
   },
   exam: {
      backgroundColor: '#3B82F6', // niebieski
   },
   learn: {
      backgroundColor: '#FACC15', // żółty
   },
   practice: {
      backgroundColor: '#22C55E', // zielony
   },
   buttonText: {
      color: '#fff',
      fontSize: 20,
      fontWeight: '600',
      marginLeft: 18,
   },
   iconShadow: {
      textShadowColor: 'rgba(0,0,0,0.15)',
      textShadowOffset: { width: 1, height: 2 },
      textShadowRadius: 4,
   },
});

