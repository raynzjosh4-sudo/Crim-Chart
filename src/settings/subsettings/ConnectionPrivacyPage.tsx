import { useStyles } from "@/core/hooks/useStyles";
import ChartAppBar from '@/components/chartappbar/ChartAppBar';
import { NativeDB } from '@/core/db/NativeDB';
import { useTranslation } from '@/core/localization/i18n';
import { supabase } from '@/core/supabase/client';
import { colors } from '@/core/theme/colors';
import { useAuthStore } from '@/features/auth/application/useAuthStore';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
export default function ConnectionPrivacyPage() {
  const styles = useStyles(colors => ({
    container: {
      flex: 1,
      backgroundColor: colors.background
    },
    scrollContent: {
      padding: 16,
      paddingBottom: 40
    },
    infoText: {
      color: 'rgba(255,255,255,0.5)',
      fontSize: 14,
      lineHeight: 20,
      marginBottom: 24
    },
    toggleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: 'rgba(255,255,255,0.05)'
    },
    textContainer: {
      flex: 1,
      paddingRight: 16
    },
    title: {
      color: colors.text,
      fontSize: 16,
      fontWeight: '600',
      marginBottom: 4
    },
    description: {
      color: 'rgba(255,255,255,0.5)',
      fontSize: 13,
      lineHeight: 18
    },
    loaderOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'center',
      alignItems: 'center'
    },
    guideContainer: {
      marginTop: 32
    },
    guideTitle: {
      color: colors.text,
      fontSize: 18,
      fontWeight: '700',
      marginBottom: 6
    },
    guideSubtitle: {
      color: 'rgba(255,255,255,0.5)',
      fontSize: 13,
      lineHeight: 18,
      marginBottom: 20
    },
    guideRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16
    },
    guideRing: {
      width: 40,
      height: 40,
      borderRadius: 20,
      borderWidth: 3,
      marginRight: 16,
      backgroundColor: 'rgba(255,255,255,0.1)'
    },
    guideTextContainer: {
      flex: 1
    },
    guideColorName: {
      fontSize: 15,
      fontWeight: '600',
      marginBottom: 2
    },
    guideDesc: {
      color: 'rgba(255,255,255,0.5)',
      fontSize: 13
    }
  }));
  const router = useRouter();
  const {
    t
  } = useTranslation();
  const {
    user,
    checkSession
  } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [showStatusText, setShowStatusText] = useState(true);
  const [showCountryPref, setShowCountryPref] = useState(true);
  const [showAgePref, setShowAgePref] = useState(true);
  useEffect(() => {
    const fetchSettings = async () => {
      if (!user) return;
      try {
        // Try to get from local SQLite first
        let stats = await NativeDB.getUserConnectionStats(user.id);

        // Fallback to Supabase if local DB doesn't have it yet
        if (!stats) {
          const {
            data
          } = await supabase.from('user_connection_stats').select('*').eq('user_id', user.id).maybeSingle();
          if (data) stats = data;
        }
        if (stats) {
          setShowStatusText(stats.show_status_text !== false && stats.show_status_text !== 0);
          setShowCountryPref(stats.show_country_pref !== false && stats.show_country_pref !== 0);
          setShowAgePref(stats.show_age_pref !== false && stats.show_age_pref !== 0);
        }
      } catch (e) {
        console.error('Failed to fetch privacy settings:', e);
      }
    };
    fetchSettings();
  }, [user?.id]);
  const updatePreference = async (key: string, value: boolean) => {
    if (!user) return;

    // Optimistic update locally
    if (key === 'show_status_text') setShowStatusText(value);
    if (key === 'show_country_pref') setShowCountryPref(value);
    if (key === 'show_age_pref') setShowAgePref(value);

    // Save to local SQLite database immediately for offline/instant access
    try {
      let currentStats = await NativeDB.getUserConnectionStats(user.id);
      if (!currentStats) currentStats = {
        user_id: user.id
      };
      const updatedStats = {
        ...currentStats,
        [key]: value
      };
      await NativeDB.upsertUserConnectionStats(updatedStats);
    } catch (e) {
      console.error('Failed to save to local DB', e);
    }
    try {
      // Use .update() instead of .upsert() because RLS only allows UPDATE
      const {
        error
      } = await supabase.from('user_connection_stats').update({
        [key]: value
      }).eq('user_id', user.id);
      if (error) {
        console.error('Error updating connection stats:', error);
        // Revert on failure
        if (key === 'show_status_text') setShowStatusText(!value);
        if (key === 'show_country_pref') setShowCountryPref(!value);
        if (key === 'show_age_pref') setShowAgePref(!value);
      }
    } catch (err) {
      console.error(err);
    }
  };
  const renderToggle = (title: string, description: string, value: boolean, onValueChange: (v: boolean) => void) => <View style={styles.toggleRow}>
      <View style={styles.textContainer}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
      </View>
      <Switch value={value} onValueChange={onValueChange} trackColor={{
      false: 'rgba(255,255,255,0.1)',
      true: colors.primary
    }} thumbColor={value ? colors.text : '#f4f3f4'} />
    </View>;
  return <SafeAreaView style={styles.container}>
      <ChartAppBar title="Connection Privacy" showBack />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.infoText}>
          Control what connection information and statistics appear on your profile.
        </Text>
        {renderToggle('Status Text', 'Display your exact status label (e.g. "Highly Selective") in the stats box on your profile.', showStatusText, val => updatePreference('show_status_text', val))}

        {renderToggle('Country Preferences', 'Show which countries you connect with the most on your profile.', showCountryPref, val => updatePreference('show_country_pref', val))}

        {renderToggle('Age Preferences', 'Show the age ranges you most frequently connect with.', showAgePref, val => updatePreference('show_age_pref', val))}

        <View style={styles.guideContainer}>
          <Text style={styles.guideTitle}>Status Ring Meanings</Text>
          <Text style={styles.guideSubtitle}>Your avatar's ring changes color based on your recent messaging activity.</Text>

          <View style={styles.guideRow}>
            <View style={[styles.guideRing, {
            borderColor: '#10B981'
          }]} />
            <View style={styles.guideTextContainer}>
              <Text style={[styles.guideColorName, {
              color: '#10B981'
            }]}>Highly Selective</Text>
              <Text style={styles.guideDesc}>Very picky and focuses energy on a few select people.</Text>
            </View>
          </View>

          <View style={styles.guideRow}>
            <View style={[styles.guideRing, {
            borderColor: '#3B82F6'
          }]} />
            <View style={styles.guideTextContainer}>
              <Text style={[styles.guideColorName, {
              color: '#3B82F6'
            }]}>Active</Text>
              <Text style={styles.guideDesc}>Actively dating but keeps their circle relatively manageable.</Text>
            </View>
          </View>

          <View style={styles.guideRow}>
            <View style={[styles.guideRing, {
            borderColor: '#F59E0B'
          }]} />
            <View style={styles.guideTextContainer}>
              <Text style={[styles.guideColorName, {
              color: '#F59E0B'
            }]}>Exploring</Text>
              <Text style={styles.guideDesc}>Talking to many people and openly exploring options.</Text>
            </View>
          </View>

          <View style={styles.guideRow}>
            <View style={[styles.guideRing, {
            borderColor: '#EF4444'
          }]} />
            <View style={styles.guideTextContainer}>
              <Text style={[styles.guideColorName, {
              color: '#EF4444'
            }]}>Casting a Wide Net</Text>
              <Text style={styles.guideDesc}>Mass-messaging or entertaining a very large number of people.</Text>
            </View>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>;
}