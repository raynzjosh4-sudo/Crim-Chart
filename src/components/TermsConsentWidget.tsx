import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { X } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { Platform, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const TermsConsentWidget = () => {
  const [visible, setVisible] = useState(false);
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  useEffect(() => {
    const checkConsent = async () => {
      try {
        const consent = await AsyncStorage.getItem('crimchart_terms_consent');
        if (!consent) {
          setVisible(true);
        }
      } catch (e) {
        // Ignore errors
      }
    };
    checkConsent();
  }, []);

  if (!visible) return null;

  const handleAccept = async () => {
    try {
      await AsyncStorage.setItem('crimchart_terms_consent', 'true');
      setVisible(false);
    } catch (e) {
      // Ignore errors
    }
  };

  const handleDismiss = () => {
    setVisible(false);
  };

  return (
    <View style={[
      {
        position: 'absolute',
        backgroundColor: '#111',
        zIndex: 99999,
        elevation: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
      },
      isDesktop ? {
        bottom: 24,
        left: 24,
        width: 360,
        borderRadius: 16,
        padding: 20,
        borderWidth: 1,
        borderColor: '#333',
      } : {
        bottom: 0,
        left: 0,
        right: 0,
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: Math.max(insets.bottom, 20),
        borderTopWidth: 1,
        borderTopColor: '#333',
      }
    ]}>
      <TouchableOpacity 
        style={{ position: 'absolute', top: 12, right: 12, zIndex: 2, padding: 4, ...(Platform.OS === 'web' && { cursor: 'pointer' as any }) }}
        activeOpacity={0.7}
        onPress={handleDismiss}
      >
        <X size={18} color="#999" />
      </TouchableOpacity>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 16, alignItems: 'center', marginTop: 4, paddingRight: 24 }}>
        <Text style={{ color: '#ccc', fontSize: 13, lineHeight: 20 }}>By continuing to use Crimchart, you agree to our </Text>
        <TouchableOpacity activeOpacity={0.7} onPress={() => router.push('/terms')}>
          <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 13, lineHeight: 20, textDecorationLine: 'underline', ...(Platform.OS === 'web' && { cursor: 'pointer' as any }) }}>
            Terms of Service
          </Text>
        </TouchableOpacity>
        <Text style={{ color: '#ccc', fontSize: 13, lineHeight: 20 }}> and </Text>
        <TouchableOpacity activeOpacity={0.7} onPress={() => router.push('/privacy')}>
          <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 13, lineHeight: 20, textDecorationLine: 'underline', ...(Platform.OS === 'web' && { cursor: 'pointer' as any }) }}>
            Privacy Policy
          </Text>
        </TouchableOpacity>
        <Text style={{ color: '#ccc', fontSize: 13, lineHeight: 20 }}>.</Text>
      </View>

      <TouchableOpacity
        onPress={handleAccept}
        activeOpacity={0.8}
        style={{
          backgroundColor: '#FFD700', // primary theme color
          paddingVertical: 12,
          borderRadius: 9999,
          alignItems: 'center',
          ...(Platform.OS === 'web' && { cursor: 'pointer' as any })
        }}
      >
        <Text style={{ color: '#000', fontWeight: 'bold', fontSize: 15 }}>I Agree</Text>
      </TouchableOpacity>
    </View>
  );
};
