import { EmojiPickerWidget } from '@/components/EmojiPicker/EmojiPickerWidget';
import UserAvatar from '@/components/avatar/UserAvatar';
import { TooltipBadge } from '@/components/badge/TooltipBadge';
import { CategoryPickerWidget } from '@/components/compose/CategoryPickerWidget';
import { LocalMusicList } from '@/components/compose/LocalMusicList';
import { useGlobalProgress } from '@/components/globalProgressBar/GlobalProgressBar';
import { useStyles } from "@/core/hooks/useStyles";
import { useTranslation } from '@/core/localization/i18n';
import { MediaType, usePostingStore } from '@/core/store/usePostingStore';
import { useCurrentTheme } from '@/core/store/useThemeStore';
import { colors } from "@/core/theme/colors";
import { useAuthStore } from '@/features/auth/application/useAuthStore';
import { useTooltipSchedule } from '@/hooks/useTooltipSchedule';
import * as DocumentPicker from 'expo-document-picker';
import * as MediaLibrary from 'expo-media-library';
import { useRouter } from 'expo-router';
import { Music, Smile } from 'lucide-react-native';
import { useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { ComposerMediaInput } from './ComposerMediaInput';
export const ComposerWidget = ({
  onPostSuccess
}: {
  onPostSuccess?: () => void;
}) => {
  const styles = useStyles(colors => ({
    container: {
      flex: 1,
      backgroundColor: 'transparent',
      display: 'flex',
      flexDirection: 'column'
    },
    scrollContent: {
      padding: 16,
      flexGrow: 1
    },
    inputArea: {
      flexDirection: 'row',
      alignItems: 'flex-start'
    },
    input: {
      flex: 1,
      marginLeft: 12,
      fontSize: 18,
      minHeight: '20%',
      textAlignVertical: 'top'
    },
    footer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderTopWidth: StyleSheet.hairlineWidth
    },
    toolbar: {
      flexDirection: 'row',
      alignItems: 'center'
    },
    iconButton: {
      padding: 8,
      marginRight: 4
    },
    categoryChip: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
      marginLeft: 8,
      justifyContent: 'center',
      alignItems: 'center'
    },
    postButton: {
      paddingHorizontal: 18,
      paddingVertical: 8,
      borderRadius: 20
    },
    postButtonDisabled: {
      opacity: 0.5
    },
    postButtonText: {
      color: colors.background,
      fontWeight: 'bold',
      fontSize: 15
    },
    emojiPickerContainer: {
      position: 'absolute',
      bottom: 60,
      left: 16,
      zIndex: 9999,
      backgroundColor: colors.background,
      borderRadius: 16,
      elevation: 5,
      shadowColor: colors.background,
      shadowOffset: {
        width: 0,
        height: -2
      },
      shadowOpacity: 0.25,
      shadowRadius: 10
    },
    musicDetailsSheet: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      width: '100%',
      height: '60%',
      backgroundColor: '#1E1E1E',
      borderTopLeftRadius: 16,
      borderTopRightRadius: 16,
      zIndex: 9999,
      elevation: 5,
      shadowColor: colors.background,
      shadowOffset: {
        width: 0,
        height: -2
      },
      shadowOpacity: 0.25,
      shadowRadius: 10,
      padding: 16
    }
  }));
  const {
    t
  } = useTranslation();
  const theme = useCurrentTheme();
  const user = useAuthStore(s => s.user);
  const [text, setText] = useState('');
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [lyrics, setLyrics] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showCategories, setShowCategories] = useState(false);
  const [isMusicBadgeDismissed, setIsMusicBadgeDismissed] = useState(false);
  const [selectedAudio, setSelectedAudio] = useState<any>(null);
  const [customThumbnail, setCustomThumbnail] = useState<string | null>(null);
  const [category, setCategory] = useState<string | null>(null);
  const [isPickingMusic, setIsPickingMusic] = useState(false);
  const [prefetchedAssets, setPrefetchedAssets] = useState<MediaLibrary.Asset[] | null>(null);
  const {
    startLoading,
    stopLoading
  } = useGlobalProgress();
  const {
    width
  } = useWindowDimensions();
  const isDesktop = width >= 768;
  const showMusicBadge = useTooltipSchedule(isMusicBadgeDismissed);
  const router = useRouter();
  const handlePickMusic = async () => {
    setIsMusicBadgeDismissed(true);
    if (Platform.OS === 'android') {
      // Pre-fetch assets while showing the global loader
      startLoading();
      try {
        const perm = await MediaLibrary.requestPermissionsAsync();
        if (perm.granted) {
          const media = await MediaLibrary.getAssetsAsync({
            mediaType: MediaLibrary.MediaType.audio,
            first: 100,
            sortBy: [[MediaLibrary.SortBy.creationTime, false]]
          });
          setPrefetchedAssets(media.assets);
        } else {
          setPrefetchedAssets([]);
        }
      } catch {
        setPrefetchedAssets([]);
      } finally {
        stopLoading();
        setIsPickingMusic(true);
      }
      return;
    }
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'audio/*',
        copyToCacheDirectory: true
      });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        setSelectedAudio({
          id: `local-${Date.now()}`,
          uri: asset.uri,
          name: asset.name,
          artist: artist || 'Unknown Artist',
          lyrics: lyrics || '',
          type: 'audio'
        });

        // Auto-open category widget
        setShowCategories(true);
      }
    } catch (error) {
      console.log('Error picking audio:', error);
    }
  };
  const handlePost = async () => {
    if (!text.trim()) return;
    setIsPosting(true);
    startLoading();
    const media: any[] = [];
    if (selectedAudio) {
      media.push({
        path: selectedAudio.uri,
        type: MediaType.audio,
        source: 'device',
        title: title || selectedAudio.name,
        artist: artist || selectedAudio.artist,
        lyrics: lyrics || selectedAudio.lyrics,
        thumbnailUrl: customThumbnail || selectedAudio.thumbnailUri || undefined
      });
    }
    const success = await usePostingStore.getState().createPost({
      media,
      caption: text,
      postType: 'post',
      // Default regular post
      isPublicFeed: true,
      allowComments: true,
      category: category || user?.musicCategory || undefined
    });
    stopLoading();
    setIsPosting(false);
    if (success) {
      setText('');
      setTitle('');
      setArtist('');
      setLyrics('');
      setSelectedAudio(null);
      setCustomThumbnail(null);
      setCategory(null);
      if (onPostSuccess) {
        onPostSuccess();
      } else {
        router.back();
      }
    }
  };
  const renderInputArea = () => <View style={styles.inputArea}>
    <UserAvatar userId={user?.id || ''} fallbackUrl={user?.profileImageUrl} name={user?.displayName} size={40} />
    <TextInput style={[styles.input, {
      color: theme.colors.text
    }, Platform.OS === 'web' && {
      outlineStyle: 'none'
    } as any]} placeholder={t('what_is_happening' as any) || "What's happening?"} placeholderTextColor={theme.colors.text + '80'} // 50% opacity
      multiline value={text} onChangeText={setText} autoFocus />
  </View>;
  return <View style={styles.container}>
    {isPickingMusic ? <View style={{
      flex: 1
    }}>
      <LocalMusicList selectedId={selectedAudio?.id} prefetchedAssets={prefetchedAssets ?? undefined} onSelect={async media => {
        let thumbnailUri: string | null = media.thumbnailUri || media.thumbnail || null;
        try {
          const info = await MediaLibrary.getAssetInfoAsync(media.id, {
            shouldDownloadFromNetwork: false
          });

          // Android: album art is at content://media/external/audio/albumart/<albumId>
          // The albumId is sometimes exposed as a custom field on the info object
          const albumId = (info as any)?.albumId ?? (info as any)?.album?.id;
          if (albumId && !thumbnailUri) {
            thumbnailUri = `content://media/external/audio/albumart/${albumId}`;
          }

          // Fallback: extract media ID from the URI and try the album-art content provider
          if (!thumbnailUri && info?.uri) {
            const match = info.uri.match(/\/(\d+)$/);
            if (match) {
              // Some Android versions serve art at this URI
              thumbnailUri = `content://media/external/audio/albumart/${match[1]}`;
            }
          }
        } catch {/* non-critical */ }
        setSelectedAudio({
          id: media.id,
          uri: media.uri,
          name: media.name,
          artist: media.artist || 'Unknown Artist',
          lyrics: media.lyrics || '',
          thumbnailUri,
          type: 'audio'
        });

        // Auto-fill the inputs with the song metadata so the user sees it in the next widget
        setTitle(media.name || '');
        setArtist(media.artist || 'Unknown Artist');
        setLyrics(media.lyrics || '');
        if (media.thumbnail) {
          setCustomThumbnail(media.thumbnail);
        }
        setShowCategories(true);
      }} />
    </View> : <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
      {renderInputArea()}

      <ComposerMediaInput title={title} setTitle={setTitle} artist={artist} setArtist={setArtist} lyrics={lyrics} setLyrics={setLyrics} selectedAudio={selectedAudio} onRemoveAudio={() => setSelectedAudio(null)} customThumbnail={customThumbnail} setCustomThumbnail={setCustomThumbnail} />
    </ScrollView>}

    {showEmojiPicker && <>
      <Pressable style={[StyleSheet.absoluteFillObject, {
        zIndex: 9998,
        cursor: 'default' as any
      }]} onPress={() => setShowEmojiPicker(false)} />
      <View style={styles.emojiPickerContainer}>
        <EmojiPickerWidget onEmojiSelect={emoji => {
          setText(text + emoji);
        }} />
      </View>
    </>}

    {showCategories && <>
      <Pressable style={[StyleSheet.absoluteFillObject, {
        zIndex: 9998,
        backgroundColor: 'rgba(0,0,0,0.5)',
        cursor: 'default' as any
      }]} onPress={() => setShowCategories(false)} />
      <View style={[styles.musicDetailsSheet, {
        backgroundColor: theme.colors.background
      }, isDesktop && {
        bottom: undefined,
        top: '50%',
        left: '50%',
        width: 400,
        height: 500,
        transform: [{
          translateX: '-50%' as any
        }, {
          translateY: '-50%' as any
        }],
        borderRadius: 16
      }]}>
        <CategoryPickerWidget onSelectCategory={categoryId => {
          setCategory(categoryId);
          setShowCategories(false);
          setIsPickingMusic(false); // Return to composer view
        }} />
      </View>
    </>}

    <View style={[styles.footer, {
      borderTopColor: 'rgba(255,255,255,0.1)'
    }]}>
      <View style={styles.toolbar}>
        <TouchableOpacity activeOpacity={0.8} style={styles.iconButton} onPress={() => setShowEmojiPicker(!showEmojiPicker)}>
          <Smile size={20} color={theme.colors.primary} />
        </TouchableOpacity>
        <View style={{
          position: 'relative'
        }}>
          <TooltipBadge visible={showMusicBadge} text="Device Music" />
          <TouchableOpacity activeOpacity={0.8} style={styles.iconButton} onPress={handlePickMusic}>
            <Music size={20} color={theme.colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Category Chip */}
        <TouchableOpacity activeOpacity={0.8} style={[styles.categoryChip, {
          backgroundColor: category ? theme.colors.primary + '33' : 'rgba(255,255,255,0.1)'
        }]} onPress={() => setShowCategories(true)}>
          <Text style={{
            color: category ? theme.colors.primary : colors.text,
            fontSize: 12,
            fontWeight: 'bold'
          }}>
            {category ? category.charAt(0).toUpperCase() + category.slice(1) : '+ Category'}
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity activeOpacity={0.8} style={[styles.postButton, {
        backgroundColor: theme.colors.primary
      }, (!text.trim() || isPosting) && styles.postButtonDisabled]} onPress={handlePost} disabled={!text.trim() || isPosting}>
        <Text style={styles.postButtonText}>{isPosting ? t('posting' as any) || 'Posting...' : t('post' as any) || 'Post'}</Text>
      </TouchableOpacity>
    </View>
  </View>;
};