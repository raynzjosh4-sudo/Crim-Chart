import { useStyles } from "@/core/hooks/useStyles";
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeSettings } from '@/core/theme/theme_provider';
import { useLocalization } from '@/core/localization/LocalizationProvider';
import ChartAppBar from '@/components/chartappbar/ChartAppBar';
import { colors } from '@/core/theme/colors';
import { ChartToast } from '@/components/showcase/CrimChart_toast';
import { useAuthStore } from '@/features/auth/application/useAuthStore';
export default function UsernamePage() {
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
      marginBottom: 12
    },
    subtitle: {
      fontSize: 14,
      lineHeight: 19.6
    },
    space32: {
      height: 32
    },
    space40: {
      height: 40
    },
    input: {
      fontSize: 16,
      paddingHorizontal: 16,
      paddingVertical: 16,
      borderRadius: 12
    },
    spacer: {
      flex: 1
    },
    nextButton: {
      width: '100%',
      height: 52,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center'
    },
    nextButtonText: {
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
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  useEffect(() => {
    const pendingUsername = authStore.pendingSignUp?.username || '';
    if (pendingUsername) {
      setUsername(pendingUsername);
    } else {
      extractUsernameFromEmail();
    }
  }, []);
  const extractUsernameFromEmail = () => {
    const email = authStore.pendingSignUp?.email;
    if (email && email.includes('@')) {
      const usernamePart = email.split('@')[0];
      setUsername(usernamePart.replace(/[^a-zA-Z0-9]/g, '').toLowerCase());
    }
  };
  const handleNext = async () => {
    const cleanUsername = username.trim().toLowerCase();
    if (!cleanUsername) {
      ChartToast.showError(null, {
        title: tr('error_title'),
        message: tr('login_error_empty') || 'Username cannot be empty'
      });
      return;
    }
    setIsLoading(true);

    // Check if username is available
    const available = await authStore.setUsernameAndCheck(cleanUsername);
    setIsLoading(false);
    if (available) {
      if (authStore.pendingGoogleOnboarding) {
        router.push('/birthday' as any);
      } else {
        router.push('/password' as any);
      }
    } else {
      ChartToast.showError(null, {
        title: tr('error_title'),
        message: authStore.errorMessage || 'Username is already taken'
      });
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
                        {tr('username_title') || 'Choose your username'}
                    </Text>
                    <Text style={[styles.subtitle, {
          color: 'rgba(255, 255, 255, 0.6)'
        }]}>
                        {tr('username_subtitle') || 'You can always change this later.'}
                    </Text>

                    <View style={styles.space32} />

                    <TextInput style={[styles.input, {
          color: colors.text,
          backgroundColor: 'rgba(255, 255, 255, 0.05)'
        }]} placeholder={tr('username') || 'Username'} placeholderTextColor="rgba(255, 255, 255, 0.5)" value={username} onChangeText={setUsername} autoCapitalize="none" editable={!isLoading} />

                    <View style={styles.spacer} />

                    <TouchableOpacity activeOpacity={1} style={[styles.nextButton, {
          backgroundColor: colors.primary
        }]} onPress={handleNext} disabled={isLoading}>
                        <Text style={[styles.nextButtonText, {
            color: colors.surface
          }]}>
                            {tr('next') || 'Next'}
                        </Text>
                    </TouchableOpacity>

                    <View style={styles.space40} />
                </View>
            </SafeAreaView>
        </View>;
}