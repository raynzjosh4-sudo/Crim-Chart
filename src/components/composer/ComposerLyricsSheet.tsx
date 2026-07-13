import { useStyles } from "@/core/hooks/useStyles";
import { colors } from '@/core/theme/colors';
import { LyricsEditorPanel } from '@/components/compose/LyricsEditorPanel';
import { OfflineStaleDataBanner, SlowConnectionBanner, OfflineNoDataWidget } from '@/components/offlineIndicators';
import { X } from 'lucide-react-native';
import React, { useState, useEffect } from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, useWindowDimensions, View, Platform, KeyboardAvoidingView, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
interface ComposerLyricsSheetProps {
  visible: boolean;
  onClose: () => void;
  initialLyrics?: string;
  onSave: (lyrics: string) => void;
  /** Pre-fill artist name for web lyrics search */
  artistName?: string;
  /** Pre-fill song title for web lyrics search */
  songTitle?: string;
}
export const ComposerLyricsSheet: React.FC<ComposerLyricsSheetProps> = ({
  visible,
  onClose,
  initialLyrics = '',
  onSave,
  artistName = '',
  songTitle = ''
}) => {
  const styles = useStyles(colors => ({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.7)',
      justifyContent: 'flex-end',
      alignItems: 'center'
    },
    sheet: {
      backgroundColor: colors.background,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      width: '100%',
      flex: 0.8,
      padding: 24,
      shadowColor: colors.background,
      shadowOffset: {
        width: 0,
        height: -2
      },
      shadowOpacity: 0.25,
      shadowRadius: 10,
      elevation: 5
    },
    sheetDesktop: {
      width: 600,
      borderBottomLeftRadius: 20,
      borderBottomRightRadius: 20,
      marginBottom: 'auto',
      marginTop: 'auto',
      flex: 0.8
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 24
    },
    title: {
      color: colors.text,
      fontSize: 20,
      fontWeight: 'bold'
    },
    closeButton: {
      padding: 4
    },
    saveButton: {
      backgroundColor: colors.primary,
      paddingVertical: 14,
      borderRadius: 30,
      alignItems: 'center',
      marginTop: 20
    },
    saveButtonText: {
      color: colors.background,
      fontSize: 16,
      fontWeight: 'bold'
    }
  }));
  const {
    width
  } = useWindowDimensions();
  const isDesktop = width >= 768;
  const insets = useSafeAreaInsets();
  const [lyrics, setLyrics] = useState(initialLyrics);
  useEffect(() => {
    if (visible) {
      setLyrics(initialLyrics);
    }
  }, [visible, initialLyrics]);
  const handleSave = () => {
    onSave(lyrics);
    onClose();
  };
  return <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <KeyboardAvoidingView style={styles.overlay} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={[styles.sheet, isDesktop && styles.sheetDesktop, {
        paddingBottom: Math.max(insets.bottom + 20, 20)
      }]}>
          <View style={styles.header}>
            <Text style={styles.title}>Lyrics</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
          <OfflineStaleDataBanner />
          <SlowConnectionBanner />
          <ScrollView style={{
          flex: 1
        }} contentContainerStyle={{
          flexGrow: 1
        }} keyboardShouldPersistTaps="handled">
            <LyricsEditorPanel value={lyrics} onChange={setLyrics} initialArtist={artistName} initialSong={songTitle} visible={visible} />
          </ScrollView>
          <TouchableOpacity activeOpacity={0.8} style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>Save Lyrics</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>;
};