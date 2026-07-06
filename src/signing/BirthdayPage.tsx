import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import { MaterialIcons } from '@expo/vector-icons';
import { useThemeSettings } from '@/core/theme/theme_provider';
import { useLocalization } from '@/core/localization/LocalizationProvider';
import ChartAppBar from '@/components/chartappbar/ChartAppBar';
import { colors } from '@/core/theme/colors';
import { ChartToast } from '@/components/showcase/CrimChart_toast';
import { useAuthStore } from '@/features/auth/application/useAuthStore';

const calculateAge = (birthDate: Date) => {
    const currentDate = new Date();
    let age = currentDate.getFullYear() - birthDate.getFullYear();
    const month1 = currentDate.getMonth();
    const month2 = birthDate.getMonth();
    if (month2 > month1 || (month1 === month2 && birthDate.getDate() > currentDate.getDate())) {
        age--;
    }
    return age;
};

// Removed mock hook

export default function BirthdayPage() {
    const router = useRouter();
    const { tr } = useLocalization();
    const { themeMode } = useThemeSettings();
    const authStore = useAuthStore();

    const now = new Date();
    // 1. Set the maximum allowed date to exactly 13 years ago today
    const initialMaxDate = new Date(now.getFullYear() - 13, now.getMonth(), now.getDate());

    const savedDateStr = authStore.pendingSignUp?.birthday;
    // Cast to any to get gender if it hasn't been officially typed in useAuthStore yet
    const savedGender = (authStore.pendingSignUp as any)?.gender;

    const [selectedDate, setSelectedDate] = useState<Date>(
        savedDateStr ? new Date(savedDateStr) : initialMaxDate
    );
    const [selectedGender, setSelectedGender] = useState<string | null>(savedGender || null);
    const [isLoading, setIsLoading] = useState(false);

    const genders = [
        { id: 'male', label: tr('male'), icon: 'male' },
        { id: 'female', label: tr('female'), icon: 'female' },
        { id: 'other', label: tr('other'), icon: 'person-outline' },
    ];

    const handleNext = async () => {
        const age = calculateAge(selectedDate);
        if (age < 13) {
            ChartToast.showError(null, {
                title: tr('birthday_error_age_title'),
                message: tr('birthday_error_age_message'),
            });
            return;
        }

        if (!selectedGender) return;

        setIsLoading(true);

        if (authStore.pendingGoogleOnboarding) {
            authStore.setBirthday(selectedDate);
            authStore.setGender(selectedGender);
            
            setIsLoading(false);
            router.push('/musicCategory' as any);
        } else {
            // For email signup flow, the profile was already created in OtpVerificationPage.
            // We just need to update it now.
            const success = await authStore.updateProfile({
                birthday: selectedDate.toISOString(),
                gender: selectedGender,
            });
            setIsLoading(false);

            if (success) {
                router.push('/musicCategory' as any);
            } else {
                ChartToast.showError(null, {
                    title: tr('birthday_error_update_title') || 'Error',
                    message: authStore.errorMessage || tr('birthday_error_update_message') || 'Failed to update profile',
                });
            }
        }
    };

    const isNextDisabled = !selectedGender || isLoading;

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <ChartAppBar 
                title="" 
                showBorder={true} 
                isLoading={isLoading} 
                backgroundColor={colors.background} 
            />
            
            <View style={styles.content}>
                <Text style={[styles.title, { color: colors.text }]}>
                    {tr('birthday_title')}
                </Text>
                
                <Text style={[styles.subtitle, { color: 'rgba(255, 255, 255, 0.6)' }]}>
                    {tr('birthday_subtitle')}
                </Text>

                <View style={styles.datePickerContainer}>
                    <DateTimePicker
                        value={selectedDate}
                        mode="date"
                        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                        maximumDate={initialMaxDate}
                        onChange={(event, date) => {
                            if (date) setSelectedDate(date);
                        }}
                        textColor={colors.text} // Prop supported on iOS for spinner theming
                        style={styles.datePicker}
                    />
                </View>

                <Text style={[styles.genderTitle, { color: colors.text }]}>
                    {tr('select_gender')}
                </Text>

                <View style={styles.genderRow}>
                    {genders.map((gender) => {
                        const isSelected = selectedGender === gender.id;
                        return (
                            <TouchableOpacity
                                key={gender.id}
                                style={styles.genderWrapper}
                                onPress={() => setSelectedGender(gender.id)}
                                activeOpacity={0.7}
                            >
                                <View style={[
                                    styles.genderCard,
                                    {
                                        backgroundColor: isSelected 
                                            ? `${colors.primary}1A` 
                                            : 'rgba(255, 255, 255, 0.05)',
                                        borderColor: isSelected 
                                            ? colors.primary 
                                            : 'transparent',
                                    }
                                ]}>
                                    <MaterialIcons
                                        name={gender.icon as any}
                                        size={24}
                                        color={isSelected ? colors.primary : 'rgba(255, 255, 255, 0.5)'}
                                    />
                                    <Text style={[
                                        styles.genderLabel,
                                        {
                                            color: isSelected ? colors.text : 'rgba(255, 255, 255, 0.5)',
                                            fontWeight: isSelected ? 'bold' : 'normal',
                                        }
                                    ]}>
                                        {gender.label}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        );
                    })}
                </View>

                <View style={styles.spacer} />

                <TouchableOpacity activeOpacity={1}
                    style={[
                        styles.nextButton,
                        { backgroundColor: isNextDisabled ? 'rgba(255, 255, 255, 0.1)' : colors.primary }
                    ]}
                    onPress={handleNext}
                    disabled={isNextDisabled}
                >
                    {isLoading ? (
                        <ActivityIndicator color={colors.surface} />
                    ) : (
                        <Text style={[styles.nextButtonText, { color: colors.surface }]}>
                            {tr('next')}
                        </Text>
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
        paddingHorizontal: 24,
        paddingTop: 20,
        paddingBottom: 40,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 12,
    },
    subtitle: {
        fontSize: 14,
        lineHeight: 20,
        marginBottom: 32,
    },
    datePickerContainer: {
        height: 160,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 32,
    },
    datePicker: {
        width: '100%',
        height: '100%',
    },
    genderTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    genderRow: {
        flexDirection: 'row',
        marginHorizontal: -4,
    },
    genderWrapper: {
        flex: 1,
        paddingHorizontal: 4,
    },
    genderCard: {
        paddingVertical: 12,
        borderRadius: 12,
        borderWidth: 2,
        alignItems: 'center',
        justifyContent: 'center',
    },
    genderLabel: {
        fontSize: 12,
        marginTop: 4,
    },
    spacer: {
        flex: 1,
    },
    nextButton: {
        height: 52,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
    },
    nextButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
});
