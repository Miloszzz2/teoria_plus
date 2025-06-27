import { FontAwesome6 } from "@expo/vector-icons";
import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Switch, Image } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { supabase } from '../../utils/supabase';
import CustomText from '../../components/StyledText';
import { useTheme } from '@react-navigation/native';

export default function SettingsScreen() {
  const [notifications, setNotifications] = useState(true);
  const [language, setLanguage] = useState('pl');
  const { colors } = useTheme();

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={{ paddingTop: 40 }}>
        <View style={styles.profileRow}>
          <Image
            source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCIrXSVfSx9SnpnE5gweMEvmVuJb-6FkXzfDXHVy3iWGihmAXwqNG50Noh6U7sjAbd0MYTB81lphmbMCPUkmJv3I0Jl2dMGv4lIKAXu5GSY_QRT1y4zVYCIJI2pa73Qu7cRcr-bFZzFxmEuskbg8vCITNpYYt169EJhAB9nLWgc5aLPEVsedAliu-7rUafXb5BZfFMynn_z3zQWdsRjsJgXONvRFeBGbIT9DgEPrBxJMt3LIGpO6PDE41AbOr3vIZuhf4TCWfoWcR4' }}
            style={styles.avatar}
          />
          <View style={{ flex: 1, justifyContent: 'center' }}>
            <CustomText style={[styles.profileTitle, { color: colors.text }]}>Profil</CustomText>
            <CustomText style={styles.profileSubtitle}>Zobacz profil</CustomText>
          </View>
        </View>
        <View style={[styles.rowBetween, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
          <CustomText style={[styles.rowText, { color: colors.text }]}>Powiadomienia</CustomText>
          <Switch
            value={notifications}
            onValueChange={setNotifications}
            trackColor={{ false: '#f1f2f4', true: '#5b98d6' }}
            thumbColor={notifications ? '#fff' : '#fff'}
          />
        </View>
        <View style={[styles.rowBetween, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
          <CustomText style={[styles.rowText, { color: colors.text }]}>Język</CustomText>
          <Picker
            selectedValue={language}
            style={{ width: 180, color: colors.text, backgroundColor: colors.card, borderRadius: 8 }}
            onValueChange={(itemValue: string) => setLanguage(itemValue)}
            dropdownIconColor={colors.text}
          >
            <Picker.Item label="🇵🇱  Polski" value="pl" />
            <Picker.Item label="🇩🇪  Niemiecki" value="de" />
            <Picker.Item label="🇺🇦  Ukraiński" value="ua" />
          </Picker>
        </View>
        <CustomText style={[styles.sectionTitle, { color: colors.text }]}>Wsparcie</CustomText>
        <TouchableOpacity style={[styles.rowBetween, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
          <CustomText style={[styles.rowText, { color: colors.text }]}>Centrum pomocy</CustomText>
          <FontAwesome6 name="arrow-right" color={colors.text} />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.rowBetween, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
          <CustomText style={[styles.rowText, { color: colors.text }]}>Kontakt</CustomText>
          <FontAwesome6 name="arrow-right" color={colors.text} />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.rowBetween, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
          <CustomText style={[styles.rowText, { color: colors.text }]}>Regulamin</CustomText>
          <FontAwesome6 name="arrow-right" color={colors.text} />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.rowBetween, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
          <CustomText style={[styles.rowText, { color: colors.text }]}>Polityka prywatności</CustomText>
          <FontAwesome6 name="arrow-right" color={colors.text} />
        </TouchableOpacity>
      </View>
      <TouchableOpacity
        style={{
          backgroundColor: '#3d98f4',
          margin: 24,
          borderRadius: 16,
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 48,
        }}
        onPress={async () => {
          await supabase.auth.signOut();
        }}
      >
        <CustomText style={{ color: '#fff', fontWeight: 'semibold', fontSize: 18, padding: 15 }}>Wyloguj się</CustomText>
      </TouchableOpacity>
      <View style={{ height: 20, backgroundColor: colors.background }} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'space-between',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    paddingBottom: 8,
    justifyContent: 'space-between',
  },
  iconLeft: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 18,
    color: '#121417',
    paddingRight: 48,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#121417',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    minHeight: 72,
    paddingVertical: 8,
    gap: 16,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#eee',
  },
  profileTitle: {
    color: '#121417',
    fontSize: 16,
    fontWeight: '500',
  },
  profileSubtitle: {
    color: '#677583',
    fontSize: 14,
    fontWeight: '400',
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    minHeight: 56,
    justifyContent: 'space-between',
    borderBottomWidth: 0.5,
    borderBottomColor: '#f1f2f4',
  },
  rowText: {
    color: '#121417',
    fontSize: 16,
    fontWeight: '400',
  },
  arrow: {
    color: '#121417',
    fontSize: 22,
    fontWeight: '400',
    marginLeft: 8,
  },
});
