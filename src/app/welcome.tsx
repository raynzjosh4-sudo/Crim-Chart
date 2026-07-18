import { colors } from '@/core/theme/colors';
import { useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Image, Modal, Platform, SafeAreaView, Text, TouchableOpacity, View, useWindowDimensions, StyleSheet } from 'react-native';
import LandingPage from './landing';
import { useAuthStore } from '@/features/auth/application/useAuthStore';
import { ChartToast } from '@/components/showcase/CrimChart_toast';
import { useTranslation } from '@/core/localization/i18n';
import { SignupModalWidget } from '@/signing/components/SignupModalWidget';
import { LoginModalWidget } from '@/signing/components/LoginModalWidget';
import { LinearGradient } from 'expo-linear-gradient';

const allImages = [
  require('@/assets/images/welcome-floating/avatar1.webp'),
  require('@/assets/images/welcome-floating/avatar2.webp'),
  require('@/assets/images/welcome-floating/avatar3.webp'),
  require('@/assets/images/welcome-floating/avatar4.webp'),
  require('@/assets/images/welcome-floating/album1.webp'),
  require('@/assets/images/welcome-floating/album2.webp'),
  require('@/assets/images/welcome-floating/album3.webp'),
  require('@/assets/images/welcome-floating/note_icon.webp'),
  require('@/assets/music_images/images__9_.jpg'),
  require('@/assets/music_images/images__10_.jpg'),
  require('@/assets/music_images/images__11_.jpg'),
  require('@/assets/music_images/images__12_.jpg'),
  require('@/assets/music_images/images__13_.jpg'),
  require('@/assets/music_images/images__14_.jpg'),
  require('@/assets/music_images/images__15_.jpg'),
  require('@/assets/music_images/images__16_.jpg'),
  require('@/assets/music_images/images__17_.jpg'),
  require('@/assets/music_images/images__18_.jpg'),
  require('@/assets/music_images/images__19_.jpg'),
  require('@/assets/music_images/images__20_.jpg'),
  require('@/assets/music_images/images__21_.jpg'),
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
  const { t } = useTranslation();
  const authStore = useAuthStore();

  const [activeSheet, setActiveSheet] = useState<'none' | 'getStarted' | 'login'>('none');
  const [showSignupWidget, setShowSignupWidget] = useState(false);
  const [showLoginWidget, setShowLoginWidget] = useState(false);

  // Return desktop landing page directly
  if (isDesktop) {
    return <LandingPage />;
  }

  const gap = 12;
  const numCols = 3; // Mobile only now
  // Calculate column width keeping a little bit of overflow on edges
  const colWidth = (width - gap * (numCols + 1)) / numCols;

  // Extend images to guarantee columns are tall enough on large desktop screens
  const extendedImages = [...allImages, ...allImages];
  const columns = Array.from({ length: numCols }, () => [] as any[]);
  extendedImages.forEach((img, i) => {
    columns[i % numCols].push(img);
  });

  const handleGoogleLogin = async () => {
    try {
      const success = await authStore.loginWithGoogle();
      if (success) {
        setActiveSheet('none');
        if (useAuthStore.getState().pendingGoogleOnboarding) {
          setShowSignupWidget(true);
        } else {
          router.replace('/(tabs)' as any);
        }
      } else {
        const errorMsg = useAuthStore.getState().errorMessage;
        ChartToast.showError(null, { title: t('error_title') || 'Error', message: errorMsg || 'Google login failed' });
      }
    } catch (error: any) {
      ChartToast.showError(null, { title: t('error_title') || 'Error', message: error.message || 'Google login failed' });
    }
  };

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
          opacity: 0.4
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

        {/* Foreground Content */}
        <View style={{ flex: 1, zIndex: 10 }}>
          
          {/* Top Logo */}
          <View style={{ alignItems: 'center', marginTop: 40 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Image source={require('@/assets/appicon/big-sized-app-icon.png')} style={{ width: 32, height: 32 }} resizeMode="contain" />
              <Text style={{ fontSize: 24, fontWeight: 'bold', color: colors.primary }}>crimchart</Text>
            </View>
          </View>

          <View style={{ flex: 1 }} />

          {/* Bottom Content Area */}
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.8)', '#000000']}
            style={{ width: '100%', paddingHorizontal: 24, paddingTop: 60, paddingBottom: 40, alignItems: 'center' }}
          >
            <Text style={{
              fontSize: 32,
              fontWeight: '900',
              color: colors.text,
              textAlign: 'center',
              lineHeight: 40,
              letterSpacing: -0.5,
              marginBottom: 40,
              textShadowColor: 'rgba(0,0,0,0.9)',
              textShadowOffset: { width: 0, height: 4 },
              textShadowRadius: 12
            }}>
              The most real place for sharing music
            </Text>

            {/* Buttons */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setActiveSheet('getStarted')}
              style={{
                backgroundColor: '#FFFFFF',
                paddingVertical: 16,
                paddingHorizontal: 32,
                borderRadius: 9999,
                width: '100%',
                alignItems: 'center',
                marginBottom: 16
              }}
            >
              <Text style={{ color: '#000000', fontSize: 16, fontWeight: 'bold' }}>Get Started</Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setActiveSheet('login')}
              style={{
                backgroundColor: 'transparent',
                borderColor: 'rgba(255,255,255,0.3)',
                borderWidth: 1,
                paddingVertical: 16,
                paddingHorizontal: 32,
                borderRadius: 9999,
                width: '100%',
                alignItems: 'center',
              }}
            >
              <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' }}>I already have an account</Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>

        {/* Bottom Sheets Overlay */}
        <Modal visible={activeSheet !== 'none'} transparent animationType="slide">
          <TouchableOpacity style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }} activeOpacity={1} onPress={() => setActiveSheet('none')}>
            <TouchableOpacity activeOpacity={1} style={{ backgroundColor: '#111', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24 }}>
              
              <Text style={{ fontSize: 22, fontWeight: 'bold', color: '#FFF', marginBottom: 24, textAlign: 'center' }}>
                {activeSheet === 'getStarted' ? 'Get Started' : 'Log In'}
              </Text>

              {/* Google Button */}
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handleGoogleLogin}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'transparent',
                  borderColor: 'rgba(255,255,255,0.3)',
                  borderWidth: 1,
                  paddingVertical: 16,
                  borderRadius: 9999,
                  marginBottom: 16
                }}
              >
                <Image source={{ uri: 'https://www.gstatic.com/images/branding/product/2x/googleg_96dp.png' }} style={{ width: 20, height: 20, marginRight: 12 }} />
                <Text style={{ color: '#FFF', fontSize: 16, fontWeight: 'bold' }}>Continue with Google</Text>
              </TouchableOpacity>

              {/* Email Button */}
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => {
                  setActiveSheet('none');
                  if (activeSheet === 'getStarted') {
                    setShowSignupWidget(true);
                  } else {
                    setShowLoginWidget(true);
                  }
                }}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'transparent',
                  borderColor: 'rgba(255,255,255,0.3)',
                  borderWidth: 1,
                  paddingVertical: 16,
                  borderRadius: 9999,
                  marginBottom: 24
                }}
              >
                <Text style={{ color: '#FFF', fontSize: 16, fontWeight: 'bold' }}>
                  {activeSheet === 'getStarted' ? 'Continue with email' : 'Use email or username'}
                </Text>
              </TouchableOpacity>

              <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, textAlign: 'center', marginBottom: 24, lineHeight: 18 }}>
                By continuing, you agree to our <Text style={{ fontWeight: 'bold', color: '#FFF', ...(Platform.OS === 'web' && { cursor: 'pointer' as any }) }} onPress={() => router.push('/terms')}>User Agreement</Text> and acknowledge that you understand the <Text style={{ fontWeight: 'bold', color: '#FFF', ...(Platform.OS === 'web' && { cursor: 'pointer' as any }) }} onPress={() => router.push('/privacy')}>Privacy Policy</Text>.
              </Text>

              <TouchableOpacity onPress={() => setActiveSheet('none')} style={{ alignItems: 'center', paddingVertical: 12 }}>
                <Text style={{ color: '#FFF', fontSize: 14, fontWeight: 'bold' }}>Cancel</Text>
              </TouchableOpacity>

            </TouchableOpacity>
          </TouchableOpacity>
        </Modal>

        {/* Existing Widgets for email flow fallback */}
        {showSignupWidget && (
          <SignupModalWidget 
            visible={showSignupWidget} 
            onClose={() => setShowSignupWidget(false)} 
            onGoToLogin={() => { setShowSignupWidget(false); setShowLoginWidget(true); }} 
            onFinish={() => router.replace('/(tabs)' as any)}
          />
        )}
        {showLoginWidget && (
          <LoginModalWidget 
            visible={showLoginWidget} 
            onClose={() => setShowLoginWidget(false)} 
          />
        )}

      </View>
    </SafeAreaView>
  );
}
