import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { AlertTriangle, X } from 'lucide-react-native';
import ChartAppBar from '@/components/chartappbar/ChartAppBar';
import { useAppTheme } from '@/core/theme/app_theme';
import { useGuestFeed } from '@/features/feed/application/useGuestFeed';
import { GuestArtistRow as GuestArtistRowModel } from '@/features/feed/data/sources/FeedRemoteSource';
import { GuestArtistRow } from '../components/guest/GuestArtistRow';
import { GuestFeedSkeletonRow } from '../components/guest/GuestFeedSkeletonRow';

const SKELETON_COUNT = 4;

export function GuestFeedPage() {
  const { colors } = useAppTheme();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width >= 768;

  const { artists, isLoading, error, load } = useGuestFeed();
  const [showBanner, setShowBanner] = useState(true);

  useEffect(() => {
    load();
  }, []);

  const renderArtistRow = ({ item }: { item: GuestArtistRowModel }) => (
    <GuestArtistRow artist={item} />
  );

  const renderEmpty = () => {
    if (isLoading) return null;
    return (
      <View style={styles.emptyContainer}>
        <Text style={[styles.emptyText, { color: colors.textSecondary ?? 'rgba(255,255,255,0.5)' }]}>
          {error ? 'Failed to load music. Check your connection.' : 'No music found yet.'}
        </Text>
      </View>
    );
  };

  const renderSkeletons = () => (
    <View style={{ paddingTop: 16 }}>
      {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
        <GuestFeedSkeletonRow key={i} />
      ))}
    </View>
  );

  const content = (
    <View style={[styles.flex, { backgroundColor: colors.background }]}>
      <ChartAppBar title="Discover Music" showBack={false} />

      {/* Compact Vault & Feed CTA banner */}
      {showBanner && (
        <View style={[styles.compactBanner, { backgroundColor: colors.primary + '11' }]}>
          <TouchableOpacity onPress={() => setShowBanner(false)} style={styles.compactBannerClose}>
            <X size={16} color={colors.textSecondary || 'rgba(255,255,255,0.5)'} />
          </TouchableOpacity>
          <View style={styles.compactBannerContent}>
            <Text style={[styles.compactBannerTitle, { color: colors.primary }]}>
              Create your Digital Music Vault
            </Text>
            <Text style={[styles.compactBannerDesc, { color: colors.text }]}>
              Never lose your music. Save your favourite tracks forever, share them with friends, and unlock a personalised feed.
            </Text>
            <TouchableOpacity 
              activeOpacity={0.8} 
              onPress={() => router.push('/welcome' as any)}
              style={[styles.compactBannerBtn, { backgroundColor: colors.primary }]}
            >
              <Text style={styles.compactBannerBtnText}>Sign Up / Try it</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {isLoading ? (
        renderSkeletons()
      ) : (
        <FlatList
          data={artists}
          keyExtractor={(item) => item.authorId}
          renderItem={renderArtistRow}
          ListEmptyComponent={renderEmpty}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          // Avoid nesting FlatList VirtualizedLists warning
          removeClippedSubviews={Platform.OS !== 'web'}
        />
      )}
    </View>
  );

  // On desktop, center content in a max-width container
  if (isDesktop) {
    return (
      <View style={[styles.flex, { backgroundColor: colors.background }]}>
        <View style={styles.desktopWrapper}>
          {content}
        </View>
      </View>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  compactBanner: {
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 4,
    borderRadius: 12,
    overflow: 'hidden',
  },
  compactBannerClose: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 10,
    padding: 6,
  },
  compactBannerContent: {
    padding: 14,
  },
  compactBannerTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
    paddingRight: 20,
  },
  compactBannerDesc: {
    fontSize: 13,
    lineHeight: 18,
    opacity: 0.85,
    marginBottom: 12,
  },
  compactBannerBtn: {
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 999,
  },
  compactBannerBtnText: {
    color: '#000',
    fontWeight: '700',
    fontSize: 12,
  },
  listContent: {
    paddingTop: 20,
    paddingBottom: 40,
  },
  emptyContainer: {
    marginTop: 80,
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
  },
  desktopWrapper: {
    flex: 1,
    maxWidth: 680,
    alignSelf: 'center',
    width: '100%',
  },
});
