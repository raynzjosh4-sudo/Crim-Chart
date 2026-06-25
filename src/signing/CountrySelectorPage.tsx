import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, FlatList, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search } from 'lucide-react-native';
import { useThemeSettings } from '@/core/theme/theme_provider';
import { useLocalization } from '@/core/localization/LocalizationProvider';
import ChartAppBar from '@/components/chartappbar/ChartAppBar';
import { colors } from '@/core/theme/colors';
import { useAuthStore } from '@/features/auth/application/useAuthStore';

// Simple mock for countries
const DUMMY_COUNTRIES = [
    { name: 'United States', code: 'US', phoneCode: '1' },
    { name: 'United Kingdom', code: 'GB', phoneCode: '44' },
    { name: 'Canada', code: 'CA', phoneCode: '1' },
    { name: 'Australia', code: 'AU', phoneCode: '61' },
    { name: 'Germany', code: 'DE', phoneCode: '49' },
    { name: 'France', code: 'FR', phoneCode: '33' },
    { name: 'India', code: 'IN', phoneCode: '91' },
    { name: 'Japan', code: 'JP', phoneCode: '81' },
];

export default function CountrySelectorPage() {
    const router = useRouter();
    const { tr } = useLocalization();
    const { themeMode } = useThemeSettings();
    const authStore = useAuthStore();

    const [searchQuery, setSearchQuery] = useState('');
    const [filteredCountries, setFilteredCountries] = useState(DUMMY_COUNTRIES);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const query = searchQuery.toLowerCase();
        setFilteredCountries(
            DUMMY_COUNTRIES.filter(c => 
                c.name.toLowerCase().includes(query) || 
                c.phoneCode.includes(query) || 
                c.code.toLowerCase().includes(query)
            )
        );
    }, [searchQuery]);

    const handleSelectCountry = async (country: any) => {
        if (isLoading) return;
        setIsLoading(true);

        authStore.startSignUp(`+${country.phoneCode}`, country.name);

        await new Promise(resolve => setTimeout(resolve, 300));
        setIsLoading(false);
        router.push('/phoneNumber' as any); // Assuming this is the route
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <ChartAppBar 
                title={tr('select_country')} 
                showBorder={true} 
                centerTitle={true}
                isLoading={isLoading}
                backgroundColor={colors.background}
            />
            <SafeAreaView style={styles.safeArea} edges={['bottom', 'left', 'right']}>
                <View style={styles.searchContainer}>
                    <View style={[styles.searchBox, { backgroundColor: 'rgba(255, 255, 255, 0.05)' }]}>
                        <Search size={20} color="rgba(255, 255, 255, 0.5)" style={styles.searchIcon} />
                        <TextInput
                            style={[styles.searchInput, { color: colors.text }]}
                            placeholder={tr('search_country')}
                            placeholderTextColor="rgba(255, 255, 255, 0.5)"
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                    </View>
                </View>

                <FlatList
                    data={filteredCountries}
                    keyExtractor={(item) => item.code}
                    renderItem={({ item }) => (
                        <TouchableOpacity activeOpacity={1} 
                            style={styles.countryRow} 
                            onPress={() => handleSelectCountry(item)}
                            disabled={isLoading}
                        >
                            <Text style={[styles.countryName, { color: colors.text }]}>{item.name}</Text>
                            <Text style={[styles.countryCode, { color: 'rgba(255, 255, 255, 0.5)' }]}>
                                {item.code} +{item.phoneCode}
                            </Text>
                        </TouchableOpacity>
                    )}
                />
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    safeArea: { flex: 1 },
    searchContainer: {
        padding: 16,
    },
    searchBox: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 48,
        borderRadius: 12,
        paddingHorizontal: 16,
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        height: '100%',
    },
    countryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 16,
        paddingHorizontal: 24,
    },
    countryName: {
        fontSize: 16,
        fontWeight: '500',
    },
    countryCode: {
        fontSize: 14,
    },
});
