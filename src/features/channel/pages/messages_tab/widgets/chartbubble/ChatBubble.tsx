import { useStyles } from "@/core/hooks/useStyles";
import * as Clipboard from 'expo-clipboard';
import { MoreHorizontal, Trash2 } from 'lucide-react-native';
import React, { useState } from 'react';
import { ActionSheetIOS, Modal, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { UserProfileBottomSheet } from '@/channel/pages/messages_tab/bottom_sheets/UserProfileBottomSheet';
import { PollCarousel } from '../../../../../../channel/CrimChartInBox/widgets/PollCarousel';
import UserAvatar from '@/components/avatar/UserAvatar';
import { MessageMediaItem } from '../../../../../../models/MediaModel';
import { MessageMediaGrid } from '../MessageMediaGrid';
import { STICKER_SOURCES } from '../StickerSheet';
import { VoiceMessagePlayer } from '../VoiceMessagePlayer';
export interface ReplyToPayload {
  senderName: string;
  text: string;
}
export interface ChatMessagePayload {
  id: string;
  text: string;
  time: string;
  isMe: boolean;
  senderId: string;
  senderName: string;
  senderAvatarUrl: string;
  replyTo?: ReplyToPayload;
  mediaItems?: MessageMediaItem[];
  poll?: any; // Maps to PollItem[]
}
interface ChatBubbleProps {
  message: ChatMessagePayload;
  onDelete?: () => void;
  channelId?: string;
}
export const ChatBubble: React.FC<ChatBubbleProps> = ({
  message,
  onDelete,
  channelId
}) => {
  const styles = useStyles(colors => ({
    container: {
      paddingHorizontal: 16,
      paddingVertical: 12
    },
    contentRow: {
      flexDirection: 'row',
      alignItems: 'flex-start'
    },
    rowReverse: {
      flexDirection: 'row-reverse'
    },
    rowForward: {
      flexDirection: 'row'
    },
    spacer: {
      width: 12
    },
    contentColumn: {
      flex: 1
    },
    alignEnd: {
      alignItems: 'flex-end'
    },
    alignStart: {
      alignItems: 'flex-start'
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 4
    },
    senderName: {
      color: colors.text,
      fontSize: 14,
      fontWeight: 'bold'
    },
    divider: {
      height: 1,
      backgroundColor: 'rgba(255,255,255,0.05)'
    },
    timeText: {
      color: 'rgba(255,255,255,0.4)',
      fontSize: 11
    },
    moreButton: {
      padding: 4
    },
    messageText: {
      color: colors.text,
      fontSize: 15,
      lineHeight: 22,
      marginTop: 4
    },
    mediaContainer: {
      marginTop: 8,
      width: '100%'
    },
    replyContainer: {
      backgroundColor: 'rgba(255,255,255,0.05)',
      borderLeftWidth: 3,
      borderLeftColor: '#E41E3F',
      padding: 8,
      borderRadius: 4,
      marginBottom: 8
    },
    replySender: {
      color: '#E41E3F',
      fontSize: 12,
      fontWeight: 'bold',
      marginBottom: 2
    },
    replyText: {
      color: 'rgba(255,255,255,0.7)',
      fontSize: 13
    },
    deleteOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.45)',
      justifyContent: Platform.OS === 'web' ? 'center' : 'flex-end',
      paddingHorizontal: 20
    },
    deleteMenu: {
      backgroundColor: '#1A1A2E',
      borderRadius: 16,
      overflow: 'hidden'
    },
    deleteMenuItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      paddingVertical: 18,
      paddingHorizontal: 20
    },
    deleteText: {
      color: '#E41E3F',
      fontSize: 16,
      fontWeight: '700'
    }
  }));
  const [showDeleteMenu, setShowDeleteMenu] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const handleMorePress = () => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions({
        options: ['Cancel', 'Delete'],
        destructiveButtonIndex: 1,
        cancelButtonIndex: 0
      }, index => {
        if (index === 1) {
          onDelete?.();
        }
      });
    } else {
      setShowDeleteMenu(true);
    }
  };
  const handleLongPress = async () => {
    if (message.text) {
      await Clipboard.setStringAsync(message.text);
    }
  };
  const audioItem = message.mediaItems?.find(m => m.type === 'audio');
  const lottieItem = message.mediaItems?.find(m => m.type === 'lottie');
  const imageVideoItems = message.mediaItems?.filter(m => m.type === 'image' || m.type === 'video') || [];

  // Lazy-load lottie so it doesn't crash if not installed
  const [LottieView, setLottieView] = useState<any>(null);
  React.useEffect(() => {
    if (lottieItem) {
      try {
        const mod = require('lottie-react-native');
        setLottieView(() => mod.default ?? mod);
      } catch {
        setLottieView(null);
      }
    }
  }, [lottieItem]);
  return <>
      <TouchableOpacity style={styles.container} activeOpacity={0.9} onLongPress={handleLongPress}>
        <View style={[styles.contentRow, message.isMe ? styles.rowReverse : styles.rowForward]}>
          <UserAvatar userId={message.senderId} fallbackUrl={message.senderAvatarUrl} size={42} forceOnline={message.isMe ? true : undefined} onTap={() => setShowProfile(true)} />

          <View style={styles.spacer} />

          {/* ── Content Column ── */}
          <View style={styles.contentColumn}>
            {/* Header: Username + Time + 3-dots */}
            <View style={[styles.headerRow, message.isMe ? styles.rowReverse : styles.rowForward]}>
              <Text style={styles.senderName}>{message.senderName}</Text>

              {message.time ? <Text style={styles.timeText}>{message.time}</Text> : null}

              {message.isMe && <TouchableOpacity activeOpacity={1} style={styles.moreButton} onPress={handleMorePress}>
                  <MoreHorizontal size={16} color="rgba(255,255,255,0.5)" />
                </TouchableOpacity>}
            </View>

            {/* Message Content Layout */}
            <View style={[message.isMe ? styles.alignEnd : styles.alignStart]}>

              {/* Reply To Container */}
              {message.replyTo && <View style={styles.replyContainer}>
                  <Text style={styles.replySender}>{message.replyTo.senderName}</Text>
                  <Text style={styles.replyText} numberOfLines={2}>{message.replyTo.text}</Text>
                </View>}

              {/* Text Message */}
              {Boolean(message.text && message.text.length > 0) && <Text style={styles.messageText}>{message.text}</Text>}

              {/* Media Grid (Images/Videos) */}
              {imageVideoItems.length > 0 && <View style={styles.mediaContainer}>
                  <MessageMediaGrid items={imageVideoItems} isMe={message.isMe} channelId={channelId} caption={message.text} />
                </View>}

              {/* Voice Message */}
              {audioItem && <VoiceMessagePlayer url={audioItem.url} isMe={message.isMe} />}

              {/* Lottie Sticker */}
              {lottieItem && LottieView && <View style={{
              width: 140,
              height: 140,
              marginVertical: 8
            }}>
                  <LottieView source={Platform.OS === 'web' ? {
                uri: `data:application/json;charset=utf-8,${encodeURIComponent(JSON.stringify(STICKER_SOURCES[Number(lottieItem.url)] ?? lottieItem.url))}`
              } : STICKER_SOURCES[Number(lottieItem.url)] ?? lottieItem.url} autoPlay loop style={{
                width: '100%',
                height: '100%'
              }} resizeMode="contain" />
                </View>}

              {/* Poll Carousel */}
              {message.poll && message.poll.items && <View style={{
              width: 340
            }}>
                  <PollCarousel items={message.poll.items} />
                </View>}

            </View>
          </View>
        </View>
      </TouchableOpacity>

      <View style={styles.divider} />

      <UserProfileBottomSheet visible={showProfile} onClose={() => setShowProfile(false)} user={{
      user: {
        id: message.senderId,
        name: message.senderName,
        avatarUrl: message.senderAvatarUrl
      },
      isTyping: false
    }} />

      {Platform.OS !== 'ios' && <Modal visible={showDeleteMenu} transparent animationType="fade" onRequestClose={() => setShowDeleteMenu(false)}>
          <TouchableOpacity style={styles.deleteOverlay} activeOpacity={1} onPress={() => setShowDeleteMenu(false)}>
            <View style={[styles.deleteMenu, { width: '100%', maxWidth: 400, alignSelf: 'center', marginBottom: Platform.OS === 'web' ? 0 : 40 }]}>
              <TouchableOpacity activeOpacity={0.8} style={styles.deleteMenuItem} onPress={() => {
            setShowDeleteMenu(false);
            onDelete?.();
          }}>
                <Trash2 size={18} color="#E41E3F" />
                <Text style={styles.deleteText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>}
    </>;
};