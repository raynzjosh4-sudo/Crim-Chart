import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, TouchableWithoutFeedback, useWindowDimensions, Platform } from 'react-native';
import { ChannelAvatarImage } from './ChannelAvatarImage';

interface ChannelAvatarActionBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  onViewMoments: () => void;
  onViewChannel: () => void;
  avatarUrl?: string | null;
  name?: string;
  anchorPosition?: { x: number, y: number, width: number, height: number } | null;
}

export const ChannelAvatarActionBottomSheet: React.FC<ChannelAvatarActionBottomSheetProps> = ({
  visible,
  onClose,
  onViewMoments,
  onViewChannel,
  avatarUrl,
  name,
  anchorPosition,
}) => {
  const { width, height } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width >= 768;

  let customContainerStyle: any = {};
  if (isDesktop && anchorPosition) {
    const MENU_WIDTH = 320;
    const MENU_HEIGHT = 200; // approximate height
    let top = anchorPosition.y + anchorPosition.height + 8;
    let left = anchorPosition.x;

    if (left + MENU_WIDTH > width) {
      left = anchorPosition.x + anchorPosition.width - MENU_WIDTH;
    }
    if (top + MENU_HEIGHT > height) {
      top = anchorPosition.y - MENU_HEIGHT - 8;
    }

    customContainerStyle = {
      position: 'absolute',
      top,
      left,
    };
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType={isDesktop ? "fade" : "slide"}
      onRequestClose={onClose}
    >
      <View style={[styles.overlay, isDesktop && !anchorPosition && styles.overlayDesktop]}>
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={styles.backdrop} />
        </TouchableWithoutFeedback>

        <View style={[styles.container, isDesktop && styles.containerDesktop, customContainerStyle]}>
          {!isDesktop && <View style={styles.dragHandle} />}

          <View style={styles.header}>
            <ChannelAvatarImage
              imageUrl={avatarUrl}
              name={name}
              size={44}
              showStatusRing={false}
              showActiveDot={false}
            />
            <View style={{ marginLeft: 16 }}>
              <Text style={styles.name}>{name || '-'}</Text>
            </View>
          </View>

          <View style={styles.actionsContainer}>
            <TouchableOpacity activeOpacity={1} 
              style={styles.actionButton}
              onPress={() => {
                onClose();
                onViewMoments();
              }}
            >
              <Text style={[styles.actionText, { color: '#FACD11' }]}>View Moments</Text>
            </TouchableOpacity>

            <TouchableOpacity activeOpacity={1} 
              style={styles.actionButton}
              onPress={() => {
                onClose();
                onViewChannel();
              }}
            >
              <Text style={[styles.actionText, { color: 'rgba(255,255,255,0.7)' }]}>View Channel</Text>
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
  overlayDesktop: {
    justifyContent: 'center',
    alignItems: 'center',
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
  containerDesktop: {
    width: 320,
    borderRadius: 24,
    paddingBottom: 24,
    paddingTop: 24,
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
