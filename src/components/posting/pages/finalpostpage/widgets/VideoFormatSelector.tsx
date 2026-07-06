import { useStyles } from "@/core/hooks/useStyles";
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
export interface VideoFormatSelectorProps {
  isShortClip: boolean;
  onFormatChange: (isShort: boolean) => void;
}
export const VideoFormatSelector: React.FC<VideoFormatSelectorProps> = ({
  isShortClip,
  onFormatChange
}) => {
  const styles = useStyles(colors => ({
    formatSelectionContainer: {
      paddingHorizontal: 16,
      paddingVertical: 12
    },
    formatTitle: {
      color: colors.text,
      fontSize: 14,
      fontWeight: '600',
      marginBottom: 6
    },
    chipsRow: {
      flexDirection: 'row',
      gap: 8
    },
    chip: {
      paddingVertical: 4,
      paddingHorizontal: 10,
      borderRadius: 12,
      backgroundColor: 'rgba(255,255,255,0.1)',
      borderWidth: 1,
      borderColor: 'transparent'
    },
    chipActive: {
      backgroundColor: 'rgba(250, 205, 17, 0.2)',
      borderColor: '#FACD11'
    },
    chipText: {
      color: 'rgba(255,255,255,0.8)',
      fontSize: 11,
      fontWeight: '500'
    },
    chipTextActive: {
      color: '#FACD11'
    }
  }));
  return <View style={styles.formatSelectionContainer}>
      <Text style={styles.formatTitle}>Video Format</Text>
      <View style={styles.chipsRow}>
        <TouchableOpacity activeOpacity={0.8} style={[styles.chip, isShortClip && styles.chipActive]} onPress={() => onFormatChange(true)}>
          <Text style={[styles.chipText, isShortClip && styles.chipTextActive]}>Short Clip</Text>
        </TouchableOpacity>
        <TouchableOpacity activeOpacity={0.8} style={[styles.chip, !isShortClip && styles.chipActive]} onPress={() => onFormatChange(false)}>
          <Text style={[styles.chipText, !isShortClip && styles.chipTextActive]}>Long Clip</Text>
        </TouchableOpacity>
      </View>
    </View>;
};