import { useStyles } from "@/core/hooks/useStyles";
import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeSettings } from '@/core/theme/theme_provider';
import { useLocalization } from '@/core/localization/LocalizationProvider';
import ChartAppBar from '@/components/chartappbar/ChartAppBar';
import { colors } from '@/core/theme/colors';
import { ChartToast } from '@/components/showcase/CrimChart_toast';
import { useAuthStore } from '@/features/auth/application/useAuthStore';
export default function OtpVerificationPage() {
  const styles = useStyles(colors => ({
    container: {
      flex: 1
    },
    safeArea: {
      flex: 1
    },
    content: {
      flex: 1,
      paddingHorizontal: 24,
      paddingTop: 20
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: 8
    },
    subtitle: {
      fontSize: 14,
      lineHeight: 21
    },
    space32: {
      height: 32
    },
    space40: {
      height: 40
    },
    otpInput: {
      fontSize: 24,
      letterSpacing: 8,
      fontWeight: 'bold',
      borderRadius: 12,
      paddingVertical: 20,
      paddingHorizontal: 16
    },
    spacer: {
      flex: 1
    },
    verifyButton: {
      width: '100%',
      height: 52,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center'
    },
    verifyButtonText: {
      fontSize: 16,
      fontWeight: 'bold'
    }
  }));
  const router = useRouter();
  const {
    tr
  } = useLocalization();
  const {
    themeMode
  } = useThemeSettings();
  const authStore = useAuthStore();
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const email = authStore.pendingSignUp?.email || 'your email';
  const isValid = otp.trim().length >= 6;
  const handleVerify = async () => {
    if (!isValid) return;
    setIsLoading(true);
    try {
      const success = await authStore.verifyOtp(otp);
      if (success) {
        router.push('/birthday' as any);
      } else {
        ChartToast.showError(null, {
          title: 'Error',
          message: authStore.errorMessage || 'Invalid verification code.'
        });
      }
    } catch (e: any) {
      ChartToast.showError(null, {
        title: 'Error',
        message: e.message || 'Invalid verification code.'
      });
    } finally {
      setIsLoading(false);
    }
  };
  return <View style={[styles.container, {
    backgroundColor: colors.background
  }]}>
            <ChartAppBar title="" showBorder={true} isLoading={isLoading} backgroundColor={colors.background} />
            <SafeAreaView style={styles.safeArea} edges={['bottom', 'left', 'right']}>
                <View style={styles.content}>
                    <Text style={[styles.title, {
          color: colors.text
        }]}>
                        Check your email
                    </Text>
                    <Text style={[styles.subtitle, {
          color: 'rgba(255, 255, 255, 0.6)'
        }]}>
                        We sent a 6-digit code to <Text style={{
            fontWeight: 'bold',
            color: colors.text
          }}>{email}</Text>. Enter it below to confirm your account.
                    </Text>

                    <View style={styles.space32} />

                    <TextInput style={[styles.otpInput, {
          color: colors.text,
          backgroundColor: 'rgba(255, 255, 255, 0.05)'
        }]} keyboardType="number-pad" maxLength={6} value={otp} onChangeText={setOtp} placeholder="000000" placeholderTextColor="rgba(255, 255, 255, 0.2)" editable={!isLoading} textAlign="center" />

                    <View style={styles.spacer} />

                    <TouchableOpacity activeOpacity={1} style={[styles.verifyButton, {
          backgroundColor: !isLoading && isValid ? colors.primary : 'rgba(255, 255, 255, 0.1)'
        }]} onPress={handleVerify} disabled={isLoading || !isValid}>
                        <Text style={[styles.verifyButtonText, {
            color: !isLoading && isValid ? colors.surface : colors.text
          }]}>
                            Verify
                        </Text>
                    </TouchableOpacity>

                    <View style={styles.space40} />
                </View>
            </SafeAreaView>
        </View>;
}