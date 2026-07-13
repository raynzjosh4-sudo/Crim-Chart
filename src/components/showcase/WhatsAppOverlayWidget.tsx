import React, { useEffect, useRef } from 'react';
import { Modal, View, Text, Animated, StyleSheet } from 'react-native';
import { create } from 'zustand';

interface OverlayState {
  visible: boolean;
  message: string;
  show: (message: string) => void;
  hide: () => void;
}

export const useWhatsAppOverlay = create<OverlayState>((set) => ({
  visible: false,
  message: '',
  show: (message: string) => set({ visible: true, message }),
  hide: () => set({ visible: false, message: '' })
}));

export const WhatsAppOverlayRoot = () => {
  const { visible, message, hide } = useWhatsAppOverlay();
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.timing(opacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true
      }).start();

      const timer = setTimeout(() => {
        Animated.timing(opacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true
        }).start(() => {
          hide();
        });
      }, 1500);

      return () => clearTimeout(timer);
    } else {
      opacity.setValue(0);
    }
  }, [visible, opacity, hide]);

  if (!visible) return null;

  return (
    <Modal transparent animationType="none" visible={visible}>
      <View style={styles.container}>
        <Animated.View style={[styles.bubble, { opacity }]}>
          <Text style={styles.text}>{message}</Text>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
    pointerEvents: 'none',
  },
  bubble: {
    backgroundColor: 'rgba(0,0,0,0.75)',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 120,
    alignItems: 'center',
  },
  text: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '500',
  }
});

// Helper for easy access
export const WhatsAppOverlay = {
  show: (message: string) => {
    useWhatsAppOverlay.getState().show(message);
  }
};
