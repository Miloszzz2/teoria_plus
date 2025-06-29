import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import 'react-native-reanimated';
import { supabase } from "@/utils/supabase";
import Auth from "@/components/AuthScreen";
import { Session } from '@supabase/supabase-js'
import { useColorScheme } from '@/components/useColorScheme';
import CategorySelectScreen from './category-select';
import { PlusJakartaSans_400Regular, PlusJakartaSans_600SemiBold, PlusJakartaSans_800ExtraBold, PlusJakartaSans_700Bold } from "@expo-google-fonts/plus-jakarta-sans";
import { Ionicons } from "@expo/vector-icons";
export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: '/',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

const MyDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: 'rgb(10, 132, 255)',
    background: 'rgb(1, 1, 1)',
    card: 'rgb(18, 18, 18)',
    text: 'rgb(229, 229, 231)',
    border: 'rgb(39, 39, 41)',
    notification: 'rgb(255, 69, 58)',
  },
};

import { useTheme } from '@react-navigation/native';
import { LanguageProvider } from "./language-provider";
import i18n from "./i18n";

function RootLayoutNav() {
  const { colors } = useTheme();
  const router = useRouter()
  return (
    <Stack>
      <Stack.Screen name="category-select" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
      <Stack.Screen
        name="category/[category]"
        options={({ route }) => {
          // Get category from route params
          const category =
            (route?.params && (route.params as any).category)
              ? (route.params as any).category
              : 'Kategoria';
          let translatedCategory = category;
          switch (category) {
            case 'Znaki drogowe':
              translatedCategory = i18n.t('signs');
              break;
            case 'Przepisy ruchu':
              translatedCategory = i18n.t('rules');
              break;
            case 'Bezpieczeństwo pojazdu':
              translatedCategory = i18n.t('vehicle_safety');
              break;
            case 'Technika jazdy':
              translatedCategory = i18n.t('driving_technique');
              break;
            case 'Nawigacja drogowa':
              translatedCategory = i18n.t('navigation');
              break;
            case 'Procedury awaryjne':
              translatedCategory = i18n.t('emergency');
              break;
            case 'Inne':
              translatedCategory = i18n.t('other');
              break;
            default:
              // fallback to raw
              translatedCategory = category;
          }
          return {
            href: null,
            title: translatedCategory,
            headerShown: true,
            headerStyle: {
              backgroundColor: colors.card,
              borderBottomWidth: 0,
              elevation: 0,
              shadowOpacity: 0,
            },
            headerTitleStyle: { fontFamily: 'PlusJakartaSans_800ExtraBold', fontSize: 22, color: colors.text },
            headerLeft: ({ tintColor }) => (
              <Ionicons name="arrow-back" size={25} color={tintColor || colors.text} style={{ marginRight: 15, marginTop: 8 }} onPress={() => router.back()} />
            ),
          };
        }}
      />
      <Stack.Screen
        name="category-practice"
        options={() => {
          return ({
            title: i18n.t('select_category'),
            href: null,
            headerShown: true,
            headerStyle: { backgroundColor: colors.card, borderBottomWidth: 0, elevation: 0, shadowOpacity: 0 },
            headerTitleStyle: { fontFamily: 'PlusJakartaSans_800ExtraBold', fontSize: 22, color: colors.text },
            headerLeft: ({ tintColor }) => (
              <Ionicons name="arrow-back" size={25} color={tintColor || colors.text} style={{ marginRight: 15, marginTop: 8 }} onPress={() => router.back()} />
            ),
            tabBarStyle: { display: 'none' }, // <-- Hides the tab bar
          })
        }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  const [loaded, error] = useFonts({
    PlusJakartaSans_400Regular, PlusJakartaSans_600SemiBold, PlusJakartaSans_800ExtraBold, PlusJakartaSans_700Bold
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  const [session, setSession] = useState<Session | null>(null)
  const [categorySelected, setCategorySelected] = useState<boolean | null>(null);

  const colorScheme = useColorScheme();

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => { setSession(session) })
    supabase.auth.onAuthStateChange((_event, session) => { setSession(session) })
  }, [])

  useEffect(() => {
    if (session && session.user) {
      // Sprawdź czy kategoria została wybrana
      import('@react-native-async-storage/async-storage').then(({ default: AsyncStorage }) => {
        AsyncStorage.getItem('selectedCategory').then(val => setCategorySelected(!!val));
      });
    }
  }, [session])

  if (!loaded) return null;
  if (!session || !session.user) return <Auth />;
  if (!categorySelected) return <CategorySelectScreen />;
  return (
    <ThemeProvider value={colorScheme === 'dark' ? MyDarkTheme : DefaultTheme}>
      <LanguageProvider >
        <RootLayoutNav />
      </LanguageProvider>
    </ThemeProvider>
  );
}
