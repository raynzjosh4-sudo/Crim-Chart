import ChartAppBar from '@/components/chartappbar/ChartAppBar';
import { ChartToast } from '@/components/showcase/CrimChart_toast';
import { NativeDB } from '@/core/db/NativeDB';
import { supabase } from '@/core/supabase/supabaseConfig';
import { colors } from '@/core/theme/colors';
import { useAuthStore } from '@/features/auth/application/useAuthStore';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, SafeAreaView, StyleSheet, Switch, Text, TouchableOpacity, View, Alert } from 'react-native';
import { X, Trash2 } from 'lucide-react-native';
import { AppCountryPicker } from '@/components/countryPicker/AppCountryPicker';
import { AppAgeRestrictionPicker, AgeRestrictionType } from '@/components/ageRestriction/AppAgeRestrictionPicker';
import { Country } from 'react-native-country-picker-modal';

export default function BoxOptionsPage() {
  const { id } = useLocalSearchParams();
  const user = useAuthStore(s => s.user);
  const router = useRouter();
  const [box, setBox] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCountryPickerVisible, setCountryPickerVisible] = useState(false);
  const [isAgePickerVisible, setAgePickerVisible] = useState(false);

  useEffect(() => {
    if (!id) return;
    const fetchBox = async () => {
      // 1. Load locally first for instant UI
      let hasLocalData = false;
      try {
        const localBoxes = await NativeDB.getBoxes(user?.id || '');
        const localBox = localBoxes.find(b => b.id === id);
        if (localBox) {
          setBox(localBox);
          hasLocalData = true;
          setIsLoading(false); // Instantly hide spinner!
        }
      } catch (err) {
        console.error('[BoxOptions] Failed to load local box:', err);
      }

      if (!hasLocalData) {
        setIsLoading(true);
      }

      try {
        const { data, error } = await supabase
          .from('boxes')
          .select('id, owner_id, title, description, box_type, metadata, is_public, allow_submissions, age_restriction, country_restrictions, visible_to_followed_users, created_at')
          .eq('id', id as string)
          .single();

        if (error) throw error;
        setBox(data);
        // Save to local cache
        if (data) await NativeDB.upsertBoxes([data]);
      } catch (e: any) {
        console.error('[BoxOptions] Failed to fetch box:', e);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBox();
  }, [id]);

  const handleToggle = async (field: string, newValue: any) => {
    if (!box) return;

    // Optimistic update
    const updatedBox = { ...box, [field]: newValue };
    setBox(updatedBox);

    try {
      // Sync locally immediately
      await NativeDB.upsertBoxes([updatedBox]);

      const { error } = await supabase
        .from('boxes')
        .update({ [field]: newValue })
        .eq('id', box.id);

      if (error) throw error;
    } catch (e: any) {
      // Revert on error
      setBox((prev: any) => ({ ...prev, [field]: prev?.[field] }));
      console.error('[BoxOptions] Toggle Error:', e);
      ChartToast.showError(null, { title: 'Update Failed', message: 'Could not update setting.' });
    }
  };

  const handleAddCountry = (country: Country) => {
    if (!box) return;
    let current = box.country_restrictions || ['Global'];
    // If it's Global, replace it with the new country
    if (current.includes('Global')) {
      current = [];
    }
    // Prevent duplicates
    if (!current.includes(country.name as string)) {
      handleToggle('country_restrictions', [...current, country.name]);
    }
    setCountryPickerVisible(false);
  };

  const handleRemoveCountry = (countryName: string) => {
    if (!box) return;
    let current = box.country_restrictions || [];
    const updated = current.filter((c: string) => c !== countryName);
    
    // If list is empty, revert to Global
    if (updated.length === 0) {
      handleToggle('country_restrictions', ['Global']);
    } else {
      handleToggle('country_restrictions', updated);
    }
  };

  const handleDeleteBox = () => {
    Alert.alert(
      "Delete Box",
      "Are you sure you want to permanently delete this box? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive",
          onPress: async () => {
            try {
              setIsLoading(true);
              // Delete from Supabase
              const { error } = await supabase.from('boxes').delete().eq('id', box.id);
              if (error) throw error;
              
              // Remove from local SQLite DB
              await NativeDB.deleteBox(box.id);
              
              ChartToast.showSuccess(null, { title: 'Box Deleted', message: 'The box was removed.' });
              router.back();
            } catch (err) {
              console.error('Failed to delete box:', err);
              ChartToast.showError(null, { title: 'Error', message: 'Could not delete the box.' });
              setIsLoading(false);
            }
          }
        }
      ]
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <ChartAppBar title="Box Options" showBack />
        <View style={styles.centerContainer}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      </SafeAreaView>
    );
  }

  if (!box) {
    return (
      <SafeAreaView style={styles.container}>
        <ChartAppBar title="Box Options" showBack />
        <View style={styles.centerContainer}>
          <Text style={styles.emptyText}>Box not found.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ChartAppBar title={box.title || "Box Options"} showBack />

      <View style={styles.content}>
        <View style={styles.section}>
          <View style={styles.row}>
            <Text style={styles.label}>Public Box</Text>
            <Switch
              value={box.is_public ?? true}
              onValueChange={(val) => handleToggle('is_public', val)}
              trackColor={{ false: '#333', true: colors.primary }}
              thumbColor="#FFF"
            />
          </View>
          <Text style={styles.description}>
            If on, this box is visible on your profile and accessible to the public.
          </Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.section}>
          <View style={styles.row}>
            <Text style={styles.label}>Allow Community Submissions</Text>
            <Switch
              value={box.allow_submissions ?? true}
              onValueChange={(val) => handleToggle('allow_submissions', val)}
              trackColor={{ false: '#333', true: colors.primary }}
              thumbColor="#FFF"
            />
          </View>
          <Text style={styles.description}>
          </Text>
        </View>

        <View style={styles.divider} />

          <View style={styles.section}>
            <View style={styles.row}>
              <Text style={styles.label}>Followers Only</Text>
              <Switch
                value={box.visible_to_followed_users ?? true}
                onValueChange={(val) => handleToggle('visible_to_followed_users', val)}
                trackColor={{ false: '#333', true: colors.primary }}
                thumbColor="#FFF"
              />
            </View>
            <Text style={styles.description}>
              If on, only people who follow you can view this box.
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.section}>
            <View style={styles.row}>
              <Text style={styles.label}>Age Restriction</Text>
              <TouchableOpacity activeOpacity={1}
                style={styles.pickerButton}
                onPress={() => setAgePickerVisible(true)}
              >
                <Text style={styles.pickerText}>{box.age_restriction || 'All Ages'}</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.description}>
              Restrict this box to users of a certain age.
            </Text>
          </View>

        <View style={styles.divider} />

        <View style={styles.section}>
          <View style={styles.row}>
            <Text style={styles.label}>Country Restriction</Text>
          </View>
          <View style={styles.chipContainer}>
            {(box.country_restrictions || ['Global']).map((c: string) => (
              <View key={c} style={styles.chip}>
                <Text style={styles.chipText}>{c}</Text>
                {c !== 'Global' && (
                  <TouchableOpacity activeOpacity={1} onPress={() => handleRemoveCountry(c)} style={styles.removeChipIcon}>
                    <X size={12} color="#FFF" />
                  </TouchableOpacity>
                )}
              </View>
            ))}
            <TouchableOpacity activeOpacity={1} 
              style={styles.addChip}
              onPress={() => setCountryPickerVisible(true)}
            >
              <Text style={styles.addChipText}>+ Add Country</Text>
            </TouchableOpacity>
            
            {!(box.country_restrictions || ['Global']).includes('Global') && (
              <TouchableOpacity activeOpacity={1} 
                style={styles.resetChip}
                onPress={() => handleToggle('country_restrictions', ['Global'])}
              >
                <Text style={styles.addChipText}>Reset to Global</Text>
              </TouchableOpacity>
            )}
          </View>
          <Text style={styles.description}>
            Restrict this box to users from specific countries.
          </Text>
        </View>

        <View style={styles.divider} />

        <TouchableOpacity 
          style={styles.deleteButton} 
          onPress={handleDeleteBox}
          activeOpacity={0.8}
        >
          <Trash2 color="#FF453A" size={20} />
          <Text style={styles.deleteButtonText}>Delete Box</Text>
        </TouchableOpacity>

      </View>

      <AppCountryPicker 
        visible={isCountryPickerVisible}
        onClose={() => setCountryPickerVisible(false)}
        onSelect={handleAddCountry}
      />

      <AppAgeRestrictionPicker 
        visible={isAgePickerVisible}
        onClose={() => setAgePickerVisible(false)}
        selectedAge={box.age_restriction || 'All Ages'}
        onSelect={(age: AgeRestrictionType) => handleToggle('age_restriction', age)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 20,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: 'rgba(255, 255, 255, 0.4)',
    fontSize: 14,
  },
  section: {
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '500',
  },
  description: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 14,
    lineHeight: 20,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    marginVertical: 16,
  },
  pickerButton: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  pickerText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginVertical: 12,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  chipText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  removeChipIcon: {
    marginLeft: 6,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 10,
    padding: 2,
  },
  addChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    borderStyle: 'dashed',
    justifyContent: 'center',
  },
  addChipText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
    fontWeight: '600',
  },
  resetChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 60, 60, 0.2)',
    justifyContent: 'center',
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 20,
    backgroundColor: 'rgba(255, 69, 58, 0.1)',
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 69, 58, 0.3)',
  },
  deleteButtonText: {
    color: '#FF453A',
    fontSize: 16,
    fontWeight: 'bold',
  }
});
