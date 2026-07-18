import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, ScrollView } from 'react-native';
import Markdown from 'react-native-markdown-display';
import { supabase } from '../core/supabase/supabaseConfig';
import { colors } from '../core/theme/colors';

export default function DocumentViewer({ documentType }: { documentType: string }) {
  const [content, setContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error || !content) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.error || 'red' }}>{error || 'Document not found.'}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <Markdown
        style={{
          body: { color: colors.text, fontSize: 16, lineHeight: 24, padding: 20 },
          heading1: { color: colors.primary, fontSize: 32, fontWeight: 'bold', marginBottom: 16 },
          heading2: { color: colors.primary, fontSize: 24, fontWeight: 'bold', marginTop: 24, marginBottom: 12 },
          heading3: { color: colors.text, fontSize: 20, fontWeight: 'bold', marginTop: 16, marginBottom: 8 },
          paragraph: { marginBottom: 16 },
          list_item: { marginBottom: 8 },
          bullet_list: { marginBottom: 16 },
          link: { color: colors.primary, textDecorationLine: 'underline' },
        }}
      >
        {content}
      </Markdown>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
