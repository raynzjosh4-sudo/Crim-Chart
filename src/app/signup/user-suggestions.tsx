import ChartAppBar from '@/components/chartappbar/ChartAppBar';
import { colors } from '@/core/theme/colors';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { FlatList, Image, StyleSheet, Text, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '@/features/auth/application/useAuthStore';
import { useSuggestedUsers } from '@/features/profile/application/useSuggestedUsers';
import { FollowUserButton } from '@/components/FollowUserButton';
import { User } from 'lucide-react-native';

export default function UserSuggestionsPage() {
  const router = useRouter();
  const currentUser = useAuthStore(state => state.user);
  const { users, isLoading } = useSuggestedUsers(currentUser?.id);
  const [followCount, setFollowCount] = useState(0);

  const handleFinish = () => {
    router.replace('/signup/channel-intro' as any);
  };

  const handleToggle = (isFollowing: boolean) => {
    setFollowCount(followCount + (isFollowing ? 1 : -1));
  };

  return (
    <SafeAreaView style={styles.container}>
      <ChartAppBar
        title=""
        showBorder
        actions={[
          <TouchableOpacity activeOpacity={1}
            key="skip"
            onPress={handleFinish}
          >
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
        ]}
      />

      <View style={styles.content}>
        <Text style={styles.title}>People you may know</Text>
        <Text style={styles.subtitle}>
          Follow people to see their posts and moments in your main feed. Follow at least 2 people to get started.
        </Text>

        <View style={styles.spacerMedium} />

        {isLoading ? (
          <View style={styles.centerBox}>
            <ActivityIndicator color={colors.primary} size="large" />
          </View>
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
                  <Text style={styles.userName}>{item.displayName}</Text>
                  <Text style={styles.userSubtitle}>@{item.username}</Text>
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
