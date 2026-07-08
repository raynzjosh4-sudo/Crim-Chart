import { Search } from 'lucide-react-native';
import React, { useState, useRef } from 'react';
import { Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, useColorScheme, useWindowDimensions, View } from 'react-native';
import { useSearchMusic } from '../../hooks/useSearchMusic';
import { useTopLikedMusic } from '../../hooks/useTopLikedMusic';
import { TopRatedCard, TopRatedCardShimmer } from './TopRatedCard';

export function TabsLayer() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const isWeb = Platform.OS === 'web';
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { height } = useWindowDimensions();

  // Hooks
  const { tracks: topTracks, isLoading: isLoadingTop } = useTopLikedMusic();
  const { tracks: searchTracks, isLoading: isLoadingSearch } = useSearchMusic(searchQuery);
  const topScrollRef = useRef<ScrollView | null>(null);
  const searchScrollRef = useRef<ScrollView | null>(null);

  // Git Theme Colors
  const bgColor = isDark ? '#0d1117' : '#f6f8fa';
  const textColor = isDark ? '#c9d1d9' : '#24292f';
  const inputBgColor = isDark ? '#161b22' : '#ffffff';
  const inputBorderColor = isDark ? '#30363d' : '#d0d7de';
  const primaryColor = isDark ? '#238636' : '#2da44e'; // Git green button

  // Determine if search is active
  const isSearchActive = isFocused || searchQuery.trim().length > 0;

  return (
    <View style={[
      styles.container,
      { backgroundColor: bgColor },
      isWeb ? { minHeight: height } : {}
    ]}>
      <Text style={[styles.title, { color: textColor }]}>What do you want to listen to?</Text>

      <View style={styles.searchContainer}>
        <View style={[styles.searchBox, { backgroundColor: inputBgColor, borderColor: inputBorderColor, borderWidth: 1 }]}>
          <Search size={22} color={isDark ? '#8b949e' : '#57606a'} style={styles.searchIcon} />
          <TextInput
            style={[styles.searchInput, { color: textColor }]}
            placeholder="Search for music, artists, or channels..."
            placeholderTextColor={isDark ? '#8b949e' : '#57606a'}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
          />
          <TouchableOpacity style={[styles.searchButton, { backgroundColor: primaryColor }]}>
            <Text style={styles.searchButtonText}>Search</Text>
          </TouchableOpacity>
        </View>
      </View>

      {(!isFocused && searchQuery.trim().length === 0) ? (
        <View style={styles.topRatedSection}>
          <Text style={[styles.sectionSubtitle, { color: textColor }]}>Top Rated & Most Liked</Text>
          
          <View style={styles.scrollWrapper}>
            {isWeb && topTracks.length > 0 && (
              <TouchableOpacity 
                style={[styles.scrollArrow, styles.scrollArrowLeft]} 
                onPress={() => topScrollRef.current?.scrollTo({ x: 0, animated: true })}
                activeOpacity={0.7}
              >
                <Text style={styles.scrollArrowText}>{'<'}</Text>
              </TouchableOpacity>
            )}

            <ScrollView
              ref={topScrollRef}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.cardsScroll}
            >
              {isLoadingTop ? (
                <>
                  <TopRatedCardShimmer />
                  <TopRatedCardShimmer />
                  <TopRatedCardShimmer />
                  <TopRatedCardShimmer />
                </>
              ) : (
                topTracks.map((track) => (
                  <TopRatedCard key={track.id} track={track} />
                ))
              )}
            </ScrollView>

            {isWeb && topTracks.length > 0 && (
              <TouchableOpacity 
                style={[styles.scrollArrow, styles.scrollArrowRight]} 
                onPress={() => topScrollRef.current?.scrollToEnd({ animated: true })}
                activeOpacity={0.7}
              >
                <Text style={styles.scrollArrowText}>{'>'}</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      ) : (
        <View style={styles.searchResultsSection}>
          <Text style={[styles.sectionSubtitle, { color: textColor }]}>
            {searchQuery.trim().length > 0 ? `Search results for "${searchQuery}"` : 'Type to search...'}
          </Text>

          {isLoadingSearch ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.cardsScroll}
            >
              <TopRatedCardShimmer />
              <TopRatedCardShimmer />
              <TopRatedCardShimmer />
              <TopRatedCardShimmer />
            </ScrollView>
          ) : searchTracks.length > 0 ? (
            <View style={styles.scrollWrapper}>
              {isWeb && (
                <TouchableOpacity 
                  style={[styles.scrollArrow, styles.scrollArrowLeft]} 
                  onPress={() => searchScrollRef.current?.scrollTo({ x: 0, animated: true })}
                  activeOpacity={0.7}
                >
                  <Text style={styles.scrollArrowText}>{'<'}</Text>
                </TouchableOpacity>
              )}
              
              <ScrollView
                ref={searchScrollRef}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.cardsScroll}
              >
                {searchTracks.map((track, index) => (
                  <TopRatedCard key={`${track.id}-${index}`} track={track} />
                ))}
              </ScrollView>

              {isWeb && (
                <TouchableOpacity 
                  style={[styles.scrollArrow, styles.scrollArrowRight]} 
                  onPress={() => searchScrollRef.current?.scrollToEnd({ animated: true })}
                  activeOpacity={0.7}
                >
                  <Text style={styles.scrollArrowText}>{'>'}</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            <Text style={{ color: isDark ? '#8b949e' : '#57606a', marginTop: 20 }}>
              {searchQuery.trim().length > 0 ? 'No results found.' : 'Discover your favorite tracks.'}
            </Text>
          )}
        </View>
      )}
    </View>
  );
}

const isWeb = Platform.OS === 'web';

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    paddingTop: 60,
    zIndex: 10,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    marginBottom: 24,
    textAlign: 'center',
  },
  searchContainer: {
    width: '100%',
    maxWidth: 700,
    alignItems: 'center',
    marginBottom: 40,
    ...Platform.select({
      web: {
        position: 'sticky' as any,
        top: 20,
        zIndex: 100,
      }
    })
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 999,
    paddingLeft: 20,
    paddingRight: 6,
    paddingVertical: 6,
    width: '100%',
    ...Platform.select({
      web: {
        boxShadow: '0 10px 30px rgba(0,0,0,0.05)' as any,
      },
      default: {
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      }
    }),
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    height: 48,
    fontSize: 16,
    outlineStyle: 'none' as any,
  },
  searchButton: {
    borderRadius: 999,
    paddingHorizontal: 24,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    ...(isWeb && { cursor: 'pointer' as any }),
  },
  searchButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  topRatedSection: {
    width: '100%',
    maxWidth: 1200,
    alignItems: 'flex-start',
  },
  searchResultsSection: {
    width: '100%',
    maxWidth: 1200,
    alignItems: 'center',
    minHeight: 200,
  },
  sectionSubtitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
    paddingLeft: 8,
  },
  cardsScroll: {
    gap: 16,
    paddingBottom: 10,
  },
  scrollWrapper: {
    width: '100%',
    position: 'relative',
  },
  scrollArrow: {
    position: 'absolute',
    top: '40%',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    ...(isWeb && { cursor: 'pointer' as any }),
  },
  scrollArrowLeft: {
    left: -20,
  },
  scrollArrowRight: {
    right: -20,
  },
  scrollArrowText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
});
