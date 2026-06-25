import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ChevronLeft, Search, CheckCircle2, Circle } from 'lucide-react-native';
import { colors } from '@/core/theme/colors';

const COUNTRIES = [
  { name: 'Global', emoji: '🌍' },
  { name: 'United States', emoji: '🇺🇸' },
  { name: 'United Kingdom', emoji: '🇬🇧' },
  { name: 'Canada', emoji: '🇨🇦' },
  { name: 'Australia', emoji: '🇦🇺' },
  { name: 'Germany', emoji: '🇩🇪' },
  { name: 'France', emoji: '🇫🇷' },
];

export default function CountrySelectionPage() {
  const router = useRouter();
  const [selectedCountries, setSelectedCountries] = useState<Set<string>>(new Set(['Global']));
  const [search, setSearch] = useState('');

  const toggleCountry = (name: string) => {
    const newSet = new Set(selectedCountries);
    if (name === 'Global') {
      newSet.clear();
      newSet.add('Global');
    } else {
      newSet.delete('Global');
      if (newSet.has(name)) {
        newSet.delete(name);
      } else {
        newSet.add(name);
      }
      if (newSet.size === 0) newSet.add('Global');
    }
    setSelectedCountries(newSet);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity activeOpacity={1} onPress={() => router.back()} style={styles.headerButton}>
          <ChevronLeft size={28} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Select Countries</Text>
        <TouchableOpacity activeOpacity={1} onPress={() => router.back()} style={styles.headerButton}>
          <Text style={styles.doneText}>Done</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Search size={20} color="rgba(255,255,255,0.3)" />
          <TextInput 
            style={styles.searchInput}
            placeholder="Search country"
            placeholderTextColor="rgba(255,255,255,0.3)"
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </View>

      <ScrollView style={styles.content}>
        {COUNTRIES.filter(c => c.name.toLowerCase().includes(search.toLowerCase())).map((country) => {
          const isSelected = selectedCountries.has(country.name);
          return (
            <TouchableOpacity activeOpacity={1} 
              key={country.name} 
              style={styles.tile} 
              onPress={() => toggleCountry(country.name)}
            >
              <View style={styles.tileLeft}>
                <Text style={styles.emoji}>{country.emoji}</Text>
                <Text style={styles.tileTitle}>{country.name}</Text>
              </View>
              {isSelected ? (
                <CheckCircle2 size={22} color={colors.primary} />
              ) : (
                <Circle size={22} color="rgba(255,255,255,0.2)" />
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 60,
    paddingHorizontal: 12,
  },
  headerButton: {
    padding: 8,
  },
  headerTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '900',
  },
  doneText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  searchContainer: {
    padding: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 48,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    color: '#FFF',
    fontSize: 15,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  tile: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  tileLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  emoji: {
    fontSize: 24,
  },
  tileTitle: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '600',
  },
});
