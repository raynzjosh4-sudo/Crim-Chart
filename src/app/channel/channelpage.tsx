import { ChannelAndFeedPostModel } from "@/channel/ChannelComponents/ChnnelMainPostCard/ChannelAndFeedPostModel";
import { channelRepository } from "@/channel/data/repositories/ChannelRepositoryImpl";
import { useChannelBroadcast } from "@/channel/hooks/useChannelBroadcast";
import { useChannelMembers } from "@/channel/hooks/useChannelMembers";
import { useChannelMessages } from "@/channel/hooks/useChannelMessages";
import { useChannelPermissions } from "@/channel/hooks/useChannelPermissions";
import { useChannelPosts } from "@/channel/hooks/useChannelPosts";
import { useChannelStatuses } from "@/channel/hooks/useChannelStatuses";
import { cloudMediaService } from "@/core/network/cloudMediaService";
import { useDesktopComposeStore } from "@/core/store/useDesktopComposeStore";
import { useProfileCacheStore } from "@/core/store/useProfileCacheStore";
import { useAuthStore } from "@/features/auth/application/useAuthStore";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import React, { useCallback, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { CustomChannelWidget } from "@/channel/components/CustomChannelWidget";
import { JoinChannelWidget } from "@/channel/components/JoinChannelWidget";
import { UserStatusWidget } from "@/components/UserStatusWidget/UserStatusWidget";
import { UserStatusWidgetShimmer } from "@/components/UserStatusWidget/UserStatusWidgetShimmer";
import { FeedPermissionsWrapper } from "@/components/wrappers/FeedPermissionsWrapper";
import { useInteractionStore } from "@/core/store/useInteractionStore";
import { ChannelNavBar } from "@/features/channel/pages/discovery_widgets/ChannelNavBar";

import { ChannelRestrictionOverlay } from "@/channel/components/ChannelRestrictionOverlay";
import { useChannelData } from "@/channel/hooks/useChannelData";
import { StatusGroup, StatusViewer } from '@/channel/pages/widgets2/status/StatusViewer';
import UserAvatar from "@/components/avatar/UserAvatar";
import { ChannelPageShimmer } from "@/components/shimmers/channelPageShimmer/ChannelPageShimmer";
import { ChannelRestrictionWrapper } from "@/components/wrappers/ChannelRestrictionWrapper";
import { useCurrentTheme } from "@/core/store/useThemeStore";
import { MembersTabView } from "@/features/channel/pages/members_tab/MembersTabView";
import { ActiveUsersBar } from "@/features/channel/pages/messages_tab/widgets/ActiveUsersBar";
import { ChatBubble } from "@/features/channel/pages/messages_tab/widgets/chartbubble/ChatBubble";
import { TypingBubble } from "@/features/channel/pages/messages_tab/widgets/chartbubble/TypingBubble";
import { ChatInputField } from "@/features/channel/pages/messages_tab/widgets/ChatInputField";
import { VideoTabView } from "@/features/channel/pages/video_tab/VideoTabView";
import { useChannelStyles } from "./styles/_channelStyyles.styles";
import { DateDivider } from "./widgets/_datedivider";
import { ChannelTitleBar } from "./widgets/ChannelTitleBar";


export default function ChannelPage({ channelIdOverride, isModal }: { channelIdOverride?: string, isModal?: boolean }) {
  const styles = useChannelStyles();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === "web" && width >= 768;
  const { id: routeId } = useLocalSearchParams<{ id: string }>();
  const id = channelIdOverride || routeId;
  const router = useRouter();
  const { channel, loading } = useChannelData(id);
  const user = useAuthStore((s) => s.user);
  const theme = useCurrentTheme();
  const { statuses: channelStatuses, loadMore: loadMoreChannelStatuses, loading: statusesLoading } = useChannelStatuses(id as string);
  const { posts: channelPosts } = useChannelPosts(id as string);

  const [activeTab, setActiveTab] = useState(0);
  // Local unread count — synced from channel data but cleared optimistically when messages tab is opened
  const [localUnreadCount, setLocalUnreadCount] = useState(0);

  // Reset local state whenever the user navigates to a DIFFERENT channel.
  // Without this, localUnreadCount from Channel A leaks into Channel B.
  React.useEffect(() => {
    setLocalUnreadCount(0);
    setActiveTab(0);
  }, [id]);

  // Keep localUnreadCount in sync with server data (but only when NOT on the messages tab).
  // IMPORTANT: We use Math.max so that a re-fetch returning 0 never clears a badge the user
  // hasn't explicitly dismissed. Only the user tapping the messages tab resets this to 0.
  React.useEffect(() => {
    if (channel?.unreadCount != null && channel.unreadCount > 0 && activeTab !== 1) {
      setLocalUnreadCount(Math.max(localUnreadCount, channel.unreadCount));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [channel?.unreadCount]);

  // Status Viewer State
  const [statusViewerVisible, setStatusViewerVisible] = useState(false);
  const [statusInitialIndex, setStatusInitialIndex] = useState(0);
  const [statusViewerGroups, setStatusViewerGroups] = useState<StatusGroup[]>([]);

  const handleStatusPress = (tappedItem: any) => {
    const mappedGroups: StatusGroup[] = channelStatuses.map(item => ({
      id: item.id,
      channelName: item.user.displayName || item.user.username || 'User',
      avatarUrl: item.user.profileImageUrl || 'https://via.placeholder.com/150',
      media: item.statuses?.map(s => ({
        id: s.id,
        authorId: item.user.id,
        url: s.videoUrl || s.audioUrl || (s.imageUrls && s.imageUrls[0]) || s.thumbnailUrl || '',
        type: (s.isVideo || s.isAudio) ? 'video' : 'image', // StatusViewer uses 'video' for both and checks isAudio
        isAudio: s.isAudio,
        title: s.caption || 'Audio Status',
        artist: item.user.displayName || item.user.username || 'User',
        caption: s.caption || '',
        thumbnail: s.thumbnailUrl || (s.imageUrls && s.imageUrls[0]) || ''
      })) || []
    }));

    const index = mappedGroups.findIndex(g => g.id === tappedItem.id);
    setStatusViewerGroups(mappedGroups);
    setStatusInitialIndex(index >= 0 ? index : 0);
    setStatusViewerVisible(true);
  };
  const { canPostStatus } = useChannelPermissions(id as string);
  const { members: channelMembers, refetch: refetchChannelMembers } = useChannelMembers(id as string);
  const { openModal } = useDesktopComposeStore();

  React.useEffect(() => {
    if (channelMembers && channelMembers.length > 0) {
      console.log("=== CHANNEL MEMBERS WITH PROFILE CACHE ===");
      const enrichedMembers = channelMembers.map((m) => {
        const cachedProfile =
          useProfileCacheStore.getState().profiles[m.userId];
        return {
          ...m,
          cachedProfile: cachedProfile || null,
        };
      });
      console.log(JSON.stringify(enrichedMembers, null, 2));
      console.log("==========================================");
    }
  }, [channelMembers]);

  const [isMediaSheetVisible, setIsMediaSheetVisible] = useState(false);
  const [isStatusMode, setIsStatusMode] = useState(false);
  const [myTyping, setMyTyping] = useState(false);

  const interactionLikes = useInteractionStore((s) => s.likes);
  const interactionLikesCount = useInteractionStore((s) => s.likesCount);
  const interactionTagsCount = useInteractionStore((s) => s.channelTagsCount);

  const flatListRef = useRef<FlatList | null>(null);
  const {
    messages,
    setMessages,
    loadMore,
    loadingMore,
    loading: messagesLoading,
    deleteMessage
  } = useChannelMessages(id as string);

  // We no longer need messagesRef since we use functional updates

  const onMessageReceived = useCallback((newMessage: any) => {
    setMessages((prevMessages) => {
      // Check if we already have this message locally to avoid duplicates
      if (!prevMessages.some((m) => m.id === newMessage.id)) {
        const resolvedMessage = {
          ...newMessage,
          isMe: newMessage.senderId === user?.id,
        };

        // Also persist the incoming message to the local SQLite database
        import("@/channel/data/sources/ChannelLocalSource").then(
          ({ channelLocalSource }) => {
            channelLocalSource.saveMessage(newMessage);
          },
        );

        setTimeout(() => {
          flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
        }, 100);

        return [resolvedMessage, ...prevMessages];
      }
      return prevMessages;
    });
  }, [user?.id, setMessages]);

  const { broadcastMessage, broadcastTyping, typingUsers, activeUsers } =
    useChannelBroadcast(id as string, onMessageReceived);

  // Derived state to merge creator, online users, and all channel members
  const topBarUsers = React.useMemo(() => {
    const list: any[] = [];
    const addedIds = new Set<string>();

    // Pre-compute lastReplied from locally loaded messages
    const lastRepliedMap: Record<string, number> = {};
    messages.forEach((msg) => {
      if (!lastRepliedMap[msg.senderId]) {
        // Assume messages are sorted newest first, so the first time we see a sender, it's their latest message
        const msgTime = new Date(
          msg.createdAt || msg.time || Date.now(),
        ).getTime();
        lastRepliedMap[msg.senderId] = msgTime;
      }
    });

    // Helper to enrich user with profile cache data
    const enrichUser = (baseUser: any) => {
      const cachedProfile =
        useProfileCacheStore.getState().profiles[baseUser.id];
      return {
        ...baseUser,
        hasStatus: cachedProfile?.hasStatus || false,
        statusCount: cachedProfile?.statusCount || 0,
        lastSeen: cachedProfile?.lastSeen,
        lastReplied: lastRepliedMap[baseUser.id] || 0,
      };
    };

    // 1. Add active users first so they get their live online/typing status
    activeUsers.forEach((u) => {
      list.push(enrichUser(u));
      addedIds.add(String(u.id));
    });

    // 2. Add remaining channel members
    if (channelMembers && channelMembers.length > 0) {
      channelMembers.forEach((member) => {
        if (!addedIds.has(String(member.userId))) {
          list.push(
            enrichUser({
              id: member.userId,
              username: member.displayName || "Member",
              profileImageUrl:
                member.profileImageUrl || "https://i.pravatar.cc/150",
              isOnline: false, // Will be overridden if they join the websocket later
              isTyping: false,
            }),
          );
          addedIds.add(String(member.userId));
        }
      });
    }

    // 3. Fallback for creator if they aren't somehow in the members list
    if (
      channel?.creatorUser?.id &&
      !addedIds.has(String(channel.creatorUser.id))
    ) {
      list.push(
        enrichUser({
          id: channel.creatorUser.id,
          username:
            channel.creatorUser.displayName ||
            channel.creatorUser.username ||
            "Admin",
          profileImageUrl:
            channel.creatorUser.profileImageUrl ||
            "https://i.pravatar.cc/150?img=12",
          isOnline: false,
          isTyping: false,
        }),
      );
    }

    return list;
  }, [activeUsers, channel, channelMembers, messages]);

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top, paddingBottom: insets.bottom },
        isDesktop && {
          width: '100%',
          maxWidth: 600,
          marginHorizontal: 'auto',
          borderLeftWidth: 1,
          borderRightWidth: 1,
          borderColor: theme.colors.surfaceVariant,
        }
      ]}
    >
      <ChannelRestrictionWrapper
        channelId={id}
        requiredAction="view_channel"
        loadingComponent={<ChannelPageShimmer />}
        fallback={(reason) => (
          <ChannelRestrictionOverlay
            isVisible={true}
            title="Private Channel"
            reason={
              reason ||
              "This channel is private. You must request to join to view its content and interact with members."
            }
            channelName={channel?.title || ""}
            channelImage={
              channel?.imageUrl || "https://picsum.photos/400/400?random=11"
            }
            channelId={id as string}
            isModal={isModal}
          />
        )}
      >
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <Stack.Screen options={{ headerShown: false }} />
          {/* Conditional Rendering of Entire View for Messages Tab */}
          {activeTab === 1 ? (
            <View style={styles.messagesTabContainer}>
              <View style={styles.header}>
                <TouchableOpacity
                  activeOpacity={1}
                  style={styles.backButton}
                  onPress={() => setActiveTab(0)}
                >
                  <ChevronLeft size={28} color={styles.headerTitle.color} />
                </TouchableOpacity>
                <Text style={styles.headerTitle} numberOfLines={1}>
                  {channel?.title || ""}
                </Text>
                <View style={{ width: 28 }} />
              </View>

              <ActiveUsersBar users={topBarUsers} />

              <FlatList
                ref={flatListRef}
                style={styles.messagesScroll}
                contentContainerStyle={styles.messagesScrollContent}
                data={messages}
                inverted
                keyExtractor={(item) => item.id}
                onEndReached={loadMore}
                onEndReachedThreshold={0.5}
                renderItem={({ item }) => (
                  <ChatBubble message={item} channelId={id as string} onDelete={() => deleteMessage(item.id)} />
                )}
                ListFooterComponent={
                  <>
                    {loadingMore && (
                      <ActivityIndicator
                        size="small"
                        color="#FFF"
                        style={{ marginVertical: 8 }}
                      />
                    )}
                    <DateDivider date="MAY 12, 2026" />
                  </>
                }
                ListEmptyComponent={
                  !messagesLoading && messages.length === 0 ? (
                    <View
                      style={{
                        alignItems: "center",
                        justifyContent: "center",
                        padding: 40,
                        marginTop: 40,
                      }}
                    >
                      <UserAvatar
                        userId={channel?.creatorUser?.id || ''}
                        fallbackUrl={
                          channel?.creatorUser?.profileImageUrl ||
                          "https://i.pravatar.cc/150"
                        }
                        size={80}
                      />
                      <Text
                        style={{
                          color: styles.feedAuthor.color,
                          fontSize: 18,
                          fontWeight: "bold",
                          marginTop: 16,
                        }}
                      >
                        {channel?.creatorUser?.displayName ||
                          channel?.creatorUser?.username ||
                          "Admin"}
                      </Text>
                      <Text
                        style={{
                          color: styles.inviteChannelSub.color,
                          fontSize: 14,
                          textAlign: "center",
                          marginTop: 8,
                        }}
                      >
                        This is the beginning of the chat history. Send a
                        message to start the conversation!
                      </Text>
                    </View>
                  ) : null
                }
                ListHeaderComponent={() => {
                  const typingUsersList = Object.values(typingUsers);
                  if (typingUsersList.length === 0) return null;

                  const firstTypingUser = typingUsersList[0];
                  const displayName =
                    firstTypingUser?.displayName ||
                    firstTypingUser?.username ||
                    "Someone";
                  const avatarUrl =
                    firstTypingUser?.profileImageUrl ||
                    "https://i.pravatar.cc/150?img=13";
                  const othersCount = typingUsersList.length - 1;

                  return (
                    <View
                      style={{
                        flexDirection: "column",
                        alignItems: "flex-start",
                        paddingBottom: 8,
                      }}
                    >
                      <TypingBubble avatarUrl={avatarUrl} />
                      <Text
                        style={{
                          marginLeft: 70,
                          color: styles.inviteChannelSub.color,
                          fontSize: 12,
                          marginTop: -4,
                        }}
                      >
                        {othersCount === 0
                          ? `${displayName} is typing...`
                          : `${displayName} and ${othersCount} other${othersCount > 1 ? "s" : ""} are typing...`}
                      </Text>
                    </View>
                  );
                }}
                showsVerticalScrollIndicator={false}
              />

              {!channelMembers?.some(m => m.userId === user?.id) ? (
                <JoinChannelWidget
                  channelId={id as string}
                  channelName={channel?.title || ""}
                  avatarUrl={channel?.imageUrl || ""}
                  ownerId={channel?.creatorId}
                  onJoined={() => refetchChannelMembers()}
                />
              ) : (
                <ChannelRestrictionWrapper
                  channelId={id as string}
                  requiredAction="participate_in_chat"
                  fallback={null}
                >
                  <ChatInputField
                  channelId={id as string}
                  onSubmitted={(msg) => {
                    console.log(
                      "\n[Pipeline Step 1] UI: User pressed send. Optimistic UI update executing...",
                    );
                    const newMsg = {
                      id: Date.now().toString(),
                      text: msg,
                      time: new Date().toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      }),
                      isMe: true,
                      senderId: user?.id,
                      senderName:
                        user?.displayName || user?.username || "Admin",
                      senderAvatarUrl: user?.profileImageUrl || null,
                    };
                    setMessages((prev) => [newMsg, ...prev]);

                    console.log(
                      "[Pipeline Step 2] WebSocket: Broadcasting message to other users...",
                    );
                    broadcastMessage(newMsg);

                    console.log(
                      "[Pipeline Step 3] Repository: Initiating persistent background save...",
                    );
                    channelRepository.createChannelMessage(
                      id as string,
                      user?.id as string,
                      msg,
                    );

                    setTimeout(() => {
                      flatListRef.current?.scrollToOffset({
                        offset: 0,
                        animated: true,
                      });
                    }, 100);
                  }}
                  onMediaSubmitted={async (media, caption) => {
                    if (!media || media.length === 0) return;

                    // 1. Optimistic UI update with local URI
                    const newMediaItems = media.map((m: any) => ({
                      type: m.type === "video" ? "video" : "image",
                      url: m.path || m.url || m.uri,
                      thumbnail: m.thumbnailUrl,
                    }));

                    const newMsg = {
                      id: Date.now().toString(),
                      text: caption || "",
                      time: new Date().toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      }),
                      isMe: true,
                      senderId: user?.id,
                      senderName:
                        user?.displayName || user?.username || "Admin",
                      senderAvatarUrl: user?.profileImageUrl || null,
                      mediaItems: newMediaItems,
                    };
                    setMessages((prev) => [newMsg, ...prev]);

                    // Scroll to bottom
                    setTimeout(() => {
                      flatListRef.current?.scrollToOffset({
                        offset: 0,
                        animated: true,
                      });
                    }, 100);

                    try {
                      // 2. Upload media to cloud storage in background
                      console.log(
                        "[Pipeline Step 1.5] Media: Uploading to Cloudflare R2...",
                      );
                      const uploadedUrls = await Promise.all(
                        newMediaItems.map(async (m: any) => {
                          const remoteUrl = await cloudMediaService.uploadMedia(
                            m.url,
                            "channel_messages",
                            user?.id,
                          );
                          return remoteUrl;
                        }),
                      );

                      // 3. Broadcast to WebSockets with actual public URLs
                      const finalMediaItems = newMediaItems.map(
                        (m: any, index: number) => ({
                          ...m,
                          url: uploadedUrls[index],
                        }),
                      );
                      const finalMsg = {
                        ...newMsg,
                        mediaItems: finalMediaItems,
                      };

                      console.log(
                        "[Pipeline Step 2] WebSocket: Broadcasting uploaded media message...",
                      );
                      broadcastMessage(finalMsg);

                      // 4. Save to Repository
                      console.log(
                        "[Pipeline Step 3] Repository: Saving uploaded media message...",
                      );
                      channelRepository.createChannelMessage(
                        id as string,
                        user?.id as string,
                        caption || "",
                        finalMediaItems.map((m: any) => ({
                          uri: m.url,
                          type: m.type,
                        })),
                      );
                    } catch (e) {
                      console.error("[Pipeline Error] Media upload failed:", e);
                    }
                  }}
                  onVoiceSubmitted={async (url, duration) => {
                    const newMsg = {
                      id: Date.now().toString(),
                      text: "",
                      time: new Date().toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      }),
                      isMe: true,
                      senderId: user?.id,
                      senderName:
                        user?.displayName || user?.username || "Admin",
                      senderAvatarUrl: user?.profileImageUrl || null,
                      mediaItems: [{ type: "audio", url: url }],
                    };
                    setMessages((prev) => [newMsg, ...prev]);

                    setTimeout(() => {
                      flatListRef.current?.scrollToOffset({
                        offset: 0,
                        animated: true,
                      });
                    }, 100);

                    try {
                      console.log(
                        "[Pipeline] Audio: Uploading to Cloudflare R2...",
                      );
                      const remoteUrl = await cloudMediaService.uploadMedia(
                        url,
                        "channel_messages",
                        user?.id,
                      );

                      const finalMsg = {
                        ...newMsg,
                        mediaItems: [{ type: "audio", url: remoteUrl }],
                      };
                      broadcastMessage(finalMsg);
                      channelRepository.createChannelMessage(
                        id as string,
                        user?.id as string,
                        "",
                        [{ type: "audio", url: remoteUrl }],
                      );
                    } catch (e) {
                      console.error("[Pipeline Error] Audio upload failed:", e);
                    }
                  }}
                  onLottieSubmitted={(index) => {
                    const newMsg = {
                      id: Date.now().toString(),
                      text: "",
                      time: new Date().toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      }),
                      isMe: true,
                      senderId: user?.id,
                      senderName: user?.displayName || user?.username || "Josh",
                      senderAvatarUrl:
                        user?.profileImageUrl ||
                        "https://i.pravatar.cc/150?img=12",
                      mediaItems: [{ type: "lottie", url: String(index) }],
                    };
                    setMessages((prev) => [newMsg, ...prev]);
                    broadcastMessage(newMsg);
                    channelRepository.createChannelMessage(
                      id as string,
                      user?.id as string,
                      "",
                      [{ type: "lottie", url: String(index) }],
                    );
                    setTimeout(() => {
                      flatListRef.current?.scrollToOffset({
                        offset: 0,
                        animated: true,
                      });
                    }, 100);
                  }}
                  onTypingChange={(typing) => {
                    setMyTyping(typing);
                    broadcastTyping(typing);
                  }}
                />
              </ChannelRestrictionWrapper>
              )}
            </View>
          ) : (
            <>
              {/* Title Bar at the very top (Facebook style) */}
              <ChannelTitleBar
                channelId={id as string}
                title={channel?.title || ""}
                channelImageUrl={channel?.imageUrl}
                onBackPress={() => router.back()}
              />

              {/* Nav Bar */}
              <ChannelNavBar
                selectedIndex={activeTab}
                onTabSelected={(index) => {
                  setActiveTab(index);
                  // When user opens the messages tab, clear the badge and mark channel as read
                  if (index === 1 && (localUnreadCount > 0 || (channel?.unreadCount ?? 0) > 0)) {
                    setLocalUnreadCount(0); // Optimistic clear
                    if (id && user?.id) {
                      channelRepository.markChannelRead(id as string, user.id);
                    }
                  }
                }}
                totalMembers={channel?.membersCount || 0}
                pendingRequests={channel?.pendingRequestsCount || 0}
                unreadMessages={activeTab === 1 ? 0 : (localUnreadCount || channel?.unreadCount || 0)}
              />

              {/* Tab Content */}
              <ScrollView
                style={styles.content}
                contentContainerStyle={styles.scrollContent}
              >
                {activeTab === 0 && (
                  <>
                    {!channelMembers?.some(m => m.userId === user?.id) ? (
                      <JoinChannelWidget
                        channelId={id as string}
                        channelName={channel?.title || ""}
                        avatarUrl={channel?.imageUrl || ""}
                        ownerId={channel?.creatorId}
                        onJoined={() => refetchChannelMembers()}
                      />
                    ) : (
                      <CustomChannelWidget
                        userId={channel?.creatorUser?.id}
                        username={
                          channel?.creatorUser?.displayName ||
                          channel?.creatorUser?.username ||
                          "Owner"
                        }
                        avatarUrl={
                          channel?.creatorUser?.profileImageUrl ||
                          "https://i.pravatar.cc/150?img=12"
                        }
                        channelId={id as string}
                        onPlusPress={() => {
                          if (Platform.OS === 'web') {
                            useDesktopComposeStore.getState().openModal({
                              targetChannelId: id as string,
                              channelName: channel?.title || '',
                              channelAvatarUrl: channel?.imageUrl || '',
                              postType: 'channel_post',
                            });
                          } else {
                            router.push({
                              pathname: "/first-post",
                              params: {
                                targetChannelId: id,
                                channelName: channel?.title || '',
                                channelAvatarUrl: channel?.imageUrl || '',
                                isChannelPost: "true",
                              },
                            });
                          }
                        }}
                        onMorePress={() => {
                          if (isDesktop && channelIdOverride) {
                            router.setParams({ desktopChannelView: 'settings' });
                          } else {
                            router.push(`/channel/settings/${id}` as any);
                          }
                        }}
                      />
                    )}

                    {/* Status Section using the new component */}
                    {statusesLoading ? (
                      <>
                        <View
                          style={{
                            height: 6,
                            backgroundColor: styles.dateLine.backgroundColor,
                            marginTop: 12,
                          }}
                        />
                        <UserStatusWidgetShimmer />
                      </>
                    ) : (
                      <ChannelRestrictionWrapper
                        channelId={id as string}
                        requiredAction="post_moment"
                        fallback={
                          channelStatuses && channelStatuses.length > 0 ? (
                            <>
                              <View
                                style={{
                                  height: 6,
                                  backgroundColor: styles.dateLine.backgroundColor,
                                  marginTop: 12,
                                }}
                              />
                              <UserStatusWidget
                                channelId={id as string}
                                currentUser={user as any}
                                statuses={channelStatuses}
                                onEndReached={loadMoreChannelStatuses}
                                onStatusPress={handleStatusPress}
                                onAddStatusPress={() => {
                                  if (Platform.OS === 'web') {
                                    openModal({ postType: 'status', targetChannelId: id as string });
                                  } else {
                                    router.push({
                                      pathname: "/first-post",
                                      params: {
                                        targetChannelId: id,
                                        isChannelStatus: "true",
                                      },
                                    });
                                  }
                                }}
                              />
                            </>
                          ) : null
                        }
                      >
                        <View
                          style={{
                            height: 6,
                            backgroundColor: styles.dateLine.backgroundColor,
                            marginTop: 12,
                          }}
                        />
                        <UserStatusWidget
                          channelId={id as string}
                          currentUser={user as any}
                          statuses={channelStatuses}
                          onEndReached={loadMoreChannelStatuses}
                          onStatusPress={handleStatusPress}
                          onAddStatusPress={() => {
                            if (Platform.OS === 'web') {
                              openModal({ postType: 'status', targetChannelId: id as string });
                            } else {
                              router.push({
                                pathname: "/first-post",
                                params: {
                                  targetChannelId: id,
                                  isChannelStatus: "true",
                                },
                              });
                            }
                          }}
                        />
                      </ChannelRestrictionWrapper>
                    )}

                    {/* Status Viewer Modal */}
                    {statusViewerVisible && (
                      <StatusViewer
                        visible={statusViewerVisible}
                        onClose={() => setStatusViewerVisible(false)}
                        statusGroups={statusViewerGroups}
                        initialGroupIndex={statusInitialIndex}
                        isMoment={true}
                      />
                    )}

                    {/* Channel Posts Feed */}
                    {channelPosts.map((post) => {
                      const isLiked = interactionLikes[post.id] ?? false;
                      const currentLikesCount = interactionLikesCount[post.id] ?? post.likes;
                      const currentTagsCount = interactionTagsCount[post.id] ?? post.tagsCount;

                      return (
                        <View key={post.id}>
                          <FeedPermissionsWrapper permissions={{ canComment: canPostStatus }}>
                            <ChannelAndFeedPostModel
                              postId={post.id}
                              content={post.title || ""}
                              timeAgo={post.createdAt ? new Date(post.createdAt).toLocaleDateString() : ""}
                              imageUrls={post.imageUrls?.length > 0 ? post.imageUrls : null}
                              thumbnailUrl={post.thumbnailUrl}
                              videoUrl={post.videoUrl}
                              isVideo={post.isVideo || !!post.videoUrl}
                              audioUrl={post.audioUrl}
                              isAudio={post.isAudio}
                              metadata={post.metadata}
                              aspectRatio={post.aspectRatio}
                              type={post.type}
                              isLiked={isLiked}
                              likesCount={currentLikesCount}
                              commentsCount={post.commentsCount}
                              tagsCount={currentTagsCount}
                              channelId={id as string}
                              channelName={channel?.title}
                              widgetType="channel_post"
                              canComment={canPostStatus}
                              taggerName={post.taggerName}
                              taggerAvatar={post.taggerAvatar}
                              onLikeTap={() => {
                                useInteractionStore.getState().toggleLike(post.id, undefined, post.sourceTable);
                              }}
                              authorData={
                                {
                                  id: post.addedBy?.id || "",
                                  displayName: post.addedBy?.name || "Unknown",
                                  username: post.addedBy?.name || "Unknown",
                                  profileImageUrl: post.addedBy?.avatarUrl || "",
                                } as any
                              }
                            />
                          </FeedPermissionsWrapper>
                        </View>
                      );
                    })}


                  </>
                )}

                {activeTab === 2 && (
                  <VideoTabView
                    channelId={id as string}
                    channelName={channel?.title || ""}
                    channelTitle={channel?.description || ""}
                  />
                )}

                {activeTab === 3 && (
                  <MembersTabView
                    channelId={id as string}
                    channelName={channel?.title}
                    channelImageUrl={channel?.imageUrl}
                    canPostStatus={canPostStatus}
                    totalMemberCount={channel?.memberCount}
                    members={channelMembers?.map((m) => ({
                      id: m.userId,
                      displayName: m.displayName || "Member",
                      profileImageUrl: m.profileImageUrl || "",
                      role: m.role,
                      canChat: m.canChat,
                    }))}
                    onAddStory={() => {
                      router.push({
                        pathname: "/first-post",
                        params: {
                          targetChannelId: id,
                          isChannelStatus: "true",
                        },
                      });
                    }}
                  />
                )}
              </ScrollView>
            </>
          )}
        </KeyboardAvoidingView>
      </ChannelRestrictionWrapper>
    </View>
  );
}
