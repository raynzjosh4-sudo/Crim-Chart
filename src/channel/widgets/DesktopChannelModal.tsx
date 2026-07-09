import React from 'react';
import { Modal, View, TouchableOpacity, StyleSheet, Platform, useWindowDimensions } from 'react-native';
import { X } from 'lucide-react-native';
import { useDesktopChannelModalStore } from '@/core/store/useDesktopChannelModalStore';
import ChannelPage from '@/app/channel/channelpage';
import { useCurrentTheme } from '@/core/store/useThemeStore';

export const DesktopChannelModal = () => {
  const { channelId, closeChannel } = useDesktopChannelModalStore();
  const theme = useCurrentTheme();
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width >= 768;

  if (!channelId || !isDesktop) return null;

  return (
    <Modal
      visible={!!channelId}
      transparent
      animationType="fade"
      onRequestClose={closeChannel}
    >
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={closeChannel} />
        <View style={[
          styles.modalContainer, 
          { 
            backgroundColor: theme.colors.background, 
          }
        ]}>
          <TouchableOpacity style={styles.closeButton} onPress={closeChannel} activeOpacity={0.7}>
            <X size={24} color="#FFF" />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <ChannelPage channelIdOverride={channelId} isModal={true} />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 600,
    height: '90%',
    maxHeight: 900,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    left: 16,
    zIndex: 1000,
    padding: 8,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  }
});
