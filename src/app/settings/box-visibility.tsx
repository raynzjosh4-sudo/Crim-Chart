import ChartAppBar from '@/components/chartappbar/ChartAppBar';
import { useTranslation } from '@/core/localization/i18n';
import { colors } from '@/core/theme/colors';
import React, { useState, useEffect } from 'react';
import { SafeAreaView, StyleSheet, Switch, Text, View, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { supabase } from '@/core/supabase/supabaseConfig';
import { useAuthStore } from '@/features/auth/application/useAuthStore';
import { ChartToast } from '@/components/showcase/CrimChart_toast';
import { FolderHeart, ChevronRight } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useIsFocused } from '@react-navigation/native';
import { NativeDB } from '@/core/db/NativeDB';

export default function BoxVisibilitySettingsPage() {
  const user = useAuthStore(s => s.user);
  const router = useRouter();
  const isFocused = useIsFocused(); // Refresh when coming back from options page
  
  const [boxes, setBoxes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Computed Master Toggles
  const isGlobalPublic = boxes.length > 0 && boxes.every(b => b.is_public);
  const isGlobalSubmissions = boxes.length > 0 && boxes.every(b => b.allow_submissions);

  useEffect(() => {
    if (!user || !isFocused) return;
    const fetchBoxes = async () => {
      // 1. Load locally first for instant UI
      let hasLocalData = false;
      try {
        const localBoxes = await NativeDB.getBoxes(user.id);
        if (localBoxes && localBoxes.length > 0) {
          setBoxes(localBoxes);
          hasLocalData = true;
          setIsLoading(false); // Instantly hide spinner!
        }
      } catch (err) {
        console.error('[BoxVisibility] Failed to load local boxes:', err);
      }

      // 2. Fetch fresh from network silently if we already have data
      if (!hasLocalData) {
        setIsLoading(true);
      }
      try {
        const { data, error } = await supabase
          .from('boxes')
          .select('id, owner_id, title, description, box_type, metadata, is_public, allow_submissions, created_at')
          .eq('owner_id', user.id)
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        if (data) {
          setBoxes(data);
          // 3. Save fresh data to local cache
          await NativeDB.upsertBoxes(data);
        }
      } catch (e: any) {
        console.error('[BoxVisibility] Failed to fetch boxes:', e);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBoxes();
  }, [user, isFocused]);

  const handleToggleGlobal = async (field: 'is_public' | 'allow_submissions', newValue: boolean) => {
    if (!user || boxes.length === 0) return;
    
    // Optimistic update
    const updatedBoxes = boxes.map(b => ({ ...b, [field]: newValue }));
    setBoxes(updatedBoxes);
    
    try {
      // Sync locally immediately
      await NativeDB.upsertBoxes(updatedBoxes);

      const { error } = await supabase
        .from('boxes')
        .update({ [field]: newValue })
        .eq('owner_id', user.id);

      if (error) throw error;
    } catch (e: any) {
      console.error('[BoxVisibility] Global Toggle Error:', e);
      ChartToast.showError(null, { title: 'Update Failed', message: 'Could not apply global setting.' });
      // In a real app we might want to re-fetch on failure to revert
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ChartAppBar title="Box Visibility" showBack />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Master Controls</Text>
        </View>

        <View style={styles.section}>
          <View style={styles.row}>
            <Text style={styles.label}>Global Public Box</Text>
            <Switch
              value={isGlobalPublic}
              onValueChange={(val) => handleToggleGlobal('is_public', val)}
              trackColor={{ false: '#333', true: colors.primary }}
              thumbColor="#FFF"
            />
          </View>
          <Text style={styles.description}>
            When turned ON, all your boxes become public. Turn this off to manage visibility per box.
          </Text>
        </View>

        <View style={styles.section}>
          <View style={styles.row}>
            <Text style={styles.label}>Global Allow Submissions</Text>
            <Switch
              value={isGlobalSubmissions}
              onValueChange={(val) => handleToggleGlobal('allow_submissions', val)}
              trackColor={{ false: '#333', true: colors.primary }}
              thumbColor="#FFF"
            />
          </View>
          <Text style={styles.description}>
            When turned ON, all your boxes will allow community submissions.
          </Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Individual Box Options</Text>
        </View>

        {isLoading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator color={colors.primary} size="large" />
          </View>
        ) : boxes.length === 0 ? (
          <View style={styles.centerContainer}>
            <FolderHeart color="rgba(255,255,255,0.2)" size={48} style={{ marginBottom: 12 }} />
            <Text style={styles.emptyText}>You haven't created any boxes yet.</Text>
          </View>
        ) : (
          boxes.map(box => (
            <TouchableOpacity 
              key={box.id} 
              style={styles.boxRow} 
              activeOpacity={0.7}
              onPress={() => router.push(`/settings/box-options/${box.id}` as any)}
            >
              <View style={styles.boxInfo}>
                <Text style={styles.boxTitle} numberOfLines={1}>{box.title}</Text>
                <Text style={styles.boxStatus}>
                  {box.is_public ? 'Public' : 'Private'} • {box.allow_submissions ? 'Submissions On' : 'Submissions Off'}
                </Text>
              </View>
              <ChevronRight color="rgba(255,255,255,0.3)" size={20} />
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
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
    paddingBottom: 40,
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
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
    color: '#FFF',
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
    marginVertical: 24,
  },
  centerContainer: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: 'rgba(255, 255, 255, 0.4)',
    fontSize: 14,
  },
  boxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    marginBottom: 4,
  },
  boxInfo: {
    flex: 1,
    paddingRight: 16,
  },
  boxTitle: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  boxStatus: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 13,
  },
});
