import React from 'react';
import { View, StyleSheet } from 'react-native';

interface VideoProgressBarProps {
  controller: any; // Map to your expo-video or expo-av player controller
}

export const VideoProgressBar: React.FC<VideoProgressBarProps> = ({ controller }) => {
  return (
    <View style={styles.container}>
      <View style={styles.background}>
        {/* You will need to wire these up to the actual controller's progress state */}
        <View style={styles.buffered} />
        <View style={styles.played} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 4, // Padding zero, just the height
  },
  background: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  buffered: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    width: '50%', // Placeholder value
  },
  played: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'white',
    width: '20%', // Placeholder value
  },
});
