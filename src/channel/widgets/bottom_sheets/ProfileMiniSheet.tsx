import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, Dimensions, TouchableWithoutFeedback } from 'react-native';
import { Image as ExpoImage } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { ChannelModel } from '@/channel/models/ChannelModel';
import AppAvatar from '@/components/avatar/AppAvatar';
import { StatusPage } from '@/components/statuspagesAndWidgets/StatusPage';

interface ProfileMiniSheetProps {
  visible: boolean;
  onClose: () => void;
  channel: ChannelModel | null;
}

const { width, height } = Dimensions.get('window');

const MOCK_MOMENTS = [
  'https://picsum.photos/400/600',
  'https://picsum.photos/400/300',
  'https://picsum.photos/400/301',
  'https://picsum.photos/400/500',
  'https://picsum.photos/400/501',
  'https://picsum.photos/400/502',
];

export const ProfileMiniSheet: React.FC<ProfileMiniSheetProps> = ({
  visible,
  onClose,
  channel,
}) => {
  const [selectedMomentIndex, setSelectedMomentIndex] = useState<number | null>(null);

  if (!channel) return null;

  return (
    <>
      <Modal
        visible={visible}
        animationType="slide"
        transparent={true}
        onRequestClose={onClose}
      >
        <View style={styles.overlay}>
          <TouchableWithoutFeedback onPress={onClose}>
            <View style={styles.backdrop} />
          </TouchableWithoutFeedback>
          
          <View style={styles.sheetContent}>
            {/* Drag Handle */}
            <View style={styles.dragHandleContainer}>
              <View style={styles.dragHandle} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
              {/* Header Banner & Avatar */}
              <View style={styles.headerContainer}>
                <LinearGradient
                  colors={['rgba(250, 205, 17, 0.4)', 'rgba(250, 205, 17, 0.1)', 'transparent']}
                  style={styles.banner}
                />
                
                <View style={styles.avatarWrapper}>
                  <AppAvatar
                    size={100}
                    imageUrl={channel.imageUrl}
                    hasStatus={false}
                    style={styles.avatarBorder}
                  />
                </View>
              </View>

              {/* Channel Info */}
              <View style={styles.infoContainer}>
                <Text style={styles.channelTitle}>{channel.title}</Text>
                <Text style={styles.channelHandle}>
                  @{channel.creatorUser?.displayName || channel.title.toLowerCase().replace(/\s/g, '')}
                </Text>
              </View>

              {/* Action Buttons */}
              <View style={styles.actionsContainer}>
                <TouchableOpacity activeOpacity={1} style={styles.followButton}>
                  <Text style={styles.followButtonText}>Follow</Text>
                </TouchableOpacity>
                <View style={styles.followersContainer}>
                  <Text style={styles.followersCount}>1.2k</Text>
                  <Text style={styles.followersLabel}>Followers</Text>
                </View>
              </View>

              {/* Moments Grid */}
              <View style={styles.momentsContainer}>
                <Text style={styles.momentsTitle}>Moments</Text>
                <View style={styles.momentsGrid}>
                  {MOCK_MOMENTS.map((url, index) => (
                    <TouchableOpacity activeOpacity={1}
                      key={index}
                      style={[styles.momentItem, { height: index === 0 ? 200 : 120 }]}
                      onPress={() => setSelectedMomentIndex(index)}
                    >
                      <ExpoImage
                        source={{ uri: url }}
                        style={StyleSheet.absoluteFillObject}
                        contentFit="cover"
                      />
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              <View style={{ height: 40 }} />
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Moment Viewer Modal */}
      <Modal
        visible={selectedMomentIndex !== null}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setSelectedMomentIndex(null)}
      >
        {selectedMomentIndex !== null && (
          <StatusPage
            status={{
              author: {
                displayName: channel.title,
                profileImageUrl: channel.imageUrl || undefined,
              },
              imageUrls: MOCK_MOMENTS,
              isVideo: false,
            }}
            statusImageUrl={MOCK_MOMENTS[selectedMomentIndex]} // Start at selected
            username={channel.title}
            userProfileImageUrl={channel.imageUrl || undefined}
            onClose={() => setSelectedMomentIndex(null)}
            onOptionsTap={() => {}}
            onProfileTap={() => {}}
          />
        )}
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  sheetContent: {
    backgroundColor: '#1C1C1E', // Dark theme surface
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    height: height * 0.85,
    overflow: 'hidden',
  },
  dragHandleContainer: {
    alignItems: 'center',
    paddingVertical: 12,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  dragHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 50,
  },
  banner: {
    width: '100%',
    height: 160,
  },
  avatarWrapper: {
    position: 'absolute',
    bottom: -50,
    backgroundColor: '#1C1C1E',
    borderRadius: 999,
    padding: 4,
  },
  avatarBorder: {
    borderWidth: 0,
  },
  infoContainer: {
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  channelTitle: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: '900',
    textAlign: 'center',
  },
  channelHandle: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
    marginTop: 4,
  },
  actionsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    marginTop: 24,
    alignItems: 'center',
  },
  followButton: {
    flex: 2,
    backgroundColor: '#FACD11', // colors.primary
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  followButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '800',
  },
  followersContainer: {
    flex: 1,
    height: 52,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 26,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  followersCount: {
    color: '#FACD11',
    fontSize: 16,
    fontWeight: '900',
  },
  followersLabel: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 10,
    fontWeight: '700',
  },
  momentsContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  momentsTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 20,
  },
  momentsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 8,
  },
  momentItem: {
    width: '31%',
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
});
