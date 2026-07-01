/**
 * LyricsEditorPanel
 *
 * Reusable panel that combines:
 *  - Manual lyrics text input
 *  - "Get lyrics here" web-search feature (via lrclib.net)
 *
 * Designed to be embedded inside any sheet/modal.
 */
import { colors } from '@/core/theme/colors';
import { useGlobalProgress } from '@/components/globalProgressBar/GlobalProgressBar';
import React, { useState } from 'react';
import { Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export interface LyricsEditorPanelProps {
  /** Current lyrics value */
  value: string;
  /** Called when the lyrics text changes */
  onChange: (lyrics: string) => void;
  /** Pre-fill artist search field */
  initialArtist?: string;
  /** Pre-fill song title search field */
  initialSong?: string;
}

export const LyricsEditorPanel: React.FC<LyricsEditorPanelProps> = ({
  value,
  onChange,
  initialArtist = '',
  initialSong = '',
}) => {
  const [showSearch, setShowSearch] = useState(false);
  const [searchArtist, setSearchArtist] = useState(initialArtist);
  const [searchSong, setSearchSong] = useState(initialSong);
  const [searchError, setSearchError] = useState('');
  const { startLoading, stopLoading } = useGlobalProgress();

  const webStyle = Platform.OS === 'web' ? ({ outlineStyle: 'none' } as any) : {};

  const handleSearch = async () => {
    if (!searchArtist.trim() || !searchSong.trim()) {
      setSearchError('Please enter both artist and song name.');
      return;
    }
    startLoading();
    setSearchError('');
    try {
      const params = new URLSearchParams({
        track_name: searchSong.trim(),
        artist_name: searchArtist.trim(),
      }).toString();
      const res = await fetch(`https://lrclib.net/api/search?${params}`);
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        const found = data[0];
        const fetched = found.plainLyrics || found.syncedLyrics || '';
        if (fetched) {
          onChange(fetched);
          setShowSearch(false);
          setSearchError('');
        } else {
          setSearchError('No lyrics text found for this song. Try another.');
        }
      } else {
        setSearchError('No results found. Check the spelling and try again.');
      }
    } catch {
      setSearchError('Network error. Check your connection and try again.');
    } finally {
      stopLoading();
    }
  };

  if (showSearch) {
    return (
      <View style={styles.searchPanel}>
        <>
            <Text style={styles.searchHint}>
              Enter the song details to search lyrics online.
            </Text>
            <TextInput
              style={[styles.searchInput, webStyle]}
              placeholder="Artist Name"
              placeholderTextColor="rgba(255,255,255,0.4)"
              value={searchArtist}
              onChangeText={setSearchArtist}
            />
            <TextInput
              style={[styles.searchInput, webStyle]}
              placeholder="Song Name"
              placeholderTextColor="rgba(255,255,255,0.4)"
              value={searchSong}
              onChangeText={setSearchSong}
            />
            {!!searchError && <Text style={styles.errorText}>{searchError}</Text>}
            <View style={styles.searchActions}>
              <TouchableOpacity
                activeOpacity={0.8}
                style={[styles.actionBtn, styles.backBtn]}
                onPress={() => { setShowSearch(false); setSearchError(''); }}
              >
                <Text style={styles.actionBtnText}>Back</Text>
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.8}
                style={[styles.actionBtn, styles.searchBtn]}
                onPress={handleSearch}
              >
                <Text style={[styles.actionBtnText, { color: '#000', fontWeight: 'bold' }]}>Search</Text>
              </TouchableOpacity>
            </View>
          </>
        </View>
    );
  }

  return (
    <View style={styles.editPanel}>
      <TextInput
        style={[styles.lyricsInput, webStyle]}
        placeholder="Paste or type lyrics here..."
        placeholderTextColor="rgba(255,255,255,0.5)"
        multiline
        value={value}
        onChangeText={onChange}
        textAlignVertical="top"
        scrollEnabled={false}
      />
      <TouchableOpacity
        activeOpacity={0.8}
        style={styles.getLyricsBtn}
        onPress={() => {
          setSearchArtist(initialArtist);
          setSearchSong(initialSong);
          setSearchError('');
          setShowSearch(true);
        }}
      >
        <Text style={styles.getLyricsText}>✨ Get lyrics here</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  editPanel: {
    flex: 1,
  },
  lyricsInput: {
    flex: 1,
    color: colors.text,
    fontSize: 16,
    lineHeight: 24,
  },
  getLyricsBtn: {
    paddingVertical: 8,
    alignSelf: 'flex-start',
  },
  getLyricsText: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 13,
    textDecorationLine: 'underline',
  },
  searchPanel: {
    flex: 1,
    paddingTop: 4,
  },
  searchHint: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 13,
    marginBottom: 14,
  },
  searchInput: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 10,
    color: colors.text,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 15,
    marginBottom: 10,
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 13,
    marginBottom: 8,
  },
  searchActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 6,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 24,
    alignItems: 'center',
  },
  backBtn: {
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  searchBtn: {
    flex: 2,
    backgroundColor: colors.primary,
  },
  actionBtnText: {
    color: colors.text,
    fontSize: 15,
  },
});
