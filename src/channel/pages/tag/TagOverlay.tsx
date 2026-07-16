import { ActiveChannelCircle } from "@/channel/widgets/ActiveChannelCircle";
import { ChannelTagWrapper } from "@/components/wrappers/ChannelTagWrapper";
import { UserTagWrapper } from "@/components/wrappers/UserTagWrapper";
import { useStyles } from "@/core/hooks/useStyles";
import { ThemeTokens } from "@/core/theme/themes";
import { fetchUserTagChannels } from "@/features/channel/application/tagChannelService";
import { useTheme } from "@react-navigation/native";
import { Users } from "lucide-react-native";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Image,
  Modal,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { DesktopTagOverlay } from "./DesktopTagOverlay";
import { fetchMutualFollowers } from "./tagService";
import { TagNoInternet } from "./widgets/TagNoInternet";
import { TagShimmer } from "./widgets/TagShimmer";

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
interface TagOverlayProps {
  visible: boolean;
  onClose: () => void;
  postId: string;
  sourceChannelId: string;
  linkChain?: string[] | null;
  channelName?: string | null;
  sourceTable?: string;
}
type Status = "loading" | "loaded" | "error";
type TabId = "channels" | "friends";

export const TagOverlay: React.FC<TagOverlayProps> = ({
  visible,
  onClose,
  postId,
  sourceChannelId,
  linkChain = [],
  channelName,
  sourceTable = 'posts',
}) => {
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === "web" && width >= 768;

  // Delegate to desktop overlay on web large screens
  if (isDesktop) {
    return (
      <DesktopTagOverlay
        visible={visible}
        onClose={onClose}
        postId={postId}
        sourceChannelId={sourceChannelId}
        linkChain={linkChain}
        sourceTable={sourceTable}
      />
    );
  }

  // Mobile sheet below
  return (
    <MobileTagSheet
      visible={visible}
      onClose={onClose}
      postId={postId}
      sourceChannelId={sourceChannelId}
      linkChain={linkChain}
      sourceTable={sourceTable}
    />
  );
};

// ─────────────────────────────────────────────
// Mobile bottom-sheet with tabs
// ─────────────────────────────────────────────
const MobileTagSheet: React.FC<{
  visible: boolean;
  onClose: () => void;
  postId: string;
  sourceChannelId: string;
  linkChain?: string[] | null;
  sourceTable: string;
}> = ({ visible, onClose, postId, sourceChannelId, linkChain = [], sourceTable }) => {
  const { colors, dark } = useTheme();
  const styles = useStyles(mobileStyles);
  const insets = useSafeAreaInsets();

  const [activeTab, setActiveTab] = useState<TabId>("channels");

  // Channels
  const [channels, setChannels] = useState<Channel[]>([]);
  const [channelsStatus, setChannelsStatus] = useState<Status>("loading");
  const [channelsLoadingMore, setChannelsLoadingMore] = useState(false);
  const channelsPageRef = useRef(0);
  const channelsHasMoreRef = useRef(true);
  const channelsRef = useRef<Channel[]>([]);

  // Friends
  const [friends, setFriends] = useState<Friend[]>([]);
  const [friendsStatus, setFriendsStatus] = useState<Status>("loading");
  const [friendsLoadingMore, setFriendsLoadingMore] = useState(false);
  const friendsPageRef = useRef(0);
  const friendsHasMoreRef = useRef(true);
  const friendsRef = useRef<Friend[]>([]);

  const [taggedIds, setTaggedIds] = useState<string[]>([]);

  const scaleAnim = useRef(new Animated.Value(0.85)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
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
        Animated.timing(scaleAnim, { toValue: 1, duration: 250, useNativeDriver: true }),
        Animated.timing(opacityAnim, { toValue: 1, duration: 250, useNativeDriver: true }),
      ]).start();
    } else {
      scaleAnim.setValue(0.85);
      opacityAnim.setValue(0);
    }
  }, [visible]);

  const loadChannels = useCallback(async (reset = false) => {
    if (!channelsHasMoreRef.current && !reset) return;
    if (!reset) setChannelsLoadingMore(true);
    try {
      const page = reset ? 0 : channelsPageRef.current;
      const data = await fetchUserTagChannels({ limit: 20, offset: page * 20 });
      channelsRef.current = reset ? data : [...channelsRef.current, ...data];
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
      friendsRef.current = reset ? data : [...friendsRef.current, ...data];
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

  const renderChannels = () => {
    if (channelsStatus === "loading" && channels.length === 0) return <TagShimmer />;
    if (channelsStatus === "error" && channels.length === 0)
      return <TagNoInternet onRetry={() => loadChannels(true)} />;
    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.carousel}
        onScroll={(e) => {
          const { contentOffset, layoutMeasurement, contentSize } = e.nativeEvent;
          if (contentOffset.x + layoutMeasurement.width >= contentSize.width - 150)
            loadChannels(false);
        }}
        scrollEventThrottle={100}
      >
        {channels.map((c) => {
          const tagged = isTagged(c.id);
          return (
            <View key={c.id} style={styles.carouselItem}>
              <ActiveChannelCircle name={c.name} imageUrl={c.avatarUrl} />
              <View style={{ height: 6 }} />
              <ChannelTagWrapper
                postId={postId}
                sourceChannelId={sourceChannelId}
                targetChannelId={c.id}
                linkChain={linkChain}
                onTagSuccess={() => { markTagged(c.id); onClose(); }}
              >
                <TouchableOpacity
                  style={[
                    styles.tagBtn,
                    tagged
                      ? styles.tagBtnTagged
                      : {
                        backgroundColor: dark ? "#2A2A2A" : colors.background,
                        borderColor: dark ? "rgba(255,255,255,0.12)" : colors.border,
                      },
                  ]}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.tagBtnText, { color: tagged ? "#fff" : colors.text }]}>
                    {tagged ? "✓" : "Tag"}
                  </Text>
                </TouchableOpacity>
              </ChannelTagWrapper>
            </View>
          );
        })}
        {channelsLoadingMore && (
          <View style={{ width: 48, alignItems: "center", justifyContent: "center" }}>
            <ActivityIndicator color="rgba(255,255,255,0.24)" />
          </View>
        )}
      </ScrollView>
    );
  };

  const renderFriends = () => {
    if (friendsStatus === "loading" && friends.length === 0) return <TagShimmer />;
    if (friendsStatus === "error" && friends.length === 0)
      return <TagNoInternet onRetry={() => loadFriends(true)} />;
    if (friendsStatus === "loaded" && friends.length === 0) {
      return (
        <View style={styles.emptyState}>
          <Users size={36} color={dark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.2)"} />
          <Text style={[styles.emptyText, { color: dark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.4)" }]}>
            No mutual friends yet
          </Text>
        </View>
      );
    }
    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.carousel}
        onScroll={(e) => {
          const { contentOffset, layoutMeasurement, contentSize } = e.nativeEvent;
          if (contentOffset.x + layoutMeasurement.width >= contentSize.width - 150)
            loadFriends(false);
        }}
        scrollEventThrottle={100}
      >
        {friends.map((f) => {
          const tagged = isTagged(f.id);
          return (
            <View key={f.id} style={styles.carouselItem}>
              <View style={styles.friendAvatar}>
                {f.avatarUrl ? (
                  <Image source={{ uri: f.avatarUrl }} style={styles.friendAvatarImg} />
                ) : (
                  <View style={[styles.friendAvatarImg, styles.friendAvatarFallback, { backgroundColor: dark ? "#2A2A2A" : "#E5E7EB" }]}>
                    <Users size={20} color={dark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.4)"} />
                  </View>
                )}
              </View>
              <Text style={[styles.friendName, { color: dark ? "rgba(255,255,255,0.85)" : colors.text }]} numberOfLines={1}>
                {f.displayName}
              </Text>
              <View style={{ height: 6 }} />
              <UserTagWrapper
                postId={postId}
                targetUserId={f.id}
                sourceTable={sourceTable}
                onTagSuccess={() => { markTagged(f.id); }}
              >
                <TouchableOpacity
                  style={[
                    styles.tagBtn,
                    tagged
                      ? styles.tagBtnTagged
                      : {
                        backgroundColor: dark ? "#2A2A2A" : colors.background,
                        borderColor: dark ? "rgba(255,255,255,0.12)" : colors.border,
                      },
                  ]}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.tagBtnText, { color: tagged ? "#fff" : colors.text }]}>
                    {tagged ? "✓" : "Tag"}
                  </Text>
                </TouchableOpacity>
              </UserTagWrapper>
            </View>
          );
        })}
        {friendsLoadingMore && (
          <View style={{ width: 48, alignItems: "center", justifyContent: "center" }}>
            <ActivityIndicator color="rgba(255,255,255,0.24)" />
          </View>
        )}
      </ScrollView>
    );
  };

  const tabs: { id: TabId; label: string }[] = [
    { id: "channels", label: "Channels" },
    { id: "friends", label: "Friends" },
  ];

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose}>
        <Animated.View
          style={[
            styles.sheet,
            { transform: [{ scale: scaleAnim }], opacity: opacityAnim, backgroundColor: dark ? "#121212" : colors.card },
          ]}
          onStartShouldSetResponder={() => true}
        >
          {/* Tab bar */}
          <View style={[styles.tabBar, { borderBottomColor: dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)" }]}>
            {tabs.map((tab) => (
              <TouchableOpacity
                key={tab.id}
                style={styles.tabItem}
                activeOpacity={0.8}
                onPress={() => setActiveTab(tab.id)}
              >
                <Text style={[styles.tabText, { color: activeTab === tab.id ? "#FACD11" : dark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.4)" }]}>
                  {tab.label}
                </Text>
                {activeTab === tab.id && <View style={styles.tabIndicator} />}
              </TouchableOpacity>
            ))}
          </View>

          {/* Content */}
          <View style={{ paddingTop: 16, paddingBottom: 8 }}>
            {activeTab === "channels" ? renderChannels() : renderFriends()}
          </View>

          {/* Footer see-all (channels only) */}
          {activeTab === "channels" && (
            <TouchableOpacity
              activeOpacity={1}
              onPress={() => {
                onClose();
                import("expo-router").then(({ router }) => {
                  router.push({
                    pathname: "/tag-discovery" as any,
                    params: { postId, sourceChannelId, linkChain: JSON.stringify(linkChain) },
                  });
                });
              }}
              style={styles.seeAllButton}
            >
              <Text style={{ color: "#FACD11", fontSize: 15, fontWeight: "800" }}>See all</Text>
            </TouchableOpacity>
          )}
          <View style={{ height: Math.max(insets.bottom, Platform.OS === 'android' ? 100 : 32) }} />
        </Animated.View>
      </TouchableOpacity>
    </Modal>
  );
};

const mobileStyles = (colors: ThemeTokens, scale: number): any => ({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center" as const,
    alignItems: "center" as const,
  },
  sheet: {
    width: "100%",
    shadowColor: "#000",
    shadowOpacity: 0.4,
    shadowRadius: 30,
    elevation: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    position: "absolute" as const,
    bottom: 0,
  },
  tabBar: {
    flexDirection: "row" as const,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    paddingTop: 16,
  },
  tabItem: {
    marginRight: 24,
    paddingBottom: 10,
    alignItems: "center" as const,
    position: "relative" as const,
  },
  tabText: {
    fontSize: 14,
    fontWeight: "700" as const,
  },
  tabIndicator: {
    position: "absolute" as const,
    bottom: 0,
    left: 0,
    right: 0,
    height: 2.5,
    backgroundColor: "#FACD11",
    borderRadius: 99,
  },
  carousel: {
    paddingHorizontal: 20,
    paddingBottom: 4,
    alignItems: "flex-start" as const,
  },
  carouselItem: {
    marginRight: 18,
    alignItems: "center" as const,
  },
  tagBtn: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 1,
  },
  tagBtnTagged: {
    backgroundColor: "#22c55e",
    borderColor: "#22c55e",
  },
  tagBtnText: {
    fontSize: 11,
    fontWeight: "800" as const,
  },
  friendAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    overflow: "hidden" as const,
  },
  friendAvatarImg: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  friendAvatarFallback: {
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  friendName: {
    fontSize: 11,
    fontWeight: "700" as const,
    marginTop: 4,
    maxWidth: 70,
    textAlign: "center" as const,
  },
  emptyState: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    alignItems: "center" as const,
  },
  emptyText: {
    marginTop: 8,
    fontSize: 13,
    fontWeight: "600" as const,
  },
  seeAllButton: {
    alignItems: "center" as const,
    paddingBottom: 4,
  },
});
