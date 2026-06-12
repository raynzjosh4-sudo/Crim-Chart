import ChartAppBar from '@/components/chartappbar/ChartAppBar';
import { useTranslation } from '@/core/localization/i18n';
import { colors } from '@/core/theme/colors';
import { useRouter } from 'expo-router';
import { ChevronDown, Moon, Sun } from 'lucide-react-native';
import React from 'react';
import { Image, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function LandingPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const isDark = true; // Hardcoded for now matching the theme

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <ChartAppBar
          title=""
          showBack={false}
          actions={[
            <TouchableOpacity key="theme" style={styles.iconButton}>
              {isDark ? <Sun size={20} color={colors.textSecondary} /> : <Moon size={20} color={colors.textSecondary} />}
            </TouchableOpacity>,
            <TouchableOpacity key="login" onPress={() => router.push('/login' as any)}>
              <Text style={styles.loginText}>{t('log_in')}</Text>
            </TouchableOpacity>,
          ]}
        />

        <View style={styles.spacerLarge} />

        {/* Logo */}
        <View style={styles.logoContainer}>
          <Image
            source={require('@/assets/images/logo-glow.png')} // Using existing asset as placeholder
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        <View style={styles.spacerMedium} />

        {/* Language Selector */}
        <TouchableOpacity style={styles.languageSelector} onPress={() => router.push('/language' as any)}>
          <Text style={styles.languageText}>{t('native_name')}</Text>
          <ChevronDown size={20} color={colors.textSecondary} />
        </TouchableOpacity>

        <View style={styles.spacerExtraLarge} />

        {/* Main Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.signUpButton}
            onPress={() => router.push('/signup/phone' as any)}
          >
            <Text style={styles.signUpButtonText}>{t('create_account')}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.spacerMedium} />

        {/* Divider */}
        <View style={styles.dividerContainer}>
          <View style={styles.divider} />
          <Text style={styles.orText}>{t('or')}</Text>
          <View style={styles.divider} />
        </View>

        <View style={styles.spacerMedium} />

        {/* Google Sign In */}
        <TouchableOpacity style={styles.googleButton}>
          <Image
            source={{ uri: 'https://www.gstatic.com/images/branding/product/2x/googleg_96dp.png' }}
            style={styles.googleIcon}
          />
          <Text style={styles.googleButtonText}>{t('try_with_google')}</Text>
        </TouchableOpacity>

        <View style={styles.spacerLarge} />

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            By continuing, you agree to our{' '}
            <Text style={styles.footerLink}>Terms of Service</Text> and{' '}
            <Text style={styles.footerLink}>Privacy Policy</Text>.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  topActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconButton: {
    padding: 8,
  },
  loginText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: 'bold',
    paddingHorizontal: 8,
  },
  spacerLarge: {
    height: 40,
  },
  spacerMedium: {
    height: 32,
  },
  spacerExtraLarge: {
    height: 60,
  },
  logoContainer: {
    alignItems: 'center',
  },
  logo: {
    width: 150,
    height: 150,
  },
  languageSelector: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
  languageText: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '500',
  },
  buttonContainer: {
    paddingHorizontal: 24,
  },
  signUpButton: {
    backgroundColor: colors.primary,
    height: 52,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  signUpButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  orText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: 'bold',
    paddingHorizontal: 16,
  },
  googleButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignSelf: 'center',
  },
  googleIcon: {
    width: 20,
    height: 20,
  },
  googleButtonText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 12,
  },
  footer: {
    paddingHorizontal: 40,
    paddingVertical: 24,
  },
  footerText: {
    color: 'rgba(255, 255, 255, 0.4)',
    fontSize: 11,
    lineHeight: 16,
    textAlign: 'center',
  },
  footerLink: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '600',
  },
});

