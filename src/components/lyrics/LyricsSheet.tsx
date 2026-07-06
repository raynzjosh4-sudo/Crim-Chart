import { useStyles } from "@/core/hooks/useStyles";
import { colors } from '@/core/theme/colors';
import { X } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
interface LyricsSheetProps {
  visible: boolean;
  onClose: () => void;
  lyrics: string;
}
export const LyricsSheet: React.FC<LyricsSheetProps> = ({
  visible,
  onClose,
  lyrics
}) => {
  const styles = useStyles(colors => ({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'flex-end',
      alignItems: 'center'
    },
    sheet: {
      backgroundColor: colors.surface,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      width: '100%',
      flex: 0.75,
      padding: '5%',
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
      flex: 0.85,
      width: '60%',
      maxWidth: 600,
      borderRadius: 20,
      marginBottom: '5%'
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '5%',
      borderBottomWidth: 1,
      borderBottomColor: 'rgba(255, 255, 255, 0.1)',
      paddingBottom: '3%'
    },
    title: {
      color: colors.text,
      fontSize: 20,
      fontWeight: '700'
    },
    closeButton: {
      padding: '2%'
    },
    scroll: {
      flex: 1
    },
    scrollContent: {
      paddingBottom: '10%'
    },
    lyricsText: {
      color: colors.textSecondary,
      fontSize: 16,
      lineHeight: 28
    }
  }));
  const {
    t
  } = useTranslation();
  const {
    width
  } = useWindowDimensions();
  const isDesktop = width >= 768;
  const insets = useSafeAreaInsets();
  return <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.sheet, isDesktop && styles.sheetDesktop, {
        paddingBottom: Math.max(insets.bottom + 20, 20)
      }]}>
          <View style={styles.header}>
            <Text style={styles.title}>{t('music.lyrics', 'Lyrics')}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
            <Text style={styles.lyricsText}>
              {lyrics ? lyrics : t('music.noLyrics', 'No lyrics available')}
            </Text>
          </ScrollView>
        </View>
      </View>
    </Modal>;
};