import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useNetInfo } from '@react-native-community/netinfo';
import { WifiOff, Image as ImageIcon } from 'lucide-react-native';

export const VideoNetworkWidget: React.FC = () => {
  const netInfo = useNetInfo();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-50)).current;

  // Show if explicitly disconnected or explicitly unreachable
  const isOffline = netInfo.isConnected === false || netInfo.isInternetReachable === false;

  useEffect(() => {
    if (isOffline) {
      // Slide down and fade in
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 60,
          useNativeDriver: true,
          damping: 15,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        })
      ]).start();

      // Automatically dismiss after 4 seconds
      const timeout = setTimeout(() => {
        Animated.parallel([
          Animated.timing(slideAnim, {
            toValue: -50,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          })
        ]).start();
      }, 4000);

      return () => clearTimeout(timeout);
    } else {
      // Reset if online
      fadeAnim.setValue(0);
      slideAnim.setValue(-50);
    }
  }, [isOffline]);

  if (!isOffline) {
    return null;
  }

  return (
    <Animated.View 
      style={[
        styles.container, 
        { 
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }]
        }
      ]} 
      pointerEvents="none"
    >
      <View style={styles.iconContainer}>
        <WifiOff size={16} color="#fff" />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.title}>You're offline!</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
          <ImageIcon size={12} color="#rgba(255,255,255,0.8)" style={{ marginRight: 4 }} />
          <Text style={styles.subtitle}>Viewing local gallery videos</Text>
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0, // Starts at 0, translates down to 60 via animation
    alignSelf: 'center',
    backgroundColor: 'rgba(20, 20, 20, 0.95)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  iconContainer: {
    backgroundColor: 'rgba(255, 60, 60, 0.2)',
    padding: 8,
    borderRadius: 16,
    marginRight: 12,
  },
  textContainer: {
    flexDirection: 'column',
  },
  title: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
    fontSize: 12,
  },
});
