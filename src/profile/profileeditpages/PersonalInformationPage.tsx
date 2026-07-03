import ChartAppBar from '@/components/chartappbar/ChartAppBar';
import { ChartLinearLoader } from '@/components/CrimchartLoader/ChartLinearLoader';
import CrimchartBackButton from '@/components/CrimChartBackButton/CrimChart_back_button';
import { supabase } from '@/core/supabase/supabaseConfig';
import { colors } from '@/core/theme/colors';
import { useAuthStore } from '@/features/auth/application/useAuthStore';
import { ChartToast } from '@/components/showcase/CrimChart_toast';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';
import { ChevronRight, EyeOff, Plus, Star } from 'lucide-react-native';
import React, { useState } from 'react';
import { Modal, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View, TextInput, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const PersonalInformationPage = ({
  isModal = false,
  visible = true,
  onClose,
}: {
  isModal?: boolean;
  visible?: boolean;
  onClose?: () => void;
}) => {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const updateProfile = useAuthStore((s) => s.updateProfile);
  const isLoading = useAuthStore((s) => s.isLoading);
  const insets = useSafeAreaInsets();
  const isDesktop = Dimensions.get('window').width >= 768;

  // We should initialize with user's birthday/gender if available
  // but let's assume they might be in `user` object depending on CrimChartUserModel
  const [birthday, setBirthday] = useState<Date | undefined>(
    user?.birthday ? new Date(user.birthday) : undefined
  );
  const [gender, setGender] = useState<string | undefined>(user?.gender || undefined);
  const [email, setEmail] = useState<string>(user?.email || 'Loading...');
  const [crownTitle, setCrownTitle] = useState(user?.crownTitle || '');
  const [bio, setBio] = useState(user?.bio || '');

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showGenderModal, setShowGenderModal] = useState(false);

  React.useEffect(() => {
    const fetchEmail = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email) {
        setEmail(user.email);
      } else {
        setEmail('No email found');
      }
    };
    fetchEmail();
  }, []);

  const handleSave = async () => {
    if (isLoading) return;
    const success = await updateProfile({ birthday, gender, crown_title: crownTitle, bio });
    if (success) {
      ChartToast.showSuccess(null, {
        title: 'Success',
        message: 'Personal information updated successfully!',
      });
      if (isModal && onClose) onClose();
      else router.back();
    } else {
      ChartToast.showError(null, {
        title: 'Error',
        message: 'Failed to update profile.',
      });
    }
  };

  const handleBack = () => {
    if (isModal && onClose) onClose();
    else router.back();
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setBirthday(selectedDate);
    }
  };

  const selectGender = (selected: string) => {
    setGender(selected);
    setShowGenderModal(false);
  };

  const formatDate = (date?: Date) => {
    if (!date) return 'Not set';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  if (isModal && !visible) return null;

  return (
    <View style={[styles.container, isModal && isDesktop && styles.desktopContainer]}>
      <View style={[(isModal && isDesktop) ? styles.desktopModal : styles.pageWrapper]}>
      <ChartAppBar
        title="Personal Information"
        showBack={false}
        useSafeArea={!isModal}
        showBorder={!isModal}
        leading={<CrimchartBackButton onPress={handleBack} color={colors.text} />}
        actions={[
          <TouchableOpacity activeOpacity={1} key="save" onPress={handleSave} disabled={isLoading} style={styles.saveButton}>
            <Text style={[styles.saveText, isLoading && { opacity: 0.5 }]}>Save</Text>
          </TouchableOpacity>
        ]}
      />

      <ChartLinearLoader isLoading={isLoading} />

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.sectionHeader}>BASIC DETAILS</Text>

        {/* Birthday Field */}
        <TouchableOpacity activeOpacity={1} style={styles.capsuleField} onPress={() => setShowDatePicker(true)}>
          <Text style={styles.capsuleLabel} numberOfLines={1}>Birthday</Text>
          <Text style={styles.capsuleValue}>{formatDate(birthday)}</Text>
          <ChevronRight size={16} color="rgba(255, 255, 255, 0.2)" />
        </TouchableOpacity>

        {showDatePicker && (
          <DateTimePicker
            value={birthday || new Date(1995, 0, 1)}
            mode="date"
            display="spinner"
            maximumDate={new Date()}
            onChange={handleDateChange}
          />
        )}

        {/* Gender Field */}
        <TouchableOpacity activeOpacity={1} style={styles.capsuleField} onPress={() => setShowGenderModal(true)}>
          <Text style={styles.capsuleLabel} numberOfLines={1}>Gender</Text>
          <Text style={styles.capsuleValue}>{gender || 'Not specified'}</Text>
          <ChevronRight size={16} color="rgba(255, 255, 255, 0.2)" />
        </TouchableOpacity>

        <View style={styles.spacer} />
        <Text style={styles.sectionHeader}>EMAIL ADDRESSES</Text>

        {/* Primary Email */}
        <View style={styles.emailContainer}>
          <View style={styles.emailRow}>
            <Text style={styles.emailText} numberOfLines={1}>{email}</Text>
            <View style={styles.primaryBadge}>
              <Text style={styles.primaryBadgeText}>PRIMARY</Text>
            </View>
          </View>

          <View style={styles.emailActionsRow}>
            <TouchableOpacity activeOpacity={1} style={styles.smallAction}>
              <EyeOff size={14} color="rgba(255, 255, 255, 0.3)" />
              <Text style={styles.smallActionText}>Hidden</Text>
            </TouchableOpacity>

            <View style={{ width: 20 }} />

            <TouchableOpacity activeOpacity={1} style={styles.smallAction}>
              <Star size={14} color={colors.primary} />
              <Text style={[styles.smallActionText, { color: colors.primary }]}>Primary</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.spacer} />
        <Text style={styles.sectionHeader}>CROWN TITLE</Text>
        <View style={styles.inputFieldContainer}>
          <TextInput
            style={[styles.blockInput, Platform.OS === 'web' && { outlineStyle: 'none' } as any]}
            value={crownTitle}
            onChangeText={setCrownTitle}
            placeholder="Enter your crown title..."
            placeholderTextColor="rgba(255,255,255,0.3)"
          />
        </View>

        <View style={styles.spacer} />
        <Text style={styles.sectionHeader}>BIO</Text>
        <View style={styles.inputFieldContainer}>
          <TextInput
            style={[styles.blockInput, { minHeight: 80, textAlignVertical: 'top' }, Platform.OS === 'web' && { outlineStyle: 'none' } as any]}
            value={bio}
            onChangeText={setBio}
            placeholder="Tell us about yourself..."
            placeholderTextColor="rgba(255,255,255,0.3)"
            multiline
          />
        </View>

      </ScrollView>

      {/* Gender Selection Modal */}
      <Modal visible={showGenderModal} transparent animationType="slide">
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowGenderModal(false)}>
          <View style={[styles.modalContent, { paddingBottom: Math.max(insets.bottom, 24) }]}>
            <Text style={styles.modalTitle}>SELECT GENDER</Text>
            {['Male', 'Female', 'Non-binary', 'Prefer not to say'].map((g) => (
              <TouchableOpacity activeOpacity={1} key={g} style={styles.modalItem} onPress={() => selectGender(g)}>
                <Text style={styles.modalItemText}>{g}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>



      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  pageWrapper: {
    flex: 1,
    width: '100%',
  },
  desktopContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    backgroundColor: 'rgba(0,0,0,0.6)',
    ...Platform.select({
      web: {
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        zIndex: 9999,
      } as any,
      default: {
        ...StyleSheet.absoluteFillObject,
        zIndex: 9999,
        elevation: 999,
      }
    })
  },
  desktopModal: {
    width: 600,
    maxWidth: '90%',
    maxHeight: '80%',
    backgroundColor: colors.background,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#FFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
  },
  saveButton: {
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  saveText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '900',
  },
  content: {
    paddingVertical: 24,
  },
  sectionHeader: {
    color: 'rgba(255, 255, 255, 0.4)',
    fontWeight: '900',
    fontSize: 11,
    letterSpacing: 1.2,
    paddingHorizontal: 24,
    marginBottom: 12,
  },
  capsuleField: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 14,
    borderWidth: 0.8,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginHorizontal: 24,
    marginBottom: 12,
  },
  capsuleLabel: {
    color: colors.text,
    fontWeight: '700',
    fontSize: 14,
    marginRight: 12,
  },
  inputFieldContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 14,
    borderWidth: 0.8,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginHorizontal: 24,
    marginBottom: 12,
  },
  blockInput: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
    textAlign: 'left',
    padding: 0,
    margin: 0,
  },
  capsuleValue: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 14,
    marginRight: 8,
  },
  spacer: {
    height: 24,
  },
  emailContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 14,
    borderWidth: 0.8,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    padding: 16,
    marginHorizontal: 24,
    marginBottom: 12,
  },
  emailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  emailText: {
    flex: 1,
    color: colors.text,
    fontWeight: '900',
    fontSize: 14,
    letterSpacing: -0.2,
  },
  primaryBadge: {
    backgroundColor: 'rgba(255, 179, 0, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginLeft: 8,
  },
  primaryBadgeText: {
    color: colors.primary,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  emailActionsRow: {
    flexDirection: 'row',
  },
  smallAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  smallActionText: {
    color: 'rgba(255, 255, 255, 0.4)',
    fontSize: 12,
    fontWeight: '800',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 8,
    gap: 8,
  },
  addButtonText: {
    color: colors.primary,
    fontWeight: '900',
    fontSize: 13.5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1E1E1E',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 24,
  },
  modalTitle: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontWeight: '900',
    fontSize: 11,
    letterSpacing: 1.2,
    textAlign: 'center',
    marginBottom: 16,
  },
  inputWrapper: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  input: {
    backgroundColor: '#333',
    color: '#fff',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  saveModalButton: {
    backgroundColor: colors.primary,
    marginHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveModalButtonText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 16,
  },
  modalItem: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  modalItemText: {
    color: colors.text,
    fontSize: 16,
  },
});
