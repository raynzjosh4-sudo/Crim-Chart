import ChartAppBar from '@/components/chartappbar/ChartAppBar';
import { FollowUserButton } from '@/components/FollowUserButton';
import { useGlobalProgress } from '@/components/globalProgressBar/GlobalProgressBar';
import { useTranslation } from '@/core/localization/i18n';
import { colors } from '@/core/theme/colors';
import { useAuthStore } from '@/features/auth/application/useAuthStore';
import { useSuggestedUsers } from '@/features/profile/application/useSuggestedUsers';
import { useRouter } from 'expo-router';
import { User } from 'lucide-react-native';
import { ActivityShimmer } from '@/components/shimmers/ActivityShimmer';
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Image, StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function UserSuggestionsPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const currentUser = useAuthStore(state => state.user);
  const { users, isLoading: usersLoading } = useSuggestedUsers(currentUser?.id);
  const [followCount, setFollowCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const { startLoading, stopLoading } = useGlobalProgress();

  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  useEffect(() => {
    if (usersLoading) {
      startLoading();
    } else {
      stopLoading();
    }
    return () => {
      if (usersLoading) stopLoading();
    };
  }, [usersLoading, startLoading, stopLoading]);

  const handleFinish = async () => {
    if (isLoading) return;
    setIsLoading(true);
    startLoading();
    await new Promise(resolve => setTimeout(resolve, 600));
    stopLoading();
    router.replace('/signup/channel-intro' as any);
    setTimeout(() => setIsLoading(false), 1000);
  };

  const handleToggle = (isFollowing: boolean) => {
    setFollowCount(followCount + (isFollowing ? 1 : -1));
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
              onPress={handleFinish}
              disabled={isLoading}
            >
              <Text style={styles.skipText}>{t('skip' as any) || 'Skip'}</Text>
            </TouchableOpacity>
          ]}
        />
      )}

      <View style={isDesktop ? styles.desktopWrapper : styles.flexOne}>
        <View style={[styles.content, isDesktop && styles.desktopModal]}>
          <Text style={[styles.title, isDesktop && { textAlign: 'center', marginTop: 40 }]}>People you may know</Text>
          <Text style={[styles.subtitle, isDesktop && { textAlign: 'center' }]}>
            Follow people to see their posts and moments in your main feed. Follow at least 2 people to get started.
          </Text>

          <View style={styles.spacerMedium} />

          {usersLoading ? (
            <ActivityShimmer />
          ) : users.length === 0 ? (
            <View style={styles.centerBox}>
              <Text style={styles.subtitle}>No suggestions found right now.</Text>
            </View>
          ) : (
            <FlatList
              data={users}
              keyExtractor={(item) => String(item.id)}
              contentContainerStyle={styles.listPadding}
              renderItem={({ item }) => (
                <View style={styles.userItem}>
                  {item.profileImageUrl ? (
                    <Image source={{ uri: item.profileImageUrl }} style={styles.userIcon} />
                  ) : (
                    <View style={[styles.userIcon, styles.placeholderIcon]}>
                      <User color="rgba(255,255,255,0.3)" size={24} />
                    </View>
                  )}

                  <View style={styles.userInfo}>
                    <Text style={styles.userName} numberOfLines={2}>{item.displayName}</Text>
                    <Text style={styles.userSubtitle} numberOfLines={1}>@{item.username}</Text>
                  </View>

                  <View style={styles.buttonContainer}>
                    <FollowUserButton
                      targetUserId={item.id}
                      size="small"
                      onToggle={handleToggle}
                    />
                  </View>
                </View>
              )}
            />
          )}

          <View style={styles.footer}>
            <TouchableOpacity activeOpacity={1}
              style={[styles.finishButton, followCount < 2 && styles.finishButtonDisabled]}
              onPress={handleFinish}
              disabled={followCount < 2}
            >
              <Text style={styles.finishButtonText}>Next</Text>
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
    maxHeight: 800,
    backgroundColor: '#16181c',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
  },
  flexOne: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  centerBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    color: colors.text,
    fontSize: 24,
    fontWeight: 'bold',
    paddingHorizontal: 24,
    marginTop: 20,
  },
  subtitle: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 14,
    paddingHorizontal: 24,
    marginTop: 8,
  },
  spacerMedium: {
    height: 16,
  },
  listPadding: {
    paddingHorizontal: 24,
    paddingBottom: 100,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
  },
  userIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  placeholderIcon: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userInfo: {
    flex: 1,
    marginLeft: 16,
  },
  userName: {
    color: colors.text,
    fontSize: 16,
    fontWeight: 'bold',
  },
  userSubtitle: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 13,
    marginTop: 2,
  },
  buttonContainer: {
    width: 100,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 24,
    backgroundColor: colors.background,
  },
  finishButton: {
    backgroundColor: colors.primary,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  finishButtonDisabled: {
    opacity: 0.5,
  },
  finishButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  skipText: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
