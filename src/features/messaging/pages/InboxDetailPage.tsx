import { UserProfileBottomSheet } from '@/channel/pages/messages_tab/bottom_sheets/UserProfileBottomSheet';
import { ChatInputField } from '@/channel/pages/messages_tab/widgets/ChatInputField';
import UserAvatar from '@/components/avatar/UserAvatar';
import { useProfileCacheStore } from '@/core/store/useProfileCacheStore';
import ChartAppBar from '@/components/chartappbar/ChartAppBar';
import CrimchartBackButton from '@/components/CrimChartBackButton/CrimChart_back_button';
import { OverscrollStatusReveal } from '@/components/OverscrollStatusReveal/OverscrollStatusReveal';
import { BouncingTypingIndicator } from '@/channel/widgets/sectionHeaders/InboxSectionHeader';
import { ChatBubble } from '@/features/channel/pages/messages_tab/widgets/chartbubble/ChatBubble';
import { DateDivider } from '@/channel/pages/messages_tab/widgets/DateDivider';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, FlatList, KeyboardAvoidingView, Platform, StyleSheet, Text, TouchableOpacity, View, Keyboard } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useChatStore } from '../application/useChatStore';
import { useAuthStore } from '@/features/auth/application/useAuthStore';

import { LottieEmojiSheet } from '../widgets/LottieEmojiSheet';
import { QuickEmojiToolbar } from '../widgets/QuickEmojiToolbar';

import { InboxDetailShimmer } from '@/components/shimmers/inboxDetailPageshimmer/InboxDetailShimmer';

export const InboxDetailPage: React.FC = () => {
  const params = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const threadId = params.threadId as string;

  const { threads, messages, typingUsers, onlineUsers, isLoadingMessages, fetchMessages, loadMoreMessages, sendMessage, subscribeToThread, unsubscribeFromThread, markThreadAsRead, startTyping, stopTyping } = useChatStore();
  const currentThread = threads.find(t => t.id === threadId);
  const { user } = useAuthStore() as any;

  // Resolving participant: In a real app we'd get this from currentThread.participants
  const participant = currentThread?.participants?.[0];
  const participantProfile = useProfileCacheStore(state => state.profiles[participant?.id || '']);
  const threadMessages = messages[threadId] || [];
  const isLoading = isLoadingMessages[threadId];
  
  // Check if anyone OTHER than me is typing
  const currentlyTypingUsers = typingUsers[threadId] || [];
  const isTyping = currentlyTypingUsers.some(id => id !== user?.id);

  const [text, setText] = useState('');
  const [showLottieSheet, setShowLottieSheet] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [overscroll, setOverscroll] = useState(0);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

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
                  userId={participant?.id || ''}
                  fallbackUrl={participant?.profileImageUrl}
                  name={participant?.displayName}
                  size={42}
                />
                <View style={{ marginLeft: 12 }}>
                  <Text style={{ color: '#FFF', fontSize: 16, fontWeight: 'bold' }}>
                    {participant?.displayName || 'User'}
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
                displayName: participant?.displayName || 'User',
                profileImageUrl: participant?.profileImageUrl ?? undefined
              }} 
            />
          </View>
          {isLoading && threadMessages.length === 0 ? (
            <InboxDetailShimmer />
          ) : (
          <FlatList
            data={threadMessages}
            keyExtractor={m => m.id}
            inverted
            bounces={true}
            alwaysBounceVertical={true}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            onEndReached={() => loadMoreMessages(threadId, 10)}
            onEndReachedThreshold={0.5}
            style={{ flex: 1 }}
            renderItem={({ item, index }) => {
              // Convert MessageEntity's mediaUrl/type back into ChatBubble's expected mediaItems
              let mediaItems: any[] | undefined = (item as any).mediaItems;
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
              )}}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>No messages yet</Text>
              <Text style={styles.emptySub}>Send an emoji to start the conversation</Text>
            </View>
          }
        />
          )}
        </View>

        {threadMessages.length === 0 && (
          <QuickEmojiToolbar
            onEmojiSelected={(asset) => {
              sendMessage(threadId, '', 'lottie', asset as any);
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

        <LottieEmojiSheet
          visible={showLottieSheet}
          onClose={() => setShowLottieSheet(false)}
          onEmojiSelected={(asset) => {
            sendMessage(threadId, '', 'lottie', asset as any);
            setShowLottieSheet(false);
          }}
        />

        <UserProfileBottomSheet
          visible={showProfile}
          onClose={() => setShowProfile(false)}
          user={{
            user: {
              id: participant?.id || 'temp-id',
              name: participant?.displayName || 'Unknown',
              avatarUrl: participant?.profileImageUrl || '',
            },
            isTyping: false,
          }}
        />
      </KeyboardAvoidingView>
    </View>
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
