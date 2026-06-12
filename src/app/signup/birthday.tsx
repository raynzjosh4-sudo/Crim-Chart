import ChartAppBar from '@/components/chartappbar/ChartAppBar';
import { useAuthStore } from '@/features/auth/application/useAuthStore';
import { colors } from '@/core/theme/colors';
import RNDateTimePicker from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';
import { Mars, User as UserIcon, Venus } from 'lucide-react-native';
import React, { useState } from 'react';
import { Platform, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function BirthdayPage() {
  const router = useRouter();
  const { pendingSignUp } = useAuthStore();

  const now = new Date();
  const maxDate = new Date(now.getFullYear() - 13, now.getMonth(), now.getDate());

  const [selectedDate, setSelectedDate] = useState(maxDate);
  const [selectedGender, setSelectedGender] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(Platform.OS === 'ios');

  const handleNext = async () => {
    if (!selectedGender) return;
    setIsLoading(true);

    // Update profile logic would go here
    await new Promise(resolve => setTimeout(resolve, 800));

    setIsLoading(false);
    router.push('/signup/profile-picture' as any);
  };

  const genders = [
    { id: 'male', label: 'Male', icon: Mars },
    { id: 'female', label: 'Female', icon: Venus },
    { id: 'other', label: 'Other', icon: UserIcon },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ChartAppBar title="" showBorder isLoading={isLoading} />

      <View style={styles.content}>
        <Text style={styles.title}>When's your birthday?</Text>
        <Text style={styles.subtitle}>
          Your birthday won't be shown publicly. You must be at least 13 years old to use CrimChart.
        </Text>

        <View style={styles.spacerLarge} />

        <View style={styles.datePickerContainer}>
          {Platform.OS === 'android' && (
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={styles.dateButtonText}>{selectedDate.toLocaleDateString()}</Text>
            </TouchableOpacity>
          )}

          {(showDatePicker || Platform.OS === 'ios') && (
            <RNDateTimePicker
              value={selectedDate}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              maximumDate={maxDate}
              onChange={(event, date) => {
                setShowDatePicker(Platform.OS === 'ios');
                if (date) setSelectedDate(date);
              }}
              textColor="#FFF"
              style={styles.picker}
            />
          )}
        </View>

        <View style={styles.spacerLarge} />

        <Text style={styles.sectionTitle}>Select Gender</Text>
        <View style={styles.genderRow}>
          {genders.map((gender) => {
            const isSelected = selectedGender === gender.id;
            const Icon = gender.icon;
            return (
              <TouchableOpacity
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

        <View style={styles.flexOne} />

        <TouchableOpacity
          style={[styles.nextButton, (!selectedGender) && styles.nextButtonDisabled]}
          onPress={handleNext}
          disabled={!selectedGender || isLoading}
        >
          <Text style={styles.nextButtonText}>Next</Text>
        </TouchableOpacity>

        <View style={styles.spacerLarge} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
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
    height: 160,
  },
  picker: {
    width: '100%',
    height: 160,
  },
  dateButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  dateButtonText: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '600',
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

