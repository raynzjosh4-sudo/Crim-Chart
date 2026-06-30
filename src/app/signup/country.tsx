import ChartAppBar from '@/components/chartappbar/ChartAppBar';
import { colors } from '@/core/theme/colors';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/features/auth/application/useAuthStore';
import { ChartToast } from '@/components/showcase/CrimChart_toast';
import { Search } from 'lucide-react-native';
import { useGlobalProgress } from '@/components/globalProgressBar/GlobalProgressBar';
import React, { useState } from 'react';
import { FlatList, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View, useWindowDimensions } from 'react-native';

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
  const { startLoading, stopLoading } = useGlobalProgress();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  const authStore = useAuthStore();

  const filteredCountries = COUNTRIES.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.phone.includes(search) ||
    c.code.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = async (country: any) => {
    if (isLoading) return;
    setIsLoading(true);
    startLoading();

    // Adding slight artificial delay for smooth transition and showing off the global spinner
    await new Promise(resolve => setTimeout(resolve, 400));

    if (authStore.status === 'authenticated' && authStore.user) {
      const success = await authStore.updateProfile({ country: country.name });
      stopLoading();
      if (success) {
        router.replace('/(tabs)' as any);
      } else {
        ChartToast.showError(null, { title: 'Error', message: 'Failed to update country' });
      }
      setTimeout(() => setIsLoading(false), 1000);
      return;
    }

    if (authStore.pendingGoogleOnboarding) {
      authStore.setCountryName(country.name);
      
      const success = await authStore.completeGoogleOnboarding();
      stopLoading();
      
      if (success) {
        router.push('/signup/username' as any);
      } else {
        ChartToast.showError(null, { title: 'Error', message: 'Failed to create profile' });
      }
      setTimeout(() => setIsLoading(false), 1000);
    } else {
      authStore.startSignUp(country.code || '', country.name);
      stopLoading();
      router.push('/signup/email' as any);
      setTimeout(() => setIsLoading(false), 1000);
    }
  };

  return (
    <View style={styles.container}>
      {!isDesktop && (
        <ChartAppBar
          title="Select Country"
          centerTitle
          isLoading={isLoading}
          onBack={() => router.back()}
        />
      )}

      <View style={isDesktop ? styles.desktopWrapper : styles.flexOne}>
        <View style={[styles.content, isDesktop && styles.desktopModal]}>
          {isDesktop && (
            <Text style={styles.desktopTitle}>
              Select Country
            </Text>
          )}

          <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Search size={20} color="rgba(255, 255, 255, 0.5)" />
          <TextInput
            style={[styles.searchInput, Platform.OS === 'web' ? { outlineStyle: 'none' } as any : {}]}
            placeholder="Search country..."
            placeholderTextColor="rgba(255, 255, 255, 0.5)"
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </View>

      <FlatList
        style={{ flex: 1 }}
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
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  desktopWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
  },
  desktopModal: {
    width: '100%',
    maxWidth: 600,
    backgroundColor: '#16181c',
    borderRadius: 16,
    paddingTop: 32,
    paddingBottom: 16,
    paddingHorizontal: 16,
    height: '80%',
    maxHeight: 700,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
  },
  content: {
    flex: 1,
    width: '100%',
  },
  flexOne: {
    flex: 1,
  },
  desktopTitle: {
    textAlign: 'center',
    color: colors.text,
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  searchContainer: {
    padding: 16,
    paddingTop: 0,
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

