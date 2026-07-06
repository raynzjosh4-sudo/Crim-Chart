import ChartAppBar from '@/components/chartappbar/ChartAppBar';
import { FollowUserButton } from '@/components/FollowUserButton';
import { useGlobalProgress } from '@/components/globalProgressBar/GlobalProgressBar';
import { OfflineStateWidget } from '@/components/offline/OfflineStateWidget';
import { supabase } from '@/core/supabase/supabaseConfig';
import { useAuthStore } from '@/features/auth/application/useAuthStore';
import { useStyles } from '@/core/hooks/useStyles';
import { useCurrentTheme } from '@/core/store/useThemeStore';
import { ThemeTokens } from '@/core/theme/themes';
import { useRouter } from 'expo-router';
import { User, X } from 'lucide-react-native';
import React, { useCallback, useEffect, useRef } from 'react';
import { useState } from 'react';
import {
  Animated,
  FlatList,
  Image,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const LIMIT = 10;

interface UserRow {
  id: string;
  display_name: string;
  profile_image_url: string | null;
  crown_title: string | null;
}

interface FollowersListPageProps {
  /** The profile being viewed */
  targetUserId: string;
  /** Which tab to open first */
  initialTab?: 'followers' | 'following';
  /** If true, rendered as a side-panel modal on desktop (pass onClose) */
  isPanel?: boolean;
  onClose?: () => void;
}

export const FollowersListPage: React.FC<FollowersListPageProps> = ({
  targetUserId,
  initialTab = 'followers',
  isPanel = false,
  onClose,
}) => {
  const router = useRouter();
  const theme = useCurrentTheme();
  const styles = useStyles(themeStyles);
  const insets = useSafeAreaInsets();
  const currentUser = useAuthStore(s => s.user);
  const { stopLoading } = useGlobalProgress();

  const [activeTab, setActiveTab] = useState<'followers' | 'following'>(initialTab);
  const [followers, setFollowers] = useState<UserRow[]>([]);
  const [following, setFollowing] = useState<UserRow[]>([]);
  const [loadingFollowers, setLoadingFollowers] = useState(true);
  const [loadingFollowing, setLoadingFollowing] = useState(true);
  const [hasError, setHasError] = useState(false);

  const fetchFollowers = useCallback(async () => {
    if (!targetUserId) return;
    setLoadingFollowers(true);
    setHasError(false);
    try {
      const { data, error } = await supabase
        .from('follows')
        .select('follower_id, profiles:follower_id(id, display_name, profile_image_url, crown_title)')
        .eq('following_id', targetUserId)
        .limit(LIMIT);
      if (error) throw error;
      if (data) {
        setFollowers(data.map((r: any) => r.profiles).filter(Boolean));
      }
    } catch (e) {
      console.error('[FollowersListPage] fetchFollowers', e);
      setHasError(true);
    } finally {
      setLoadingFollowers(false);
    }
  }, [targetUserId]);

  const fetchFollowing = useCallback(async () => {
    if (!targetUserId) return;
    setLoadingFollowing(true);
    setHasError(false);
    try {
      const { data, error } = await supabase
        .from('follows')
        .select('following_id, profiles:following_id(id, display_name, profile_image_url, crown_title)')
        .eq('follower_id', targetUserId)
        .limit(LIMIT);
      if (error) throw error;
      if (data) {
        setFollowing(data.map((r: any) => r.profiles).filter(Boolean));
      }
    } catch (e) {
      console.error('[FollowersListPage] fetchFollowing', e);
      setHasError(true);
    } finally {
      setLoadingFollowing(false);
    }
  }, [targetUserId]);

  // stopLoading after both fetches so the global bar completes
  useEffect(() => {
    Promise.all([fetchFollowers(), fetchFollowing()]).finally(() => {
      stopLoading();
    });
  }, [fetchFollowers, fetchFollowing]);

  const handleBack = () => {
    if (isPanel && onClose) onClose();
    else router.back();
  };

  const navigateToProfile = (userId: string) => {
    if (isPanel && onClose) onClose();
    router.push(`/profile/${userId}` as any);
  };

  const list = activeTab === 'followers' ? followers : following;
  const loading = activeTab === 'followers' ? loadingFollowers : loadingFollowing;

  const renderUser = ({ item }: { item: UserRow }) => (
    <TouchableOpacity
      activeOpacity={0.8}
      style={styles.userRow}
      onPress={() => navigateToProfile(item.id)}
    >
      <View style={styles.avatarContainer}>
        {item.profile_image_url ? (
          <Image source={{ uri: item.profile_image_url }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarFallback}>
            <User color="rgba(255,255,255,0.4)" size={22} />
          </View>
        )}
      </View>
      <View style={styles.userInfo}>
        <Text style={styles.displayName} numberOfLines={1}>{item.display_name || 'Unknown'}</Text>
        {item.crown_title ? (
          <Text style={styles.crownTitle} numberOfLines={1}>{item.crown_title}</Text>
        ) : null}
      </View>
      {item.id !== currentUser?.id && (
        <FollowUserButton
          targetUserId={item.id}
          size="small"
          style={styles.followBtnStyle}
        />
      )}
    </TouchableOpacity>
  );

  const content = (
    <View style={styles.inner}>
      {/* Tab Bar */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          activeOpacity={0.8}
          style={[styles.tab, activeTab === 'followers' && styles.tabActive]}
          onPress={() => setActiveTab('followers')}
        >
          <Text style={[styles.tabText, activeTab === 'followers' && styles.tabTextActive]}>
            Followers
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={0.8}
          style={[styles.tab, activeTab === 'following' && styles.tabActive]}
          onPress={() => setActiveTab('following')}
        >
          <Text style={[styles.tabText, activeTab === 'following' && styles.tabTextActive]}>
            Following
          </Text>
        </TouchableOpacity>
      </View>

      {/* Offline / Error state */}
      {hasError ? (
        <OfflineStateWidget
          onRetry={() => {
            fetchFollowers();
            fetchFollowing();
          }}
        />
      ) : loading ? (
        /* Shimmer skeleton */
        <View>
          {[...Array(LIMIT)].map((_, i) => (
            <UserShimmer key={i} />
          ))}
        </View>
      ) : list.length === 0 ? (
        <View style={styles.center}>
          <User color="rgba(255,255,255,0.15)" size={48} />
          <Text style={styles.emptyText}>
            {activeTab === 'followers' ? 'No followers yet' : 'Not following anyone yet'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={list}
          keyExtractor={item => item.id}
          renderItem={renderUser}
          contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, 16) }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );

  // Desktop panel mode — use Modal so it renders at root level (Portal) and
  // is never clipped by any parent overflow or stacking context.
  if (isPanel) {
    return (
      <Modal
        visible={true}
        transparent={true}
        animationType="none"
        onRequestClose={handleBack}
      >
        <View style={styles.panelContainer}>
          {/* Dismiss overlay — left side */}
          <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={handleBack} />
          <View style={styles.panel}>
            {/* Panel Header */}
            <View style={styles.panelHeader}>
              <Text style={styles.panelTitle}>Connections</Text>
              <TouchableOpacity activeOpacity={0.8} onPress={handleBack} style={styles.closeBtn}>
                <X color={theme.colors.text} size={20} />
              </TouchableOpacity>
            </View>
            {content}
          </View>
        </View>
      </Modal>
    );
  }

  // Mobile full-page mode — ChartAppBar already has the progress bar built in
  return (
    <View style={[styles.page, { paddingTop: insets.top }]}>
      <ChartAppBar
        title="Connections"
        showBack={true}
        onBack={handleBack}
        centerTitle={true}
        showBorder={true}
        useSafeArea={false}
      />
      {content}
    </View>
  );
};

/* ─── Animated shimmer row ────────────────────────────────────────── */
const UserShimmer = () => {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, { toValue: 1, duration: 900, useNativeDriver: true }),
        Animated.timing(shimmerAnim, { toValue: 0, duration: 900, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const opacity = shimmerAnim.interpolate({ inputRange: [0, 1], outputRange: [0.4, 0.9] });

  return (
    <Animated.View style={[shimmerStyles.row, { opacity }]}>
      <View style={shimmerStyles.circle} />
      <View style={shimmerStyles.lines}>
        <View style={shimmerStyles.line1} />
        <View style={shimmerStyles.line2} />
      </View>
    </Animated.View>
  );
};

const shimmerStyles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 },
  circle: { width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.07)' },
  lines: { flex: 1, marginLeft: 12, gap: 6 },
  line1: { height: 14, width: '55%', borderRadius: 7, backgroundColor: 'rgba(255,255,255,0.07)' },
  line2: { height: 10, width: '35%', borderRadius: 5, backgroundColor: 'rgba(255,255,255,0.04)' },
});

const themeStyles = (colors: ThemeTokens) => StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: colors.background,
  },
  inner: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  tab: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
  },
  tabActive: {
    borderBottomWidth: 3,
    borderBottomColor: colors.primary,
  },
  tabText: {
    color: colors.textSecondary,
    fontWeight: '700',
    fontSize: 14,
  },
  tabTextActive: {
    color: colors.text,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  avatarContainer: {
    marginRight: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#1A1A1A',
  },
  avatarFallback: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.06)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userInfo: {
    flex: 1,
  },
  displayName: {
    color: colors.text,
    fontWeight: '700',
    fontSize: 15,
  },
  crownTitle: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  followBtnStyle: {
    marginLeft: 8,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 64,
  },
  emptyText: {
    color: 'rgba(255,255,255,0.3)',
    fontSize: 15,
    marginTop: 16,
    fontWeight: '500',
  },
  // ── Desktop panel styles ──────────────────────────────────────────────
  panelContainer: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
    zIndex: 9999,
    ...Platform.select({
      web: { position: 'fixed' as any, top: 0, left: 0, right: 0, bottom: 0 },
      default: {},
    }),
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  panel: {
    width: 360,
    backgroundColor: colors.background,
    borderLeftWidth: 0.5,
    borderLeftColor: 'rgba(255,255,255,0.1)',
    flexDirection: 'column',
  },
  panelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  panelTitle: {
    color: colors.text,
    fontWeight: '800',
    fontSize: 18,
    letterSpacing: -0.3,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.06)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
