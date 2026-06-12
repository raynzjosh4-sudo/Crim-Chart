import React from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { Search } from 'lucide-react-native';

interface Props { value: string; onChangeText: (t: string) => void; placeholder?: string; }

export default function ChannelSearchBar({ value, onChangeText, placeholder = 'Search channels...' }: Props) {
  const { colors } = useTheme();
  return (
    <View style={[styles.container, { backgroundColor: colors.card }]}>
      <Search size={18} color={colors.text + '60'} />
      <TextInput
        style={[styles.input, { color: colors.text }]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.text + '60'}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', margin: 12, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 16 },
  input: { flex: 1, marginLeft: 8, fontSize: 15 },
});
