import { CustomBackButton } from '@/components/CustomBackButton';
import { colors } from '@/core/theme/colors';
import { router } from 'expo-router';
import { Search } from 'lucide-react-native';
import React, { useState } from 'react';
import { Dimensions, FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const COLUMN_WIDTH = (SCREEN_WIDTH - 36) / 2;

export default function ExploreScreen() {
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState('');

  // Mock data for the explore grid
  const mockItems = Array.from({ length: 20 }, (_, i) => ({
    id: String(i),
    aspectRatio: [0.8, 1.2, 1.0, 1.4, 0.7][i % 5],
    color: ['#231D1C', '#1E1C1B', '#141110'][i % 3],
  }));

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Search Header */}
      <View style={styles.header}>
        <CustomBackButton onPressed={() => router.back()} size={28} />

        <View style={styles.searchBar}>
          <Search size={20} color="rgba(255, 255, 255, 0.5)" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search channels..."
            placeholderTextColor="rgba(255, 255, 255, 0.5)"
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={() => console.log('Searching for:', searchQuery)}
          />
        </View>

        <TouchableOpacity activeOpacity={1} onPress={() => console.log('Searching for:', searchQuery)}>
          <Text style={styles.searchButtonText}>Search</Text>
        </TouchableOpacity>
      </View>

      {/* Grid Content */}
      <FlatList
        data={mockItems}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.gridPadding}
        renderItem={({ item }) => (
          <View style={[
            styles.gridItem,
            { height: COLUMN_WIDTH * item.aspectRatio, backgroundColor: item.color }
          ]}>
            {/* Skeleton / Placeholder content */}
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 12,
  },
  searchBar: {
    flex: 1,
    height: 45,
    backgroundColor: colors.surfaceVariant,
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  searchButtonText: {
    color: colors.text,
    fontWeight: '900',
    fontSize: 14,
  },
  gridPadding: {
    padding: 12,
  },
  gridItem: {
    width: COLUMN_WIDTH,
    margin: 6,
    borderRadius: 15,
  },
});
