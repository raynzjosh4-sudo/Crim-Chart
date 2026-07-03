import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, Text, ActivityIndicator, DeviceEventEmitter, Dimensions } from 'react-native';
import { supabase } from '@/core/supabase/supabaseConfig';
import { SmartPostWidget } from '@/mainFeed/pages/main_page_widgets/SmartPostWidget';
import { VideoPostFeedCard } from '@/mainFeed/pages/main_page_widgets/VideoPostFeedCard';

interface PostsProfileTabProps {
  userId?: string;
  userData?: any;
}

export const PostsProfileTab: React.FC<PostsProfileTabProps> = ({ userId }) => {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activePostId, setActivePostId] = useState<string | null>(null);
  
  const itemLayouts = useRef<{ [key: string]: { y: number; height: number } }>({});
  const windowHeight = Dimensions.get('window').height;

  useEffect(() => {
    if (!userId) return;

    const fetchPosts = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('posts')
          .select('id, created_at, type, is_video')
          .eq('author_id', userId)
          .order('created_at', { ascending: false })
          .limit(10);

        if (error) throw error;
        
        if (data) {
          setPosts(data);
          if (data.length > 0) setActivePostId(data[0].id); // Default first item
        }
      } catch (error) {
        console.error('Error fetching user posts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [userId]);

  useEffect(() => {
    const sub = DeviceEventEmitter.addListener('profileScroll', (scrollY: number) => {
      // Find the post closest to the center of the viewport
      const viewportCenter = scrollY + (windowHeight / 2);
      
      let closestId: string | null = null;
      let minDistance = Infinity;

      Object.entries(itemLayouts.current).forEach(([id, layout]) => {
        // Since we are measuring relative to the PostsProfileTab, 
        // we need to offset it. Assuming the profile header is roughly 350px tall.
        const headerOffset = 350; 
        const itemCenter = layout.y + headerOffset + (layout.height / 2);
        const distance = Math.abs(viewportCenter - itemCenter);
        
        if (distance < minDistance) {
          minDistance = distance;
          closestId = id;
        }
      });

      if (closestId && closestId !== activePostId) {
        setActivePostId(closestId);
      }
    });

    return () => sub.remove();
  }, [windowHeight, activePostId]);

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator color="#FACD11" />
      </View>
    );
  }

  if (posts.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.emptyText}>No posts yet</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {posts.map(post => {
        const isVideo = post.is_video || post.type?.includes('video');
        const isActive = post.id === activePostId;

        return (
          <View 
            key={post.id} 
            style={styles.cardContainer}
            onLayout={(e) => {
              itemLayouts.current[post.id] = {
                y: e.nativeEvent.layout.y,
                height: e.nativeEvent.layout.height
              };
            }}
          >
            {isVideo ? (
              <VideoPostFeedCard 
                postId={post.id} 
                entityType={post.type === 'short_video_post' ? 'short_video_post' : 'long_video_post'} 
                isActive={isActive} 
              />
            ) : (
              <SmartPostWidget 
                postId={post.id} 
                entityType="socialPost"
                sourceType="post"
                isActive={isActive} 
              />
            )}
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 8,
  },
  cardContainer: {
    marginBottom: 16,
  },
  centerContainer: {
    paddingTop: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 14,
    fontWeight: '600',
  }
});
