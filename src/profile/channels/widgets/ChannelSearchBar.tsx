import { Search } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

interface ChannelSearchBarProps {
  onChanged?: (value: string) => void;
}

export const ChannelSearchBar: React.FC<ChannelSearchBarProps> = ({ onChanged }) => {
  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Search size={20} color="rgba(255,255,255,0.5)" style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="Search anything"
          placeholderTextColor="rgba(255,255,255,0.5)"
          onChangeText={onChanged}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 24,
    paddingHorizontal: 16,
    height: 48,
  },
  icon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    color: '#FFF',
    fontSize: 15,
  },
});
