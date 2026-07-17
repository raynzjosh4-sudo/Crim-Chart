import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Image } from 'expo-image';

interface ChannelShareCardProps {
  channel: any;
}

export const ChannelShareCard: React.FC<ChannelShareCardProps> = ({ channel }) => {
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Image 
          source={{ uri: channel?.imageUrl || 'https://picsum.photos/200/200?random=50' }}
          style={styles.avatar}
          contentFit="cover"
        />
        <Text style={styles.title}>{channel?.title || 'Unknown Channel'}</Text>
        <Text style={styles.subtitle}>Channel • {channel?.membersCount || 0} members</Text>
        
        <View style={styles.footer}>
          <Text style={styles.footerText}>CrimChart</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 400,
    height: 400,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    height: '100%',
    backgroundColor: '#1C1C1E',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    borderWidth: 1,
    borderColor: '#333333',
  },
  avatar: {
    width: 140,
    height: 140,
    borderRadius: 70,
    marginBottom: 24,
    borderWidth: 2,
    borderColor: '#333333',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 20,
    color: '#8E8E93',
    marginBottom: 20,
  },
  footer: {
    position: 'absolute',
    bottom: 24,
  },
  footerText: {
    fontSize: 18,
    color: '#0A84FF',
    fontWeight: 'bold',
    letterSpacing: 1,
  }
});
