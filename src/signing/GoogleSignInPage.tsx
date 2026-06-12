import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator, Image, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, UserPlus } from 'lucide-react-native';
import { useThemeSettings } from '@/core/theme/theme_provider';
import { useLocalization } from '@/core/localization/LocalizationProvider';
import { colors } from '@/core/theme/colors';

export default function GoogleSignInPage() {
    const router = useRouter();
    const { tr } = useLocalization();
    const { themeMode } = useThemeSettings();

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [emails, setEmails] = useState<string[]>([]);

    useEffect(() => {
        loadDeviceAccounts();
    }, []);

    const loadDeviceAccounts = async () => {
        if (Platform.OS !== 'android') {
            setLoading(false);
            setError(tr('google_android_only') || 'Android only');
            return;
        }

        try {
            // Mocking the MethodChannel('Chart.dev/account')
            await new Promise(resolve => setTimeout(resolve, 1000));
            const mockAccounts = ['testuser1@gmail.com', 'admin.chart@gmail.com'];
            
            setEmails(mockAccounts);
            if (mockAccounts.length === 0) {
                setError(tr('google_no_accounts'));
            }
        } catch (e: any) {
            setError(`${tr('google_error_reading')}: ${e.message}`);
            setEmails([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectEmail = (email: string) => {
        // Return email and pop
        if (router.canGoBack()) {
            router.back();
            // TODO: In a real flow, you'd pass the email parameter back or set it in the auth store
        } else {
            router.replace('/landing' as any);
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <ChevronLeft size={24} color={colors.text} />
                    </TouchableOpacity>
                </View>

                <View style={styles.titleSection}>
                    <Image 
                        source={{ uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Google_2015_logo.svg/1200px-Google_2015_logo.svg.png' }} 
                        style={styles.googleLogo} 
                        resizeMode="contain" 
                    />
                    <Text style={[styles.title, { color: colors.text }]}>
                        {tr('choose_account')}
                    </Text>
                    <View style={styles.subtitleRow}>
                        <Text style={[styles.subtitle, { color: 'rgba(255, 255, 255, 0.7)' }]}>
                            {tr('continue_to')} 
                        </Text>
                        <Text style={[styles.brandText, { color: colors.text }]}> Chart</Text>
                    </View>
                </View>

                <View style={styles.listContainer}>
                    {loading ? (
                        <ActivityIndicator size="large" color={colors.primary} />
                    ) : emails.length === 0 ? (
                        <Text style={[styles.errorText, { color: 'rgba(255, 255, 255, 0.7)' }]}>
                            {error || tr('google_no_accounts')}
                        </Text>
                    ) : (
                        <FlatList
                            data={emails}
                            keyExtractor={(item) => item}
                            renderItem={({ item }) => {
                                const initials = item.length > 0 ? item[0].toUpperCase() : 'A';
                                const name = item.split('@')[0];
                                return (
                                    <View>
                                        <TouchableOpacity 
                                            style={styles.accountTile} 
                                            onPress={() => handleSelectEmail(item)}
                                        >
                                            <View style={[styles.avatar, { backgroundColor: '#2196F3' }]}>
                                                <Text style={styles.avatarText}>{initials}</Text>
                                            </View>
                                            <View style={styles.accountInfo}>
                                                <Text style={[styles.accountName, { color: colors.text }]}>{name}</Text>
                                                <Text style={[styles.accountEmail, { color: 'rgba(255, 255, 255, 0.7)' }]}>{item}</Text>
                                            </View>
                                        </TouchableOpacity>
                                        <View style={[styles.divider, { backgroundColor: 'rgba(255, 255, 255, 0.1)' }]} />
                                    </View>
                                );
                            }}
                        />
                    )}
                </View>

                <TouchableOpacity style={styles.useAnotherButton} onPress={() => router.back()}>
                    <UserPlus size={20} color="rgba(255, 255, 255, 0.7)" />
                    <Text style={[styles.useAnotherText, { color: colors.text }]}>
                        {tr('use_another')}
                    </Text>
                </TouchableOpacity>
                <View style={[styles.divider, { backgroundColor: 'rgba(255, 255, 255, 0.1)' }]} />

                <Text style={[styles.privacyNotice, { color: 'rgba(255, 255, 255, 0.5)' }]}>
                    {tr('google_privacy_notice')}
                </Text>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    safeArea: { flex: 1 },
    header: {
        height: 56,
        justifyContent: 'center',
        paddingHorizontal: 8,
    },
    backButton: {
        padding: 8,
    },
    titleSection: {
        alignItems: 'center',
        paddingHorizontal: 24,
        marginTop: 40,
        marginBottom: 32,
    },
    googleLogo: {
        height: 32,
        width: 100,
        marginBottom: 16,
    },
    title: {
        fontSize: 22,
        fontWeight: '400',
        marginBottom: 8,
    },
    subtitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    subtitle: {
        fontSize: 14,
    },
    brandText: {
        fontSize: 14,
        fontWeight: 'bold',
    },
    listContainer: {
        flex: 1,
        justifyContent: 'center',
    },
    errorText: {
        textAlign: 'center',
        paddingHorizontal: 32,
        fontSize: 14,
    },
    accountTile: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 32,
    },
    avatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    avatarText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: 'bold',
    },
    accountInfo: {
        flex: 1,
    },
    accountName: {
        fontSize: 14,
        fontWeight: '500',
    },
    accountEmail: {
        fontSize: 12,
        marginTop: 2,
    },
    divider: {
        height: 1,
    },
    useAnotherButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 32,
    },
    useAnotherText: {
        fontSize: 14,
        fontWeight: '500',
        marginLeft: 16,
    },
    privacyNotice: {
        textAlign: 'center',
        fontSize: 12,
        lineHeight: 18,
        padding: 24,
    },
});
