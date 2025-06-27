import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Image } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from '@react-navigation/native';

const categories = [
   {
      key: 'B',
      label: 'Category B',
      desc: 'For cars and light trucks',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBcNYmUIAnLzwL39XQIionDJoC6FJkFLLIuPJcHs79h3vW72_DzJpK7-hhPYpvsJXmgqchlZItvcZ9yum6iswCixoUgmk9DhEJ0YDyo1pwOEX4tJzoBFpldT6yxx4tiaumhp1zPcCXG2rImxaIVXzY5IgjChgx9NTGWs19W-fReL0jJ9qE-uXfBMzErVdWmKi73D9oWQwIAqDeOZdJFcVudSenKkGGeGV6loNdI827NX4bOadQbNNasP8vqdxxCQpifPqbPmvprUuA',
   },
   {
      key: 'A',
      label: 'Category A',
      desc: 'For motorcycles',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCgjXC1_4HYNpJO4Bf9a4cHG_HSGP5DnK0KVjoq80J7dCfF7-UWbDcmKWkXZYHgy1u6WUX1U7UGPh1n7hibyPsK4f_jwqOkERgnSNcPyoBtBlycQFxv80Dmdw9FSRrJFBTFJ7VGHuSHQ0JPI392LrVG2AmWRh79Vj3yI9Jgi8YC_Ga1hEpuRp9Us46CDDaIXLzOjmQrx7UaM8OOji9vOoDJKW8mMGrGcXZeHeIm9x46MM2z71NyCBT2fxMl691xOofVv980UiL2RrE',
   },
   {
      key: 'C',
      label: 'Category C',
      desc: 'For heavy trucks',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBNcl7-iXuEijoQRKqz9ITESCFtEodTVUf0vHbkaWWyRSamrCZozdZ50UGrScxlJ2LRPueICQ1A1nHs22C_C_iIVg1MaOQc1UZKB_sCw-X15nAZ6FvnjJkspYsLb3E4C8yw_bRplhOGIlBdZYhFJn2Qv2VcEyXkq8SdqONbLn6omdlTwWkTpzXEHBaFh2iJ-QTnA7GDyO6vVheOxG0q4L9ABUQ2DqXhpZ6kH8MLVwKJ7oN07PDDGDnYvWCtiMMZn3TRYdaC__zqhao',
   },
];

export default function CategorySelectScreen() {
   const router = useRouter();
   const [selected, setSelected] = useState<string | null>(null);
   const [loading, setLoading] = useState(false);
   const [alreadySelected, setAlreadySelected] = useState<boolean>(false);
   const { colors } = useTheme();

   useFocusEffect(
      useCallback(() => {
         let isActive = true;
         AsyncStorage.getItem('selectedCategory').then(val => {
            if (isActive) setAlreadySelected(!!val);
         });
         return () => { isActive = false; };
      }, [])
   );

   useEffect(() => {
      if (alreadySelected) {
         // Don't navigate during render, use useEffect
         router.navigate("/(tabs)");
      }
   }, [alreadySelected, router]);

   const handleContinue = async () => {
      if (!selected) return;
      setLoading(true);
      await AsyncStorage.setItem('selectedCategory', selected);
      setLoading(false);
      router.push('/(tabs)');
   };

   return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'space-between' }}>
         <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: colors.background, padding: 16, justifyContent: "center" }}>
            <Text style={{ flex: 1, textAlign: 'center', fontWeight: 'bold', fontSize: 22, color: colors.text }}>Choose your license</Text>
         </View>
         <View>
            {categories.map(cat => (
               <View key={cat.key} style={{ padding: 8 }}>
                  <TouchableOpacity
                     style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        backgroundColor: selected === cat.key ? colors.primary : colors.card,
                        borderRadius: 16,
                        overflow: 'hidden',
                        elevation: selected === cat.key ? 2 : 0,
                        shadowColor: selected === cat.key ? colors.primary : 'transparent',
                        shadowOpacity: selected === cat.key ? 0.15 : 0,
                        shadowRadius: 8,
                        shadowOffset: { width: 0, height: 2 },
                     }}
                     onPress={() => setSelected(cat.key)}
                     activeOpacity={0.85}
                  >
                     <View style={{ width: 200, height: 130, borderRadius: 16, overflow: 'hidden', backgroundColor: '#eee', marginRight: 16 }}>
                        <View style={{ flex: 1 }}>
                           <Image
                              src={cat.image}
                              alt={cat.label}
                              style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 16 }}
                           />
                        </View>
                     </View>
                     <View style={{ flex: 1, minWidth: 120, justifyContent: 'center', gap: 2 }}>
                        <Text style={{ color: selected === cat.key ? '#fff' : colors.text, fontWeight: 'bold', fontSize: 18 }}>{cat.label}</Text>
                        <Text style={{ color: selected === cat.key ? '#fff' : colors.text, fontSize: 15 }}>{cat.desc}</Text>
                     </View>
                  </TouchableOpacity>
               </View>
            ))}
         </View>
         <View>
            <View style={{ flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 12 }}>
               <TouchableOpacity
                  style={{
                     flex: 1,
                     minHeight: 48,
                     backgroundColor: selected ? colors.primary : colors.card,
                     borderRadius: 16,
                     alignItems: 'center',
                     justifyContent: 'center',
                     opacity: loading ? 0.7 : 1,
                  }}
                  disabled={!selected || loading}
                  onPress={handleContinue}
               >
                  <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 17 }}>Continue</Text>
               </TouchableOpacity>
            </View>
            <View style={{ height: 20, backgroundColor: colors.background }} />
         </View>
      </SafeAreaView>
   );
}

const styles = StyleSheet.create({
   container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 16,
   },
   title: {
      fontSize: 22,
      fontWeight: 'bold',
      marginBottom: 24,
      textAlign: 'center',
   },
   button: {
      backgroundColor: '#007AFF',
      paddingVertical: 16,
      paddingHorizontal: 32,
      borderRadius: 8,
      marginBottom: 16,
      width: 280,
      alignItems: 'center',
   },
   buttonText: {
      color: '#fff',
      fontSize: 18,
      fontWeight: '500',
   },
});