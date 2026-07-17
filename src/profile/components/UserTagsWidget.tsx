import { useCurrentTheme } from '@/core/store/useThemeStore';
import { ThemeTokens } from '@/core/theme/themes';
import { ChevronDown, ChevronUp, Tag as TagIcon } from 'lucide-react-native';
import { useState } from 'react';
import { FlatList, Image, LayoutAnimation, Platform, StyleSheet, Text, TouchableOpacity, UIManager, View } from 'react-native';
import { UserTagsBottomSheet } from './UserTagsBottomSheet';

import { useGlobalProgress } from '@/components/globalProgressBar/GlobalProgressBar';
import { supabase } from '@/core/supabase/supabaseConfig';
import { CrimChartUserModel, UserTagGroup } from '../models/CrimChartUserModel';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface UserTagsWidgetProps {
  userId?: string;
  isCurrentUser: boolean;
  userData?: CrimChartUserModel | null;
}

export const UserTagsWidget: React.FC<UserTagsWidgetProps> = ({ userId, isCurrentUser, userData }) => {
  const theme = useCurrentTheme();
  const styles = themeStyles(theme.colors);

  const [selectedTagger, setSelectedTagger] = useState<UserTagGroup | null>(null);
  const [fetchedPosts, setFetchedPosts] = useState<any[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const { startLoading, stopLoading } = useGlobalProgress();

  const taggers = userData?.receivedTags || [];

  if (taggers.length === 0) {
    if (isCurrentUser) {
      return (
        <View style={styles.container}>
          <Text style={styles.headerTitle}>Tagged By</Text>
          <Text style={styles.emptyText}>You haven't been tagged by anyone yet.</Text>
        </View>
      );
    }
    return null;
  }

  const toggleExpand = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsExpanded(!isExpanded);
  };

  const handleTaggerPress = async (item: UserTagGroup) => {
    startLoading();
    try {
      const postIds = item.tags.map(t => t.id);
      const { data, error } = await supabase.rpc('get_tagged_posts_v2', {
        p_post_ids: postIds
      });
      if (error) {
        console.error('Error fetching tagged posts:', error);
      } else if (data) {
        const orderedData = postIds.map(id => data.find((d: any) => d.id === id)).filter(Boolean);
        setFetchedPosts(orderedData);
      }
      setSelectedTagger(item);
    } catch (e) {
      console.error('Failed to fetch tagged posts', e);
    } finally {
      stopLoading();
    }
  };

  const renderTagger = ({ item }: { item: UserTagGroup }) => (
    <TouchableOpacity
      activeOpacity={0.8}
      style={styles.avatarContainer}
      onPress={() => handleTaggerPress(item)}
    >
      <Image source={{ uri: item.taggerAvatar }} style={styles.avatar} />
      <View style={styles.tagBadge}>
        <TagIcon color={theme.colors.background} size={10} />
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.headerRow}
        activeOpacity={0.7}
        onPress={toggleExpand}
      >
        <Text style={styles.headerTitle}>Tagged By</Text>
        {isExpanded ? (
          <ChevronUp color={theme.colors.textSecondary} size={20} />
        ) : (
          <ChevronDown color={theme.colors.textSecondary} size={20} />
        )}
      </TouchableOpacity>

      {isExpanded && (
        <FlatList
          data={taggers}
          keyExtractor={item => item.taggerId}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          renderItem={renderTagger}
        />
      )}

      <UserTagsBottomSheet
        visible={!!selectedTagger}
        onClose={() => setSelectedTagger(null)}
        taggedUserId={userId}
        taggerUserId={selectedTagger?.taggerId}
        taggerName={selectedTagger?.taggerName}
        tags={selectedTagger?.tags || []}
        fetchedPosts={fetchedPosts}
      />
    </View>
  );
};

const themeStyles = (colors: ThemeTokens) => StyleSheet.create({
  container: {
    marginTop: 8,
    marginBottom: 8,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  headerTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '900',
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: 14,
    paddingHorizontal: 20,
    fontStyle: 'italic',
  },
  scrollContent: {
    paddingHorizontal: 20,
    gap: 12,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 4,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.background,
  },
  tagBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: colors.primary,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.background,
  }
});
