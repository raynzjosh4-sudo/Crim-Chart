import ChartAppBar from '@/components/chartappbar/ChartAppBar';
import { colors } from '@/core/theme/colors';
import { useRouter } from 'expo-router';
import { Search } from 'lucide-react-native';
import React, { useState } from 'react';
import { FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const COUNTRIES = [
  { name: 'United States', code: 'US', phone: '1' },
  { name: 'United Kingdom', code: 'GB', phone: '44' },
  { name: 'Canada', code: 'CA', phone: '1' },
  { name: 'Australia', code: 'AU', phone: '61' },
  { name: 'Germany', code: 'DE', phone: '49' },
  { name: 'France', code: 'FR', phone: '33' },
  { name: 'Japan', code: 'JP', phone: '81' },
  { name: 'China', code: 'CN', phone: '86' },
  { name: 'India', code: 'IN', phone: '91' },
  { name: 'Brazil', code: 'BR', phone: '55' },
  // Add more as needed or use a library
];

export default function CountrySelector() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const filteredCountries = COUNTRIES.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.phone.includes(search) ||
    c.code.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = async (country: any) => {
    setIsLoading(true);
    // Here we would store the selected country in a store
    await new Promise(resolve => setTimeout(resolve, 300));
    setIsLoading(false);
    router.push('/signup/phone' as any);
  };

  return (
    <View style={styles.container}>
      <ChartAppBar
        title="Select Country"
        centerTitle
        isLoading={isLoading}
        onBack={() => router.back()}
      />

      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Search size={20} color="rgba(255, 255, 255, 0.5)" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search country..."
            placeholderTextColor="rgba(255, 255, 255, 0.5)"
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </View>

      <FlatList
        data={filteredCountries}
        keyExtractor={(item) => item.code}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.countryItem}
            onPress={() => handleSelect(item)}
            disabled={isLoading}
          >
            <Text style={styles.countryName}>{item.name}</Text>
            <Text style={styles.countryCode}>{item.code} +{item.phone}</Text>
          </TouchableOpacity>
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
  searchContainer: {
    padding: 16,
  },
  searchBar: {
    height: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    color: colors.text,
    fontSize: 16,
  },
  countryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  countryName: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '500',
  },
  countryCode: {
    color: colors.textSecondary,
    fontSize: 14,
  },
});

