import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Platform, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const TermsConsentWidget = () => {
  const [visible, setVisible] = useState(false);
  const router = useRouter();
  const insets = useSafeAreaInsets();

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

  return (
    <View style={{
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: '#111',
      paddingHorizontal: 20,
      paddingTop: 20,
      paddingBottom: Math.max(insets.bottom, 20),
      borderTopWidth: 1,
      borderTopColor: '#333',
      zIndex: 99999,
      elevation: 20,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: -4 },
      shadowOpacity: 0.3,
      shadowRadius: 12,
    }}>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 16, alignItems: 'center' }}>
        <Text style={{ color: '#ccc', fontSize: 14, lineHeight: 22 }}>By continuing to use Crimchart, you agree to our </Text>
        <TouchableOpacity activeOpacity={0.7} onPress={() => router.push('/terms')}>
          <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 14, lineHeight: 22, textDecorationLine: 'underline', ...(Platform.OS === 'web' && { cursor: 'pointer' as any }) }}>
            Terms of Service
          </Text>
        </TouchableOpacity>
        <Text style={{ color: '#ccc', fontSize: 14, lineHeight: 22 }}> and </Text>
        <TouchableOpacity activeOpacity={0.7} onPress={() => router.push('/privacy')}>
          <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 14, lineHeight: 22, textDecorationLine: 'underline', ...(Platform.OS === 'web' && { cursor: 'pointer' as any }) }}>
            Privacy Policy
          </Text>
        </TouchableOpacity>
        <Text style={{ color: '#ccc', fontSize: 14, lineHeight: 22 }}>.</Text>
      </View>

      <TouchableOpacity
        onPress={handleAccept}
        activeOpacity={0.8}
        style={{
          backgroundColor: '#FFD700', // primary theme color
          paddingVertical: 14,
          borderRadius: 9999,
          alignItems: 'center'
        }}
      >
        <Text style={{ color: '#000', fontWeight: 'bold', fontSize: 16 }}>I Agree</Text>
      </TouchableOpacity>
    </View>
  );
};
