import ChartAppBar from '@/components/chartappbar/ChartAppBar';
import { colors } from '@/core/theme/colors';
import { useAuthStore } from '@/features/auth/application/useAuthStore';
import { useRouter } from 'expo-router';
import { Camera, ChevronRight } from 'lucide-react-native';
import React, { useState } from 'react';
import { Image, StyleSheet, Text, TextInput, TouchableOpacity, View, ScrollView, Alert } from 'react-native';
import CrimchartBackButton from '@/components/CrimChartBackButton/CrimChart_back_button';

export const EditProfilePage = () => {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const updateProfile = useAuthStore((s) => s.updateProfile);
  const isLoading = useAuthStore((s) => s.isLoading);
  
  const [username, setUsername] = useState(user?.username || '');

  const handleSave = async () => {
    if (isLoading) return;
    const success = await updateProfile({ username });
    if (success) {
      Alert.alert('Success', 'Profile updated successfully!');
      router.back();
    } else {
      Alert.alert('Error', 'Failed to update profile.');
    }
  };

  const handleEditPicture = () => {
    Alert.alert('Coming Soon', 'Edit Image functionality will be added soon.');
  };

  return (
    <View style={styles.container}>
      <ChartAppBar
        title="Edit Profile"
        showBack={false}
        leading={<CrimchartBackButton onPress={() => router.back()} color={colors.text} />}
        actions={[
          <TouchableOpacity key="save" onPress={handleSave} disabled={isLoading} style={styles.saveButton}>
            <Text style={[styles.saveText, isLoading && { opacity: 0.5 }]}>Save</Text>
          </TouchableOpacity>
        ]}
      />
      
      <ScrollView contentContainerStyle={styles.content}>
        {/* Profile Picture Section */}
        <View style={styles.pictureSection}>
          <TouchableOpacity onPress={handleEditPicture}>
            <View>
              <Image
                source={{ uri: user?.profileImageUrl || 'https://i.pravatar.cc/150?u=me' }}
                style={styles.avatar}
              />
              <View style={styles.cameraBadge}>
                <Camera size={14} color="#000" />
              </View>
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleEditPicture} style={styles.editPictureButton}>
            <Text style={styles.editPictureText}>Edit picture</Text>
          </TouchableOpacity>
        </View>

        {/* Personal Info Link */}
        <View style={styles.personalInfoRow}>
          <TouchableOpacity 
            style={styles.personalInfoButton} 
            onPress={() => router.push('/personal-info')}
          >
            <Text style={styles.personalInfoText}>Personal Information</Text>
            <ChevronRight size={16} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Username Input */}
        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>USERNAME</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={username}
              onChangeText={setUsername}
              placeholder="Enter username"
              placeholderTextColor="rgba(255, 255, 255, 0.2)"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
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
    paddingVertical: 30,
  },
  pictureSection: {
    alignItems: 'center',
    marginBottom: 10,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: colors.primary,
    backgroundColor: '#1A1A1A',
  },
  cameraBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: colors.primary,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.background,
  },
  editPictureButton: {
    marginTop: 16,
  },
  editPictureText: {
    color: colors.primary,
    fontWeight: '900',
    fontSize: 15,
  },
  personalInfoRow: {
    paddingHorizontal: 24,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 12,
  },
  personalInfoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  personalInfoText: {
    color: colors.primary,
    fontWeight: '800',
    fontSize: 13.5,
  },
  inputSection: {
    paddingHorizontal: 24,
    paddingVertical: 8,
  },
  inputLabel: {
    color: 'rgba(255, 255, 255, 0.4)',
    fontWeight: '900',
    fontSize: 11,
    letterSpacing: 1.2,
    marginBottom: 10,
  },
  inputContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 14,
    borderWidth: 0.8,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: 16,
  },
  input: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '500',
    paddingVertical: 16,
  },
});
