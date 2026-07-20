import React from 'react';
import { View, Text, Modal, StyleSheet, Pressable, Image, TouchableOpacity, useWindowDimensions, Platform } from 'react-native';
import { useTranslation } from '@/core/localization/i18n';
import { colors } from '@/core/theme/colors';
import { ArrowLeft } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/features/auth/application/useAuthStore';
import { ChartToast } from '@/components/showcase/CrimChart_toast';

interface AuthChoiceModalWidgetProps {
  visible: boolean;
  onClose: () => void;
  onLoginClick: () => void;
  onSignupClick: () => void;
}

export function AuthChoiceModalWidget({ visible, onClose, onLoginClick, onSignupClick }: AuthChoiceModalWidgetProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const authStore = useAuthStore();
  const { width, height } = useWindowDimensions();
  const isDesktop = width >= 768;

  const modalWidth = isDesktop ? Math.min(width * 0.4, 450) : width;
  const modalHeight = isDesktop ? Math.min(height * 0.85, 650) : height;
  const modalBorderRadius = isDesktop ? 16 : 0;

  const handleGoogleLogin = async () => {
    try {
      const success = await authStore.loginWithGoogle();
      if (success) {
        onClose();
        if (useAuthStore.getState().pendingGoogleOnboarding) {
          onSignupClick();
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

  const handleCreateAccount = () => {
    onClose();
    setTimeout(() => {
      onSignupClick();
    }, 100);
  };

  const handleLoginClick = () => {
    onClose();
    setTimeout(() => {
      onLoginClick();
    }, 100);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.modalContainer, { width: modalWidth, height: modalHeight, borderRadius: modalBorderRadius, backgroundColor: colors.background }]}>
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.backBtn} activeOpacity={0.7}>
              <ArrowLeft color={colors.text} size={24} />
            </TouchableOpacity>
            <View style={styles.logoContainer}>
              {/* Logo removed from header */}
            </View>
            <View style={styles.headerRightSpacer} />
          </View>

          <View style={styles.content}>
            <Image 
              source={require('@/assets/appicon/big-sized-app-icon.png')} 
              style={{ width: 44, height: 44, marginBottom: 24, alignSelf: 'flex-start' }} 
              resizeMode="contain" 
            />
            <Text style={styles.title}>Join today.</Text>
            
            <View style={{ height: 24 }} />
            
            <Pressable onPress={handleGoogleLogin} style={({ pressed }) => [styles.whitePill, pressed && { opacity: 0.85 }]}>
              <Image source={{ uri: 'https://www.gstatic.com/images/branding/product/2x/googleg_96dp.png' }} style={styles.gIcon} resizeMode="contain" />
              <Text style={styles.whitePillText}>{t('try_with_google') || 'Sign in with Google'}</Text>
            </Pressable>

            <View style={styles.orRow}>
              <View style={styles.orLine} />
              <Text style={styles.orTxt}>or</Text>
              <View style={styles.orLine} />
            </View>

            <Pressable onPress={handleCreateAccount} style={({ pressed }) => [styles.brandPill, { backgroundColor: colors.primary }, pressed && { opacity: 0.85 }]}>
              <Text style={[styles.brandPillText, { color: colors.background }]}>
                {t('create_account') || 'Create account'}
              </Text>
            </Pressable>

            <View style={{ height: 44 }} />
            <Text style={styles.already}>Already have an account?</Text>
            <View style={{ height: 16 }} />

            <Pressable onPress={handleLoginClick} style={({ pressed }) => [styles.outlinePill, pressed && { opacity: 0.85 }]}>
              <Text style={[styles.outlinePillText, { color: colors.primary }]}>Log In</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    ...(Platform.OS === 'web' ? { boxShadow: '0 0 15px rgba(255,255,255,0.05)' as any } : {})
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: '4%',
    paddingVertical: '2%',
    minHeight: 50
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent'
  },
  logoContainer: {
    flex: 1,
    alignItems: 'center'
  },
  logo: {
    width: 32,
    height: 32
  },
  headerRightSpacer: {
    width: 36
  },
  content: {
    flex: 1,
    paddingHorizontal: '10%',
    paddingTop: '6%',
    paddingBottom: '4%',
    alignItems: 'center',
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    color: colors.text,
    alignSelf: 'flex-start'
  },
  whitePill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.text,
    borderRadius: 9999,
    height: 42,
    width: '100%',
    gap: 10,
    ...(Platform.OS === 'web' && { cursor: 'pointer' as any })
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
    width: '100%',
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
    width: '100%',
    borderRadius: 9999,
    alignItems: 'center',
    justifyContent: 'center',
    ...(Platform.OS === 'web' && { cursor: 'pointer' as any })
  },
  brandPillText: {
    fontSize: 15,
    fontWeight: '700'
  },
  already: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.text,
    alignSelf: 'flex-start'
  },
  outlinePill: {
    height: 42,
    width: '100%',
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
    ...(Platform.OS === 'web' && { cursor: 'pointer' as any })
  },
  outlinePillText: {
    fontSize: 15,
    fontWeight: '700'
  }
});
