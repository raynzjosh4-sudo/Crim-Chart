import ChartAppBar from '@/components/chartappbar/ChartAppBar';
import { useAuthStore } from '@/features/auth/application/useAuthStore';
import { colors } from '@/core/theme/colors';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Platform, StyleSheet, Text, TextInput, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useGlobalProgress } from '@/components/globalProgressBar/GlobalProgressBar';
import { useTranslation } from '@/core/localization/i18n';

export default function UsernamePage() {
  const router = useRouter();
  const { t } = useTranslation();
  const { pendingSignUp, setUsernameAndCheck, updateProfile, user } = useAuthStore();
  const [username, setUsername] = useState(pendingSignUp?.username || user?.displayName || user?.username || '');
  const [isLoading, setIsLoading] = useState(false);
  const { startLoading, stopLoading } = useGlobalProgress();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  useEffect(() => {
    if (!username) {
      if (pendingSignUp?.email) {
        const extracted = pendingSignUp.email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
        setUsername(extracted);
      } else if (user?.email) {
        const extracted = user.email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
        setUsername(extracted);
      }
    }
  }, [user]);

  const handleNext = async () => {
    if (username.length < 3 || isLoading) return;
    setIsLoading(true);
    startLoading();

    const isAvailable = await setUsernameAndCheck(username);

    if (isAvailable) {
      await updateProfile({ 
        display_name: username
      });
      stopLoading();
      router.push('/signup/birthday' as any);
      setTimeout(() => setIsLoading(false), 1000);
    } else {
      stopLoading();
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {!isDesktop && <ChartAppBar title="" showBorder isLoading={isLoading} />}

      <View style={isDesktop ? styles.desktopWrapper : styles.flexOne}>
        <View style={[styles.content, isDesktop && styles.desktopModal]}>
          <Text style={[styles.title, isDesktop && { textAlign: 'center', marginBottom: 12, fontSize: 28 }]}>Pick a username</Text>
        <Text style={styles.subtitle}>
          Your username is how people find you on CrimChart. You can change it later.
        </Text>

        <View style={styles.spacerLarge} />

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Username</Text>
          <TextInput
            style={[styles.input, Platform.OS === 'web' ? { outlineStyle: 'none' } as any : {}]}
            placeholder="username"
            placeholderTextColor="rgba(255, 255, 255, 0.2)"
            autoCapitalize="none"
            autoCorrect={false}
            value={username}
            onChangeText={(text) => setUsername(text.toLowerCase())}
            autoFocus
          />
        </View>

        {isDesktop ? <View style={{ height: 40 }} /> : <View style={styles.flexOne} />}

        <TouchableOpacity activeOpacity={1}
          style={[styles.nextButton, username.length < 3 && styles.nextButtonDisabled]}
          onPress={handleNext}
          disabled={username.length < 3 || isLoading}
        >
          <Text style={styles.nextButtonText}>{t('next') || 'Next'}</Text>
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
    flex: 0,
    minHeight: 500,
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
  inputContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 56,
    justifyContent: 'center',
  },
  label: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 12,
    marginBottom: 4,
  },
  input: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '500',
    padding: 0,
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

