import { FontAwesome6 } from "@expo/vector-icons";
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Switch, Image } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { supabase } from '../../utils/supabase';
import CustomText from '../../components/StyledText';
import { useTheme } from '@react-navigation/native';
import { useLanguage } from '../language-provider';
import i18n from '../i18n';

export default function SettingsScreen() {
  const [notifications, setNotifications] = useState(true);
  const [user, setUser] = useState<any>(null);
  const { colors } = useTheme();
  const { language, setLanguage } = useLanguage();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data?.user));
  }, []);

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={{ paddingTop: 40 }}>
        <View style={styles.profileRow}>
          <Image
            source={{ uri: user?.user_metadata?.avatar_url || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user?.email || i18n.t('profile')) + '&background=eee&color=121417&size=128' }}
            style={styles.avatar}
          />
          <View style={{ flex: 1, justifyContent: 'center' }}>
            <CustomText style={[styles.profileTitle, { color: colors.text }]}>{user?.user_metadata?.full_name || user?.email || i18n.t('profile')}</CustomText>
            <CustomText style={styles.profileSubtitle}>
              {user?.email
                ? i18n.t('logged_in_as', { email: user.email })
                : i18n.t('view_profile')}
            </CustomText>
          </View>
        </View>
        <View style={[styles.rowBetween, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
          <CustomText style={[styles.rowText, { color: colors.text }]}>{i18n.t('notifications')}</CustomText>
          <Switch
            value={notifications}
            onValueChange={setNotifications}
            trackColor={{ false: '#f1f2f4', true: '#5b98d6' }}
            thumbColor={notifications ? '#fff' : '#fff'}
          />
        </View>
        <View style={[styles.rowBetween, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
          <CustomText style={[styles.rowText, { color: colors.text }]}>{i18n.t('language')}</CustomText>
          <Picker
            selectedValue={language}
            style={{ width: 180, color: colors.text, backgroundColor: colors.card, borderRadius: 8 }}
            onValueChange={(itemValue: string) => setLanguage(itemValue)}
            dropdownIconColor={colors.text}
          >
            <Picker.Item label="🇵🇱  Polski" value="pl" />
            <Picker.Item label="🇩🇪  Deutsch" value="de" />
            <Picker.Item label="🇺🇦  Українська" value="ua" />
          </Picker>
        </View>
        <CustomText style={[styles.sectionTitle, { color: colors.text }]}>{i18n.t('support')}</CustomText>
        <TouchableOpacity style={[styles.rowBetween, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
          <CustomText style={[styles.rowText, { color: colors.text }]}>{i18n.t('help_center')}</CustomText>
          <FontAwesome6 name="arrow-right" color={colors.text} />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.rowBetween, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
          <CustomText style={[styles.rowText, { color: colors.text }]}>{i18n.t('contact')}</CustomText>
          <FontAwesome6 name="arrow-right" color={colors.text} />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.rowBetween, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
          <CustomText style={[styles.rowText, { color: colors.text }]}>{i18n.t('regulations')}</CustomText>
          <FontAwesome6 name="arrow-right" color={colors.text} />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.rowBetween, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
          <CustomText style={[styles.rowText, { color: colors.text }]}>{i18n.t('privacy_policy')}</CustomText>
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
        <CustomText style={{ color: '#fff', fontWeight: 'semibold', fontSize: 18, padding: 15 }}>{i18n.t('logout')}</CustomText>
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
