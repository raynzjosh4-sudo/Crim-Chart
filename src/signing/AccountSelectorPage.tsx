import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CheckCircle2, User } from 'lucide-react-native';
import { useThemeSettings } from '@/core/theme/theme_provider';
import { useLocalization } from '@/core/localization/LocalizationProvider';
import ChartAppBar from '@/components/chartappbar/ChartAppBar';
import { colors } from '@/core/theme/colors';
import { useAuthStore } from '@/features/auth/application/useAuthStore';
import { ChartToast } from '@/components/showcase/CrimChart_toast';

// Types
export interface SavedAccount {
    id: string;
    name: string;
    avatar: string;
    notificationsCount: number;
}

// Mock Hook for Saved Accounts (Replace with actual backend logic later)
const useSavedAccounts = () => {
    const [accounts, setAccounts] = useState<SavedAccount[] | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Simulate network fetch
        const fetchAccounts = async () => {
            try {
                await new Promise(resolve => setTimeout(resolve, 1000));
                setAccounts([
                    {
                        id: '1',
                        name: 'Jane Doe',
                        avatar: '',
                        notificationsCount: 2,
                    },
                    {
                        id: '2',
                        name: 'John Smith',
                        avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704d',
                        notificationsCount: 0,
                    }
                ]);
            } catch (err) {
                setError('Failed to load accounts');
            } finally {
                setLoading(false);
            }
        };

        fetchAccounts();
    }, []);

    return { data: accounts, loading, error };
};

// Mock Hook for Auth Controller Extension
const useAuthController = () => {
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const { signOut } = useAuthStore(); // Using the existing auth store

    const switchAccount = async (id: string): Promise<boolean> => {
        try {
            // Simulate switch account
            await new Promise(resolve => setTimeout(resolve, 800));
            // Simulate success
            return true;
        } catch (error) {
            setErrorMessage('Failed to switch account');
            return false;
        }
    };

    return { switchAccount, errorMessage };
};

export default function AccountSelectorPage() {
    const router = useRouter();
    const { tr } = useLocalization();
    const { themeMode } = useThemeSettings();

    const { data: accounts, loading, error } = useSavedAccounts();
    const { switchAccount, errorMessage } = useAuthController();

    const handleBack = () => {
        if (router.canGoBack()) {
            router.back();
        } else {
            router.replace('/landing' as any);
        }
    };

    const handleSwitchAccount = async (account: SavedAccount) => {
        const success = await switchAccount(account.id);
        if (success) {
            // Assuming the main feed is at the root tabs
            router.replace('/(tabs)' as any);
        } else if (errorMessage) {
            ChartToast.showError(null, { title: 'Notice', message: errorMessage });
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <ChartAppBar 
                title="" 
                showBorder={false} 
                backgroundColor={colors.background}
                onBack={handleBack}
            />
            <SafeAreaView style={styles.safeArea} edges={['bottom', 'left', 'right']}>
                {/* Background Radial Glow */}
                <View style={[styles.radialGlow, { backgroundColor: colors.primary }]} />

                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    {/* Centered Chart Logo */}
                    <View style={styles.logoContainer}>
                        <Image 
                            // TODO: Replace with require('@/assets/icons/playstore.png') when asset is added
                            source={require('../../../assets/images/react-logo.png')} 
                            style={styles.logo}
                            resizeMode="contain"
                        />
                    </View>

                    {/* Accounts List */}
                    <View style={styles.accountsContainer}>
                        {loading ? (
                            <ActivityIndicator size="large" color={colors.primary} style={styles.loader} />
                        ) : error ? (
                            <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
                        ) : !accounts || accounts.length === 0 ? (
                            <Text style={[styles.emptyText, { color: colors.text }]}>No saved accounts</Text>
                        ) : (
                            accounts.map((account, index) => (
                                <AccountCard 
                                    key={account.id}
                                    account={account}
                                    isHighlight={index === 0}
                                    onLogin={() => handleSwitchAccount(account)}
                                />
                            ))
                        )}
                    </View>
                </ScrollView>

                {/* Bottom Navigation Actions */}
                <View style={[styles.bottomNav, { backgroundColor: colors.background, borderTopColor: 'rgba(255,255,255,0.1)' }]}>
                    <TouchableOpacity activeOpacity={1} 
                        style={styles.bottomNavButton} 
                        onPress={() => router.push('/login' as any)}
                    >
                        <Text style={[styles.bottomNavText, { color: colors.primary }]}>Email</Text>
                    </TouchableOpacity>
                    
                    <View style={[styles.divider, { backgroundColor: 'rgba(255,255,255,0.1)' }]} />
                    
                    <TouchableOpacity activeOpacity={1} 
                        style={styles.bottomNavButton} 
                        onPress={() => router.replace('/landing' as any)}
                    >
                        <Text style={[styles.bottomNavText, { color: colors.primary }]}>
                            {tr('account_selector_create')}
                        </Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        </View>
    );
}

const AccountCard = ({ 
    account, 
    isHighlight, 
    onLogin 
}: { 
    key?: string | number;
    account: SavedAccount; 
    isHighlight: boolean; 
    onLogin: () => void | Promise<void>;
}) => {
    const { tr } = useLocalization();

    return (
        <View style={styles.cardContainer}>
            <View style={[styles.cardContent, { backgroundColor: 'rgba(255,255,255,0.04)' }]}>
                {/* Avatar */}
                <View style={[
                    styles.avatarWrapper, 
                    isHighlight && { borderColor: colors.primary, borderWidth: 2, padding: 2 }
                ]}>
                    {account.avatar ? (
                        <Image source={{ uri: account.avatar }} style={styles.avatar} />
                    ) : (
                        <View style={[styles.avatarPlaceholder, { backgroundColor: 'rgba(255,255,255,0.05)' }]}>
                            <User color="rgba(255,255,255,0.2)" size={24} />
                        </View>
                    )}
                </View>

                {/* Name & Metadata */}
                <View style={styles.infoContainer}>
                    <View style={styles.nameRow}>
                        <Text style={[styles.nameText, { color: colors.text }]} numberOfLines={1}>
                            {account.name}
                        </Text>
                        {isHighlight && (
                            <CheckCircle2 color={colors.primary} size={16} style={styles.checkIcon} />
                        )}
                    </View>
                    {account.notificationsCount > 0 && (
                        <Text style={[styles.notificationText, { color: colors.primary }]}>
                            {account.notificationsCount} {tr('notifications_count')}
                        </Text>
                    )}
                </View>

                {/* Login Button */}
                <TouchableOpacity activeOpacity={1} style={styles.loginButton} onPress={onLogin}>
                    <Text style={[styles.loginButtonText, { color: colors.primary }]}>
                        {tr('account_selector_login')}
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    safeArea: {
        flex: 1,
    },
    radialGlow: {
        position: 'absolute',
        top: -50,
        left: 20,
        right: 20,
        height: 300,
        borderRadius: 150,
        opacity: 0.1,
    },
    scrollContent: {
        paddingBottom: 100, // Extra space to scroll past the bottom bar
    },
    logoContainer: {
        alignItems: 'center',
        marginTop: 48,
        marginBottom: 48,
    },
    logo: {
        width: 80,
        height: 80,
    },
    accountsContainer: {
        paddingHorizontal: 24,
    },
    loader: {
        marginTop: 32,
    },
    errorText: {
        textAlign: 'center',
        padding: 16,
    },
    emptyText: {
        textAlign: 'center',
        padding: 16,
    },
    cardContainer: {
        marginBottom: 12,
        borderRadius: 20,
        overflow: 'hidden',
    },
    cardContent: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 16,
    },
    avatarWrapper: {
        borderRadius: 50,
    },
    avatar: {
        width: 56,
        height: 56,
        borderRadius: 28,
    },
    avatarPlaceholder: {
        width: 56,
        height: 56,
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
    },
    infoContainer: {
        flex: 1,
        marginLeft: 16,
    },
    nameRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    nameText: {
        fontSize: 16,
        fontWeight: 'bold',
        flexShrink: 1,
    },
    checkIcon: {
        marginLeft: 8,
    },
    notificationText: {
        fontSize: 12,
        fontWeight: '600',
        marginTop: 4,
    },
    loginButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    loginButtonText: {
        fontSize: 13,
        fontWeight: '900',
        letterSpacing: 0.5,
    },
    bottomNav: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        borderTopWidth: 0.5,
    },
    bottomNavButton: {
        flex: 1,
        paddingVertical: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    bottomNavText: {
        fontSize: 14,
        fontWeight: '600',
    },
    divider: {
        width: 1,
        height: 24,
        alignSelf: 'center',
    },
});

