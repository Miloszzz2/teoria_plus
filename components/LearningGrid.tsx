import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import CustomText from './StyledText';
import Svg, { Path } from 'react-native-svg';
import { FontAwesome, FontAwesome5, FontAwesome6, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from 'expo-router';

const cards = [
   {
      icon: (
         <FontAwesome name="map-signs" size={24} color="black" />
      ),
      title: 'Znaki drogowe',
      desc: 'Poznaj różne znaki drogowe i ich znaczenie.',
   },
   {
      icon: (
         <MaterialCommunityIcons name="traffic-cone" size={24} color="black" />
      ),
      title: 'Przepisy ruchu',
      desc: 'Zrozum zasady i przepisy ruchu drogowego.',
   },
   {
      icon: (
         <FontAwesome5 name="car" size={24} color="black" />),
      title: 'Bezpieczeństwo pojazdu',
      desc: 'Dowiedz się, jak dbać o pojazd i sprawdzać jego stan.',
   },
   {
      icon: (
         <MaterialCommunityIcons name="steering" size={28} color="black" />
      ),
      title: 'Technika jazdy',
      desc: 'Opanuj techniki jazdy w różnych warunkach.',
   },
   {
      icon: (
         <FontAwesome5 name="traffic-light" size={24} color="black" />
      ),
      title: 'Nawigacja drogowa',
      desc: 'Dowiedz się, jak korzystać z map i znaków drogowych.',
   },
   {
      icon: (
         <FontAwesome5 name="first-aid" size={22} color="black" />
      ),
      title: 'Procedury awaryjne',
      desc: 'Dowiedz się, jak postępować w sytuacjach awaryjnych na drodze.',
   },
   {
      icon: (
         <FontAwesome5 name="question-circle" size={24} color="black" />
      ),
      title: 'Inne',
      desc: 'Pozostałe pytania spoza głównych kategorii.',
   },
];

const rainbowColors = [
   ['#FF3B30'], // vibrant red-orange
   ['#34C759'], // vibrant green-blue
   ['#FFD600'], // vibrant yellow-green
   ['#5856D6'], // vibrant blue-purple
   ['#AF52DE'], // vibrant purple-yellow
   ['#FF2D55'], // vibrant pink-blue
   ['#FF9500'], // vibrant orange
];

export default function LearningGrid() {
   const router = useRouter();
   return (
      <ScrollView contentContainerStyle={styles.gridWrap}>
         <View style={styles.grid}>
            {cards.map((card, idx) => (
               <View
                  key={idx}
                  style={[
                     styles.card,
                     {
                        backgroundColor: rainbowColors[idx % rainbowColors.length][0],
                        borderWidth: 0,
                        shadowColor: '#1A1A1A',
                        shadowOpacity: 0.28,
                        shadowRadius: 24,
                        shadowOffset: { width: 10, height: 10 },
                        elevation: 12,
                     },
                  ]}
               >
                  <TouchableOpacity
                     onPress={() => router.navigate(`/category/${encodeURIComponent(card.title)}`)}
                     style={{ flex: 1 }}
                     activeOpacity={0.85}
                  >
                     <View
                        style={{
                           ...styles.iconWrap,
                           backgroundColor: 'rgba(255,255,255,0.90)',
                           borderRadius: 12,
                           padding: 10,
                           alignSelf: 'flex-start',
                           marginBottom: 8,
                        }}
                     >
                        {card.icon}
                     </View>
                     <View style={{ gap: 2 }}>
                        <CustomText style={[styles.cardTitle]}>{card.title}</CustomText>
                        <CustomText style={styles.cardDesc}>{card.desc}</CustomText>
                     </View>
                  </TouchableOpacity>
               </View>
            ))}
         </View>
      </ScrollView>
   );
}

const styles = StyleSheet.create({
   gridWrap: {
      padding: 16,
      paddingBottom: 0,
      alignItems: 'center',
      justifyContent: 'center',
   },
   grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12,
      justifyContent: 'space-between',
   },
   card: {
      flexBasis: '48%',
      minWidth: 158,
      maxWidth: '48%',
      flexGrow: 1,
      backgroundColor: '#fff',
      borderRadius: 14,
      borderWidth: 1,
      borderColor: '#dde0e4',
      padding: 16,
      marginBottom: 12,
      gap: 8,
      shadowColor: '#000',
      shadowOpacity: 0.04,
      shadowRadius: 4,
      shadowOffset: { width: 0, height: 2 },
      elevation: 2,
   },
   iconWrap: {
      marginBottom: 8,
   },
   cardTitle: {
      color: 'white',
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 2,
   },
   cardDesc: {
      color: 'white',
      fontSize: 13,
      fontWeight: '600',
   },
});
