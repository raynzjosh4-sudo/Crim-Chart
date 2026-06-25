import ChartAppBar from '@/components/chartappbar/ChartAppBar';
import { colors } from '@/core/theme/colors';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/features/auth/application/useAuthStore';
import { ChartToast } from '@/components/showcase/CrimChart_toast';
import { Search } from 'lucide-react-native';
import React, { useState } from 'react';
import { FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { customArray } from 'country-codes-list';

const COUNTRIES = customArray({
  name: '{countryNameEn}',
  code: '{countryCode}',
  phone: '{countryCallingCode}'
}).sort((a, b) => a.name.localeCompare(b.name));

export default function CountrySelector() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const authStore = useAuthStore();

  const filteredCountries = COUNTRIES.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.phone.includes(search) ||
    c.code.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = async (country: any) => {
    setIsLoading(true);
    authStore.setCountryName(country.name);

    if (authStore.pendingGoogleOnboarding) {
      setIsLoading(false);
      router.push('/signup/username' as any);
    } else {
      setIsLoading(false);
      router.push('/signup/phone' as any);
    }
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
        keyExtractor={(item, index) => `${item.code}-${index}`}
        renderItem={({ item }) => (
          <TouchableOpacity activeOpacity={1}
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

