import React, { useState, useCallback, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  SafeAreaView, FlatList, ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ChevronLeft, Search } from 'lucide-react-native';
import { useAppRouter } from '@/core/hooks/useAppRouter';
import { supabase } from '@/core/supabase/supabaseConfig';
import { ExploreItemModel, ExploreItemType } from '../models/ExploreItemModel';
import { ExploreGridItem } from '../widgets/ExploreGridItem';
import { ExploreGridSkeleton } from '@/components/skeletons/Skeletons';

export const ExplorePage: React.FC = () => {
  const navigation = useNavigation();
  const router = useAppRouter();
  const [query, setQuery] = useState('');
  const [items, setItems] = useState<ExploreItemModel[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadDiscover = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          id, caption, image_urls, is_video, video_url,
          likes_count, author_id,
          profiles:author_id(display_name, profile_image_url)
        `)
        .eq('is_video', true)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      const mapped = (data ?? []).map((row: any): ExploreItemModel => {
        const thumb = row.image_urls?.[0];
        return {
          id: row.id,
          imageUrl: thumb,
          description: row.caption,
          likes: row.likes_count ?? 0,
          type: ExploreItemType.media,
          isVideo: row.is_video,
          videoUrl: row.video_url,
          isAudio: false,
          aspectRatio: Math.random() * (1.5 - 0.7) + 0.7, // simulate masonry ratio
        };
      });
      setItems(mapped);
    } catch (e) {
      console.error('[ExplorePage]', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { loadDiscover(); }, [loadDiscover]);

  const onSearch = () => {
    // Basic search simulation
    loadDiscover();
  };

  return (
    <SafeAreaView style={styles.root}>
      {/* App Bar */}
      <View style={styles.header}>
        <TouchableOpacity activeOpacity={1} onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ChevronLeft color="#FFF" size={28} />
        </TouchableOpacity>
        <View style={styles.searchBox}>
          <Search color="rgba(255,255,255,0.5)" size={18} />
          <TextInput
            style={styles.input}
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={onSearch}
            placeholder="Search posts, users, channels..."
            placeholderTextColor="rgba(255,255,255,0.4)"
            returnKeyType="search"
          />
        </View>
        <TouchableOpacity activeOpacity={1} onPress={onSearch}>
          <Text style={styles.searchBtnText}>Search</Text>
        </TouchableOpacity>
      </View>

      {/* Grid */}
      {isLoading ? (
        <ExploreGridSkeleton />
      ) : (
        <FlatList
          data={items}
          numColumns={2}
          keyExtractor={i => i.id}
          columnWrapperStyle={styles.row}
          renderItem={({ item }) => (
            <View style={{ flex: 1, padding: 4 }}>
              <ExploreGridItem item={item} onPress={() => {}} />
            </View>
          )}
          contentContainerStyle={{ padding: 8 }}
          removeClippedSubviews={true}
          initialNumToRender={8}
          maxToRenderPerBatch={6}
          windowSize={5}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0D0D0D' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 12,
  },
  backBtn: { padding: 4 },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  input: { flex: 1, color: '#FFF', fontSize: 14, fontWeight: '600' },
  searchBtnText: { color: '#FFF', fontWeight: '900', fontSize: 14 },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  row: { gap: 4 },
});
