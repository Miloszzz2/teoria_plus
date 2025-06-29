import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import StyledText from "@/components/StyledText";
import { FontAwesome, FontAwesome5, FontAwesome6, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from 'expo-router';
import i18n from "@/app/i18n";
import { SafeAreaView } from "react-native-safe-area-context";



export default function CategoryPractice() {
   const cards = [
      {
         icon: (
            <FontAwesome name="map-signs" size={24} color="black" />
         ),
         route: "Znaki drogowe",
         title: i18n.t('signs'),
         desc: i18n.t('signs_desc'),
      },
      {
         icon: (
            <MaterialCommunityIcons name="traffic-cone" size={24} color="black" />
         ),
         route: "Przepisy ruchu",
         title: i18n.t('rules'),
         desc: i18n.t('rules_desc'),
      },
      {
         icon: (
            <FontAwesome5 name="car" size={24} color="black" />),
         route: "Bezpieczeństwo pojazdy",
         title: i18n.t('vehicle_safety'),
         desc: i18n.t('vehicle_safety_desc'),
      },
      {
         icon: (
            <MaterialCommunityIcons name="steering" size={28} color="black" />
         ),
         route: "Technika jazdy",
         title: i18n.t('driving_technique'),
         desc: i18n.t('driving_technique_desc'),
      },
      {
         icon: (
            <FontAwesome5 name="traffic-light" size={24} color="black" />
         ),
         route: "Nawigacja drogowa",
         title: i18n.t('navigation'),
         desc: i18n.t('navigation_desc'),
      },
      {
         icon: (
            <FontAwesome5 name="first-aid" size={22} color="black" />
         ), route: "Procedury awaryjne",
         title: i18n.t('emergency'),
         desc: i18n.t('emergency_desc'),
      },
      {
         icon: (
            <FontAwesome5 name="question-circle" size={24} color="black" />
         ), route: "Inne",
         title: i18n.t('other'),
         desc: i18n.t('other_desc'),
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
   const router = useRouter()
   return (
      <SafeAreaView style={{ flex: 1 }}>
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
                        onPress={() => router.navigate(`/category/${encodeURIComponent(card.route)}`)}
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
                           <StyledText style={[styles.cardTitle]}>{card.title}</StyledText>
                           <StyledText style={styles.cardDesc}>{card.desc}</StyledText>
                        </View>
                     </TouchableOpacity>
                  </View>
               ))}
            </View>
         </ScrollView>
      </SafeAreaView>
   );
}

const styles = StyleSheet.create({
   gridWrap: {
      padding: 16,
      paddingTop: 0,
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
