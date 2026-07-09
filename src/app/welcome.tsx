import { colors } from '@/core/theme/colors';
import { useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Image, Modal, Platform, SafeAreaView, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import LandingPage from './landing';

const allImages = [
  require('@/assets/images/welcome-floating/avatar1.webp'),
  require('@/assets/images/welcome-floating/avatar2.webp'),
  require('@/assets/images/welcome-floating/avatar3.webp'),
  require('@/assets/images/welcome-floating/avatar4.webp'),
  require('@/assets/images/welcome-floating/album1.webp'),
  require('@/assets/images/welcome-floating/album2.webp'),
  require('@/assets/images/welcome-floating/album3.webp'),
  require('@/assets/images/welcome-floating/note_icon.webp'),
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

const MarqueeColumn = ({ items, reverse, duration, width }: any) => {
  const gap = 12;
  const imageSize = width;
  const setHeight = items.length * (imageSize + gap);

  const translateY = useRef(new Animated.Value(reverse ? -setHeight : 0)).current;

  useEffect(() => {
    // Reset animation if height changes (e.g. window resize)
    translateY.setValue(reverse ? -setHeight : 0);
    const animation = Animated.timing(translateY, {
      toValue: reverse ? 0 : -setHeight,
      duration: duration,
      easing: Easing.linear,
      useNativeDriver: Platform.OS !== 'web',
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
  const isDesktop = Platform.OS === 'web' && width >= 768;

  const [showLandingLayer, setShowLandingLayer] = useState(false);

  const handleContinue = () => {
    if (isDesktop) {
      setShowLandingLayer(true);
    } else {
      router.push('/landing' as any);
    }
  };

  const gap = 12;
  const numCols = isDesktop ? 6 : 3;
  // Calculate column width keeping a little bit of overflow on edges
  const colWidth = (width - gap * (numCols + 1)) / numCols;

  // Extend images to guarantee columns are tall enough on large desktop screens
  const extendedImages = [...allImages, ...allImages];
  const columns = Array.from({ length: numCols }, () => [] as any[]);
  extendedImages.forEach((img, i) => {
    columns[i % numCols].push(img);
  });

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
          {columns.map((col, i) => (
            <MarqueeColumn
              key={`${numCols}-${i}`}
              items={col}
              reverse={i % 2 !== 0}
              duration={30000 + (i * 3000)}
              width={colWidth}
            />
          ))}
        </View>

        {/* Removed black widget backgrounds */}
        {/* Foreground Content */}
        <View style={{ flex: 1, justifyContent: 'flex-end', alignItems: 'center', padding: 24, zIndex: 10 }}>
          <View style={{ width: '100%', maxWidth: 480, alignItems: 'center', paddingBottom: 40 }}>

            {isDesktop && (
              <Text style={{
                fontSize: 64,
                fontWeight: '900',
                color: colors.primary,
                textAlign: 'center',
                marginBottom: 8,
                textShadowColor: 'rgba(0,0,0,0.8)',
                textShadowOffset: { width: 0, height: 4 },
                textShadowRadius: 16
              }}>
                CrimChart
              </Text>
            )}

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
              Know what your friends are listening to on CrimChart.
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

      {isDesktop && (
        <Modal visible={showLandingLayer} animationType="slide" transparent={true}>
          <View style={{ flex: 1, backgroundColor: colors.background }}>
            <LandingPage />

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setShowLandingLayer(false)}
              style={{
                position: 'absolute',
                top: 24,
                left: 24,
                zIndex: 999,
                width: 44,
                height: 44,
                borderRadius: 22,
                backgroundColor: 'rgba(255,255,255,0.1)',
                alignItems: 'center',
                justifyContent: 'center',
                ...(Platform.OS === 'web' && { cursor: 'pointer' as any })
              }}
            >
              <ArrowLeft color={colors.text} size={24} />
            </TouchableOpacity>
          </View>
        </Modal>
      )}
    </SafeAreaView>
  );
}
