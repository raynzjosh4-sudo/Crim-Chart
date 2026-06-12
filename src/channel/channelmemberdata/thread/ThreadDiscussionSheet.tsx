import CommentInputField from '@/commentingsheets/widgets/CommentInputField';
import { MessageSquare, X } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { MediaData } from '@/components/media/types';
import { useState } from 'react';
import { Dimensions, Keyboard, KeyboardAvoidingView, Modal, Platform, StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { height: SCREEN_H } = Dimensions.get('window');

interface ThreadDiscussionSheetProps {
  threadId: string;
  channelId?: string;
  channelName?: string;
  onClose?: () => void;
  isEmbedded?: boolean;
}

export default function ThreadDiscussionSheet({
  threadId,
  channelId,
  channelName,
  onClose,
  isEmbedded = false,
}: ThreadDiscussionSheetProps) {
  const [commentText, setCommentText] = useState('');
  const [isInputModalOpen, setIsInputModalOpen] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<MediaData[]>([]);
  const commentsCount = 0; // Hardcoded for now until connected
  const navigation = useNavigation<any>();

  const openImagePicker = () => {
    setIsInputModalOpen(false);
    navigation.navigate('FirstPostMainPage', {
      isManifestoContext: true,
      onMediaSelected: (items: MediaData[]) => {
        setSelectedMedia(prev => [...prev, ...items]);
        setIsInputModalOpen(true);
      }
    });
  };

  const content = (
    <View style={[styles.container, isEmbedded && styles.embedded]}>
      {/* Drag Handle */}
      <View style={styles.handle} />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerSpacer} />
        <Text style={styles.title}>{commentsCount} comments</Text>
        <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
          <X color="rgba(255,255,255,0.7)" size={22} />
        </TouchableOpacity>
      </View>

      {/* Comments List (Empty state for now) */}
      <View style={styles.listContainer}>
        <View style={styles.emptyState}>
          <MessageSquare size={48} color="rgba(255,255,255,0.1)" style={{ marginBottom: 12 }} />
          <Text style={styles.emptyStateText}>Be the first to speak</Text>
        </View>
      </View>

      {/* Selected Media Previews */}
      {selectedMedia.length > 0 && (
        <View style={{ flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 8 }}>
          {selectedMedia.map((m, idx) => (
            <View key={idx} style={{ marginRight: 8 }}>
              <View style={{ width: 60, height: 60, borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.1)' }} />
            </View>
          ))}
        </View>
      )}

      {/* Input Field (Fake one to trigger modal) */}
      <SafeAreaView edges={['bottom']} style={{ backgroundColor: '#1C1C1E' }}>
        <CommentInputField
          controller={{ value: commentText, onChange: setCommentText }}
          onSend={() => { }}
          onTap={() => setIsInputModalOpen(true)}
          isTikTokStyle={true}
          onImageTap={openImagePicker}
          hasMedia={selectedMedia.length > 0}
        />
      </SafeAreaView>

      {/* Floating Input Modal */}
      <Modal
        visible={isInputModalOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsInputModalOpen(false)}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <TouchableWithoutFeedback onPress={() => { Keyboard.dismiss(); setIsInputModalOpen(false); }}>
            <View style={{ flex: 1 }} />
          </TouchableWithoutFeedback>
          <SafeAreaView style={styles.modalContent} edges={['bottom']}>
            <View style={styles.modalHandle} />
            {selectedMedia.length > 0 && (
              <View style={{ flexDirection: 'row', paddingHorizontal: 16, paddingTop: 8 }}>
                {selectedMedia.map((m, idx) => (
                  <View key={idx} style={{ marginRight: 8 }}>
                    <View style={{ width: 60, height: 60, borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.2)' }} />
                  </View>
                ))}
              </View>
            )}
            <CommentInputField
              controller={{ value: commentText, onChange: setCommentText }}
              autoFocus={true}
              onSend={(text) => {
                // Implement send logic
                setCommentText('');
                setSelectedMedia([]);
                setIsInputModalOpen(false);
              }}
              isTikTokStyle={true}
              onImageTap={openImagePicker}
              hasMedia={selectedMedia.length > 0}
            />
          </SafeAreaView>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );

  return content;
}

const styles = StyleSheet.create({
  container: {
    height: SCREEN_H * 0.85,
    backgroundColor: '#0F0F0F',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    flexDirection: 'column',
  },
  embedded: {
    flex: 1,
    height: '100%',
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  headerSpacer: {
    width: 38, // to balance the close button
  },
  title: {
    flex: 1,
    color: 'white',
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
  },
  closeBtn: {
    padding: 8,
  },
  listContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateText: {
    color: 'rgba(255,255,255,0.24)',
    fontSize: 14,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#1C1C1E',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 8,
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 2,
    alignSelf: 'center',
    marginVertical: 12,
  },
});
