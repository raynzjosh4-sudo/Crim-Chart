import React, { useState } from 'react';
import {
  View, TextInput, FlatList, Text, TouchableOpacity,
  StyleSheet, SafeAreaView,
} from 'react-native';
import { Search, X } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';

interface SearchResult {
  id: string;
  label: string;
  subtitle?: string;
  type: 'user' | 'channel' | 'post';
}

interface NativeSearchDelegateProps {
  onResult?: (result: SearchResult) => void;
  placeholder?: string;
}

export const NativeSearchDelegate: React.FC<NativeSearchDelegateProps> = ({
  onResult,
  placeholder = 'Search CrimChart…',
}) => {
  const navigation = useNavigation();
  const [query, setQuery] = useState('');
  const [results] = useState<SearchResult[]>([]);

  const clearQuery = () => setQuery('');

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.searchBar}>
        <Search color="rgba(255,255,255,0.4)" size={20} />
        <TextInput
          style={styles.input}
          value={query}
          onChangeText={setQuery}
          placeholder={placeholder}
          placeholderTextColor="rgba(255,255,255,0.3)"
          autoFocus
          returnKeyType="search"
        />
        {query.length > 0 && (
          <TouchableOpacity activeOpacity={1} onPress={clearQuery}>
            <X color="rgba(255,255,255,0.5)" size={18} />
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={results}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity activeOpacity={1}
            style={styles.resultRow}
            onPress={() => onResult?.(item)}
          >
            <Text style={styles.resultLabel}>{item.label}</Text>
            {item.subtitle && (
              <Text style={styles.resultSub}>{item.subtitle}</Text>
            )}
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          query.length > 0 ? (
            <View style={styles.empty}>
              <Text style={styles.emptyText}>No results for "{query}"</Text>
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0D0D0D' },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 12,
    margin: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 10,
  },
  input: { flex: 1, color: '#FFF', fontSize: 15 },
  resultRow: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  resultLabel: { color: '#FFF', fontSize: 14, fontWeight: '600' },
  resultSub: { color: 'rgba(255,255,255,0.4)', fontSize: 12, marginTop: 2 },
  empty: { padding: 32, alignItems: 'center' },
  emptyText: { color: 'rgba(255,255,255,0.4)', fontSize: 14 },
});
