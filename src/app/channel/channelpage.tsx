import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import CommentingSheet from '@/commentingsheets/widgets/CommentingSheet';
import { ChannelNavBar } from '@/features/channel/pages/discovery_widgets/ChannelNavBar';
import { CreatorContactBar } from '@/features/channel/pages/discovery_widgets/CreatorContactBar';
import { MembersStoryBar } from '@/features/channel/pages/discovery_widgets/MembersStoryBar';
import { MembersTabView } from '@/features/channel/pages/members_tab/MembersTabView';
import { ActiveUsersBar } from '@/features/channel/pages/messages_tab/widgets/ActiveUsersBar';
import { ChatBubble } from '@/features/channel/pages/messages_tab/widgets/chartbubble/ChatBubble';
import { TypingBubble } from '@/features/channel/pages/messages_tab/widgets/chartbubble/TypingBubble';
import { ChatInputField } from '@/features/channel/pages/messages_tab/widgets/ChatInputField';
import { VideoTabView } from '@/features/channel/pages/video_tab/VideoTabView';
import { styles } from './styles/_channelStyyles.styles';
import { DateDivider } from './widgets/_datedivider';
import { DummyFeedPost } from './widgets/_DummyFeedPost';
import { ChannelTitleBar } from './widgets/ChannelTitleBar';




export default function ChannelPage() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState(0);
  const [isMediaSheetVisible, setIsMediaSheetVisible] = useState(false);
  const [isStatusMode, setIsStatusMode] = useState(false);
  const [myTyping, setMyTyping] = useState(false);

  const scrollViewRef = useRef<ScrollView | null>(null);
  const [messages, setMessages] = useState<any[]>([
    {
      id: '1',
      text: 'dsd',
      time: '1:25 PM',
      isMe: false,
      senderName: 'ooooooooo',
      senderAvatarUrl: 'https://i.pravatar.cc/150?img=13',
    },
    {
      id: '2',
      text: 'sdsds',
      time: '2:10 PM',
      isMe: false,
      senderName: 'ooooooooo',
      senderAvatarUrl: 'https://i.pravatar.cc/150?img=13',
      replyTo: {
        senderName: 'ooooooooo',
        text: 'dsd'
      }
    },
    {
      id: '3',
      text: 'Look at this cool image!',
      time: '2:15 PM',
      isMe: true,
      senderName: 'Josh',
      senderAvatarUrl: 'https://i.pravatar.cc/150?img=12',
      mediaItems: [
        {
          type: 'image',
          url: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=500&auto=format&fit=crop'
        }
      ]
    },
    /*
    {
      id: '4',
      text: 'Listen to this track',
      time: '2:20 PM',
      isMe: false,
      senderName: 'Anna',
      senderAvatarUrl: 'https://i.pravatar.cc/150?img=9',
      mediaItems: [
        {
          type: 'audio',
          url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'
        }
      ]
    },
    */
    {
      id: '5',
      text: '',
      time: '2:25 PM',
      isMe: true,
      senderName: 'Josh',
      senderAvatarUrl: 'https://i.pravatar.cc/150?img=12',
      poll: {
        items: [
          {
            id: 'p1',
            title: 'I love React Native',
            type: 2, // text type
            points: 120,
            suggestedBy: 'Josh'
          },
          {
            id: 'p2',
            title: 'Flutter is cool too',
            type: 2,
            points: 80
          }
        ]
      }
    }
  ]);

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <Stack.Screen options={{ headerShown: false }} />
        {/* Conditional Rendering of Entire View for Messages Tab */}
        {activeTab === 1 ? (
          <View style={styles.messagesTabContainer}>
            <View style={styles.header}>
              <TouchableOpacity style={styles.backButton} onPress={() => setActiveTab(0)}>
                <ChevronLeft size={28} color="#FFF" />
              </TouchableOpacity>
              <Text style={styles.headerTitle} numberOfLines={1}>beautiful 💖💖💖...</Text>
              <View style={{ width: 28 }} />
            </View>

            <ActiveUsersBar
              users={[
                {
                  id: '1',
                  username: 'josh raynz',
                  profileImageUrl: 'https://i.pravatar.cc/150?img=13',
                  isOnline: true,
                  isTyping: myTyping,
                  channelCount: 30,
                  followers: 783
                }, {
                  id: '2',
                  username: 'ooooooooo',
                  profileImageUrl: 'https://i.pravatar.cc/150?img=13',
                  isOnline: true,
                  isTyping: true,
                  channelCount: 0
                }, {
                  id: '3',
                  username: 'ooooooooo',
                  profileImageUrl: 'https://i.pravatar.cc/150?img=13',
                  isOnline: true,
                  isTyping: true,
                  channelCount: 0
                }, {
                  id: '4',
                  username: 'rop',
                  profileImageUrl: 'https://i.pravatar.cc/150?img=13',
                  isOnline: false,
                  isTyping: false,
                }
              ]}
            />

            <ScrollView
              ref={scrollViewRef}
              style={styles.messagesScroll}
              contentContainerStyle={styles.messagesScrollContent}
              onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
            >
              <DateDivider date="MAY 12, 2026" />

              {messages.map((msg) => (
                <View key={msg.id}>
                  <ChatBubble
                    message={msg}
                  />
                </View>
              ))}

              {/* Typing Indicator for other users */}
              {/* Let's pretend the second user in our hardcoded array is currently typing */}
              <TypingBubble avatarUrl="https://i.pravatar.cc/150?img=13" />

            </ScrollView>

            <ChatInputField
              channelId={id as string}
              onSubmitted={(msg) => {
                setMessages([
                  ...messages,
                  {
                    id: Date.now().toString(),
                    text: msg,
                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    isMe: true,
                    senderName: 'Josh',
                    senderAvatarUrl: 'https://i.pravatar.cc/150?img=12',
                  }
                ]);
                setTimeout(() => {
                  scrollViewRef.current?.scrollToEnd({ animated: true });
                }, 100);
              }}
              onMediaSubmitted={(media, caption) => {
                if (!media || media.length === 0) return;

                const newMediaItems = media.map((m: any) => ({
                  type: m.type === 'video' ? 'video' : 'image',
                  url: m.path || m.url || m.uri,
                  thumbnail: m.thumbnailUrl
                }));

                setMessages([
                  ...messages,
                  {
                    id: Date.now().toString(),
                    text: caption || '',
                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    isMe: true,
                    senderName: 'Josh',
                    senderAvatarUrl: 'https://i.pravatar.cc/150?img=12',
                    mediaItems: newMediaItems
                  }
                ]);
                setTimeout(() => {
                  scrollViewRef.current?.scrollToEnd({ animated: true });
                }, 100);
              }}
              onVoiceSubmitted={(url, duration) => {
                setMessages([
                  ...messages,
                  {
                    id: Date.now().toString(),
                    text: '',
                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    isMe: true,
                    senderName: 'Josh',
                    senderAvatarUrl: 'https://i.pravatar.cc/150?img=12',
                    mediaItems: [{ type: 'audio', url: url }]
                  }
                ]);
                setTimeout(() => {
                  scrollViewRef.current?.scrollToEnd({ animated: true });
                }, 100);
              }}
              onLottieSubmitted={(index) => {
                setMessages([
                  ...messages,
                  {
                    id: Date.now().toString(),
                    text: '',
                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    isMe: true,
                    senderName: 'Josh',
                    senderAvatarUrl: 'https://i.pravatar.cc/150?img=12',
                    mediaItems: [{ type: 'lottie', url: String(index) }]
                  }
                ]);
                setTimeout(() => {
                  scrollViewRef.current?.scrollToEnd({ animated: true });
                }, 100);
              }}
              onTypingChange={(typing) => setMyTyping(typing)}
            />
          </View>
        ) : (
          <>


            {/* Title Bar at the very top (Facebook style) */}
            <ChannelTitleBar
              title="beautiful 💖💖💖..."
              onBackPress={() => router.back()}
              onSettingsPress={() => router.push(`/channel/settings/${id}` as any)}
              onPlusPress={() => { setIsStatusMode(false); setIsMediaSheetVisible(true); }}
            />
            <View style={{ height: 6, backgroundColor: 'rgba(255,255,255,0.08)' }} />

            {/* Nav Bar */}
            <ChannelNavBar
              selectedIndex={activeTab}
              onTabSelected={setActiveTab}
              totalMembers={1}
            />
            <View style={{ height: 6, backgroundColor: 'rgba(255,255,255,0.08)' }} />

            {/* Tab Content */}
            <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
              {activeTab === 0 && (
                <>
                  {/* Status Section using the real component */}
                  <MembersStoryBar
                    statuses={[
                      {
                        id: 's1',
                        authorId: '1',
                        authorUsername: 'Josh',
                        authorAvatarUrl: 'https://i.pravatar.cc/150?img=12',
                        primaryImageUrl: 'https://picsum.photos/400/600?random=101',
                        imageUrls: ['https://picsum.photos/400/600?random=101'],
                      }
                    ]}
                    onAddStory={() => { setIsStatusMode(true); setIsMediaSheetVisible(true); }}
                    canPostStatus={true}
                  />

                  {/* Creator Contact */}
                  <CreatorContactBar
                    creatorName="Josh"
                    creatorImageUrl="https://i.pravatar.cc/150?img=12"
                    onMessageTap={() => setActiveTab(1)}
                    onFollowTap={() => { }}
                  />

                  {/* Feed Posts */}
                  <DummyFeedPost />
                </>
              )}

              {activeTab === 2 && (
                <VideoTabView
                  channelId={id as string}
                  channelName="beautiful 💖💖💖 girls"
                  channelTitle="beautiful 💖💖💖 girls description"
                />
              )}

              {activeTab === 3 && (
                <MembersTabView
                  channelId={id as string}
                  channelName="beautiful 💖💖💖 girls"
                  totalMemberCount={1}
                  members={[
                    {
                      id: '1',
                      displayName: 'Josh',
                      profileImageUrl: 'https://i.pravatar.cc/150?img=12',
                      role: 'admin',
                      channelCount: 50,
                      isMe: true,
                    }
                  ]}
                  onAddStory={() => { setIsStatusMode(true); setIsMediaSheetVisible(true); }}
                />
              )}
            </ScrollView>
          </>
        )}

        <CommentingSheet
          visible={isMediaSheetVisible}
          onClose={() => setIsMediaSheetVisible(false)}
          channelId={id as string}
          channelName="beautiful 💖💖💖 girls"
          showInputField={true}
          isStatus={isStatusMode}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
