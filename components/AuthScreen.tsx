import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, TextInput, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { supabase } from '@/utils/supabase';
import { Ionicons } from '@expo/vector-icons';

export default function AuthScreen() {
   const [mode, setMode] = useState<'login' | 'signup' | 'select'>('select');
   const [email, setEmail] = useState('');
   const [password, setPassword] = useState('');
   const [showPassword, setShowPassword] = useState(false);
   const [loading, setLoading] = useState(false);

   async function signInWithEmail() {
      setLoading(true);
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) Alert.alert(error.message);
      setLoading(false);
   }

   async function signUpWithEmail() {
      setLoading(true);
      const { data: { session }, error } = await supabase.auth.signUp({ email, password });
      if (error) Alert.alert(error.message);
      if (!session) Alert.alert('Please check your inbox for email verification!');
      setLoading(false);
   }

   if (mode === 'select') {
      return (
         <View style={styles.root}>
            <View>
               <View style={styles.heroWrap}>
                  <Image
                     source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDhOut2iy_gBo04uF5oSgMISHygrOJohr5SkMptF621csmpX3a5svNIQ8-URbm4gAcyzmlDMeCFGvif1Lhpsy5rTFcbOJGbF2lKEQnfnDMsPEMW-qi0_XRJjJxUzaQjwbDn0fx2RVv2iug-U6cVt1CVfzRQSRugZz_ffdzj28A6NwHZU3grrVLHRXEN1U16-BrpLLVdKZeQY2A3hZa2-2WKbkK1jut2z_a4Wm87bksXv3YjI7nvs26Er4VHrM1X0e1JgTtKCMb4GgA' }}
                     style={styles.heroImg}
                     resizeMode="cover"
                  />
               </View>
               <Text style={styles.title}>Learn to drive with confidence</Text>
               <Text style={styles.subtitle}>Ace your driving theory test with our comprehensive learning tools.</Text>
               <View style={styles.buttonCol}>
                  <TouchableOpacity style={styles.signupBtn} onPress={() => setMode('signup')}>
                     <Text style={styles.signupBtnText}>Sign up</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.loginBtn} onPress={() => setMode('login')}>
                     <Text style={styles.loginBtnText}>Log in</Text>
                  </TouchableOpacity>
               </View>
            </View>
            <View>
               <Text style={styles.terms}>By continuing, you agree to our Terms of Service and Privacy Policy.</Text>
               <View style={{ height: 20, backgroundColor: '#fff' }} />
            </View>
         </View>
      );
   }

   return (
      <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
         <View>
            <View style={styles.heroWrap}>
               <Image
                  source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDhOut2iy_gBo04uF5oSgMISHygrOJohr5SkMptF621csmpX3a5svNIQ8-URbm4gAcyzmlDMeCFGvif1Lhpsy5rTFcbOJGbF2lKEQnfnDMsPEMW-qi0_XRJjJxUzaQjwbDn0fx2RVv2iug-U6cVt1CVfzRQSRugZz_ffdzj28A6NwHZU3grrVLHRXEN1U16-BrpLLVdKZeQY2A3hZa2-2WKbkK1jut2z_a4Wm87bksXv3YjI7nvs26Er4VHrM1X0e1JgTtKCMb4GgA' }}
                  style={styles.heroImg}
                  resizeMode="cover"
               />
            </View>
            <Text style={styles.title}>{mode === 'signup' ? 'Sign up' : 'Log in'}</Text>
            <View style={styles.inputWrap}>
               <Text style={styles.inputLabel}>Email</Text>
               <TextInput
                  style={styles.input}
                  placeholder="email@address.com"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  textContentType="emailAddress"
               />
            </View>
            <View style={styles.inputWrap}>
               <Text style={styles.inputLabel}>Password</Text>
               <View style={{ position: 'relative' }}>
                  <TextInput
                     style={styles.input}
                     placeholder="Password"
                     autoCapitalize="none"
                     value={password}
                     onChangeText={setPassword}
                     secureTextEntry={!showPassword}
                     textContentType="password"
                  />
                  <TouchableOpacity
                     style={{ position: 'absolute', right: 12, top: 12 }}
                     onPress={() => setShowPassword(v => !v)}
                     hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                     <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={22} color="#677583" />
                  </TouchableOpacity>
               </View>
            </View>
            <TouchableOpacity
               style={[styles.actionBtn, mode === 'signup' ? styles.signupBtn : styles.loginBtn]}
               onPress={mode === 'signup' ? signUpWithEmail : signInWithEmail}
               disabled={loading}
            >
               <Text style={mode === 'signup' ? styles.signupBtnText : styles.loginBtnText}>
                  {loading ? 'Loading...' : mode === 'signup' ? 'Sign up' : 'Log in'}
               </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setMode(mode === 'signup' ? 'login' : 'signup')}>
               <Text style={styles.switchText}>
                  {mode === 'signup' ? 'Already have an account? Log in' : "Don't have an account? Sign up"}
               </Text>
            </TouchableOpacity>
         </View>
         <View>
            <Text style={styles.terms}>By continuing, you agree to our Terms of Service and Privacy Policy.</Text>
            <View style={{ height: 50, backgroundColor: '#fff' }} />
         </View>
      </KeyboardAvoidingView>
   );
}

const styles = StyleSheet.create({
   root: {
      flex: 1,
      backgroundColor: '#fff',
      justifyContent: 'space-between',
      paddingTop: 0,
   },
   heroWrap: {
      width: '100%',
      minHeight: 100,
      aspectRatio: 2,
      backgroundColor: '#fff',
      borderRadius: 24,
      overflow: 'hidden',
      marginBottom: 0,
   },
   heroImg: {
      width: '100%',
      height: '100%',
      borderRadius: 24,
      minHeight: 100,
   },
   title: {
      color: '#121417',
      fontSize: 28,
      fontWeight: 'bold',
      textAlign: 'center',
      paddingHorizontal: 16,
      paddingTop: 24,
      paddingBottom: 8,
      letterSpacing: -0.5,
      fontFamily: 'PlusJakartaSans_800ExtraBold',
   },
   subtitle: {
      color: '#121417',
      fontSize: 16,
      textAlign: 'center',
      fontWeight: '400',
      paddingHorizontal: 16,
      paddingBottom: 12,
      fontFamily: 'PlusJakartaSans_400Regular',
   },
   buttonCol: {
      flex: 1,
      gap: 12,
      maxWidth: 480,
      alignSelf: 'center',
      width: '100%',
      paddingHorizontal: 16,
      paddingVertical: 12,
   },
   signupBtn: {
      backgroundColor: '#5b98d6',
      borderRadius: 999,
      minHeight: 48,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 12,
   },
   signupBtnText: {
      color: 'white',
      fontWeight: 'bold',
      fontSize: 17,
   },
   loginBtn: {
      backgroundColor: '#5b98d6',
      borderRadius: 999,
      minHeight: 48,
      alignItems: 'center',
      justifyContent: 'center',
   },
   loginBtnText: {
      color: 'white',
      fontWeight: 'bold',
      fontSize: 17,
   },
   inputWrap: {
      marginHorizontal: 16,
      marginBottom: 12,
      marginTop: 8,
   },
   inputLabel: {
      color: '#121417',
      fontWeight: '500',
      fontSize: 15,
      marginBottom: 4,
      fontFamily: 'PlusJakartaSans_600SemiBold',
   },
   input: {
      borderWidth: 1,
      borderColor: '#ccc',
      borderRadius: 12,
      padding: 12,
      fontSize: 16,
      backgroundColor: '#f8fafd',
      fontFamily: 'PlusJakartaSans_400Regular',
   },
   actionBtn: {
      marginHorizontal: 16,
      marginTop: 8,
      minHeight: 48,
      borderRadius: 999,
      alignItems: 'center',
      justifyContent: 'center',
   },
   switchText: {
      color: '#5b98d6',
      textAlign: 'center',
      marginTop: 16,
      fontWeight: '500',
      fontSize: 15,
   },
   terms: {
      color: '#677583',
      fontSize: 13,
      textAlign: 'center',
      paddingHorizontal: 16,
      paddingTop: 8,
      paddingBottom: 8,
      fontFamily: 'PlusJakartaSans_400Regular',
   },
});