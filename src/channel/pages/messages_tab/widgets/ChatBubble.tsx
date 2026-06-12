import { colors } from '@/core/theme/colors';
import * as Clipboard from 'expo-clipboard';
import { MoreHorizontal } from 'lucide-react-native';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Toast from 'react-native-toast-message';
import { UserAvatarImage } from '../../widgets2/memberimage/UserAvatarImage';
import { MessageMediaItem } from '../models/MediaModel';
import { MessageModel } from '../models/MessageModel';

import { MessageMediaGrid } from './MessageMediaGrid';
import { VoiceMessagePlayer } from './VoiceMessagePlayer';

interface ChatBubbleProps {
  message: string;
  messageId?: string;
  channelId?: string;
  isMe?: boolean;
  time?: string;
  sender?: MessageModel;
  replyTo?: any; // Replace with proper reply interface
  mediaItems?: MessageMediaItem[];
  poll?: any;
  onDelete?: () => void;
}

export const ChatBubble: React.FC<ChatBubbleProps> = ({
  message,
  messageId,
  channelId,
  isMe = false,
  time,
  sender,
  replyTo,
  mediaItems = [],
  poll,
  onDelete,
}) => {
  const handleLongPress = async () => {
    if (message) {
      await Clipboard.setStringAsync(message);
      Toast.show({
        type: 'success',
        text1: 'Copied to clipboard',
        position: 'top',
      });
    }
  };

  const hasAudio = mediaItems.some(m => m.type === 'audio');
  const audioItem = mediaItems.find(m => m.type === 'audio');

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.row,
          { flexDirection: isMe ? 'row-reverse' : 'row' },
        ]}
      >
        {/* Avatar */}
        <UserAvatarImage
          size={42}
          imageUrl={sender?.user.avatarUrl}
          showStatusRing={false}
          showActiveDot={false}
          onImageTap={() => {
            console.log('Show UserProfileBottomSheet for', sender?.user.name);
          }}
        />

        <View style={styles.spacer} />

        {/* Content Column */}
        <View
          style={[
            styles.contentCol,
            { alignItems: isMe ? 'flex-end' : 'flex-start' },
          ]}
        >
          {/* Header: Username + Time + Actions */}
          <View
            style={[
              styles.headerRow,
              { flexDirection: isMe ? 'row-reverse' : 'row' },
            ]}
          >
            <Text style={styles.nameText}>
              {sender?.user.name ?? 'Anonymous'}
            </Text>

            {time && <Text style={styles.timeText}>{time}</Text>}

            {isMe && (
              <TouchableOpacity
                onPress={onDelete}
                style={styles.moreButton}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <MoreHorizontal size={16} color="rgba(255,255,255,0.5)" />
              </TouchableOpacity>
            )}
          </View>

          <View style={{ height: 4 }} />

          {/* Message Content Area */}
          <TouchableOpacity
            activeOpacity={0.8}
            onLongPress={handleLongPress}
            style={styles.messageContentArea}
          >
            {/* Reply block */}
            {replyTo && (
              <View
                style={[
                  styles.replyContainer,
                  {
                    borderLeftWidth: isMe ? 0 : 3,
                    borderRightWidth: isMe ? 3 : 0,
                    borderColor: 'rgba(250, 205, 17, 0.5)', // primary with opacity
                  },
                ]}
              >
                <Text style={styles.replyName}>
                  {replyTo.senderName ?? 'Member'}
                </Text>
                <Text style={styles.replyText} numberOfLines={2}>
                  {replyTo.text ?? ''}
                </Text>
              </View>
            )}

            {/* Text Message */}
            {message ? (
              <Text
                style={[
                  styles.messageText,
                  { textAlign: isMe ? 'right' : 'left' },
                ]}
              >
                {message}
              </Text>
            ) : null}

            {/* Voice Message */}
            {hasAudio && audioItem && (
              <View style={{ marginTop: 8 }}>
                <VoiceMessagePlayer
                  url={audioItem.url}
                  duration={audioItem.duration}
                  isMe={isMe}
                />
              </View>
            )}

            {/* Lottie/Images/Video Grid */}
            {mediaItems.filter(m => m.type !== 'audio').length > 0 && (
              <View style={{ marginTop: 8 }}>
                <MessageMediaGrid
                  items={mediaItems.filter(m => m.type !== 'audio')}
                  channelId={channelId}
                  isMe={isMe}
                />
              </View>
            )}

            {/* Poll Placeholder */}
            {poll && (
              <View style={styles.pollPlaceholder}>
                <Text style={{ color: '#FFF' }}>[Poll Carousel: {poll.title}]</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.divider} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  row: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: 'flex-start',
  },
  spacer: {
    width: 12,
  },
  contentCol: {
    flex: 1,
  },
  headerRow: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  nameText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFF', // onSurface
  },
  timeText: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.4)',
    marginHorizontal: 8,
  },
  moreButton: {
    padding: 4,
  },
  messageContentArea: {
    width: '100%',
  },
  replyContainer: {
    padding: 10,
    marginBottom: 8,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 12,
  },
  replyName: {
    fontSize: 12,
    fontWeight: '900',
    color: colors.primary,
    marginBottom: 2,
  },
  replyText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.6)',
  },
  messageText: {
    color: '#FFF',
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 4,
  },
  audioPlaceholder: {
    padding: 10,
    backgroundColor: '#333',
    borderRadius: 8,
    marginTop: 8,
  },
  mediaPlaceholder: {
    padding: 10,
    backgroundColor: '#222',
    borderRadius: 8,
    marginTop: 8,
  },
  pollPlaceholder: {
    padding: 10,
    backgroundColor: '#111',
    borderRadius: 8,
    marginTop: 8,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
});
