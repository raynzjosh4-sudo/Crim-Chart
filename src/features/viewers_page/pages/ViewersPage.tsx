import { useStyles } from "@/core/hooks/useStyles";
import { ViewersPageShimmer } from '@/components/shimmers/viewersPageShimmer/ViewersPageShimmer';
import { supabase } from '@/core/supabase/supabaseConfig';
import { useAuthStore } from '@/features/auth/application/useAuthStore';
import { useTheme } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { ViewerListTile } from '../components/ViewerListTile';
const formatTimeAgo = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  return `${weeks}w ago`;
};
export const ViewersPage = () => {
  const styles = useStyles(colors => ({
    container: {
      flex: 1
    },
    header: {
      paddingHorizontal: 16,
      paddingVertical: 20
    },
    headerText: {
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: 4
    },
    subHeaderText: {
      fontSize: 14,
      opacity: 0.6
    }
  }));
  const {
    colors
  } = useTheme();
  const user = useAuthStore(state => state.user);
  const [viewers, setViewers] = useState<Record<string, any>[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [totalViews, setTotalViews] = useState(0);
  const PAGE_SIZE = 10;
  const fetchViewers = async (pageNumber: number) => {
    if (!user?.id) return;
    try {
      // Fetch total count on the first page load
      if (pageNumber === 0) {
        const {
          data: countData
        } = await supabase.rpc('get_unique_status_viewers_count', {
          p_author_id: user.id
        });
        if (countData !== null && countData !== undefined) {
          setTotalViews(countData);
        }

        // Reset the red badge to 0 since they are viewing the page now
        supabase.from('profiles').update({
          active_status_views_count: 0
        }).eq('id', user.id).then(({
          error
        }) => {
          if (error) console.log('Error resetting badge:', error);else {
            const {
              DeviceEventEmitter
            } = require('react-native');
            DeviceEventEmitter.emit('RESET_STATUS_VIEWS', user.id);
          }
        });
      }
      const {
        data,
        error
      } = await supabase.rpc('get_unique_status_viewers', {
        p_author_id: user.id,
        p_limit: PAGE_SIZE,
        p_offset: pageNumber * PAGE_SIZE
      });
      if (error) {
        console.error('Viewers query ERROR:', JSON.stringify(error, null, 2));
        throw error;
      }
      if (data) {
        console.log(`Fetched ${data.length} unique viewers from RPC.`);
        if (pageNumber === 0) {
          setViewers(data);
        } else {
          setViewers([...viewers, ...data]);
        }
        setHasMore(data.length === PAGE_SIZE);
      }
    } catch (e) {
      console.log('Error fetching viewers catch block:', e);
    } finally {
      setIsLoading(false);
      setIsFetchingMore(false);
    }
  };
  useEffect(() => {
    fetchViewers(0);
  }, [user?.id]);
  const handleLoadMore = () => {
    if (!hasMore || isLoading || isFetchingMore) return;
    setIsFetchingMore(true);
    const nextPage = page + 1;
    setPage(nextPage);
    fetchViewers(nextPage);
  };
  if (isLoading) {
    return <SafeAreaView style={[styles.container, {
      backgroundColor: colors.background
    }]}>
        <View style={styles.header}>
          <Text style={[styles.headerText, {
          color: colors.text
        }]}>Status Viewers</Text>
        </View>
        <ViewersPageShimmer />
      </SafeAreaView>;
  }
  return <SafeAreaView style={[styles.container, {
    backgroundColor: colors.background
  }]}>
      <FlatList data={viewers} keyExtractor={(item, index) => item.id || `${item.status_id}_${item.viewer_id}_${index}`} renderItem={({
      item
    }) => <ViewerListTile userId={item.viewer_id} name={item.display_name || 'Unknown'} avatarUrl={item.profile_image_url || null} viewedAtText={item.last_viewed_at ? formatTimeAgo(item.last_viewed_at) : 'recently'} viewedStatuses={item.viewed_statuses} onPress={() => console.log(`Tapped on viewer: ${item.display_name}`)} />} ListHeaderComponent={() => <View style={styles.header}>
            <Text style={[styles.headerText, {
        color: colors.text
      }]}>Status Viewers</Text>
            <Text style={[styles.subHeaderText, {
        color: colors.text
      }]}>{totalViews} views</Text>
          </View>} onEndReached={handleLoadMore} onEndReachedThreshold={0.5} ListFooterComponent={isFetchingMore ? <ActivityIndicator style={{
      margin: 20
    }} color={colors.primary} /> : null} contentContainerStyle={{
      paddingBottom: 20
    }} ListEmptyComponent={() => <View style={{
      padding: 20,
      alignItems: 'center'
    }}>
            <Text style={{
        color: colors.text,
        opacity: 0.5
      }}>No one has viewed your status yet.</Text>
          </View>} />
    </SafeAreaView>;
};