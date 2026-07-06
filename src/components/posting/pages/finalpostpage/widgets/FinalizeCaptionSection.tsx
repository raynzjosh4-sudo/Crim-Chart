import { useStyles } from "@/core/hooks/useStyles";
import React from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
interface FinalizeCaptionSectionProps {
  caption: string;
  onChangeText: (text: string) => void;
}
export const FinalizeCaptionSection: React.FC<FinalizeCaptionSectionProps> = ({
  caption,
  onChangeText
}) => {
  const styles = useStyles(colors => ({
    container: {
      paddingHorizontal: 16,
      paddingTop: 16,
      paddingBottom: 8
    },
    input: {
      color: colors.text,
      fontSize: 14,
      fontWeight: '600',
      minHeight: 40,
      maxHeight: 120
    }
  }));
  return <View style={styles.container}>
      <TextInput style={styles.input} placeholder="Add a caption..." placeholderTextColor="rgba(255,255,255,0.3)" value={caption} onChangeText={onChangeText} multiline autoCapitalize="sentences" />
    </View>;
};