import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Animated, Platform } from 'react-native';
import Markdown from 'react-native-markdown-display';
import { supabase } from '../core/supabase/supabaseConfig';
import { colors } from '../core/theme/colors';
import { SafeAreaView } from 'react-native-safe-area-context';
import ChartAppBar from '@/components/chartappbar/ChartAppBar';
import { useRouter } from 'expo-router';

const DocumentSkeleton = () => {
  const pulseAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.7,
          duration: 800,
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: Platform.OS !== 'web',
        }),
      ])
    ).start();
  }, [pulseAnim]);

  return (
    <View style={{ padding: 20, width: '100%', maxWidth: 800, alignSelf: 'center' }}>
      <Animated.View style={{ height: 32, width: '60%', backgroundColor: '#2A2A2A', borderRadius: 6, marginBottom: 24, opacity: pulseAnim }} />
      <Animated.View style={{ height: 16, width: '100%', backgroundColor: '#1A1A1A', borderRadius: 4, marginBottom: 12, opacity: pulseAnim }} />
      <Animated.View style={{ height: 16, width: '90%', backgroundColor: '#1A1A1A', borderRadius: 4, marginBottom: 12, opacity: pulseAnim }} />
      <Animated.View style={{ height: 16, width: '95%', backgroundColor: '#1A1A1A', borderRadius: 4, marginBottom: 12, opacity: pulseAnim }} />
      <Animated.View style={{ height: 16, width: '80%', backgroundColor: '#1A1A1A', borderRadius: 4, marginBottom: 32, opacity: pulseAnim }} />
      
      <Animated.View style={{ height: 24, width: '40%', backgroundColor: '#2A2A2A', borderRadius: 6, marginBottom: 16, opacity: pulseAnim }} />
      <Animated.View style={{ height: 16, width: '100%', backgroundColor: '#1A1A1A', borderRadius: 4, marginBottom: 12, opacity: pulseAnim }} />
      <Animated.View style={{ height: 16, width: '85%', backgroundColor: '#1A1A1A', borderRadius: 4, marginBottom: 12, opacity: pulseAnim }} />
      <Animated.View style={{ height: 16, width: '90%', backgroundColor: '#1A1A1A', borderRadius: 4, marginBottom: 12, opacity: pulseAnim }} />
    </View>
  );
};

export default function DocumentViewer({ documentType }: { documentType: string }) {
  const [content, setContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function fetchDoc() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('legal_documents')
          .select('content')
          .eq('document_type', documentType)
          .eq('is_active', true)
          .single();

        if (error) throw error;
        if (data) setContent(data.content);
      } catch (e: any) {
        setError(e.message || 'Failed to load document.');
      } finally {
        setLoading(false);
      }
    }
    fetchDoc();
  }, [documentType]);

  const title = documentType === 'terms_of_service' ? 'Terms of Service' : documentType === 'privacy_policy' ? 'Privacy Policy' : 'Document';

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
      <ChartAppBar 
        title={title} 
        onBack={() => {
          if (router.canGoBack()) {
            router.back();
          } else {
            router.replace('/');
          }
        }} 
        showBorder 
        backgroundColor={colors.background} 
      />
      <View style={styles.container}>
        {loading ? (
          <DocumentSkeleton />
        ) : error || !content ? (
          <View style={[styles.center, { backgroundColor: colors.background }]}>
            <Text style={{ color: colors.error || 'red' }}>{error || 'Document not found.'}</Text>
          </View>
        ) : (
          <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 60 }}>
            <View style={{ width: '100%', maxWidth: 800, alignSelf: 'center' }}>
              <Markdown
                style={{
                  body: { color: colors.text, fontSize: 16, lineHeight: 24, padding: 20 },
                  heading1: { color: colors.primary, fontSize: 32, fontWeight: 'bold', marginBottom: 16 },
                  heading2: { color: colors.primary, fontSize: 24, fontWeight: 'bold', marginTop: 24, marginBottom: 12 },
                  heading3: { color: colors.text, fontSize: 20, fontWeight: 'bold', marginTop: 16, marginBottom: 8 },
                  paragraph: { marginBottom: 16 },
                  list_item: { marginBottom: 8, color: colors.text },
                  bullet_list: { marginBottom: 16 },
                  link: { color: colors.primary, textDecorationLine: 'underline' },
                }}
              >
                {content}
              </Markdown>
            </View>
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
