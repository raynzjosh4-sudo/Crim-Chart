import ChartAppBar from '@/components/chartappbar/ChartAppBar';
import { useTranslation } from '@/core/localization/i18n';
import { useAuthStore } from '@/features/auth/application/useAuthStore';
import { colors } from '@/core/theme/colors';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { ChevronDown, Mail } from 'lucide-react-native';
import React, { useState } from 'react';
import { SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function MobileNumberPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const { pendingSignUp, setPhoneNumber, startSignUp } = useAuthStore();
  const [phone, setPhone] = useState(pendingSignUp?.phoneNumber || '');
  const [isLoading, setIsLoading] = useState(false);
  const countryCode = pendingSignUp?.countryCode || '+1';


  const handleNext = async () => {
    if (phone.length < 7) return;
    setIsLoading(true);
    setPhoneNumber(phone);
    await new Promise(resolve => setTimeout(resolve, 600));
    setIsLoading(false);
    router.push('/signup/username' as any);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ChartAppBar title="" showBorder isLoading={isLoading} />

      <View style={styles.content}>
        <Text style={styles.title}>What's your number?</Text>
        <Text style={styles.subtitle}>
          We'll send you a code to verify your phone number. Message and data rates may apply.
        </Text>

        <View style={styles.spacerLarge} />

        {/* Phone Input Area */}
        <View style={styles.inputWrapper}>
          <TouchableOpacity
            style={styles.countrySelector}
            onPress={() => router.push('/signup/country' as any)}
          >
            <Text style={styles.countryCodeText}>{countryCode}</Text>
            <ChevronDown size={18} color="rgba(255, 255, 255, 0.4)" />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TextInput
            style={styles.phoneInput}
            placeholder="000 000 0000"
            placeholderTextColor="rgba(255, 255, 255, 0.2)"
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
            autoFocus
          />
        </View>

        <View style={styles.spacerMedium} />

        {/* Next Button */}
        <TouchableOpacity
          style={[styles.nextButton, phone.length < 7 && styles.nextButtonDisabled]}
          onPress={handleNext}
          disabled={phone.length < 7 || isLoading}
        >
          <Text style={styles.nextButtonText}>{t('next')}</Text>
        </TouchableOpacity>

        <View style={styles.flexOne} />

        {/* Bottom Section */}
        <View style={styles.bottomSection}>
          <View style={styles.alternateActions}>
            <TouchableOpacity
              style={styles.alternateButton}
              onPress={() => router.push('/signup/email' as any)}
            >
              <Mail size={18} color="rgba(255, 255, 255, 0.7)" />
              <Text style={styles.alternateButtonText}>Email</Text>
            </TouchableOpacity>

            <View style={styles.verticalDivider} />

            <TouchableOpacity style={styles.alternateButton}>
              <Image
                source={{ uri: 'https://www.gstatic.com/images/branding/product/2x/googleg_96dp.png' }}
                style={styles.googleIcon}
              />
              <Text style={styles.alternateButtonText}>Google</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.spacerMedium} />

          <Text style={styles.loginDivider}>OR</Text>

          <View style={styles.horizontalDivider} />

          <View style={styles.loginContainer}>
            <Text style={styles.alreadyText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/login' as any)}>
              <Text style={styles.loginActionText}>Log in</Text>
            </TouchableOpacity>
          </View>
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
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  title: {
    color: colors.text,
    fontSize: 24,
    fontWeight: 'bold',
    letterSpacing: -0.5,
    marginTop: 10,
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
  spacerMedium: {
    height: 24,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 12,
    backgroundColor: colors.surface,
  },
  countrySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 4,
  },
  countryCodeText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: 'bold',
  },
  divider: {
    width: 1.5,
    height: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  phoneInput: {
    flex: 1,
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 1.2,
    paddingHorizontal: 16,
  },
  nextButton: {
    backgroundColor: colors.primary,
    height: 54,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nextButtonDisabled: {
    opacity: 0.5,
  },
  nextButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  flexOne: {
    flex: 1,
  },
  bottomSection: {
    paddingBottom: 20,
  },
  alternateActions: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
  },
  alternateButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 10,
  },
  alternateButtonText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: 'bold',
  },
  verticalDivider: {
    width: 1,
    height: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  googleIcon: {
    width: 18,
    height: 18,
  },
  loginDivider: {
    color: 'rgba(255, 255, 255, 0.4)',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 2.0,
    textAlign: 'center',
  },
  horizontalDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    marginVertical: 20,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  alreadyText: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 13,
  },
  loginActionText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: 'bold',
  },
});

