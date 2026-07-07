import ChartAppBar from '@/components/chartappbar/ChartAppBar';
import { Draft, useDraftStore } from '@/core/store/useDraftStore';
import { useCurrentTheme } from '@/core/store/useThemeStore';
import { useRouter } from 'expo-router';
import { FileText, Music, Trash2, Video } from 'lucide-react-native';
import { useEffect, useMemo } from 'react';
import { FlatList, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';

export const DraftsPage = () => {
  const router = useRouter();
  const { drafts, loadDrafts, deleteDraft } = useDraftStore();
  const theme = useCurrentTheme();
  const colors = theme.colors;
  const layout = useWindowDimensions();

  const styles = useMemo(() => createStyles(colors, layout), [colors, layout]);

  useEffect(() => {
    loadDrafts();
  }, []);

  const handleOpenDraft = (draft: Draft) => {
    router.push({
      pathname: '/finalize-post',
      params: {
        selectedMediaJson: JSON.stringify(draft.media),
        initialCaption: draft.text,
        draftId: draft.id,
        isChannelPost: draft.post_type === 'channel' ? 'true' : undefined,
        isChannelStatus: draft.post_type === 'channel_status' ? 'true' : undefined,
        isChannelMoment: draft.post_type === 'channel_moment' ? 'true' : undefined,
        isGlobalStatus: draft.post_type === 'status' ? 'true' : undefined,
        isManifestoContext: draft.post_type === 'manifesto' ? 'true' : undefined,
      }
    });
  };

  const renderDraft = ({ item }: { item: Draft }) => {
    const mediaCount = item.media?.length || 0;
    const hasMedia = mediaCount > 0;

    return (
      <TouchableOpacity
        style={styles.draftCard}
        activeOpacity={0.9}
        onPress={() => handleOpenDraft(item)}
      >
        {/* Caption Header */}
        {Boolean(item.text) && (
          <Text style={styles.captionText} numberOfLines={3}>
            {item.text}
          </Text>
        )}

        {/* Media Row */}
        {hasMedia ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.mediaScroll}>
            {item.media.map((mediaItem: any, index: number) => {
              const isAudio = mediaItem.type === 'audio';
              const mediaUri = mediaItem.thumbnailUrl || mediaItem.path;

              return (
                <View key={index} style={styles.mediaItemContainer}>
                  {!isAudio ? (
                    <Image source={{ uri: mediaUri }} style={styles.mediaItemImage} />
                  ) : (
                    <View style={[styles.mediaItemImage, styles.placeholderThumbnail]}>
                      <Music color={colors.textSecondary} size={32} style={{ marginBottom: 8 }} />
                      <Text style={styles.placeholderText} numberOfLines={2}>
                        {mediaItem.title || 'Audio Draft'}
                      </Text>
                    </View>
                  )}
                  {mediaItem.type === 'video' && (
                    <View style={styles.videoIconOverlay}>
                      <Video color="#FFF" size={24} />
                    </View>
                  )}
                </View>
              );
            })}
          </ScrollView>
        ) : (
          <View style={styles.emptyMediaSpace}>
            <Text style={styles.placeholderText}>Text-only draft</Text>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footerRow}>
          <Text style={styles.dateText}>
            {new Date(item.created_at).toLocaleDateString()}
          </Text>
          <TouchableOpacity
            style={styles.deleteBtn}
            onPress={() => deleteDraft(item.id)}
            hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
          >
            <Trash2 color={colors.error || "#FF4444"} size={20} />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.root}>
      <ChartAppBar
        title="Drafts"
        onBack={() => router.back()}
      />
      <FlatList
        data={drafts}
        keyExtractor={(item) => item.id}
        renderItem={renderDraft}
        numColumns={1}
        contentContainerStyle={styles.listContainer}
        ItemSeparatorComponent={() => <View style={styles.divider} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <FileText color={colors.textSecondary} size={48} style={{ marginBottom: 16, opacity: 0.5 }} />
            <Text style={styles.emptyText}>No saved drafts yet.</Text>
          </View>
        }
      />
    </View>
  );
};



const createStyles = (colors: any, layout: any) => StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  listContainer: { paddingBottom: 40 },
  draftCard: {
    paddingVertical: 16,
  },
  divider: {
    height: 1,
    backgroundColor: colors.surfaceVariant,
  },
  captionText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  mediaScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  mediaItemContainer: {
    width: layout.width * 0.5,
    aspectRatio: 0.75,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: colors.surfaceVariant || '#2A2A2A',
  },
  mediaItemImage: {
    ...StyleSheet.absoluteFillObject,
    resizeMode: 'cover',
  },
  placeholderThumbnail: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
    backgroundColor: colors.surfaceVariant,
  },
  placeholderText: {
    color: colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
  },
  videoIconOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  emptyMediaSpace: {
    height: 80,
    borderRadius: 12,
    backgroundColor: colors.surfaceVariant,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    marginHorizontal: 16,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    paddingHorizontal: 16,
  },
  dateText: {
    color: colors.textSecondary,
    fontSize: 13,
  },
  deleteBtn: {
    padding: 4,
  },
  emptyContainer: {
    paddingTop: '40%',
    alignItems: 'center',
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: 16,
    fontWeight: '500',
  }
});
