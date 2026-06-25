import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { FollowUserButton } from '@/components/FollowUserButton';
import { useAuthStore } from '@/features/auth/application/useAuthStore';
import { useSuggestedUsers } from '@/features/profile/application/useSuggestedUsers';
import { CrimChartUserModel } from '@/profile/models/CrimChartUserModel';
import { User, X } from 'lucide-react-native';

const UserCard = ({ user }: { user: CrimChartUserModel }) => (
  <View style={styles.card}>
    <TouchableOpacity activeOpacity={1} style={styles.closeButton}>
      <X size={16} color="rgba(255,255,255,0.6)" />
    </TouchableOpacity>

    <View style={styles.cardContent}>
      {user.profileImageUrl ? (
        <Image source={{ uri: user.profileImageUrl }} style={styles.channelIcon} />
      ) : (
        <View style={[styles.channelIcon, { justifyContent: 'center', alignItems: 'center' }]}>
          <User color="rgba(255,255,255,0.3)" size={32} />
        </View>
      )}
      <View style={styles.nameRow}>
        <Text style={styles.channelName} numberOfLines={1}>
          {user.displayName}
        </Text>
      </View>
      <Text style={styles.suggestedText} numberOfLines={1}>
        @{user.username}
      </Text>
    </View>

    <View style={styles.buttonContainer}>
      <FollowUserButton
        targetUserId={user.id}
        size="small"
        style={{ width: '100%' }}
      />
    </View>
  </View>
);


export const UserRecommendationCarousel = () => {
  const currentUser = useAuthStore(state => state.user);
  const { users, isLoading } = useSuggestedUsers(currentUser?.id);

  if (isLoading || users.length === 0) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>People to Follow</Text>
      <FlatList
        data={users}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => <UserCard user={item} />}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 20,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '900',
    marginBottom: 12,
    paddingHorizontal: 20,
    letterSpacing: -0.2,
  },
  listContent: {
    paddingHorizontal: 16,
  },
  card: {
    width: 140,
    minHeight: 250,
    backgroundColor: '#0D0D0D', // Scaffold bg color
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 20,
    alignItems: 'center',
    marginRight: 8,
    justifyContent: 'space-between',
  },
  closeButton: {
    position: 'absolute',
    top: 14,
    right: 12,
    zIndex: 10,
  },
  cardContent: {
    alignItems: 'center',
    width: '100%',
  },
  channelIcon: {
    width: 90,
    height: 90,
    borderRadius: 45,
    marginBottom: 14,
    backgroundColor: '#1A1A1A',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  channelName: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: -0.2,
    textAlign: 'center',
    maxWidth: 150,
  },
  suggestedText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 12,
    marginTop: 2,
    fontWeight: '400',
    textAlign: 'center',
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: 12,
  },
  followButtonOverride: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 10,
    height: 36,
  },
});
