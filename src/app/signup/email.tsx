import { useStyles } from "@/core/hooks/useStyles";
import ChartAppBar from '@/components/chartappbar/ChartAppBar';
import { useGlobalProgress } from '@/components/globalProgressBar/GlobalProgressBar';
import { useTranslation } from '@/core/localization/i18n';
import { colors } from '@/core/theme/colors';
import { useAuthStore } from '@/features/auth/application/useAuthStore';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { LogIn } from 'lucide-react-native';
import { useState } from 'react';
import { Platform, StyleSheet, Text, TextInput, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
export default function MobileNumberPage() {
  const styles = useStyles(colors => ({
    container: {
      flex: 1,
      backgroundColor: colors.background
    },
    desktopWrapper: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
      backgroundColor: 'rgba(255, 255, 255, 0.02)' // Subtle background dimming
    },
    desktopModal: {
      width: '100%',
      maxWidth: 600,
      backgroundColor: '#16181c',
      borderRadius: 16,
      paddingVertical: 32,
      paddingHorizontal: 16,
      flex: 0,
      height: 600
    },
    content: {
      flex: 1,
      paddingHorizontal: 24
    },
    title: {
      color: colors.text,
      fontSize: 24,
      fontWeight: 'bold',
      letterSpacing: -0.5,
      marginTop: 10
    },
    subtitle: {
      color: 'rgba(255, 255, 255, 0.6)',
      fontSize: 14,
      lineHeight: 20,
      marginTop: 12
    },
    spacerLarge: {
      height: 32
    },
    spacerMedium: {
      height: 24
    },
    inputWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: 12,
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      height: 56
    },
    countrySelector: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 14,
      gap: 4
    },
    countryCodeText: {
      color: colors.text,
      fontSize: 16,
      fontWeight: 'bold'
    },
    divider: {
      width: 1.5,
      height: 24,
      backgroundColor: 'rgba(255, 255, 255, 0.1)'
    },
    phoneInput: {
      flex: 1,
      color: colors.text,
      fontSize: 16,
      fontWeight: '600',
      letterSpacing: 1.2,
      paddingHorizontal: 16
    },
    nextButton: {
      backgroundColor: colors.primary,
      height: 54,
      borderRadius: 14,
      justifyContent: 'center',
      alignItems: 'center'
    },
    nextButtonDisabled: {
      opacity: 0.5
    },
    nextButtonText: {
      color: colors.background,
      fontSize: 16,
      fontWeight: '900',
      letterSpacing: 0.5
    },
    flexOne: {
      flex: 1
    },
    bottomSection: {
      paddingBottom: 20
    },
    alternateActions: {
      flexDirection: 'row',
      justifyContent: 'space-evenly',
      alignItems: 'center'
    },
    alternateButton: {
      flex: 1,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: 12,
      gap: 10
    },
    alternateButtonText: {
      color: colors.text,
      fontSize: 14,
      fontWeight: 'bold'
    },
    verticalDivider: {
      width: 1,
      height: 20,
      backgroundColor: 'rgba(255, 255, 255, 0.1)'
    },
    googleIcon: {
      width: 18,
      height: 18
    },
    loginDivider: {
      color: 'rgba(255, 255, 255, 0.4)',
      fontSize: 11,
      fontWeight: '900',
      letterSpacing: 2.0,
      textAlign: 'center'
    },
    horizontalDivider: {
      height: 1,
      backgroundColor: 'rgba(255, 255, 255, 0.08)',
      marginVertical: 20
    },
    loginContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center'
    },
    alreadyText: {
      color: 'rgba(255, 255, 255, 0.5)',
      fontSize: 13
    },
    loginActionText: {
      color: colors.primary,
      fontSize: 13,
      fontWeight: 'bold'
    }
  }));
  const router = useRouter();
  const {
    t
  } = useTranslation();
  const {
    pendingSignUp,
    startSignUp,
    setEmail: setStoreEmail,
    status
  } = useAuthStore();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);
  const {
    startLoading,
    stopLoading
  } = useGlobalProgress();
  const {
    width
  } = useWindowDimensions();
  const isDesktop = width >= 768;
  const handleNext = async () => {
    if (email.length < 5 || !email.includes('@') || isLoading) return;
    setIsLoading(true);
    startLoading();
    setErrorText(null);
    if (status === 'authenticated') {
      if (email !== pendingSignUp?.email) {
        setErrorText('This email has already been registered. You cannot change it now.');
        stopLoading();
        setIsLoading(false);
        return;
      }
      stopLoading();
      router.push('/signup/password' as any);
      setTimeout(() => setIsLoading(false), 1000);
      return;
    }
    setStoreEmail(email);
    await new Promise(resolve => setTimeout(resolve, 600));
    stopLoading();
    router.push('/signup/password' as any);
    setTimeout(() => setIsLoading(false), 1000);
  };
  const handleLogin = async () => {
    if (isLoading) return;
    setIsLoading(true);
    startLoading();
    await new Promise(resolve => setTimeout(resolve, 400));
    stopLoading();
    router.push('/login' as any);
    setTimeout(() => setIsLoading(false), 1000);
  };
  const handleGoogle = async () => {
    if (isLoading) return;
    setIsLoading(true);
    startLoading();
    await new Promise(resolve => setTimeout(resolve, 800));
    stopLoading();
    router.push('/landing' as any);
    setTimeout(() => setIsLoading(false), 1000);
  };
  const handleRecover = async () => {
    if (isLoading) return;
    setIsLoading(true);
    startLoading();
    await new Promise(resolve => setTimeout(resolve, 400));
    stopLoading();
    router.push('/recover' as any);
    setTimeout(() => setIsLoading(false), 1000);
  };
  return <SafeAreaView style={styles.container}>
      {!isDesktop && <ChartAppBar title="" showBorder isLoading={isLoading} />}

      <View style={isDesktop ? styles.desktopWrapper : styles.flexOne}>
        <View style={[styles.content, isDesktop && styles.desktopModal]}>
          <Text style={[styles.title, isDesktop && {
          textAlign: 'center',
          marginBottom: 12,
          fontSize: 28
        }]}>
            What's your email?
          </Text>

          <View style={styles.spacerLarge} />

          {/* Email Input Area */}
          <View style={styles.inputWrapper}>
            <TextInput style={[styles.phoneInput, Platform.OS === 'web' ? {
            outlineStyle: 'none'
          } as any : {}]} placeholder="Enter your email" placeholderTextColor="rgba(255, 255, 255, 0.2)" keyboardType="email-address" autoCapitalize="none" value={email} onChangeText={text => {
            setEmail(text);
            if (errorText) setErrorText(null);
          }} autoFocus />
          </View>

          {errorText && <Text style={{
          color: '#ef4444',
          fontSize: 13,
          marginTop: 8,
          marginLeft: 4
        }}>
              {errorText}
            </Text>}

          <View style={styles.spacerMedium} />

          {/* Next Button */}
          <TouchableOpacity activeOpacity={1} style={[styles.nextButton, (!email.includes('@') || email.length < 5) && styles.nextButtonDisabled]} onPress={handleNext} disabled={!email.includes('@') || email.length < 5 || isLoading}>
            <Text style={styles.nextButtonText}>{t('next')}</Text>
          </TouchableOpacity>

          {isDesktop ? <View style={{
          height: 40
        }} /> : <View style={styles.flexOne} />}

          {/* Bottom Section */}
          <View style={styles.bottomSection}>
            <View style={styles.alternateActions}>
              <TouchableOpacity activeOpacity={1} style={styles.alternateButton} onPress={handleLogin} disabled={isLoading}>
                <LogIn size={18} color="rgba(255, 255, 255, 0.7)" />
                <Text style={styles.alternateButtonText}>Log In</Text>
              </TouchableOpacity>

              <View style={styles.verticalDivider} />

              <TouchableOpacity activeOpacity={1} style={styles.alternateButton} onPress={handleGoogle} disabled={isLoading}>
                <Image source={{
                uri: 'https://www.gstatic.com/images/branding/product/2x/googleg_96dp.png'
              }} style={styles.googleIcon} />
                <Text style={styles.alternateButtonText}>Google</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.spacerMedium} />

            <Text style={styles.loginDivider}>OR</Text>

            <View style={styles.horizontalDivider} />

            <View style={styles.loginContainer}>
              <TouchableOpacity activeOpacity={1} onPress={handleRecover} disabled={isLoading}>
                <Text style={styles.loginActionText}>Recover my account</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </SafeAreaView>;
}