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

export default function PasswordPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const { setPassword, createAccountInitial, status, pendingSignUp } = useAuthStore();
  const [password, setPasswordText] = useState('');
  const [obscureText, setObscureText] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);
  const { startLoading, stopLoading } = useGlobalProgress();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  const isPasswordValid = password.length >= 8;

  const handleNext = async () => {
    if (!isPasswordValid || isLoading) return;
    setIsLoading(true);
    startLoading();
    
    setPassword(password);
    
    setErrorText(null);

    if (status === 'authenticated') {
      if (password !== pendingSignUp?.password) {
        setErrorText('Account already created. You cannot change password here.');
        stopLoading();
        setIsLoading(false);
        return;
      }
      stopLoading();
      router.push('/signup/username' as any);
      setTimeout(() => setIsLoading(false), 1000);
      return;
    }

    const result = await createAccountInitial();
    
    stopLoading();
    if (result === true) {
      router.push('/signup/username' as any);
    } else if (result === 'OTP_REQUIRED') {
      router.push('/signup/otp' as any);
    } else {
      setErrorText(useAuthStore.getState().errorMessage || 'Failed to create account.');
    }
    setTimeout(() => setIsLoading(false), 1000);
  };

  const generateStrongPassword = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%&*~';
    let generated = '';
    for (let i = 0; i < 16; i++) {
      generated += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPasswordText(generated);
    setObscureText(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      {!isDesktop && <ChartAppBar title="" showBorder isLoading={isLoading} />}

      <View style={isDesktop ? styles.desktopWrapper : styles.flexOne}>
        <View style={[styles.content, isDesktop && styles.desktopModal]}>
          <Text style={[styles.title, isDesktop && { textAlign: 'center', marginBottom: 12, fontSize: 28 }]}>Create a password</Text>
        <Text style={styles.subtitle}>
          Your password must be at least 8 characters long. Use a mix of letters, numbers, and symbols for better security.
        </Text>

        <View style={styles.spacerLarge} />

        <View style={styles.inputContainer}>
          <TextInput
            style={[styles.input, Platform.OS === 'web' ? { outlineStyle: 'none' } as any : {}]}
                placeholder="Enter password"
                placeholderTextColor="rgba(255, 255, 255, 0.2)"
                secureTextEntry={obscureText}
                autoCapitalize="none"
                value={password}
                onChangeText={(text) => {
                  setPasswordText(text);
                  if (errorText) setErrorText(null);
                }}
                autoFocus
              />
          <TouchableOpacity activeOpacity={1} onPress={() => setObscureText(!obscureText)}>
            {obscureText ? <Eye size={20} color="rgba(255, 255, 255, 0.5)" /> : <EyeOff size={20} color="rgba(255, 255, 255, 0.5)" />}
          </TouchableOpacity>
        </View>

        {errorText && (
          <Text style={{ color: '#ef4444', fontSize: 13, marginTop: 8, marginLeft: 4 }}>
            {errorText}
          </Text>
        )}

        <View style={styles.spacerSmall} />

        <TouchableOpacity activeOpacity={1}
          style={styles.autoGenerate}
          onPress={generateStrongPassword}
        >
          <Key size={16} color={colors.primary} />
          <Text style={styles.autoGenerateText}>Auto-generate strong password</Text>
        </TouchableOpacity>

        {isDesktop ? <View style={{ height: 40 }} /> : <View style={styles.flexOne} />}

        <TouchableOpacity activeOpacity={1}
          style={[styles.nextButton, !isPasswordValid && styles.nextButtonDisabled]}
          onPress={handleNext}
          disabled={!isPasswordValid || isLoading}
        >
          <Text style={styles.nextButtonText}>{t('next' as any) || 'Next'}</Text>
        </TouchableOpacity>

        <View style={styles.spacerLarge} />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  desktopWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
  },
  desktopModal: {
    width: '100%',
    maxWidth: 600,
    backgroundColor: '#16181c',
    borderRadius: 16,
    paddingVertical: 40,
    paddingHorizontal: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  title: {
    color: colors.text,
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 20,
  },
  subtitle: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 14,
    lineHeight: 20,
    marginTop: 12,
  },
  spacerLarge: {
    height: 32,
  },
  spacerSmall: {
    height: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 56,
  },
  input: {
    flex: 1,
    color: colors.text,
    fontSize: 16,
    fontWeight: '500',
    padding: 0,
  },
  autoGenerate: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 8,
  },
  autoGenerateText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '600',
  },
  flexOne: {
    flex: 1,
  },
  nextButton: {
    backgroundColor: colors.primary,
    height: 52,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nextButtonDisabled: {
    opacity: 0.5,
  },
  nextButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

