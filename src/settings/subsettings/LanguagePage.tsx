import { Check, Search } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View, FlatList } from 'react-native';
import { useTranslation } from '@/core/localization/i18n';
import ChartAppBar from '@/components/chartappbar/ChartAppBar';
import { colors } from '@/core/theme/colors';
import { useRouter } from 'expo-router';

const LANGUAGES = [
    { code: 'en', native: 'English', english: 'English' },
    { code: 'es', native: 'Español', english: 'Spanish' },
    { code: 'sw', native: 'Kiswahili', english: 'Swahili' },
    { code: 'lg', native: 'Luganda', english: 'Luganda' },
];

const LanguagePage: React.FC = () => {
    const router = useRouter();
    const { t, lang: currentLang, setLanguage } = useTranslation();
    const [searchQuery, setSearchQuery] = React.useState('');

    const filteredLanguages = React.useMemo(() => {
        const query = searchQuery.toLowerCase();
        return LANGUAGES.filter(
            (lang) =>
                lang.native.toLowerCase().includes(query) ||
                lang.english.toLowerCase().includes(query)
        );
    }, [searchQuery]);

    const handleLanguageChange = (code: string) => {
        setLanguage(code as any);
        router.back();
    };

    const renderItem = ({ item: lang }: { item: typeof LANGUAGES[0] }) => {
        const isSelected = currentLang === lang.code;

        return (
            <TouchableOpacity activeOpacity={1}
                style={styles.languageItem}
                onPress={() => handleLanguageChange(lang.code)}
            >
                <View>
                    <Text style={styles.nativeName}>{lang.native}</Text>
                    <Text style={styles.englishName}>{lang.english}</Text>
                </View>

                {isSelected && <Check color={colors.primary} size={20} />}
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            <ChartAppBar title={t('language')} showBorder={true} />

            <View style={styles.searchContainer}>
                <View style={styles.searchInputContainer}>
                    <Search color={colors.primary} size={20} style={styles.searchIcon} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search language"
                        placeholderTextColor="rgba(255, 255, 255, 0.3)"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>
            </View>

            <FlatList
                data={filteredLanguages}
                keyExtractor={(item) => item.code}
                renderItem={renderItem}
                contentContainerStyle={styles.listContent}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    searchContainer: {
        padding: 16,
    },
    searchInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    searchIcon: {
        marginRight: 12,
    },
    searchInput: {
        flex: 1,
        color: '#FFF',
        fontSize: 16,
    },
    listContent: {
        paddingBottom: 24,
    },
    languageItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.05)',
    },
    nativeName: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '500',
        marginBottom: 4,
    },
    englishName: {
        color: 'rgba(255, 255, 255, 0.5)',
        fontSize: 14,
    },
});

export default LanguagePage;
