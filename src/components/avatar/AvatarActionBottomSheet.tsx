import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, TouchableWithoutFeedback } from 'react-native';
import { Image as ExpoImage } from 'expo-image';

interface AvatarActionBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  onViewStatuses: () => void;
  onViewProfileImage: () => void;
  avatarUrl?: string | null;
  name?: string;
}

export const AvatarActionBottomSheet: React.FC<AvatarActionBottomSheetProps> = ({
  visible,
  onClose,
  onViewStatuses,
  onViewProfileImage,
  avatarUrl,
  name,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={styles.backdrop} />
        </TouchableWithoutFeedback>

        <View style={styles.container}>
          <View style={styles.dragHandle} />

          <View style={styles.header}>
            <ExpoImage
              source={{ uri: avatarUrl || 'https://via.placeholder.com/60' }}
              style={styles.avatar}
              contentFit="cover"
            />
            <Text style={styles.name}>{name || '-'}</Text>
          </View>

          <View style={styles.actionsContainer}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => {
                onClose();
                onViewStatuses();
              }}
            >
              <Text style={[styles.actionText, { color: '#FACD11' }]}>View Statuses</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => {
                onClose();
                onViewProfileImage();
              }}
            >
              <Text style={[styles.actionText, { color: 'rgba(255,255,255,0.7)' }]}>View Profile Image</Text>
            </TouchableOpacity>
          </View>

          <View style={{ height: 24 }} />
        </View>
      </View>
    </Modal>
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
  container: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 40,
    backgroundColor: '#0D0D0D',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
  },
  dragHandle: {
    width: 40,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 2,
    marginBottom: 24,
    alignSelf: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 16,
  },
  name: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFF',
  },
  actionsContainer: {
    gap: 16,
  },
  actionButton: {
    paddingVertical: 8,
  },
  actionText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
