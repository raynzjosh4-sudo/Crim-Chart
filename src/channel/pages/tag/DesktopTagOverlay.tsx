import { ActiveChannelCircle } from "@/channel/widgets/ActiveChannelCircle";
import { ChannelTagWrapper } from "@/components/wrappers/ChannelTagWrapper";
import { UserTagWrapper } from "@/components/wrappers/UserTagWrapper";
import { useStyles } from "@/core/hooks/useStyles";
import { useCurrentTheme } from "@/core/store/useThemeStore";
import { ThemeTokens } from "@/core/theme/themes";
import { fetchUserTagChannels } from "@/features/channel/application/tagChannelService";
import { Tv, Users, X } from "lucide-react-native";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Image,
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { fetchMutualFollowers } from "./tagService";
import { TagNoInternet } from "./widgets/TagNoInternet";

interface Channel {
  id: string;
  name: string;
  avatarUrl?: string;
}

interface Friend {
  id: string;
  displayName: string;
  avatarUrl?: string;
}

interface DesktopTagOverlayProps {
  visible: boolean;
  onClose: () => void;
  postId: string;
  sourceChannelId: string;
  linkChain?: string[] | null;
  sourceTable?: string;
}

type TabId = "channels" | "friends";
type Status = "loading" | "loaded" | "error";

export const DesktopTagOverlay: React.FC<DesktopTagOverlayProps> = ({
  visible,
  onClose,
  postId,
  sourceChannelId,
  linkChain = [],
  sourceTable = 'posts',
}) => {
  const theme = useCurrentTheme();
  const styles = useStyles(themeStyles);
  const { colors, isDark } = theme;

  const [activeTab, setActiveTab] = useState<TabId>("channels");

  // --- Channels state ---
  const [channels, setChannels] = useState<Channel[]>([]);
  const [channelsStatus, setChannelsStatus] = useState<Status>("loading");
  const [channelsLoadingMore, setChannelsLoadingMore] = useState(false);
  const channelsPageRef = useRef(0);
  const channelsHasMoreRef = useRef(true);
  const channelsRef = useRef<Channel[]>([]);

  // --- Friends state ---
  const [friends, setFriends] = useState<Friend[]>([]);
  const [friendsStatus, setFriendsStatus] = useState<Status>("loading");
  const [friendsLoadingMore, setFriendsLoadingMore] = useState(false);
  const friendsPageRef = useRef(0);
  const friendsHasMoreRef = useRef(true);
  const friendsRef = useRef<Friend[]>([]);

  // Tagged set — track which IDs were tagged this session
  const [taggedIds, setTaggedIds] = useState<string[]>([]);

  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Reset all
      setActiveTab("channels");
      setChannels([]);
      setChannelsStatus("loading");
      channelsPageRef.current = 0;
      channelsHasMoreRef.current = true;
      setFriends([]);
      setFriendsStatus("loading");
      friendsPageRef.current = 0;
      friendsHasMoreRef.current = true;
      setTaggedIds([]);
      loadChannels(true);
      loadFriends(true);

      Animated.parallel([
        Animated.timing(scaleAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.timing(opacityAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start();
    } else {
      scaleAnim.setValue(0.95);
      opacityAnim.setValue(0);
    }
  }, [visible]);

  const loadChannels = useCallback(async (reset = false) => {
    if (!channelsHasMoreRef.current && !reset) return;
    if (!reset) setChannelsLoadingMore(true);
    try {
      const page = reset ? 0 : channelsPageRef.current;
      const data = await fetchUserTagChannels({ limit: 20, offset: page * 20 });
      if (reset) {
        channelsRef.current = data;
      } else {
        channelsRef.current = [...channelsRef.current, ...data];
      }
      setChannels(channelsRef.current);
      channelsHasMoreRef.current = data.length === 20;
      channelsPageRef.current = page + 1;
      setChannelsStatus("loaded");
    } catch {
      setChannelsStatus("error");
    } finally {
      setChannelsLoadingMore(false);
    }
  }, []);

  const loadFriends = useCallback(async (reset = false) => {
    if (!friendsHasMoreRef.current && !reset) return;
    if (!reset) setFriendsLoadingMore(true);
    try {
      const page = reset ? 0 : friendsPageRef.current;
      const data = await fetchMutualFollowers({ limit: 20, offset: page * 20 });
      if (reset) {
        friendsRef.current = data;
      } else {
        friendsRef.current = [...friendsRef.current, ...data];
      }
      setFriends(friendsRef.current);
      friendsHasMoreRef.current = data.length === 20;
      friendsPageRef.current = page + 1;
      setFriendsStatus("loaded");
    } catch {
      setFriendsStatus("error");
    } finally {
      setFriendsLoadingMore(false);
    }
  }, []);

  const markTagged = (id: string) => { if (!taggedIds.includes(id)) setTaggedIds([...taggedIds, id]); };
  const isTagged = (id: string) => taggedIds.includes(id);

  const handleScroll = (onLoadMore: () => void) => (e: any) => {
    const { contentOffset, layoutMeasurement, contentSize } = e.nativeEvent;
    if (contentOffset.y + layoutMeasurement.height >= contentSize.height - 150) {
      onLoadMore();
    }
  };

  const renderChannelsBody = () => {
    if (channelsStatus === "loading" && channels.length === 0) {
      return (
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} />
        </View>
      );
    }
    if (channelsStatus === "error" && channels.length === 0) {
      return <TagNoInternet onRetry={() => loadChannels(true)} />;
    }
    return (
      <ScrollView
        style={styles.scrollContainer}
        onScroll={handleScroll(() => loadChannels(false))}
        scrollEventThrottle={100}
        contentContainerStyle={{ paddingBottom: 24 }}
      >
        <View style={styles.grid}>
          {channels.map((c) => {
            const tagged = isTagged(c.id);
            return (
              <View key={c.id} style={styles.tagItem}>
                <ActiveChannelCircle name={c.name} imageUrl={c.avatarUrl} />
                <View style={{ height: 8 }} />
                <ChannelTagWrapper
                  postId={postId}
                  sourceChannelId={sourceChannelId}
                  targetChannelId={c.id}
                  linkChain={linkChain}
                  onTagSuccess={() => { markTagged(c.id); onClose(); }}
                >
                  <TouchableOpacity
                    style={[
                      styles.tagButton,
                      tagged && styles.tagButtonTagged,
                      !tagged && {
                        backgroundColor: isDark ? "#2A2A2A" : colors.background,
                        borderColor: isDark ? "rgba(255,255,255,0.12)" : colors.surfaceVariant,
                      },
                    ]}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.tagButtonText, { color: tagged ? "#fff" : colors.text }]}>
                      {tagged ? "Tagged ✓" : "Tag"}
                    </Text>
                  </TouchableOpacity>
                </ChannelTagWrapper>
              </View>
            );
          })}
        </View>
        {channelsLoadingMore && (
          <View style={styles.center}>
            <ActivityIndicator color={colors.primary} />
          </View>
        )}
      </ScrollView>
    );
  };

  const renderFriendsBody = () => {
    if (friendsStatus === "loading" && friends.length === 0) {
      return (
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} />
        </View>
      );
    }
    if (friendsStatus === "error" && friends.length === 0) {
      return <TagNoInternet onRetry={() => loadFriends(true)} />;
    }
    if (friendsStatus === "loaded" && friends.length === 0) {
      return (
        <View style={styles.center}>
          <Users size={40} color={colors.textSecondary} />
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            No mutual friends yet
          </Text>
        </View>
      );
    }
    return (
      <ScrollView
        style={styles.scrollContainer}
        onScroll={handleScroll(() => loadFriends(false))}
        scrollEventThrottle={100}
        contentContainerStyle={{ paddingBottom: 24 }}
      >
        <View style={styles.grid}>
          {friends.map((f) => {
            const tagged = isTagged(f.id);
            return (
              <View key={f.id} style={styles.tagItem}>
                {/* Avatar */}
                <View style={styles.avatarContainer}>
                  {f.avatarUrl ? (
                    <Image source={{ uri: f.avatarUrl }} style={styles.avatar} />
                  ) : (
                    <View style={[styles.avatar, styles.avatarFallback, { backgroundColor: colors.surfaceVariant }]}>
                      <Users size={22} color={colors.textSecondary} />
                    </View>
                  )}
                </View>
                <Text style={[styles.friendName, { color: colors.text }]} numberOfLines={1}>
                  {f.displayName}
                </Text>
                <View style={{ height: 8 }} />
                <UserTagWrapper
                  postId={postId}
                  targetUserId={f.id}
                  sourceTable={sourceTable}
                  onTagSuccess={() => { markTagged(f.id); onClose(); }}
                >
                  <TouchableOpacity
                    style={[
                      styles.tagButton,
                      tagged && styles.tagButtonTagged,
                      !tagged && {
                        backgroundColor: isDark ? "#2A2A2A" : colors.background,
                        borderColor: isDark ? "rgba(255,255,255,0.12)" : colors.surfaceVariant,
                      },
                    ]}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.tagButtonText, { color: tagged ? "#fff" : colors.text }]}>
                      {tagged ? "Tagged ✓" : "Tag"}
                    </Text>
                  </TouchableOpacity>
                </UserTagWrapper>
              </View>
            );
          })}
        </View>
        {friendsLoadingMore && (
          <View style={styles.center}>
            <ActivityIndicator color={colors.primary} />
          </View>
        )}
      </ScrollView>
    );
  };

  const tabs: { id: TabId; label: string; icon: React.ReactNode }[] = [
    { id: "channels", label: "Channels", icon: <Tv size={14} color={activeTab === "channels" ? "#FACD11" : colors.textSecondary} /> },
    { id: "friends", label: "Friends", icon: <Users size={14} color={activeTab === "friends" ? "#FACD11" : colors.textSecondary} /> },
  ];

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose}>
        <Animated.View
          style={[styles.card, { transform: [{ scale: scaleAnim }], opacity: opacityAnim }]}
          onStartShouldSetResponder={() => true}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>Tag</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={20} color={colors.text} opacity={0.6} />
            </TouchableOpacity>
          </View>

          {/* Tabs */}
          <View style={[styles.tabBar, { borderBottomColor: isDark ? "rgba(255,255,255,0.08)" : colors.surfaceVariant }]}>
            {tabs.map((tab) => (
              <TouchableOpacity
                key={tab.id}
                style={styles.tabItem}
                activeOpacity={0.8}
                onPress={() => setActiveTab(tab.id)}
              >
                <View style={styles.tabLabel}>
                  {tab.icon}
                  <Text style={[styles.tabText, { color: activeTab === tab.id ? "#FACD11" : colors.textSecondary }]}>
                    {tab.label}
                  </Text>
                </View>
                {activeTab === tab.id && <View style={styles.tabIndicator} />}
              </TouchableOpacity>
            ))}
          </View>

          {/* Body */}
          <View style={styles.body}>
            {activeTab === "channels" ? renderChannelsBody() : renderFriendsBody()}
          </View>
        </Animated.View>
      </TouchableOpacity>
    </Modal>
  );
};

const themeStyles = (colors: ThemeTokens, scale: number): any => ({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-start" as const,
    alignItems: "flex-end" as const,
    paddingTop: 80 * scale,
    paddingRight: 20 * scale,
  },
  card: {
    width: 350 * scale,
    height: "80%",
    maxHeight: 700 * scale,
    borderRadius: 20 * scale,
    backgroundColor: colors.surface,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 * scale },
    shadowOpacity: 0.3,
    shadowRadius: 30 * scale,
    elevation: 20,
    overflow: "hidden" as const,
  },
  header: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
    paddingHorizontal: 24 * scale,
    paddingVertical: 16 * scale,
  },
  title: {
    fontSize: 18 * scale,
    fontWeight: "800" as const,
  },
  closeBtn: {
    padding: 4 * scale,
  },
  tabBar: {
    flexDirection: "row" as const,
    borderBottomWidth: 1,
    paddingHorizontal: 16 * scale,
  },
  tabItem: {
    marginRight: 24 * scale,
    paddingBottom: 10 * scale,
    alignItems: "center" as const,
  },
  tabLabel: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 6 * scale,
  },
  tabText: {
    fontSize: 13 * scale,
    fontWeight: "700" as const,
  },
  tabIndicator: {
    position: "absolute" as const,
    bottom: 0,
    left: 0,
    right: 0,
    height: 2.5 * scale,
    backgroundColor: "#FACD11",
    borderRadius: 99,
  },
  body: { flex: 1 },
  scrollContainer: { flex: 1 },
  grid: {
    flexDirection: "row" as const,
    flexWrap: "wrap" as const,
    paddingHorizontal: 16 * scale,
    paddingTop: 16 * scale,
  },
  tagItem: {
    width: "33.33%",
    alignItems: "center" as const,
    marginBottom: 20 * scale,
  },
  avatarContainer: {
    width: 56 * scale,
    height: 56 * scale,
    borderRadius: 28 * scale,
    overflow: "hidden" as const,
  },
  avatar: {
    width: 56 * scale,
    height: 56 * scale,
    borderRadius: 28 * scale,
  },
  avatarFallback: {
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  friendName: {
    fontSize: 11 * scale,
    fontWeight: "700" as const,
    textAlign: "center" as const,
    marginTop: 6 * scale,
    maxWidth: 80 * scale,
  },
  tagButton: {
    paddingHorizontal: 12 * scale,
    paddingVertical: 5 * scale,
    borderRadius: 999 * scale,
    borderWidth: 1,
  },
  tagButtonTagged: {
    backgroundColor: "#22c55e",
    borderColor: "#22c55e",
  },
  tagButtonText: {
    fontSize: 11 * scale,
    fontWeight: "800" as const,
  },
  center: {
    flex: 1,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    paddingVertical: 40,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: "600" as const,
    textAlign: "center" as const,
  },
});
