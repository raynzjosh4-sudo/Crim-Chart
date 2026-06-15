import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { Plus } from 'lucide-react-native';
import { BoxCard, BoxModel } from './BoxCard';
import { VisibilityBoxTrackerWrapper } from '@/components/wrappers/VisibilityBoxTrackerWrapper';
import { CreateBoxSheet } from './CreateBoxSheet';
import { useRouter } from 'expo-router';
import { supabase } from '@/core/supabase/supabaseConfig';
import { useBoxStore } from '../application/useBoxStore';
import { BoxCardShimmer } from '@/components/shimmers/BoxCardShimmer';

interface UserBoxesWidgetProps {
  userId?: string;
  isCurrentUser: boolean;
}

const LIMIT = 10;

export const UserBoxesWidget: React.FC<UserBoxesWidgetProps> = ({ userId, isCurrentUser }) => {
  const router = useRouter();
  const [isCreateSheetVisible, setCreateSheetVisible] = useState(false);
  
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);

  const boxes = useBoxStore(state => userId ? state.boxesByUserId[userId] : []) || [];
  const isLoading = useBoxStore(state => userId ? state.isLoadingByUserId[userId] : false) || false;
  const setBoxes = useBoxStore(state => state.setBoxes);
  const setLoading = useBoxStore(state => state.setLoading);

  const fetchBoxes = useCallback(async (isLoadMore = false) => {
    if (!userId) return;
    
    const currentPage = isLoadMore ? page + 1 : 0;
    const from = currentPage * LIMIT;
    const to = from + LIMIT - 1;

    if (!isLoadMore) {
      setLoading(userId, true);
    } else {
      setIsFetchingMore(true);
    }

    try {
      const { data, error } = await supabase
        .from('boxes')
        .select('id, title, box_type, metadata, is_public, allow_submissions, age_restriction, country_restrictions, visible_to_followed_users')
        .eq('owner_id', userId)
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) throw error;

      const mappedBoxes: BoxModel[] = (data || []).map(row => {
        let mappedType = row.box_type;
        if (mappedType === 'audio') mappedType = 'music';
        if (mappedType === 'video') mappedType = 'movie';
        if (mappedType === 'marketplace') mappedType = 'store';
        if (mappedType === 'contest') mappedType = 'voting';

        return {
          id: row.id,
          title: row.title,
          boxType: mappedType as any,
          coverImageUrl: row.metadata?.coverImageUrl,
          itemCount: 0, // Real item count requires a join/aggregation
          isPublic: row.is_public ?? true,
          allowSubmissions: row.allow_submissions ?? true,
          ageRestriction: row.age_restriction || 'All Ages',
          countryRestrictions: row.country_restrictions || ['Global'],
          visibleToFollowedUsers: row.visible_to_followed_users ?? true
        };
      });

      if (isLoadMore) {
        setBoxes(userId, [...boxes, ...mappedBoxes]);
        setPage(currentPage);
      } else {
        setBoxes(userId, mappedBoxes);
        setPage(0);
      }
      
      setHasMore(mappedBoxes.length === LIMIT);
    } catch (err) {
      console.error('[UserBoxesWidget] Failed to fetch boxes:', err);
    } finally {
      if (!isLoadMore) setLoading(userId, false);
      else setIsFetchingMore(false);
    }
  }, [userId, page, boxes, setBoxes, setLoading]);

  useEffect(() => {
    fetchBoxes(false);
  }, [userId]); // Intentionally not including fetchBoxes to avoid loops

  const handleLoadMore = () => {
    if (!hasMore || isFetchingMore || isLoading) return;
    fetchBoxes(true);
  };

  const handleCreateBox = () => {
    setCreateSheetVisible(true);
  };

  const handleBoxPress = (box: BoxModel) => {
    switch (box.boxType) {
      case 'music': router.push(`/music-box/${box.id}` as any); break;
      case 'movie': router.push(`/movie-box/${box.id}` as any); break;
      case 'store': router.push(`/store-box/${box.id}` as any); break;
      case 'sports': router.push(`/sports-box/${box.id}` as any); break;
      case 'voting': router.push(`/voting-box/${box.id}` as any); break;
    }
  };

  if (!isCurrentUser && boxes.length === 0 && !isLoading) {
    return null;
  }

  const renderHeader = () => {
    if (isCurrentUser) {
      return (
        <TouchableOpacity 
          style={styles.createButtonContainer} 
          activeOpacity={0.7}
          onPress={handleCreateBox}
        >
          <View style={styles.createButtonInner}>
            <Plus color="#FFF" size={32} />
          </View>
          <Text style={styles.createButtonText}>Create Box</Text>
        </TouchableOpacity>
      );
    }
    return null;
  };

  const renderFooter = () => {
    if (isLoading && boxes.length === 0) {
      return (
        <View style={{ flexDirection: 'row' }}>
          <BoxCardShimmer />
          <BoxCardShimmer />
          <BoxCardShimmer />
        </View>
      );
    }
    if (isFetchingMore) {
      return <BoxCardShimmer />;
    }
    return null;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Curated Boxes</Text>
      
      <FlatList 
        data={boxes}
        keyExtractor={item => item.id}
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        ListHeaderComponent={renderHeader}
        renderItem={({ item }) => (
          <VisibilityBoxTrackerWrapper box={item} isCurrentUser={isCurrentUser} actionType="view_box">
            <BoxCard 
              box={item} 
              onPress={handleBoxPress}
            />
          </VisibilityBoxTrackerWrapper>
        )}
        ListFooterComponent={renderFooter}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        initialNumToRender={5}
      />

      <CreateBoxSheet 
        visible={isCreateSheetVisible}
        onClose={() => setCreateSheetVisible(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  headerTitle: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '900',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  createButtonContainer: {
    width: 140,
    marginRight: 12,
    alignItems: 'center',
  },
  createButtonInner: {
    width: 140,
    height: 140,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.2)',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  createButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '800',
    marginTop: 10,
  },
});
