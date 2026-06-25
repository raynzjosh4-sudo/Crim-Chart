import { UserProfileBottomSheet } from '@/channel/pages/messages_tab/bottom_sheets/UserProfileBottomSheet';
import { ChatInputField } from '@/channel/pages/messages_tab/widgets/ChatInputField';
import { DateDivider } from '@/channel/pages/messages_tab/widgets/DateDivider';
import { BouncingTypingIndicator } from '@/channel/widgets/sectionHeaders/InboxSectionHeader';
import UserAvatar from '@/components/avatar/UserAvatar';
import ChartAppBar from '@/components/chartappbar/ChartAppBar';
import CrimchartBackButton from '@/components/CrimChartBackButton/CrimChart_back_button';
import { OverscrollStatusReveal } from '@/components/OverscrollStatusReveal/OverscrollStatusReveal';
import { NativeDB } from '@/core/db/NativeDB';
import { useProfileCacheStore } from '@/core/store/useProfileCacheStore';
import { useAuthStore } from '@/features/auth/application/useAuthStore';
import { ChatBubble } from '@/features/channel/pages/messages_tab/widgets/chartbubble/ChatBubble';
import { getStatusColor } from '@/profile/utils/ConnectionStatsUtils';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, FlatList, Keyboard, KeyboardAvoidingView, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useChatStore } from '../application/useChatStore';

import { StickerSheet } from '@/features/channel/pages/messages_tab/widgets/StickerSheet';
import { QuickEmojiToolbar } from '../widgets/QuickEmojiToolbar';

import { InboxRequestWidget } from '@/components/InboxRequestWidget/InboxRequestWidget';
import { InboxTopWidget } from '@/components/InboxTopWidget/InboxTopWidget';
import { InboxDetailShimmer } from '@/components/shimmers/inboxDetailPageshimmer/InboxDetailShimmer';
import { InboxPrivacyWrapper } from '@/components/wrappers/InboxPrivacyWrapper/InboxPrivacyWrapper';
import { UserConnectionStatsModel } from '@/profile/models/CrimChartUserModel';
import { supabase } from '@/core/supabase/client';

export const InboxDetailPage: React.FC = () => {
  const params = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const threadId = params.threadId as string;
  const participantIdParam = params.participantId as string | undefined;

  const { threads, messages, typingUsers, isLoadingMessages, fetchMessages, loadMoreMessages, subscribeToThread, unsubscribeFromThread, markThreadAsRead, sendMessage, startTyping, stopTyping, acceptInboxRequest } = useChatStore();
  const currentThread = threads.find(t => t.id === threadId);
  const { user } = useAuthStore() as any;

  // Resolving participant
  const participantFromThread = currentThread?.participants?.find(p => p.id !== user?.id) || currentThread?.participants?.[0];
  const activeParticipantId = participantFromThread?.id || participantIdParam;

  // Determine thread details
  const thread = threads.find(t => t.id === threadId);
  const isPending = thread?.status === 'pending';
  const isReceiver = !!thread?.initiatedBy && thread.initiatedBy !== user?.id;
  const actualIntent = thread?.intent || 'friendship';
  const displayIntent = (isPending && isReceiver) ? 'unknown' : actualIntent;

  const participantProfile = useProfileCacheStore(state => state.profiles[activeParticipantId || '']);

  const [participantStats, setParticipantStats] = useState<UserConnectionStatsModel | null>(null);

  const displayName = participantFromThread?.displayName || 'Unknown User';
  const displayAvatar = participantFromThread?.profileImageUrl || undefined;

  const displayId = activeParticipantId || '';



  useEffect(() => {
    if (user?.id && displayId) {
      console.log('\n\n================ TARGET USER ID (Them) ================');
      console.log(displayId);
      console.log('================ YOUR USER ID (You) ===================');
      console.log(user.id);
      console.log('=======================================================\n\n');
    }
  }, [user?.id, displayId]);

  const threadMessages = messages[threadId] || [];
  const isLoading = isLoadingMessages[threadId];

  // Check if anyone OTHER than me is typing
  const currentlyTypingUsers = typingUsers[threadId] || [];
  const isTyping = currentlyTypingUsers.some(id => id !== user?.id);

  // Track keyboard height
  const [text, setText] = useState('');
  const [showLottieSheet, setShowLottieSheet] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [overscroll, setOverscroll] = useState(0);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [relSentCount, setRelSentCount] = useState<number | null>(null);
  const [relationshipStatus, setRelationshipStatus] = useState<string>('Unknown');

  useEffect(() => {
    if (activeParticipantId) {
      NativeDB.getUserConnectionStats(activeParticipantId).then((data) => {
        if (data) {
          console.log('\n\n================ RAW LOCAL SQLITE STATS ================');
          console.log(JSON.stringify(data, null, 2));
          console.log('========================================================\n\n');
          
          setRelSentCount(data.rel_sent_count || 0);
          setRelationshipStatus(data.relationship_status || 'Unknown');
          
          let preferredCountries = [];
          let preferredAgeRanges = [];
          try { preferredCountries = typeof data.preferred_countries === 'string' ? JSON.parse(data.preferred_countries) : []; } catch (e) {}
          try { preferredAgeRanges = typeof data.preferred_age_ranges === 'string' ? JSON.parse(data.preferred_age_ranges) : []; } catch (e) {}

          setParticipantStats({
            relSentCount: data.rel_sent_count || 0,
            relAcceptedCount: data.rel_accepted_count || 0,
            relationshipStatus: data.relationship_status || 'Unknown',
            preferredCountries,
            preferredAgeRanges,
            showStatusCircle: data.show_status_circle !== 0,
            showStatusText: data.show_status_text !== 0,
            showCountryPref: data.show_country_pref !== 0,
            showAgePref: data.show_age_pref !== 0,
            lockedIntent: data.locked_intent !== 0,
          });
        }
      }).catch(e => console.error('[InboxDetail] Local stats fetch error:', e));
    }
  }, [activeParticipantId]);

  useEffect(() => {
    const showSub = Keyboard.addListener(Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow', (e) => setKeyboardHeight(e.endCoordinates.height));
    const hideSub = Keyboard.addListener(Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide', () => setKeyboardHeight(0));
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const handleScroll = (e: any) => {
    const { contentOffset, contentSize, layoutMeasurement } = e.nativeEvent;

    // In an inverted FlatList, scrolling to the oldest messages increases contentOffset.y
    // When contentOffset.y exceeds (contentSize.height - layoutMeasurement.height), we are over-scrolling at the top.
    const maxScroll = contentSize.height - layoutMeasurement.height;

    // Safety check: if content is smaller than screen, overscroll starts immediately
    if (maxScroll <= 0) {
      if (contentOffset.y > 0) {
        setOverscroll(contentOffset.y);
      } else if (overscroll > 0) {
        setOverscroll(0);
      }
      return;
    }

    if (contentOffset.y > maxScroll) {
      setOverscroll(contentOffset.y - maxScroll);
    } else if (overscroll > 0) {
      setOverscroll(0);
    }
  };



  useEffect(() => {
    if (threadId) {
      markThreadAsRead(threadId);
      fetchMessages(threadId);
      subscribeToThread(threadId);
      return () => unsubscribeFromThread(threadId);
    }
  }, [threadId]);

  return (
    <InboxPrivacyWrapper
      participantId={activeParticipantId}
      isPending={isPending}
      isSender={!isReceiver}
    >
      <View style={[styles.root, Platform.OS === 'android' && { paddingBottom: keyboardHeight > 0 ? keyboardHeight + insets.bottom : 0 }]}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ChartAppBar
            title=""
            showBack={false}
            centerTitle={false}
            leading={
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <CrimchartBackButton onPress={() => router.back()} />
                <TouchableOpacity
                  style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 4 }}
                  activeOpacity={0.7}
                  onPress={() => setShowProfile(true)}
                >
                    <UserAvatar
                      userId={displayId}
                      fallbackUrl={displayAvatar}
                      name={displayName}
                      size={42}
                    />
                  <View style={{ marginLeft: 12 }}>
                    <Text style={{ color: '#FFF', fontSize: 16, fontWeight: 'bold' }}>
                      {displayName}
                    </Text>
                    {isTyping ? (
                      <View style={{ marginTop: 4, alignSelf: 'flex-start', transform: [{ scale: 0.85 }], transformOrigin: 'left center' }}>
                        <BouncingTypingIndicator />
                      </View>
                    ) : participantProfile?.isOnline ? (
                      <Text style={{ color: '#4CAF50', fontSize: 13, marginTop: 2 }}>Online</Text>
                    ) : participantProfile?.lastSeen ? (
                      <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, marginTop: 2 }}>
                        last seen {new Date(participantProfile.lastSeen).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </Text>
                    ) : null}
                  </View>
                </TouchableOpacity>
              </View>
            }
          />

          <View style={{ flex: 1, backgroundColor: 'transparent' }}>
            <View style={[StyleSheet.absoluteFill, { top: 0, height: 180, alignItems: 'center', justifyContent: 'center', zIndex: -1 }]}>
              <OverscrollStatusReveal
                overscroll={overscroll}
                user={{
                  displayName: displayName,
                  profileImageUrl: displayAvatar ?? undefined
                }}
              />
            </View>
            {isLoading && threadMessages.length === 0 ? (
              <InboxDetailShimmer />
            ) : (
              <FlatList
                data={threadMessages}
                keyExtractor={(m, index) => m.id + '_' + index}
                inverted
                bounces={true}
                alwaysBounceVertical={true}
                onScroll={handleScroll}
                scrollEventThrottle={16}
                onEndReached={() => loadMoreMessages(threadId, 10)}
                onEndReachedThreshold={0.5}
                style={{ flex: 1 }}
                contentContainerStyle={{ flexGrow: 1 }}
                renderItem={({ item, index }) => {
                  // Convert MessageEntity's mediaUrl/type back into ChatBubble's expected mediaItems
                  let mediaItems: any[] | undefined = (item as any).mediaItems;
                  const metadata = item.metadata;

                  if (!mediaItems && metadata && Array.isArray(metadata.mediaUrls)) {
                    mediaItems = metadata.mediaUrls.map((url: string) => ({
                      type: (item.type === 'gif' || item.type === 'text') ? 'image' : item.type,
                      url: url
                    }));
                  }

                  if (!mediaItems && item.mediaUrl) {
                    try {
                      const parsed = JSON.parse(item.mediaUrl);
                      if (Array.isArray(parsed)) {
                        mediaItems = parsed.map((itemObj: any) => {
                          if (typeof itemObj === 'string') {
                            return { type: (item.type === 'gif' || item.type === 'text') ? 'image' : item.type, url: itemObj };
                          } else {
                            return { type: itemObj.type || 'image', url: itemObj.url || itemObj.uri, thumbnail: itemObj.thumbnail };
                          }
                        });
                      } else {
                        throw new Error("Not an array");
                      }
                    } catch (e) {
                      // Fallback for old single URL format
                      mediaItems = [{
                        type: (item.type === 'gif' || item.type === 'text') ? 'image' : item.type,
                        url: item.mediaUrl
                      }];
                    }
                  }

                  const currentDate = new Date(item.createdAt).toDateString();
                  const nextMessage = threadMessages[index + 1];
                  const nextDate = nextMessage ? new Date(nextMessage.createdAt).toDateString() : null;
                  const showDateDivider = currentDate !== nextDate;

                  return (
                    <View>
                      {showDateDivider && (
                        <View style={{ marginVertical: 16 }}>
                          <DateDivider date={new Date(item.createdAt)} />
                        </View>
                      )}
                      <ChatBubble
                        message={{
                          id: item.id,
                          text: item.text || '',
                          time: new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                          isMe: item.author?.isMe ?? false,
                          senderId: item.author?.id || 'Unknown',
                          senderName: item.author?.displayName || 'Unknown',
                          senderAvatarUrl: item.author?.profileImageUrl || '',
                          replyTo: (item as any).replyTo,
                          mediaItems: mediaItems,
                          poll: (item as any).poll,
                        }}
                        onDelete={() => {
                          Alert.alert("Message Options", "Open the MessageOptionsBottomSheet here.");
                        }}
                      />
                    </View>
                  )
                }}
                ListEmptyComponent={
                  <View style={styles.emptyState}>
                    <Text style={styles.emptyTitle}>No messages yet</Text>
                    <Text style={styles.emptySub}>Send an emoji to start the conversation</Text>
                  </View>
                }
                ListFooterComponent={
                  <InboxTopWidget
                    userId={displayId}
                    displayName={displayName}
                    avatarUrl={displayAvatar}
                    participantStats={participantStats}
                  />
                }
                ListFooterComponentStyle={{ flexGrow: 1, justifyContent: 'flex-end' }}
              />
            )}
          </View>

          {threadMessages.length === 0 && !isPending && (
            <QuickEmojiToolbar
              onEmojiSelected={(asset) => {
                sendMessage(threadId, '', 'lottie', asset as any);
              }}
            />
          )}

          {isPending && (
            <InboxRequestWidget
              displayName={displayName}
              isReceiver={isReceiver}
              onAccept={async () => {
                if (threadId) {
                  await acceptInboxRequest(threadId);
                }
              }}
            />
          )}

          <View style={{ paddingBottom: keyboardHeight > 0 ? 4 : Math.max(insets.bottom, 8) }}>
            <ChatInputField
              channelId={threadId}
              onSubmitted={(val, media) => {
                const mediaItems = media.map(m => ({ uri: m.uri, thumbnail: m.thumbnailUri, type: m.type }));
                const type = media.length > 0 ? media[0].type : 'text';
                const mediaUrlString = mediaItems.length > 0 ? JSON.stringify(mediaItems) : undefined;
                sendMessage(threadId, val, type as any, mediaUrlString);
                stopTyping(threadId);
              }}
              onChangeText={(val) => {
                if (val.trim().length > 0) {
                  startTyping(threadId);
                } else {
                  stopTyping(threadId);
                }
              }}
              onEmojiPressed={() => setShowLottieSheet(true)}
            />
          </View>

          <StickerSheet
            visible={showLottieSheet}
            onClose={() => setShowLottieSheet(false)}
            onStickerSelected={(asset) => {
              sendMessage(threadId, '', 'lottie', String(asset));
              setShowLottieSheet(false);
            }}
          />

          <UserProfileBottomSheet
            visible={showProfile}
            onClose={() => setShowProfile(false)}
            user={{
              user: {
                id: displayId,
                name: displayName,
                avatarUrl: displayAvatar || ''
              }
            } as any}
          />
        </KeyboardAvoidingView>
      </View>
    </InboxPrivacyWrapper>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0D0D0D' },
  headerAvatarWrapper: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#1A1A1A',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 4,
    position: 'relative',
  },
  headerAvatar: { width: '100%', height: '100%', borderRadius: 17 },
  avatarFallbackText: { fontSize: 18 },
  activeDot: {
    position: 'absolute', bottom: 0, right: 0,
    width: 10, height: 10, borderRadius: 5,
    backgroundColor: '#4CAF50', borderWidth: 1.5, borderColor: '#000',
  },
  statusRing: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 18, borderWidth: 1.5, borderColor: '#FACD11',
  },
  headerTextCol: {
    justifyContent: 'center',
  },
  emptyState: {
    padding: 32, alignItems: 'center', justifyContent: 'center',
    transform: [{ scaleY: -1 }], // Inverted FlatList counter-transform
  },
  emptyTitle: { color: '#FFF', fontSize: 18, fontWeight: 'bold', marginBottom: 8, opacity: 0.6 },
  emptySub: { color: 'rgba(255,255,255,0.4)', fontSize: 14 },
  inputContainer: {
    paddingBottom: Platform.OS === 'ios' ? 8 : 0,
  },
});
