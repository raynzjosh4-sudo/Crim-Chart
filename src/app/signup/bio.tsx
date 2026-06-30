import ChartAppBar from '@/components/chartappbar/ChartAppBar';
import { useAuthStore } from '@/features/auth/application/useAuthStore';
import { colors } from '@/core/theme/colors';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Platform, StyleSheet, Text, TextInput, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useGlobalProgress } from '@/components/globalProgressBar/GlobalProgressBar';
import { useTranslation } from '@/core/localization/i18n';

export default function BioPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const { updateProfile } = useAuthStore();
  const [bio, setBio] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { startLoading, stopLoading } = useGlobalProgress();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  const handleNext = async () => {
    if (isLoading) return;
    setIsLoading(true);
    startLoading();

    await updateProfile({ bio });

    stopLoading();
    router.push('/signup/crown-title' as any);
    setTimeout(() => setIsLoading(false), 1000);
  };

  const handleSkip = async () => {
    if (isLoading) return;
    setIsLoading(true);
    startLoading();
    
    await new Promise(resolve => setTimeout(resolve, 600));
    
    stopLoading();
    router.push('/signup/crown-title' as any);
    setTimeout(() => setIsLoading(false), 1000);
  };

  return (
    <SafeAreaView style={styles.container}>
      {!isDesktop && (
        <ChartAppBar 
          title="" 
          showBorder 
          isLoading={isLoading} 
          actions={[
            <TouchableOpacity activeOpacity={1}
              key="skip"
              onPress={handleSkip}
              disabled={isLoading}
            >
              <Text style={styles.skipText}>{t('skip' as any) || 'Skip'}</Text>
            </TouchableOpacity>
          ]}
        />
      )}

      <View style={isDesktop ? styles.desktopWrapper : styles.flexOne}>
        <View style={[styles.content, isDesktop && styles.desktopModal]}>
          <Text style={[styles.title, isDesktop && { textAlign: 'center', marginBottom: 12, fontSize: 28 }]}>
            Describe yourself
          </Text>
          <Text style={styles.subtitle}>
            Write a short bio to let people know more about you. You can always change this later.
          </Text>

          <View style={styles.spacerLarge} />

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Short Bio (Optional)</Text>
            <TextInput
              style={[styles.input, Platform.OS === 'web' ? { outlineStyle: 'none' } as any : {}]}
              placeholder="I love music..."
              placeholderTextColor="rgba(255, 255, 255, 0.2)"
              multiline
              numberOfLines={4}
              maxLength={160}
              value={bio}
              onChangeText={setBio}
              autoFocus
            />
            <Text style={styles.charCount}>{bio.length}/160</Text>
          </View>

          {isDesktop ? <View style={{ height: 40 }} /> : <View style={styles.flexOne} />}

          <TouchableOpacity activeOpacity={1}
            style={[styles.nextButton, (!bio || bio.length < 1) && styles.nextButtonDisabled]}
            onPress={bio ? handleNext : handleSkip}
            disabled={isLoading}
          >
            <Text style={styles.nextButtonText}>{bio ? (t('next' as any) || 'Next') : (t('skip' as any) || 'Skip')}</Text>
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
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  flexOne: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  title: {
    color: colors.text,
    fontSize: 28,
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
    height: 40,
  },
  inputContainer: {
    width: '100%',
  },
  label: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    marginLeft: 4,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    color: colors.text,
    fontSize: 16,
    padding: 16,
    height: 120,
    textAlignVertical: 'top',
  },
  charCount: {
    color: 'rgba(255, 255, 255, 0.4)',
    fontSize: 12,
    alignSelf: 'flex-end',
    marginTop: 8,
    marginRight: 4,
  },
  skipText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  nextButton: {
    backgroundColor: colors.primary,
    height: 52,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nextButtonDisabled: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  nextButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
