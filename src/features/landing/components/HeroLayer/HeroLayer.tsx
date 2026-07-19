import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Image, Platform, TouchableOpacity } from 'react-native';
import { useTranslation } from '@/core/localization/i18n';
import { colors } from '@/core/theme/colors';
import { ChevronDown } from 'lucide-react-native';
import { AvatarCollage } from '@/signing/components/AvatarCollage';
import { useRouter } from 'expo-router';
import { UserMenuWidget } from './UserMenuWidget';

interface HeroLayerProps {
  onGoogleLogin: () => void;
  onCreateAccount: () => void;
  onLoginClick: () => void;
  onLanguageClick?: () => void;
  onBrowseAsGuest: () => void;
}

export function HeroLayer({ onGoogleLogin, onCreateAccount, onLoginClick, onLanguageClick, onBrowseAsGuest }: HeroLayerProps) {
  const { t } = useTranslation();
  const router = useRouter();


  return (
    <View style={styles.container}>
      {/* Top-right User Menu */}
      <UserMenuWidget onLoginClick={onLoginClick} onCreateAccount={onCreateAccount} />

      <View style={styles.columns}>
        {/* ── LEFT: actions ── */}
        <View style={styles.leftCol}>
          <View style={styles.leftInner}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={styles.hero}>CrimChart.</Text>
            </View>

            <View style={{ height: 52 }} />
            <Text style={styles.sub}>Join today.</Text>
            <View style={{ height: 24 }} />
            
            {/* Google */}
            <Pressable 
              onPress={onGoogleLogin} 
              style={({ pressed }) => [styles.whitePill, pressed && { opacity: 0.85 }]}
            >
              <Image 
                source={{ uri: 'https://www.gstatic.com/images/branding/product/2x/googleg_96dp.png' }} 
                style={styles.gIcon} 
                resizeMode="contain" 
              />
              <Text style={styles.whitePillText}>{t('try_with_google') || 'Sign in with Google'}</Text>
            </Pressable>

            {/* OR */}
            <View style={styles.orRow}>
              <View style={styles.orLine} />
              <Text style={styles.orTxt}>or</Text>
              <View style={styles.orLine} />
            </View>

            {/* Create account */}
            <Pressable 
              onPress={onCreateAccount} 
              style={({ pressed }) => [
                styles.brandPill, 
                { backgroundColor: colors.primary }, 
                pressed && { opacity: 0.85 }
              ]}
            >
              <Text style={[styles.brandPillText, { color: colors.background }]}>
                {t('create_account') || 'Create account'}
              </Text>
            </Pressable>

            <View style={{ height: 44 }} />
            <Text style={styles.already}>Already have an account?</Text>
            <View style={{ height: 16 }} />

            {/* Sign in */}
            <Pressable 
              onPress={onLoginClick} 
              style={({ pressed }) => [styles.outlinePill, pressed && { opacity: 0.85 }]}
            >
              <Text style={[styles.outlinePillText, { color: colors.primary }]}>Log In</Text>
            </Pressable>

            <View style={{ height: 36 }} />

            <TouchableOpacity 
              activeOpacity={0.7} 
              style={styles.langRow} 
              onPress={() => {
                if (onLanguageClick) onLanguageClick();
                else router.push('/language' as any);
              }}
            >
              <Text style={styles.langTxt}>{t('native_name') || 'English'}</Text>
              <ChevronDown size={14} color="rgba(255,255,255,0.4)" />
            </TouchableOpacity>

            <View style={{ height: 18 }} />
            <Text style={styles.tos}>
              By signing up, you agree to our{' '}
              <Text style={styles.tosLink} onPress={() => router.push('/terms')}>Terms of Service</Text>
              {' '}and{' '}
              <Text style={styles.tosLink} onPress={() => router.push('/privacy')}>Privacy Policy</Text>.
            </Text>
          </View>
        </View>

        {/* ── RIGHT: user avatar collage + guest CTA ── */}
        <View style={styles.rightCol}>
          <AvatarCollage />
          <View style={{ height: 28 }} />
          <Pressable
            onPress={onBrowseAsGuest}
            style={({ pressed }) => [
              styles.guestPill,
              { width: '70%', maxWidth: 340 },
              pressed && { opacity: 0.85 }
            ]}
          >
            <Text style={styles.guestPillText}>Browse without signing up</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const isWeb = Platform.OS === 'web';

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    width: '100%',
    minHeight: isWeb ? '90vh' as any : 800,
    zIndex: 20,
    ...Platform.select({
      web: {
        boxShadow: '0 10px 40px rgba(0,0,0,0.8)' as any,
      },
      default: {
        elevation: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.8,
        shadowRadius: 20,
      }
    })
  },

  columns: {
    flexDirection: 'row',
    flex: 1,
    minHeight: isWeb ? '90vh' as any : 800,
  },
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
    height: 38,
    gap: 10,
    ...(isWeb && { cursor: 'pointer' as any })
  },
  whitePillText: {
    fontSize: 14,
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
    height: 38,
    borderRadius: 9999,
    alignItems: 'center',
    justifyContent: 'center',
    ...(isWeb && { cursor: 'pointer' as any })
  },
  brandPillText: {
    fontSize: 14,
    fontWeight: '700'
  },
  already: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.text
  },
  outlinePill: {
    height: 38,
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
    ...(isWeb && { cursor: 'pointer' as any })
  },
  outlinePillText: {
    fontSize: 14,
    fontWeight: '700'
  },
  guestPill: {
    height: 38,
    borderRadius: 9999,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...(isWeb && { cursor: 'pointer' as any })
  },
  guestPillText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#000000'
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
    fontWeight: '600',
    ...(isWeb && { cursor: 'pointer' as any })
  },
  rightCol: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden' as any
  }
});
