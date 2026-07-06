import { useStyles } from "@/core/hooks/useStyles";
import ChartAppBar from '@/components/chartappbar/ChartAppBar';
import { useAuthStore } from '@/features/auth/application/useAuthStore';
import { colors } from '@/core/theme/colors';
import { useRouter } from 'expo-router';
import { Eye, EyeOff, Key } from 'lucide-react-native';
import React, { useState } from 'react';
import { Platform, StyleSheet, Text, TextInput, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useGlobalProgress } from '@/components/globalProgressBar/GlobalProgressBar';
import { useTranslation } from '@/core/localization/i18n';
export default function OtpPage() {
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
      backgroundColor: 'rgba(255, 255, 255, 0.02)'
    },
    desktopModal: {
      width: '100%',
      maxWidth: 600,
      backgroundColor: '#16181c',
      borderRadius: 16,
      paddingVertical: 40,
      paddingHorizontal: 40,
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.1)'
    },
    content: {
      flex: 1,
      paddingHorizontal: 24
    },
    title: {
      color: colors.text,
      fontSize: 24,
      fontWeight: 'bold',
      marginTop: 20
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
    spacerSmall: {
      height: 12
    },
    inputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 12
    },
    input: {
      flex: 1,
      color: colors.text,
      fontSize: 16,
      fontWeight: '500',
      padding: 0
    },
    autoGenerate: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-end',
      gap: 8
    },
    autoGenerateText: {
      color: colors.primary,
      fontSize: 13,
      fontWeight: '600'
    },
    flexOne: {
      flex: 1
    },
    nextButton: {
      backgroundColor: colors.primary,
      height: 52,
      borderRadius: 12,
      justifyContent: 'center',
      alignItems: 'center'
    },
    nextButtonDisabled: {
      opacity: 0.5
    },
    nextButtonText: {
      color: colors.background,
      fontSize: 16,
      fontWeight: 'bold'
    }
  }));
  const router = useRouter();
  const {
    t
  } = useTranslation();
  const {
    verifyOtp,
    resendOtp,
    pendingSignUp
  } = useAuthStore();
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resendStatus, setResendStatus] = useState<string | null>(null);
  const [errorText, setErrorText] = useState<string | null>(null);
  const {
    startLoading,
    stopLoading
  } = useGlobalProgress();
  const {
    width
  } = useWindowDimensions();
  const isDesktop = width >= 768;
  const isCodeValid = code.length === 6;
  const handleNext = async () => {
    if (!isCodeValid || isLoading) return;
    setIsLoading(true);
    startLoading();
    setErrorText(null);
    const success = await verifyOtp(code);
    stopLoading();
    if (success) {
      router.push('/signup/username' as any);
    } else {
      setErrorText(useAuthStore.getState().errorMessage || 'Invalid verification code.');
    }
    setTimeout(() => setIsLoading(false), 1000);
  };
  const handleResend = async () => {
    if (isLoading) return;
    setIsLoading(true);
    setErrorText(null);
    setResendStatus(null);
    const success = await resendOtp();
    setIsLoading(false);
    if (success) {
      setResendStatus('A new code has been sent.');
    } else {
      setErrorText(useAuthStore.getState().errorMessage || 'Failed to resend code.');
    }
  };
  return <SafeAreaView style={styles.container}>
      {!isDesktop && <ChartAppBar title="" showBorder isLoading={isLoading} />}

      <View style={isDesktop ? styles.desktopWrapper : styles.flexOne}>
        <View style={[styles.content, isDesktop && styles.desktopModal]}>
          <Text style={[styles.title, isDesktop && {
          textAlign: 'center',
          marginBottom: 12,
          fontSize: 28
        }]}>Verify your email</Text>
        <Text style={styles.subtitle}>
          We've sent a 6-digit verification code to {pendingSignUp?.email}. Please enter it below.
        </Text>

        <View style={styles.spacerLarge} />

        <View style={styles.inputContainer}>
              <TextInput style={[styles.input, Platform.OS === 'web' ? {
            outlineStyle: 'none'
          } as any : {}]} placeholder="000000" placeholderTextColor="rgba(255, 255, 255, 0.2)" keyboardType="number-pad" maxLength={6} value={code} onChangeText={text => {
            setCode(text.replace(/[^0-9]/g, ''));
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

        {resendStatus && <Text style={{
          color: colors.primary,
          fontSize: 13,
          marginTop: 8,
          marginLeft: 4
        }}>
            {resendStatus}
          </Text>}

        <View style={styles.spacerSmall} />

        <TouchableOpacity activeOpacity={1} style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'flex-end',
          marginTop: 8
        }} onPress={handleResend} disabled={isLoading}>
          <Text style={{
            color: colors.primary,
            fontSize: 13,
            fontWeight: '600'
          }}>
            Resend Code
          </Text>
        </TouchableOpacity>

        {isDesktop ? <View style={{
          height: 40
        }} /> : <View style={styles.flexOne} />}

        <TouchableOpacity activeOpacity={1} style={[styles.nextButton, !isCodeValid && styles.nextButtonDisabled]} onPress={handleNext} disabled={!isCodeValid || isLoading}>
          <Text style={styles.nextButtonText}>{t('next' as any) || 'Next'}</Text>
        </TouchableOpacity>

        <View style={styles.spacerLarge} />
        </View>
      </View>
    </SafeAreaView>;
}