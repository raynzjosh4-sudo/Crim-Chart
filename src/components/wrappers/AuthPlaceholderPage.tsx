import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { X, Lock } from 'lucide-react-native';
import ChartAppBar from '@/components/chartappbar/ChartAppBar';
import { useAppTheme } from '@/core/theme/app_theme';

interface AuthPlaceholderPageProps {
  title: string;
  featureName: string;
}

export const AuthPlaceholderPage: React.FC<AuthPlaceholderPageProps> = ({ title, featureName }) => {
  const { colors } = useAppTheme();
  const router = useRouter();
  const [showBanner, setShowBanner] = useState(true);

  return (
    <View style={[styles.flex, { backgroundColor: colors.background }]}>
      <ChartAppBar title={title} showBack={false} />

      {/* Compact Vault CTA banner */}
      {showBanner && (
        <View style={[styles.compactBanner, { backgroundColor: colors.primary + '11' }]}>
          <TouchableOpacity onPress={() => setShowBanner(false)} style={styles.compactBannerClose}>
            <X size={16} color={colors.textSecondary || 'rgba(255,255,255,0.5)'} />
          </TouchableOpacity>
          <View style={styles.compactBannerContent}>
            <Text style={[styles.compactBannerTitle, { color: colors.primary }]}>
              Create your Digital Music Vault
            </Text>
            <Text style={[styles.compactBannerDesc, { color: colors.text }]}>
              Never lose your music. Save your favourite tracks forever, share them with friends, and unlock a personalised feed.
            </Text>
            <TouchableOpacity 
              activeOpacity={0.8} 
              onPress={() => router.push('/welcome' as any)}
              style={[styles.compactBannerBtn, { backgroundColor: colors.primary }]}
            >
              <Text style={styles.compactBannerBtnText}>Sign Up / Try it</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <View style={styles.emptyContainer}>
        <View style={[styles.iconCircle, { backgroundColor: colors.surface }]}>
          <Lock size={48} color={colors.primary} />
        </View>
        <Text style={[styles.emptyTitle, { color: colors.text }]}>
          Sign in required
        </Text>
        <Text style={[styles.emptyDesc, { color: colors.textSecondary }]}>
          Please create an account or log in to access {featureName} and join the community.
        </Text>
        <TouchableOpacity 
          activeOpacity={0.8} 
          onPress={() => router.push('/welcome' as any)}
          style={[styles.joinBtn, { backgroundColor: colors.primary }]}
        >
          <Text style={styles.joinBtnText}>Join Now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  compactBanner: {
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 4,
    borderRadius: 12,
    overflow: 'hidden',
  },
  compactBannerClose: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 10,
    padding: 6,
  },
  compactBannerContent: {
    padding: 14,
  },
  compactBannerTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
    paddingRight: 20,
  },
  compactBannerDesc: {
    fontSize: 13,
    lineHeight: 18,
    opacity: 0.85,
    marginBottom: 12,
  },
  compactBannerBtn: {
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 999,
  },
  compactBannerBtnText: {
    color: '#000',
    fontWeight: '700',
    fontSize: 12,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingBottom: 60,
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyDesc: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  joinBtn: {
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 999,
  },
  joinBtnText: {
    color: '#000',
    fontWeight: '700',
    fontSize: 15,
  },
});
