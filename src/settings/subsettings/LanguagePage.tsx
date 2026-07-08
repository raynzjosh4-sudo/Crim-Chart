import { Check, Search } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View, FlatList, useWindowDimensions, Platform } from 'react-native';
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

interface LanguagePageProps {
    onClose?: () => void;
}

const LanguagePage: React.FC<LanguagePageProps> = ({ onClose }) => {
    const router = useRouter();
    const { t, lang: currentLang, setLanguage } = useTranslation();
    const [searchQuery, setSearchQuery] = React.useState('');
    const { width } = useWindowDimensions();
    const isDesktop = Platform.OS === 'web' && width >= 768;

    const filteredLanguages = React.useMemo(() => {
        const query = searchQuery.toLowerCase();
        return LANGUAGES.filter(
            (lang) =>
                lang.native.toLowerCase().includes(query) ||
                lang.english.toLowerCase().includes(query)
        );
    }, [searchQuery]);

    const handleBack = () => {
        if (onClose) onClose();
        else router.back();
    };

    const handleLanguageChange = (code: string) => {
        setLanguage(code as any);
        handleBack();
    };

    const renderItem = ({ item: lang }: { item: typeof LANGUAGES[0] }) => {
        const isSelected = currentLang === lang.code;

        return (
            <TouchableOpacity activeOpacity={1}
                style={[styles.languageItem, isDesktop && styles.desktopLanguageItem]}
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
            <View style={isDesktop ? styles.desktopContainer : styles.mobileContainer}>
                <ChartAppBar title={t('language')} showBorder={true} onBack={handleBack} />

                <View style={styles.searchContainer}>
                    <View style={styles.searchInputContainer}>
                        <Search color={colors.primary} size={20} style={styles.searchIcon} />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Search language"
                            placeholderTextColor="rgba(255, 255, 255, 0.3)"
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            outlineStyle="none"
                        />
                    </View>
                </View>

                <FlatList
                    data={filteredLanguages}
                    keyExtractor={(item) => item.code}
                    renderItem={renderItem}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
        alignItems: 'center',
    },
    mobileContainer: {
        flex: 1,
        width: '100%',
    },
    desktopContainer: {
        flex: 1,
        width: '100%',
        maxWidth: 600,
        backgroundColor: colors.background,
        marginVertical: 40,
        borderRadius: 16,
        overflow: 'hidden',
        ...(Platform.OS === 'web' ? {
            boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
        } : {}),
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
        color: colors.text,
        fontSize: 16,
        ...(Platform.OS === 'web' ? { outlineStyle: 'none' } : {}),
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
    },
    desktopLanguageItem: {
        paddingHorizontal: 24,
        ...(Platform.OS === 'web' ? { cursor: 'pointer', transition: 'background-color 0.2s ease' } : {}),
    },
    nativeName: {
        color: colors.text,
        fontSize: 16,
        fontWeight: '500',
        marginBottom: 4,
    },
    englishName: {
        color: colors.textSecondary,
        fontSize: 14,
    },
});

export default LanguagePage;
