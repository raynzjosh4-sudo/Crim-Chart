import ChartAppBar from '@/components/chartappbar/ChartAppBar';
import { ChartToast } from '@/components/showcase/CrimChart_toast';
import { useAuthStore } from '@/features/auth/application/useAuthStore';
import { colors } from '@/core/theme/colors';
import RNDateTimePicker from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';
import { Mars, User as UserIcon, Venus } from 'lucide-react-native';
import React, { useState, useRef } from 'react';
import { Platform, StyleSheet, Text, TextInput, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useGlobalProgress } from '@/components/globalProgressBar/GlobalProgressBar';
import { useTranslation } from '@/core/localization/i18n';

export default function BirthdayPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const { pendingSignUp, updateProfile } = useAuthStore();
  const { startLoading, stopLoading } = useGlobalProgress();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  const now = new Date();
  const maxDate = new Date(now.getFullYear() - 13, now.getMonth(), now.getDate());

  const [month, setMonth] = useState('');
  const [day, setDay] = useState('');
  const [year, setYear] = useState('');
  
  const monthRef = useRef<TextInput | null>(null);
  const dayRef = useRef<TextInput | null>(null);
  const yearRef = useRef<TextInput | null>(null);

  const [selectedGender, setSelectedGender] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const validateBirthday = () => {
    const m = parseInt(month, 10);
    const d = parseInt(day, 10);
    const y = parseInt(year, 10);
    
    if (!m || !d || !y || m < 1 || m > 12 || d < 1 || d > 31 || y < 1900 || y > now.getFullYear()) {
      return false;
    }
    
    const date = new Date(y, m - 1, d);
    if (date.getMonth() !== m - 1 || date.getDate() !== d) {
      return false; 
    }
    
    if (date > maxDate) {
      return 'too_young';
    }
    return date;
  };

  const handleNext = async () => {
    if (!selectedGender || isLoading) return;
    
    const validDate = validateBirthday();
    if (validDate === false) {
      ChartToast.showError(null, { title: 'Invalid Date', message: 'Please enter a valid birthday (MM/DD/YYYY).' });
      return;
    }
    if (validDate === 'too_young') {
      ChartToast.showError(null, { title: 'Age Restriction', message: 'You must be at least 13 years old to use CrimChart.' });
      return;
    }

    setIsLoading(true);
    startLoading();

    const selectedDate = validDate as Date;
    const authStore = useAuthStore.getState();
    authStore.setBirthday(selectedDate);
    authStore.setGender(selectedGender);

    await updateProfile({
      birthday: selectedDate.toISOString(),
      gender: selectedGender
    });

    stopLoading();
    router.push('/signup/bio' as any);
    setTimeout(() => setIsLoading(false), 1000);
  };

  const genders = [
    { id: 'male', label: 'Male', icon: Mars },
    { id: 'female', label: 'Female', icon: Venus },
    { id: 'other', label: 'Other', icon: UserIcon },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {!isDesktop && <ChartAppBar title="" showBorder isLoading={isLoading} />}

      <View style={isDesktop ? styles.desktopWrapper : styles.flexOne}>
        <View style={isDesktop ? styles.desktopModal : styles.content}>
          <Text style={[styles.title, isDesktop && { textAlign: 'center', marginBottom: 12, fontSize: 28 }]}>When's your birthday?</Text>
        <Text style={styles.subtitle}>
          Your birthday won't be shown publicly. You must be at least 13 years old to use CrimChart.
        </Text>

        <View style={styles.spacerLarge} />

        <View style={styles.datePickerContainer}>
          <View style={styles.dateInputRow}>
            <TextInput
              ref={monthRef}
              style={[styles.dateInput, Platform.OS === 'web' ? { outlineStyle: 'none' } as any : {}]}
              placeholder="MM"
              placeholderTextColor="rgba(255, 255, 255, 0.2)"
              keyboardType="number-pad"
              maxLength={2}
              value={month}
              onChangeText={(text) => {
                const clean = text.replace(/[^0-9]/g, '');
                setMonth(clean);
                if (clean.length === 2) dayRef.current?.focus();
              }}
            />
            <Text style={styles.dateSeparator}>/</Text>
            <TextInput
              ref={dayRef}
              style={[styles.dateInput, Platform.OS === 'web' ? { outlineStyle: 'none' } as any : {}]}
              placeholder="DD"
              placeholderTextColor="rgba(255, 255, 255, 0.2)"
              keyboardType="number-pad"
              maxLength={2}
              value={day}
              onChangeText={(text) => {
                const clean = text.replace(/[^0-9]/g, '');
                setDay(clean);
                if (clean.length === 2) yearRef.current?.focus();
                if (clean.length === 0) monthRef.current?.focus();
              }}
            />
            <Text style={styles.dateSeparator}>/</Text>
            <TextInput
              ref={yearRef}
              style={[styles.dateInput, styles.yearInput, Platform.OS === 'web' ? { outlineStyle: 'none' } as any : {}]}
              placeholder="YYYY"
              placeholderTextColor="rgba(255, 255, 255, 0.2)"
              keyboardType="number-pad"
              maxLength={4}
              value={year}
              onChangeText={(text) => {
                const clean = text.replace(/[^0-9]/g, '');
                setYear(clean);
                if (clean.length === 0) dayRef.current?.focus();
              }}
            />
          </View>
        </View>

        <View style={styles.spacerLarge} />

        <Text style={styles.sectionTitle}>Select Gender</Text>
        <View style={styles.genderRow}>
          {genders.map((gender) => {
            const isSelected = selectedGender === gender.id;
            const Icon = gender.icon;
            return (
              <TouchableOpacity activeOpacity={1}
                key={gender.id}
                style={[
                  styles.genderItem,
                  isSelected && styles.genderItemSelected
                ]}
                onPress={() => setSelectedGender(gender.id)}
              >
                <Icon size={20} color={isSelected ? colors.primary : 'rgba(255, 255, 255, 0.5)'} />
                <Text style={[
                  styles.genderLabel,
                  isSelected && styles.genderLabelSelected
                ]}>{gender.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {isDesktop ? <View style={{ height: 40 }} /> : <View style={styles.flexOne} />}

        <TouchableOpacity activeOpacity={1}
          style={[styles.nextButton, (!selectedGender || month.length < 1 || day.length < 1 || year.length < 4) && styles.nextButtonDisabled]}
          onPress={handleNext}
          disabled={!selectedGender || month.length < 1 || day.length < 1 || year.length < 4 || isLoading}
        >
          <Text style={styles.nextButtonText}>{t('next') || 'Next'}</Text>
        </TouchableOpacity>

        <View style={styles.spacerLarge} />
        </View>
      </View>
    </SafeAreaView>
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
    paddingVertical: 40,
    paddingHorizontal: 40,
    minHeight: 500,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  title: {
    color: colors.text,
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 20,
  },
  subtitle: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 14,
    lineHeight: 20,
    marginTop: 12,
  },
  spacerLarge: {
    height: 32,
  },
  datePickerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 120,
  },
  dateInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
    gap: 12,
  },
  dateInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    color: colors.text,
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'center',
    width: 70,
    height: 70,
  },
  yearInput: {
    width: 100,
  },
  dateSeparator: {
    color: 'rgba(255, 255, 255, 0.3)',
    fontSize: 28,
    fontWeight: '300',
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  genderRow: {
    flexDirection: 'row',
    gap: 12,
  },
  genderItem: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  genderItemSelected: {
    backgroundColor: 'rgba(255, 179, 0, 0.1)',
    borderColor: colors.primary,
  },
  genderLabel: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 12,
    marginTop: 8,
  },
  genderLabelSelected: {
    color: colors.text,
    fontWeight: 'bold',
  },
  flexOne: {
    flex: 1,
  },
  nextButton: {
    backgroundColor: colors.primary,
    height: 52,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nextButtonDisabled: {
    opacity: 0.5,
  },
  nextButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

