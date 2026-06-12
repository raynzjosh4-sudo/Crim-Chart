import React from 'react';
import { View, TextInput, StyleSheet } from 'react-native';

interface FinalizeCaptionSectionProps {
  caption: string;
  onChangeText: (text: string) => void;
}

export const FinalizeCaptionSection: React.FC<FinalizeCaptionSectionProps> = ({ caption, onChangeText }) => {
  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Add a caption..."
        placeholderTextColor="rgba(255,255,255,0.3)"
        value={caption}
        onChangeText={onChangeText}
        multiline
        autoCapitalize="sentences"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  input: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
    minHeight: 40,
    maxHeight: 120,
  },
});
