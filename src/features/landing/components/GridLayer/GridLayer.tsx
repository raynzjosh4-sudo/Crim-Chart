import React from 'react';
import { View, Text, StyleSheet, Pressable, Platform, Dimensions, Image, useColorScheme, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const CARDS = [
  {
    id: 'trending',
    title: 'Discover what is trending globally in music',
    subtitle: 'Explore Top Charts',
    colors: ['#8E2DE2', '#4A00E0'],
    image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&q=80',
  },
  {
    id: 'channels',
    title: 'Interact with music boxes',
    subtitle: 'Join Music Channels',
    colors: ['#FF416C', '#FF4B2B'],
    image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&q=80',
  },
  {
    id: 'video',
    title: 'Watch the latest high-quality music videos',
    subtitle: 'Stream Music Videos',
    colors: ['#00B4DB', '#0083B0'],
    image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&q=80',
  },
];

export function GridLayer() {
  const isWeb = Platform.OS === 'web';
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { height } = useWindowDimensions();
  
  // VS Code Theme
  const bgColor = isDark ? '#1e1e1e' : '#ffffff';
  
  return (
    <View style={[
      styles.container, 
      { backgroundColor: bgColor }
    ]}>
      <View style={styles.grid}>
        {CARDS.map((card) => (
          <Pressable 
            key={card.id} 
            style={({ hovered }: any) => [
              styles.cardWrapper,
              isWeb && hovered && styles.cardHovered
            ]}
          >
            <LinearGradient
              colors={card.colors as [string, string]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.cardGradient}
            >
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>{card.title}</Text>
                
                <View style={styles.pillBtn}>
                  <Text style={styles.pillText}>{card.subtitle}</Text>
                </View>
              </View>

              {/* In a real app we might put a masked image at the bottom or corner of the card */}
              <View style={styles.imageWrapper}>
                <Image 
                  source={{ uri: card.image }} 
                  style={styles.cardImage} 
                  resizeMode="cover"
                />
              </View>
            </LinearGradient>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingHorizontal: 20,
    paddingVertical: 40,
    alignItems: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 24,
    justifyContent: 'center',
    width: '100%',
  },
  cardWrapper: {
    width: Platform.OS === 'web' ? 'calc(33.333% - 16px)' as any : '100%',
    minWidth: 300,
    height: 400,
    borderRadius: 24,
    overflow: 'hidden',
    ...Platform.select({
      web: {
        transition: 'transform 0.2s ease, box-shadow 0.2s ease' as any,
        cursor: 'pointer' as any,
      },
      default: {
        elevation: 6,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 10,
      }
    }),
  },
  cardHovered: {
    transform: [{ translateY: -5 }],
    boxShadow: '0 20px 40px rgba(0,0,0,0.15)' as any,
  },
  cardGradient: {
    flex: 1,
    padding: 32,
    justifyContent: 'space-between',
  },
  cardContent: {
    zIndex: 2,
  },
  cardTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#ffffff',
    lineHeight: 34,
    marginBottom: 20,
  },
  pillBtn: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    alignSelf: 'flex-start',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 999,
  },
  pillText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  imageWrapper: {
    position: 'absolute',
    bottom: -20,
    right: -20,
    width: '80%',
    height: '60%',
    borderRadius: 20,
    overflow: 'hidden',
    transform: [{ rotate: '-5deg' }],
    opacity: 0.9,
    ...Platform.select({
      web: {
        boxShadow: '0 10px 30px rgba(0,0,0,0.3)' as any,
      },
      default: {
        elevation: 8,
      }
    }),
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
});
