import { useStyles } from "@/core/hooks/useStyles";
import React, { useState, useEffect } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, Platform } from 'react-native';
import { ImagePlus, X } from 'lucide-react-native';
import { AnimatedDisk } from '@/components/AnimatedDisk';
import { useCurrentTheme } from '@/core/store/useThemeStore';
import { useGlobalProgress } from '@/components/globalProgressBar/GlobalProgressBar';
import { useTranslation } from '@/core/localization/i18n';
import { ComposerLyricsSheet } from './ComposerLyricsSheet';
import { Audio } from 'expo-av';
import * as ImagePicker from 'expo-image-picker';
export interface ComposerMediaInputProps {
  title: string;
  setTitle: (val: string) => void;
  artist: string;
  setArtist: (val: string) => void;
  lyrics: string;
  setLyrics: (val: string) => void;
  // Selected audio from LocalMusicList
  selectedAudio?: any;
  onRemoveAudio?: () => void;
  customThumbnail: string | null;
  setCustomThumbnail: (val: string | null) => void;
}
export const ComposerMediaInput: React.FC<ComposerMediaInputProps> = ({
  title,
  setTitle,
  artist,
  setArtist,
  lyrics,
  setLyrics,
  selectedAudio,
  onRemoveAudio,
  customThumbnail,
  setCustomThumbnail
}) => {
  const styles = useStyles(colors => ({
    diskContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      marginVertical: 24
    },
    diskWrapper: {
      position: 'relative',
      width: 260,
      height: 260
    },
    addCoverButton: {
      position: 'absolute',
      top: 10,
      right: 10,
      width: 44,
      height: 44,
      borderRadius: 22,
      alignItems: 'center',
      justifyContent: 'center',
      elevation: 4,
      shadowColor: colors.background,
      shadowOffset: {
        width: 0,
        height: 2
      },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      borderWidth: 2,
      borderColor: colors.background
    },
    metadataFields: {
      width: '100%',
      paddingHorizontal: 24,
      marginTop: 16
    },
    metaInput: {
      fontSize: 16,
      paddingVertical: 12,
      borderBottomWidth: 1,
      marginBottom: 16
    },
    addLyricsButton: {
      paddingVertical: 12,
      alignItems: 'center',
      marginBottom: 16
    },
    addLyricsText: {
      fontSize: 16,
      fontWeight: 'bold'
    }
  }));
  const {
    t
  } = useTranslation();
  const theme = useCurrentTheme();
  const {
    startLoading,
    stopLoading
  } = useGlobalProgress();
  const [isLyricsSheetOpen, setIsLyricsSheetOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [sound, setSound] = useState<Audio.Sound | null>(null);

  // Stop audio when the component unmounts (e.g. user navigates away)
  useEffect(() => {
    return () => {
      if (sound) {
        sound.stopAsync().finally(() => sound.unloadAsync());
      }
    };
  }, [sound]);
  const pickCoverImage = async () => {
    startLoading();
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.85
      });
      if (!result.canceled && result.assets.length > 0) {
        setCustomThumbnail(result.assets[0].uri);
      }
    } catch (e) {
      console.error('Image pick error', e);
    } finally {
      stopLoading();
    }
  };
  const togglePlayback = async () => {
    if (!selectedAudio?.uri) return;
    if (sound) {
      if (isPlaying) {
        await sound.pauseAsync();
        setIsPlaying(false);
      } else {
        await sound.playAsync();
        setIsPlaying(true);
      }
    } else {
      try {
        const {
          sound: newSound
        } = await Audio.Sound.createAsync({
          uri: selectedAudio.uri
        }, {
          shouldPlay: true
        });
        newSound.setOnPlaybackStatusUpdate(status => {
          if (status.isLoaded && status.didJustFinish) {
            setIsPlaying(false);
            newSound.setPositionAsync(0);
          }
        });
        setSound(newSound);
        setIsPlaying(true);
      } catch (e) {
        console.error('Playback error', e);
      }
    }
  };

  // Custom pick > audio embedded thumbnail > nothing
  const diskImageUrl = customThumbnail || selectedAudio?.thumbnailUri || undefined;
  return <>
      <View style={styles.diskContainer}>
        <View style={styles.diskWrapper}>
          <AnimatedDisk isPlaying={isPlaying} onPress={selectedAudio ? togglePlayback : () => {}} size={260} imageUrl={diskImageUrl} placeholderText={t('tap_to_add_audio' as any) || "Tap to add audio"} />
          {/* Cover image button — always visible: pick if no audio, pick if has audio (allows override) */}
          {!selectedAudio && <TouchableOpacity activeOpacity={0.8} style={[styles.addCoverButton, {
          backgroundColor: theme.colors.surface
        }]} onPress={pickCoverImage} accessibilityLabel="Add cover image">
              <ImagePlus size={20} color={theme.colors.text} />
            </TouchableOpacity>}
          {selectedAudio && <>
              {/* Top-right: swap cover */}
              <TouchableOpacity activeOpacity={0.8} style={[styles.addCoverButton, {
            backgroundColor: theme.colors.surface
          }]} onPress={pickCoverImage} accessibilityLabel="Change cover image">
                <ImagePlus size={20} color={theme.colors.text} />
              </TouchableOpacity>
              {/* Bottom-left: remove song */}
              {onRemoveAudio && <TouchableOpacity activeOpacity={0.8} style={[styles.addCoverButton, {
            backgroundColor: theme.colors.surface,
            top: 'auto',
            bottom: 10,
            right: 'auto',
            left: 10
          } as any]} onPress={() => {
            setCustomThumbnail(null);
            onRemoveAudio();
          }} accessibilityLabel="Remove selected song">
                  <X size={20} color={theme.colors.text} />
                </TouchableOpacity>}
            </>}
        </View>
        <View style={styles.metadataFields}>
          <TextInput style={[styles.metaInput, {
          color: theme.colors.text,
          borderBottomColor: 'rgba(255,255,255,0.2)'
        }, Platform.OS === 'web' && {
          outlineStyle: 'none'
        } as any]} placeholder={t('track_title' as any) || "Track Title"} placeholderTextColor={theme.colors.text + '80'} value={title} onChangeText={setTitle} />
          <TextInput style={[styles.metaInput, {
          color: theme.colors.text,
          borderBottomColor: 'rgba(255,255,255,0.2)'
        }, Platform.OS === 'web' && {
          outlineStyle: 'none'
        } as any]} placeholder={t('artist_name' as any) || "Artist Name"} placeholderTextColor={theme.colors.text + '80'} value={artist} onChangeText={setArtist} />
          <TouchableOpacity activeOpacity={0.8} style={styles.addLyricsButton} onPress={async () => {
          startLoading();
          await new Promise(r => setTimeout(r, 400));
          stopLoading();
          setIsLyricsSheetOpen(true);
        }}>
            <Text style={[styles.addLyricsText, {
            color: theme.colors.primary
          }]}>
              {lyrics ? 'Edit Lyrics' : '+ Add Lyrics'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ComposerLyricsSheet visible={isLyricsSheetOpen} onClose={() => setIsLyricsSheetOpen(false)} initialLyrics={lyrics} onSave={setLyrics} artistName={artist} songTitle={title} />
    </>;
};