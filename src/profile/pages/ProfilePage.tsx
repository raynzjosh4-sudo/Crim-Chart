import CrimchartBackButton from '@/components/CrimChartBackButton/CrimChart_back_button';
import { useAuthStore } from '@/features/auth/application/useAuthStore';
import { UserBoxesWidget } from '@/features/boxes/components/UserBoxesWidget';
import { CrimChartUserModel } from '@/profile/models/CrimChartUserModel';
import { getStatusText } from '@/profile/utils/ConnectionStatsUtils';
import { useRouter } from 'expo-router';
import { LayoutGrid, Music, Play, Settings } from 'lucide-react-native';
import { useState } from 'react';
import {
  DeviceEventEmitter,
  Dimensions,
  Image,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MusicProfileTab } from '../tabs/MusicProfileTab';
import { PhotosProfileTab } from '../tabs/PhotosProfileTab';
import { PostsProfileTab } from '../tabs/PostsProfileTab';
import { VideosProfileTab } from '../tabs/VideosProfileTab';

interface ProfilePageProps {
  userId?: string;
  userData?: CrimChartUserModel;
  showBack?: boolean;
  customActions?: React.ReactNode;
  isLoading?: boolean;
  onEditProfile?: () => void;
  onOpenConnections?: (tab: 'followers' | 'following', targetId: string) => void;
}

type TabId = 'posts' | 'photos' | 'videos' | 'music';

export const ProfilePage: React.FC<ProfilePageProps> = ({
  userId,
  userData,
  showBack = true,
  customActions,
  isLoading = false,
  onEditProfile,
  onOpenConnections,
}) => {
  const router = useRouter();
  const currentUser = useAuthStore(s => s.user);
  const user: CrimChartUserModel | null | undefined = userData ?? currentUser;
  const isCurrentUser = !userId || userId === currentUser?.id;

  const isDesktop = Platform.OS === 'web' && Dimensions.get('window').width >= 768;

  const [activeTab, setActiveTab] = useState<TabId>(isDesktop ? 'posts' : 'photos');
  const [showScrolledActions, setShowScrolledActions] = useState(false);

  const openConnections = (tab: 'followers' | 'following') => {
    const targetId = userId ?? user?.id ?? currentUser?.id ?? '';
    if (onOpenConnections) {
      onOpenConnections(tab, targetId);
    }
  };

  const handleScroll = (event: any) => {
    const scrollY = event.nativeEvent.contentOffset.y;
    DeviceEventEmitter.emit('profileScroll', scrollY);
    if (scrollY > 120) {
      if (!showScrolledActions) setShowScrolledActions(true);
    } else {
      if (showScrolledActions) setShowScrolledActions(false);
    }
  };

  const goToSettings = () => router.push('/settings');
  const goToEditProfile = () => { if (onEditProfile) onEditProfile(); };
  const goToInbox = () => router.push('/inbox');
  const goToEditImage = () => { if (onEditProfile) onEditProfile(); };

  const statBadge = (label: string, value: number | string, highlighted = false) => (
    <View style={[styles.statBadge, highlighted && styles.statBadgeHighlighted]}>
      <Text style={[styles.statValue, highlighted && styles.statValueHighlighted]}>
        {value}
      </Text>
      <Text style={[styles.statLabel, highlighted && styles.statLabelHighlighted]}>
        {String(label).toUpperCase()}
      </Text>
    </View>
  );

  const stats = user?.connectionStats;

  return (
    <>
      <SafeAreaView style={styles.root}>
        <StatusBar barStyle="light-content" />

        {/* App Bar */}
        <View style={[
          styles.appBar,
          isDesktop && {
            backgroundColor: showScrolledActions ? 'rgba(13, 13, 13, 0.98)' : 'transparent',
            position: 'absolute',
            top: 0, left: 0, right: 0,
            zIndex: 100,
            borderBottomWidth: showScrolledActions ? 1 : 0,
            borderBottomColor: 'rgba(255,255,255,0.1)'
          }
        ]}>
          {showBack ? (
            <CrimchartBackButton onPress={() => router.back()} color="#FFF" />
          ) : <View style={styles.appBarBtn} />}

          <View style={{ flex: 1, alignItems: 'center', flexDirection: 'row', justifyContent: 'center' }}>
            {isDesktop && showScrolledActions ? (
              <Text style={styles.appBarTitle} numberOfLines={1}>{user?.displayName}</Text>
            ) : (
              <Text style={styles.appBarTitle} numberOfLines={1}></Text>
            )}
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', minWidth: 44, justifyContent: 'flex-end', gap: 10 }}>
            {isDesktop && showScrolledActions ? customActions : null}
            {!isDesktop && (
              <TouchableOpacity activeOpacity={1} onPress={goToSettings} style={styles.appBarBtn}>
                {isCurrentUser && <Settings color="#FFF" size={22} />}
              </TouchableOpacity>
            )}
          </View>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          onScroll={isDesktop ? handleScroll : undefined}
          scrollEventThrottle={16}
          contentContainerStyle={isDesktop ? { paddingTop: 60 } : undefined}
        >
          <View>
            {/* Header */}
            <View style={styles.header}>
              {isDesktop ? (
                <>
                  {/* Desktop: Avatar & Actions Row */}
                  <View style={styles.avatarActionRow}>
                    <TouchableOpacity
                      onPress={isCurrentUser ? goToEditImage : undefined}
                      activeOpacity={isCurrentUser ? 0.8 : 1}
                    >
                      <Image
                        source={{ uri: user?.profileImageUrl ?? '' }}
                        style={styles.avatar}
                      />
                      {isCurrentUser && (
                        <View style={styles.cameraBadge}>
                          <Text style={{ fontSize: 16 }}>📷</Text>
                        </View>
                      )}
                    </TouchableOpacity>

                    <View style={styles.actionsContainer}>
                      {customActions}
                    </View>
                  </View>

                  {/* Desktop: User Info Row */}
                  <View style={styles.userInfoRow}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Text style={styles.displayName}>{user?.username ?? ''}</Text>
                      {user?.crownTitle ? (
                        <Text style={styles.crownTitle}>{user.crownTitle}</Text>
                      ) : null}
                    </View>
                    <Text style={styles.handle}>@{user?.username?.replace(/\s+/g, '').toLowerCase() ?? 'user'}</Text>
                  </View>

                  {/* Desktop: Bio */}
                  {user?.bio ? (
                    <Text style={styles.bio}>{user.bio}</Text>
                  ) : null}

                  {/* Desktop: Followers / Following / Inboxes */}
                  <View style={styles.followStatsRow}>
                    <TouchableOpacity activeOpacity={0.8} onPress={() => openConnections('following')}>
                      <Text style={styles.followStatText}>
                        <Text style={styles.followStatNumber}>{isLoading ? '-' : (user?.followingCount ?? 0)}</Text> Following
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity activeOpacity={0.8} onPress={() => openConnections('followers')}>
                      <Text style={styles.followStatText}>
                        <Text style={styles.followStatNumber}>{isLoading ? '-' : (user?.followersCount ?? 0)}</Text> Followers
                      </Text>
                    </TouchableOpacity>
                    <Text style={styles.followStatText}>
                      <Text style={styles.followStatNumber}>{isLoading ? '-' : (user?.inboxCount ?? 0)}</Text> Inboxes
                    </Text>
                  </View>

                  {/* Desktop: Connection Stats Widget */}
                  {stats && !isCurrentUser && (
                    <View style={styles.detailsContainer}>
                      {stats.showStatusText && (
                        <Text style={styles.statsText}>Status: {getStatusText(stats.relSentCount)}</Text>
                      )}
                      {stats.showCountryPref && stats.preferredCountries && stats.preferredCountries.length > 0 && (
                        <Text style={styles.statsText}>Mostly connects with people from {stats.preferredCountries.join(', ')}</Text>
                      )}
                      {stats.showAgePref && stats.preferredAgeRanges && stats.preferredAgeRanges.length > 0 && (
                        <Text style={styles.statsText}>Prefers ages {stats.preferredAgeRanges.join(', ')}</Text>
                      )}
                    </View>
                  )}
                </>
              ) : (
                <>
                  {/* Mobile: Top layout (avatar on right, text on left) */}
                  <View style={styles.headerTopMobile}>
                    <View style={styles.headerTopMobileLeft}>
                      <Text style={styles.displayNameMobile}>{user?.username ?? ''}</Text>
                      <Text style={styles.handleMobile}>@{user?.username?.replace(/\s+/g, '').toLowerCase() ?? 'user'}</Text>
                      {user?.bio ? <Text style={styles.bioMobile}>{user.bio}</Text> : null}
                    </View>
                    <TouchableOpacity
                      onPress={isCurrentUser ? goToEditImage : undefined}
                      activeOpacity={isCurrentUser ? 0.8 : 1}
                    >
                      <Image
                        source={{ uri: user?.profileImageUrl ?? '' }}
                        style={styles.avatarMobile}
                      />
                      {isCurrentUser && (
                        <View style={styles.cameraBadgeMobile}>
                          <Text style={{ fontSize: 14 }}>📷</Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  </View>

                  {/* Mobile: Stats Badges Row */}
                  <View style={styles.statsBadgesRowMobile}>
                    {statBadge('channels', user?.channelCount ?? 0, true)}
                    {statBadge('posts', user?.postsCount ?? 0, false)}
                    {statBadge('boxes', user?.boxesCount ?? 0, false)}
                  </View>

                  {/* Mobile: Action Buttons underneath stats */}
                  <View style={styles.actionsContainerMobile}>
                    {customActions}
                  </View>

                  {/* Mobile: Mini details string underneath - tappable */}
                  <View style={{ paddingBottom: 0, flexDirection: 'row', flexWrap: 'wrap', gap: 4 }}>
                    <TouchableOpacity activeOpacity={0.8} onPress={() => openConnections('followers')}>
                      <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>
                        <Text style={{ color: '#FFF', fontWeight: '700' }}>{isLoading ? '-' : (user?.followersCount ?? '-')}</Text> followers
                      </Text>
                    </TouchableOpacity>
                    <Text style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13 }}> • </Text>
                    <TouchableOpacity activeOpacity={0.8} onPress={() => openConnections('following')}>
                      <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>
                        <Text style={{ color: '#FFF', fontWeight: '700' }}>{isLoading ? '-' : (user?.followingCount ?? '-')}</Text> following
                      </Text>
                    </TouchableOpacity>
                    <Text style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13 }}> • </Text>
                    <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>
                      <Text style={{ color: '#FFF', fontWeight: '700' }}>{isLoading ? '-' : (user?.inboxCount ?? '-')}</Text> inboxes
                    </Text>
                  </View>
                </>
              )}
            </View>

            {(isCurrentUser || (user?.boxesCount ?? 0) > 0) && (
              <UserBoxesWidget
                userId={userId ?? user?.id}
                isCurrentUser={isCurrentUser}
              />
            )}
          </View>

          {/* Sticky Tab Bar */}
          <View style={styles.tabBar}>
            {isDesktop && (
              <TouchableOpacity activeOpacity={1}
                style={[styles.tabItem, activeTab === 'posts' && styles.tabItemActive]}
                onPress={() => setActiveTab('posts')}
              >
                <Text style={[styles.tabText, activeTab === 'posts' && styles.tabTextActive]}>Posts</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity activeOpacity={1}
              style={[styles.tabItem, activeTab === 'photos' && styles.tabItemActive]}
              onPress={() => setActiveTab('photos')}
            >
              {isDesktop ? <Text style={[styles.tabText, activeTab === 'photos' && styles.tabTextActive]}>Photos</Text> : <LayoutGrid color={activeTab === 'photos' ? '#FFF' : 'rgba(255,255,255,0.4)'} size={22} />}
            </TouchableOpacity>
            <TouchableOpacity activeOpacity={1}
              style={[styles.tabItem, activeTab === 'videos' && styles.tabItemActive]}
              onPress={() => setActiveTab('videos')}
            >
              {isDesktop ? <Text style={[styles.tabText, activeTab === 'videos' && styles.tabTextActive]}>Videos</Text> : <Play color={activeTab === 'videos' ? '#FFF' : 'rgba(255,255,255,0.4)'} size={22} />}
            </TouchableOpacity>
            <TouchableOpacity activeOpacity={1}
              style={[styles.tabItem, activeTab === 'music' && styles.tabItemActive]}
              onPress={() => setActiveTab('music')}
            >
              {isDesktop ? <Text style={[styles.tabText, activeTab === 'music' && styles.tabTextActive]}>Music</Text> : <Music color={activeTab === 'music' ? '#FFF' : 'rgba(255,255,255,0.4)'} size={22} />}
            </TouchableOpacity>
          </View>

          {/* Tab Content */}
          <View style={{ minHeight: 400 }}>
            {activeTab === 'posts' && <PostsProfileTab userId={userId} userData={user as any} />}
            {activeTab === 'photos' && <PhotosProfileTab userId={userId} />}
            {activeTab === 'videos' && <VideosProfileTab userId={userId} />}
            {activeTab === 'music' && <MusicProfileTab userId={userId} />}
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0D0D0D' },
  appBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  appBarBtn: { width: 36, alignItems: 'center' },
  backArrow: { color: '#FFF', fontSize: 22 },
  appBarTitle: {
    flex: 1,
    color: '#FFF',
    fontWeight: '900',
    fontSize: 16,
    textAlign: 'center',
    letterSpacing: -0.2,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 20,
    gap: 12,
  },
  headerTopMobile: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 4,
  },
  headerTopMobileLeft: {
    flex: 1,
    marginRight: 16,
  },
  displayNameMobile: { color: '#FFF', fontWeight: '900', fontSize: 20, letterSpacing: -0.5 },
  handleMobile: { color: 'rgba(255,255,255,0.5)', fontSize: 13, marginTop: 2 },
  bioMobile: { color: 'rgba(255,255,255,0.7)', fontSize: 13, marginTop: 4, lineHeight: 18 },
  avatarMobile: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#1A1A1A',
  },
  cameraBadgeMobile: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    backgroundColor: '#FACD11',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#0D0D0D',
  },
  statsBadgesRowMobile: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  actionsContainerMobile: {
    marginTop: 4,
    paddingBottom: 8,
  },
  avatarActionRow: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' },
  actionsContainer: { paddingBottom: 12 },
  userInfoRow: { marginTop: 4 },
  displayName: { color: '#FFF', fontWeight: '900', fontSize: 22, letterSpacing: -0.5 },
  crownTitle: { color: 'rgba(255,255,255,0.5)', fontSize: 11, fontWeight: '500', marginLeft: 8 },
  handle: { color: 'rgba(255,255,255,0.5)', fontSize: 15, marginTop: 2 },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: '#0D0D0D', // Matches background to look like it cuts out
    backgroundColor: '#1A1A1A',
  },
  cameraBadge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: '#FACD11',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#0D0D0D',
  },
  followStatsRow: { flexDirection: 'row', gap: 16, marginTop: 4 },
  followStatText: { color: 'rgba(255,255,255,0.5)', fontSize: 14 },
  followStatNumber: { color: '#FFF', fontWeight: '700' },
  statsRow: { flexDirection: 'row', gap: 8 },
  statBadge: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 10,
    paddingVertical: 8,
    alignItems: 'center',
  },
  statBadgeHighlighted: { backgroundColor: 'rgba(250,205,17,0.06)' },
  statValue: { color: '#FFF', fontSize: 15, fontWeight: '900', letterSpacing: -0.5 },
  statValueHighlighted: { color: '#FACD11' },
  statLabel: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginTop: 2,
  },
  statLabelHighlighted: { color: 'rgba(250,205,17,0.7)' },
  bio: { color: 'rgba(255,255,255,0.7)', fontSize: 13, lineHeight: 18 },
  actionRow: { flexDirection: 'row' },
  actionBtn: {
    flex: 1,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryBtn: { backgroundColor: '#FACD11', flex: 2 },
  secondaryBtn: { backgroundColor: 'rgba(255,255,255,0.08)', flex: 1 },
  primaryBtnText: { color: '#000', fontWeight: '800', fontSize: 13 },
  secondaryBtnText: { color: '#FFF', fontWeight: '700', fontSize: 13 },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: '#0D0D0D',
  },
  tabItem: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
  },
  tabItemActive: {
    borderBottomWidth: 3,
    borderBottomColor: '#FACD11',
  },
  tabText: {
    color: 'rgba(255,255,255,0.5)',
    fontWeight: '700',
    fontSize: 14,
  },
  tabTextActive: {
    color: '#FFF',
  },
  detailsContainer: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 12,
    borderRadius: 8,
    marginTop: 4,
  },
  statsText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    marginBottom: 4,
  },
});
