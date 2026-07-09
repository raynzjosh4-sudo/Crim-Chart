import { colors } from '@/core/theme/colors';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Image, Platform, SafeAreaView, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';

const allImages = [
  require('@/assets/images/welcome-floating/avatar1.png'),
  require('@/assets/images/welcome-floating/avatar2.png'),
  require('@/assets/images/welcome-floating/avatar3.png'),
  require('@/assets/images/welcome-floating/avatar4.png'),
  require('@/assets/images/welcome-floating/album1.png'),
  require('@/assets/images/welcome-floating/album2.png'),
  require('@/assets/images/welcome-floating/album3.png'),
  require('@/assets/images/welcome-floating/note_icon.png'),
  require('@/assets/music_images/images (9).jpg'),
  require('@/assets/music_images/images (10).jpg'),
  require('@/assets/music_images/images (11).jpg'),
  require('@/assets/music_images/images (12).jpg'),
  require('@/assets/music_images/images (13).jpg'),
  require('@/assets/music_images/images (14).jpg'),
  require('@/assets/music_images/images (15).jpg'),
  require('@/assets/music_images/images (16).jpg'),
  require('@/assets/music_images/images (17).jpg'),
  require('@/assets/music_images/images (18).jpg'),
  require('@/assets/music_images/images (19).jpg'),
  require('@/assets/music_images/images (20).jpg'),
  require('@/assets/music_images/images (21).jpg'),
];

const col1 = [allImages[0], allImages[3], allImages[6], allImages[9], allImages[12], allImages[15], allImages[18]];
const col2 = [allImages[1], allImages[4], allImages[7], allImages[10], allImages[13], allImages[16], allImages[19]];
const col3 = [allImages[2], allImages[5], allImages[8], allImages[11], allImages[14], allImages[17], allImages[20]];

const MarqueeColumn = ({ items, reverse, duration, width }: any) => {
  const gap = 12;
  const imageSize = width;
  const setHeight = items.length * (imageSize + gap);
  
  const translateY = useRef(new Animated.Value(reverse ? -setHeight : 0)).current;

  useEffect(() => {
    const animation = Animated.timing(translateY, {
      toValue: reverse ? 0 : -setHeight,
      duration: duration,
      easing: Easing.linear,
      useNativeDriver: true,
    });
    Animated.loop(animation).start();
  }, [duration, reverse, setHeight, translateY]);

  // Duplicate items for seamless loop
  const renderItems = [...items, ...items];

  return (
    <View style={{ width: imageSize, overflow: 'visible' }}>
      <Animated.View style={{ transform: [{ translateY }] }}>
        {renderItems.map((img, i) => (
          <Image 
            key={i}
            source={img}
            style={{ 
              width: imageSize, 
              height: imageSize, 
              borderRadius: 16, 
              marginBottom: gap 
            }} 
            resizeMode="cover"
          />
        ))}
      </Animated.View>
    </View>
  );
};

export default function WelcomePage() {
  const router = useRouter();
  const { width } = useWindowDimensions();

  const handleContinue = () => {
    router.push('/landing' as any);
  };
  
  const gap = 12;
  // Calculate column width for exactly 3 columns with gaps, keeping a little bit of overflow on edges is fine
  const colWidth = (width - gap * 4) / 3;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        
        {/* Animated Marquee Grid Background */}
        <View style={{ 
          position: 'absolute', 
          top: -20, left: 0, right: 0, bottom: -20, 
          flexDirection: 'row', 
          paddingHorizontal: gap,
          gap: gap,
          opacity: 0.6
        }}>
          <MarqueeColumn items={col1} reverse={false} duration={30000} width={colWidth} />
          <MarqueeColumn items={col2} reverse={true} duration={35000} width={colWidth} />
          <MarqueeColumn items={col3} reverse={false} duration={28000} width={colWidth} />
        </View>

        {/* Soft manual gradient overlay so text is readable without an abrupt black block */}
        <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '45%', backgroundColor: 'rgba(0,0,0,0.3)', zIndex: 5 }} />
        <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '30%', backgroundColor: 'rgba(0,0,0,0.4)', zIndex: 5 }} />
        <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '15%', backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 5 }} />

        {/* Foreground Content */}
        <View style={{ flex: 1, justifyContent: 'flex-end', alignItems: 'center', padding: 24, zIndex: 10 }}>
          <View style={{ width: '100%', maxWidth: 480, alignItems: 'center', paddingBottom: 40 }}>
            
            <Text style={{
              fontSize: 42,
              fontWeight: '900',
              color: colors.text,
              textAlign: 'center',
              lineHeight: 50,
              letterSpacing: -1,
              marginBottom: 16,
              textShadowColor: 'rgba(0,0,0,0.9)',
              textShadowOffset: { width: 0, height: 4 },
              textShadowRadius: 12
            }}>
              Share your favourite music with friends.
            </Text>
            
            <Text style={{
              fontSize: 17,
              color: colors.textSecondary,
              textAlign: 'center',
              lineHeight: 26,
              marginBottom: 48,
              textShadowColor: 'rgba(0,0,0,0.9)',
              textShadowOffset: { width: 0, height: 2 },
              textShadowRadius: 8
            }}>
              Discover new sounds and connect with the community on CrimChart.
            </Text>
            
            <TouchableOpacity 
              activeOpacity={0.8} 
              onPress={handleContinue}
              style={{
                backgroundColor: colors.primary,
                paddingVertical: 18,
                paddingHorizontal: 32,
                borderRadius: 9999,
                width: '100%',
                alignItems: 'center',
                ...(Platform.OS === 'web' && { cursor: 'pointer' as any }),
                shadowColor: colors.primary,
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.4,
                shadowRadius: 16,
                elevation: 10
              }}
            >
              <Text style={{ color: colors.background, fontSize: 18, fontWeight: 'bold' }}>
                Get Started
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        
      </View>
    </SafeAreaView>
  );
}
