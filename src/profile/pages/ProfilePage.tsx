import { useAuthStore } from '@/features/auth/application/useAuthStore';
import CrimchartBackButton from '@/components/CrimChartBackButton/CrimChart_back_button';
import { CrimChartUserModel } from '@/profile/models/CrimChartUserModel';
import { useRouter } from 'expo-router';
import { LayoutGrid, Play, Settings } from 'lucide-react-native';
import { DiscoverChannelWidget } from '@/channel/ChannelComponents/DiscoverChannelCard/discoverchannelWidget/DiscoverChannelWidget';
import React, { useState } from 'react';
import {
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { PhotosProfileTab } from '../tabs/PhotosProfileTab';
import { VideosProfileTab } from '../tabs/VideosProfileTab';
import { MusicProfileTab } from '../tabs/MusicProfileTab';
import { Music } from 'lucide-react-native';

interface ProfilePageProps {
  userId?: string;
  userData?: CrimChartUserModel;
  showBack?: boolean;
  customActions?: React.ReactNode;
}

type TabId = 'photos' | 'videos' | 'music';

export const ProfilePage: React.FC<ProfilePageProps> = ({
  userId,
  userData,
  showBack = true,
  customActions,
}) => {
  const router = useRouter();
  const currentUser = useAuthStore(s => s.user);
  const user: CrimChartUserModel | null | undefined = userData ?? currentUser;
  const isCurrentUser = !userId || userId === currentUser?.id;

  const [activeTab, setActiveTab] = useState<TabId>('photos');

  const goToSettings = () => router.push('/settings');
  const goToEditProfile = () => router.push('/edit-profile');
  const goToInbox = () => router.push('/inbox');
  const goToEditImage = () => router.push('/edit-profile'); // fallback for now

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

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" />

      {/* App Bar */}
      <View style={styles.appBar}>
        {showBack ? (
          <CrimchartBackButton onPress={() => router.back()} color="#FFF" />
        ) : <View style={styles.appBarBtn} />}

        <Text style={styles.appBarTitle} numberOfLines={1}>
          {user?.username ?? 'Profile'}
        </Text>

        <TouchableOpacity onPress={goToSettings} style={styles.appBarBtn}>
          {isCurrentUser && <Settings color="#FFF" size={22} />}
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} stickyHeaderIndices={[1]}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View style={{ flex: 1 }}>
              <Text style={styles.displayName}>{user?.username ?? ''}</Text>
              {user?.crownTitle ? (
                <Text style={styles.crownTitle}>👑 {user.crownTitle}</Text>
              ) : null}
            </View>
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
                  <Text style={{ fontSize: 12 }}>📷</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Stats Row */}
          <View style={styles.statsRow}>
            {statBadge('Charts', user?.followersCount ?? 0, true)}
            {statBadge('Posts', user?.followingCount ?? 0)}
            {statBadge('Chart', user?.channelCount ?? 0)}
          </View>

          {/* Bio */}
          {user?.bio ? (
            <Text style={styles.bio}>{user.bio}</Text>
          ) : null}

          {/* Action Buttons */}
          {customActions ? (
            customActions
          ) : null}
        </View>

        <DiscoverChannelWidget 
          userId={userId ?? user?.id}
          channelCount={user?.channelCount ?? 0}
        />

        {/* Sticky Tab Bar */}
        <View style={styles.tabBar}>
          <TouchableOpacity
            style={[styles.tabItem, activeTab === 'photos' && styles.tabItemActive]}
            onPress={() => setActiveTab('photos')}
          >
            <LayoutGrid color={activeTab === 'photos' ? '#FFF' : 'rgba(255,255,255,0.4)'} size={22} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabItem, activeTab === 'videos' && styles.tabItemActive]}
            onPress={() => setActiveTab('videos')}
          >
            <Play color={activeTab === 'videos' ? '#FFF' : 'rgba(255,255,255,0.4)'} size={22} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabItem, activeTab === 'music' && styles.tabItemActive]}
            onPress={() => setActiveTab('music')}
          >
            <Music color={activeTab === 'music' ? '#FFF' : 'rgba(255,255,255,0.4)'} size={22} />
          </TouchableOpacity>
        </View>

        {/* Tab Content */}
        <View style={{ minHeight: 400 }}>
          {activeTab === 'photos' && <PhotosProfileTab userId={userId} />}
          {activeTab === 'videos' && <VideosProfileTab userId={userId} />}
          {activeTab === 'music' && <MusicProfileTab userId={userId} />}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0D0D0D' },
  appBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    paddingTop: 48,
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
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
    gap: 16,
  },
  headerTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  displayName: { color: '#FFF', fontWeight: '900', fontSize: 22, letterSpacing: -0.8 },
  crownTitle: { color: '#FACD11', fontSize: 13, fontWeight: '600', marginTop: 4 },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 2,
    borderColor: '#FACD11',
    backgroundColor: '#1A1A1A',
  },
  cameraBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#FACD11',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#0D0D0D',
  },
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
    borderTopWidth: 0.5,
    borderBottomWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: '#0D0D0D',
  },
  tabItem: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  tabItemActive: {
    borderBottomWidth: 2,
    borderBottomColor: '#FFF',
  },
});
