import { useStyles } from "@/core/hooks/useStyles";
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
  /** Whether the panel is currently visible to the user */
  visible?: boolean;
}
export const LyricsEditorPanel: React.FC<LyricsEditorPanelProps> = ({
  value,
  onChange,
  initialArtist = '',
  initialSong = '',
  visible = true
}) => {
  const styles = useStyles(colors => ({
    editPanel: {
      flex: 1
    },
    lyricsInput: {
      flex: 1,
      color: colors.text,
      fontSize: 16,
      lineHeight: 24
    },
    getLyricsBtn: {
      paddingVertical: 8,
      alignSelf: 'flex-start'
    },
    getLyricsText: {
      color: 'rgba(255,255,255,0.55)',
      fontSize: 13,
      textDecorationLine: 'underline'
    },
    searchPanel: {
      flex: 1,
      paddingTop: 4
    },
    searchHint: {
      color: 'rgba(255,255,255,0.6)',
      fontSize: 13,
      marginBottom: 14
    },
    searchInput: {
      backgroundColor: 'rgba(255,255,255,0.1)',
      borderRadius: 10,
      color: colors.text,
      paddingHorizontal: 14,
      paddingVertical: 11,
      fontSize: 15,
      marginBottom: 10
    },
    errorText: {
      color: '#FF6B6B',
      fontSize: 13,
      marginBottom: 8
    },
    searchActions: {
      flexDirection: 'row',
      gap: 10,
      marginTop: 6
    },
    actionBtn: {
      flex: 1,
      paddingVertical: 12,
      borderRadius: 24,
      alignItems: 'center'
    },
    backBtn: {
      backgroundColor: 'rgba(255,255,255,0.12)'
    },
    searchBtn: {
      flex: 2,
      backgroundColor: colors.primary
    },
    actionBtnText: {
      color: colors.text,
      fontSize: 15
    }
  }));
  const [showSearch, setShowSearch] = useState(false);
  const [searchArtist, setSearchArtist] = useState(initialArtist);
  const [searchSong, setSearchSong] = useState(initialSong);
  const [searchError, setSearchError] = useState('');
  const lastAutoSearched = React.useRef('');
  const {
    startLoading,
    stopLoading
  } = useGlobalProgress();
  const webStyle = Platform.OS === 'web' ? {
    outlineStyle: 'none'
  } as any : {};

  const performSearch = async (artist: string, song: string) => {
    if (!artist.trim() && !song.trim()) {
      setSearchError('Please enter an artist or song name.');
      setShowSearch(true);
      return;
    }
    setSearchArtist(artist);
    setSearchSong(song);
    startLoading();
    setSearchError('');
    try {
      const query = encodeURIComponent(`${artist.trim()} ${song.trim()}`.trim());
      
      // 1. Search for the most likely song match
      const suggestRes = await fetch(`https://api.lyrics.ovh/suggest/${query}`);
      const suggestData = await suggestRes.json();
      
      if (suggestData.data && suggestData.data.length > 0) {
        const found = suggestData.data[0];
        const foundArtist = found.artist.name;
        const foundTitle = found.title;
        
        // 2. Fetch the lyrics for the matched song
        const lyricsRes = await fetch(`https://api.lyrics.ovh/v1/${encodeURIComponent(foundArtist)}/${encodeURIComponent(foundTitle)}`);
        const lyricsData = await lyricsRes.json();
        
        if (lyricsData.lyrics) {
          onChange(lyricsData.lyrics);
          setShowSearch(false);
          setSearchError('');
        } else {
          setSearchError('No lyrics text found for this song. Try another.');
          setShowSearch(true);
        }
      } else {
        setSearchError('No results found. Check the spelling and try again.');
        setShowSearch(true);
      }
    } catch {
      setSearchError('Network error. Check your connection and try again.');
      setShowSearch(true);
    } finally {
      stopLoading();
    }
  };

  const handleSearchBtnClick = () => performSearch(searchArtist, searchSong);

  React.useEffect(() => {
    if (visible && !value && (initialArtist || initialSong)) {
      const queryKey = `${initialArtist.toLowerCase()}-${initialSong.toLowerCase()}`;
      if (lastAutoSearched.current !== queryKey) {
        lastAutoSearched.current = queryKey;
        setShowSearch(true);
        performSearch(initialArtist, initialSong);
      }
    }
  }, [visible, value, initialArtist, initialSong]);

  if (showSearch) {
    return <View style={styles.searchPanel}>
        <>
            <Text style={styles.searchHint}>
              Enter the song details to search lyrics online.
            </Text>
            <TextInput style={[styles.searchInput, webStyle]} placeholder="Artist Name" placeholderTextColor="rgba(255,255,255,0.4)" value={searchArtist} onChangeText={setSearchArtist} />
            <TextInput style={[styles.searchInput, webStyle]} placeholder="Song Name" placeholderTextColor="rgba(255,255,255,0.4)" value={searchSong} onChangeText={setSearchSong} />
            {!!searchError && <Text style={styles.errorText}>{searchError}</Text>}
            <View style={styles.searchActions}>
              <TouchableOpacity activeOpacity={0.8} style={[styles.actionBtn, styles.backBtn]} onPress={() => {
            setShowSearch(false);
            setSearchError('');
          }}>
                <Text style={styles.actionBtnText}>Back</Text>
              </TouchableOpacity>
              <TouchableOpacity activeOpacity={0.8} style={[styles.actionBtn, styles.searchBtn]} onPress={handleSearchBtnClick}>
                <Text style={[styles.actionBtnText, {
              color: colors.background,
              fontWeight: 'bold'
            }]}>Search</Text>
              </TouchableOpacity>
            </View>
          </>
        </View>;
  }
  return <View style={styles.editPanel}>
      <TextInput style={[styles.lyricsInput, webStyle]} placeholder="Paste or type lyrics here..." placeholderTextColor="rgba(255,255,255,0.5)" multiline value={value} onChangeText={onChange} textAlignVertical="top" scrollEnabled={false} />
      <TouchableOpacity activeOpacity={0.8} style={styles.getLyricsBtn} onPress={() => {
      setSearchArtist(initialArtist);
      setSearchSong(initialSong);
      setSearchError('');
      setShowSearch(true);
    }}>
        <Text style={styles.getLyricsText}>✨ Get lyrics here</Text>
      </TouchableOpacity>
    </View>;
};