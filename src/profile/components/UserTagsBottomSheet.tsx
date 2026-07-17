import { useCurrentTheme } from '@/core/store/useThemeStore';
import { supabase } from '@/core/supabase/supabaseConfig';
import { ThemeTokens } from '@/core/theme/themes';
import { Tag as TagIcon, X } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Modal, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MusicTagWidget } from './tag_widgets/MusicTagWidget';

import { ImageTagWidget } from './tag_widgets/ImageTagWidget';
import { VideoTagWidget } from './tag_widgets/VideoTagWidget';

interface UserTagsBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  taggedUserId?: string;
  taggerUserId?: string;
  taggerName?: string;
  tags?: { id: string; name: string }[];
  fetchedPosts?: any[];
}

export const UserTagsBottomSheet: React.FC<UserTagsBottomSheetProps> = ({
  visible,
  onClose,
  taggedUserId,
  taggerUserId,
  taggerName,
  tags = [],
  fetchedPosts = [],
}) => {
  const theme = useCurrentTheme();
  const styles = themeStyles(theme.colors);
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width >= 768;

  if (!visible) return null;

  return (
    <Modal visible={visible} animationType="fade" transparent={true} onRequestClose={onClose}>
      <TouchableOpacity
        style={[styles.backdrop, isDesktop && { justifyContent: 'center', alignItems: 'center' }]}
        activeOpacity={1}
        onPress={onClose}
      >
        <TouchableOpacity
          activeOpacity={1}
          style={[
            styles.sheet,
            { 
              paddingBottom: isDesktop ? 20 : insets.bottom + 20,
              maxHeight: isDesktop ? '80%' : '100%',
              marginTop: isDesktop ? 0 : insets.top
            },
            isDesktop && { borderRadius: 24, width: 450, maxWidth: '90%' }
          ]}
        >
          <View style={styles.header}>
            <Text style={styles.title}>Tags from {taggerName}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X color={theme.colors.textSecondary} size={24} />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.tagsContainer}>
            {fetchedPosts.length > 0 ? (
              fetchedPosts.map((post) => {
                if (post.is_audio || post.type === 'music') {
                  return <MusicTagWidget key={post.id} post={post} />;
                }
                
                if (post.is_video || post.type === 'video') {
                  return <VideoTagWidget key={post.id} post={post} />;
                }

                // Fallback for image and other post types
                return <ImageTagWidget key={post.id} post={post} />;
              })
            ) : (
              tags.length === 0 && (
                <Text style={styles.emptyText}>No tags found.</Text>
              )
            )}
          </ScrollView>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

const themeStyles = (colors: ThemeTokens) => StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    minHeight: 350,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.background,
  },
  title: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '800',
  },
  closeBtn: {
    padding: 4,
  },
  tagsContainer: {
    flexDirection: 'column',
    paddingBottom: 20,
  },
  loaderContainer: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loaderText: {
    color: colors.textSecondary,
    marginTop: 12,
    fontSize: 14,
  },
  tagPill: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.surfaceVariant,
    marginBottom: 8,
  },
  tagText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '700',
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: 15,
    marginTop: 20,
    textAlign: 'center',
    width: '100%',
  }
});
