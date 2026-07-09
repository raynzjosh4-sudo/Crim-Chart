import ChartAppBar from '@/components/chartappbar/ChartAppBar';
import { ChartToast } from '@/components/showcase/CrimChart_toast';
import { useStyles } from "@/core/hooks/useStyles";
import { useTranslation } from '@/core/localization/i18n';
import { colors } from '@/core/theme/colors';
import { useAuthStore } from '@/features/auth/application/useAuthStore';

import { GridLayer } from '@/features/landing/components/GridLayer/GridLayer';
import { HeroLayer } from '@/features/landing/components/HeroLayer/HeroLayer';
import { TabsLayer } from '@/features/landing/components/TabsLayer/TabsLayer';
import LanguagePage from '@/settings/subsettings/LanguagePage';
import { AuthChoiceModalWidget } from '@/signing/components/AuthChoiceModalWidget';
import { LoginModalWidget } from '@/signing/components/LoginModalWidget';
import { useRouter } from 'expo-router';
import { ChevronDown, Moon, Sun } from 'lucide-react-native';
import { useState } from 'react';
import { Image, Modal, Platform, SafeAreaView, ScrollView, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';

import { SignupModalWidget } from '@/signing/components/SignupModalWidget';

export default function LandingPage({ asChild }: { asChild?: boolean } = {}) {
  const styles = useStyles(colors => ({
    root: {
      backgroundColor: colors.background,
      flex: 1,
      ...(isWeb ? {
        minHeight: '100vh' as any
      } : {})
    },
    rootContent: {
      ...(isWeb ? {
        minHeight: '100vh' as any
      } : {})
    },
    topBar: {
      position: 'absolute',
      top: 14,
      right: 20,
      zIndex: 99,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12
    },
    topInput: {
      width: 200,
      height: 38,
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.22)',
      borderRadius: 6,
      paddingHorizontal: 12,
      color: colors.text,
      fontSize: 14,
      backgroundColor: 'transparent',
      outlineStyle: 'none' as any
    },
    loginBtnSmall: {
      height: 38,
      paddingHorizontal: 16,
      borderRadius: 9999,
      backgroundColor: colors.text,
      alignItems: 'center',
      justifyContent: 'center',
      ...(isWeb ? {
        cursor: 'pointer' as any
      } : {})
    },
    loginBtnSmallText: {
      fontSize: 14,
      fontWeight: '700'
    },
    columns: {
      flexDirection: 'row',
      flex: 1,
      ...(isWeb ? {
        minHeight: '100vh' as any
      } : {})
    },
    /* LEFT col – text + buttons */
    leftCol: {
      flex: 1,
      justifyContent: 'center',
      paddingLeft: '7%' as any,
      paddingRight: 24,
      paddingVertical: 80
    },
    leftInner: {
      maxWidth: 360
    },
    hero: {
      fontSize: 62,
      fontWeight: '900',
      color: colors.text,
      lineHeight: 70,
      letterSpacing: -1.5
    },
    sub: {
      fontSize: 30,
      fontWeight: '800',
      color: colors.text
    },
    whitePill: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.text,
      borderRadius: 9999,
      height: 42,
      gap: 10,
      ...(isWeb ? {
        cursor: 'pointer' as any
      } : {})
    },
    whitePillText: {
      fontSize: 15,
      fontWeight: '700',
      color: '#0f1419'
    },
    gIcon: {
      width: 20,
      height: 20
    },
    orRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginVertical: 16,
      gap: 10
    },
    orLine: {
      flex: 1,
      height: 1,
      backgroundColor: 'rgba(255,255,255,0.14)'
    },
    orTxt: {
      fontSize: 13,
      color: 'rgba(255,255,255,0.5)'
    },
    brandPill: {
      height: 42,
      borderRadius: 9999,
      alignItems: 'center',
      justifyContent: 'center',
      ...(isWeb ? {
        cursor: 'pointer' as any
      } : {})
    },
    brandPillText: {
      fontSize: 15,
      fontWeight: '700'
    },
    already: {
      fontSize: 17,
      fontWeight: '800',
      color: colors.text
    },
    outlinePill: {
      height: 42,
      borderRadius: 9999,
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.22)',
      alignItems: 'center',
      justifyContent: 'center',
      ...(isWeb ? {
        cursor: 'pointer' as any
      } : {})
    },
    outlinePillText: {
      fontSize: 15,
      fontWeight: '700'
    },
    langRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      alignSelf: 'flex-start'
    },
    langTxt: {
      fontSize: 13,
      color: 'rgba(255,255,255,0.4)'
    },
    tos: {
      fontSize: 11,
      color: 'rgba(255,255,255,0.35)',
      lineHeight: 15
    },
    tosLink: {
      color: 'rgba(255,255,255,0.6)',
      fontWeight: '600'
    },
    /* RIGHT col */
    rightCol: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden' as any
    }
  }));
  const router = useRouter();
  const {
    t
  } = useTranslation();
  const isDark = true;
  const authStore = useAuthStore();
  const {
    width
  } = useWindowDimensions();
  const isDesktop = width >= 768;
  const [isAuthChoiceVisible, setAuthChoiceVisible] = useState(false);
  const [isLoginModalVisible, setLoginModalVisible] = useState(false);
  const [isLanguageModalVisible, setLanguageModalVisible] = useState(false);
  const [isSignupModalVisible, setSignupModalVisible] = useState(false);
  const [topUsername, setTopUsername] = useState('');
  const [topPassword, setTopPassword] = useState('');
  const handleGoogleLogin = async () => {
    try {
      const success = await authStore.loginWithGoogle();
      if (success) {
        if (useAuthStore.getState().pendingGoogleOnboarding) {
          setSignupModalVisible(true);
        } else {
          router.push('/(tabs)' as any);
        }
      } else {
        const errorMsg = useAuthStore.getState().errorMessage;
        if (!isDesktop) {
          ChartToast.showError(null, {
            title: t('error_title') || 'Error',
            message: errorMsg || 'Google login failed'
          });
        }
      }
    } catch (error: any) {
      if (!isDesktop) {
        ChartToast.showError(null, {
          title: t('error_title') || 'Error',
          message: error.message || 'Google login failed'
        });
      }
    }
  };

  /* ─── DESKTOP ─────────────────────────────────────────────────── */
  if (isDesktop) {
    const desktopContent = (
      <>
        <HeroLayer
          onGoogleLogin={handleGoogleLogin}
          onCreateAccount={() => setSignupModalVisible(true)}
          onLoginClick={() => setAuthChoiceVisible(true)}
          onLanguageClick={() => setLanguageModalVisible(true)}
        />
        <TabsLayer />
        <GridLayer />


        <AuthChoiceModalWidget
          visible={isAuthChoiceVisible}
          onClose={() => setAuthChoiceVisible(false)}
          onLoginClick={() => {
            setAuthChoiceVisible(false);
            setLoginModalVisible(true);
          }}
          onSignupClick={() => {
            setAuthChoiceVisible(false);
            setSignupModalVisible(true);
          }}
        />

        <LoginModalWidget
          visible={isLoginModalVisible}
          onClose={() => setLoginModalVisible(false)}
          initialUsername={topUsername}
          initialPassword={topPassword}
        />

        <SignupModalWidget
          visible={isSignupModalVisible}
          onClose={() => setSignupModalVisible(false)}
          onGoToLogin={() => {
            setSignupModalVisible(false);
            setLoginModalVisible(true);
          }}
        />

        <Modal visible={isLanguageModalVisible} transparent animationType="fade">
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center' }}>
            <LanguagePage onClose={() => setLanguageModalVisible(false)} />
          </View>
        </Modal>
      </>
    );

    if (asChild) {
      return desktopContent;
    }

    return (
      <ScrollView
        style={styles.root}
        contentContainerStyle={{ paddingBottom: 60 }}
        showsVerticalScrollIndicator={false}
      >
        {desktopContent}
      </ScrollView>
    );
  }

  /* ─── MOBILE ──────────────────────────────────────────────────── */
  return <SafeAreaView style={{
    flex: 1,
    backgroundColor: colors.background,
    ...(isWeb ? { minHeight: '100vh' as any } : {})
  }}>
    <ScrollView contentContainerStyle={{
      paddingBottom: 40
    }}>
      <ChartAppBar title="" showBack={false} actions={[<TouchableOpacity activeOpacity={1} key="theme" style={{
        padding: 8
      }}>
        {isDark ? <Sun size={20} color={colors.textSecondary} /> : <Moon size={20} color={colors.textSecondary} />}
      </TouchableOpacity>, <TouchableOpacity activeOpacity={1} key="login" onPress={() => setLoginModalVisible(true)}>
        <Text style={{
          color: colors.primary,
          fontSize: 14,
          fontWeight: 'bold',
          paddingHorizontal: 8
        }}>
          {t('log_in')}
        </Text>
      </TouchableOpacity>]} />
      <View style={{
        height: 40
      }} />
      <View style={{
        alignItems: 'center',
        justifyContent: 'center',
        height: 150
      }}>
        <Image source={require('@/assets/images/logo-glow.png')} style={{
          width: 150,
          height: 150,
          position: 'absolute'
        }} resizeMode="contain" />
        <Image source={require('@/assets/appicon/big-sized-app-icon.png')} style={{
          width: 80,
          height: 80
        }} resizeMode="contain" />
      </View>
      <View style={{
        height: 32
      }} />
      <TouchableOpacity activeOpacity={0.7} style={{
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 4
      }} onPress={() => router.push('/language' as any)}>
        <Text style={{
          color: colors.textSecondary,
          fontSize: 14
        }}>{t('native_name') || 'English'}</Text>
        <ChevronDown size={20} color={colors.textSecondary} />
      </TouchableOpacity>
      <View style={{
        height: 60
      }} />
      <View style={{
        paddingHorizontal: 24
      }}>
        <TouchableOpacity activeOpacity={0.8} style={{
          backgroundColor: colors.primary,
          height: 52,
          borderRadius: 12,
          justifyContent: 'center',
          alignItems: 'center'
        }} onPress={() => setSignupModalVisible(true)}>
          <Text style={{
            color: colors.background,
            fontSize: 16,
            fontWeight: 'bold'
          }}>{t('create_account')}</Text>
        </TouchableOpacity>
      </View>
      <View style={{
        height: 24
      }} />
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 24
      }}>
        <View style={{
          flex: 1,
          height: 1,
          backgroundColor: 'rgba(255,255,255,0.1)'
        }} />
        <Text style={{
          color: colors.textSecondary,
          fontSize: 12,
          fontWeight: 'bold',
          paddingHorizontal: 16
        }}>{t('or')}</Text>
        <View style={{
          flex: 1,
          height: 1,
          backgroundColor: 'rgba(255,255,255,0.1)'
        }} />
      </View>
      <View style={{
        height: 24
      }} />
      <TouchableOpacity activeOpacity={0.8} style={{
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 12,
        gap: 12,
        alignSelf: 'center'
      }} onPress={handleGoogleLogin}>
        <Image source={{
          uri: 'https://www.gstatic.com/images/branding/product/2x/googleg_96dp.png'
        }} style={{
          width: 20,
          height: 20
        }} />
        <Text style={{
          color: colors.text,
          fontSize: 14,
          fontWeight: 'bold'
        }}>{t('try_with_google')}</Text>
      </TouchableOpacity>
      <View style={{
        height: 40
      }} />
      <View style={{
        paddingHorizontal: 40,
        paddingVertical: 24
      }}>
        <Text style={{
          color: 'rgba(255,255,255,0.4)',
          fontSize: 11,
          lineHeight: 16,
          textAlign: 'center'
        }}>
          By continuing, you agree to our{' '}
          <Text style={{
            color: 'rgba(255,255,255,0.7)',
            fontWeight: '600'
          }}>Terms of Service</Text>
          {' '}and{' '}
          <Text style={{
            color: 'rgba(255,255,255,0.7)',
            fontWeight: '600'
          }}>Privacy Policy</Text>.
        </Text>
      </View>
    </ScrollView>

    <SignupModalWidget
      visible={isSignupModalVisible}
      onClose={() => setSignupModalVisible(false)}
      onGoToLogin={() => {
        setSignupModalVisible(false);
        setLoginModalVisible(true);
      }}
    />

    <LoginModalWidget
      visible={isLoginModalVisible}
      onClose={() => setLoginModalVisible(false)}
      initialUsername={topUsername}
      initialPassword={topPassword}
    />
  </SafeAreaView>;
}
const isWeb = Platform.OS === 'web';