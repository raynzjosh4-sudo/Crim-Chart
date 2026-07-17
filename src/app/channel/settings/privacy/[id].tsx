import { channelRepository } from '@/channel/data/repositories/ChannelRepositoryImpl';
import { useChannelData } from '@/channel/hooks/useChannelData';
import { AgeRestrictionType, AppAgeRestrictionPicker } from '@/components/ageRestriction/AppAgeRestrictionPicker';
import { AppCountryPicker } from '@/components/countryPicker/AppCountryPicker';
import { useStyles } from '@/core/hooks/useStyles';
import { useCurrentTheme } from '@/core/store/useThemeStore';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Calendar, CheckCircle2, ChevronLeft, Circle, Globe, X } from 'lucide-react-native';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View, Platform, useWindowDimensions } from 'react-native';
import { Country } from '@/components/countryPicker/AppCountryPicker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useGlobalProgress } from '@/components/globalProgressBar/GlobalProgressBar';
import { OfflineStaleDataBanner, SlowConnectionBanner, OfflineNoDataWidget } from '@/components/offlineIndicators';
import { useNetworkState } from '@/components/offlineIndicators/useNetworkState';

export default function PrivacyPermissionsPage({ channelIdOverride }: { channelIdOverride?: string }) {
  const router = useRouter();
  const { id: routeId } = useLocalSearchParams<{ id: string }>();
  const id = channelIdOverride || routeId;
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width >= 768;
  const { channel, loading } = useChannelData(id);
  const theme = useCurrentTheme();
  const styles = useStyles(useStylesHook);
  const { startLoading, stopLoading } = useGlobalProgress();
  const networkState = useNetworkState();
  const isOffline = networkState === 'offline';

  // Settings State
  const [visibleToOthers, setVisibleToOthers] = useState(true);
  const [visibleToFollowed, setVisibleToFollowed] = useState(true);
  const [joinMethod, setJoinMethod] = useState('invite');
  const [allowPosting, setAllowPosting] = useState('all');
  const [allowCommenting, setAllowCommenting] = useState('all');
  const [allowStatus, setAllowStatus] = useState('all');
  const [allowInvitations, setAllowInvitations] = useState('all');
  const [allowChatting, setAllowChatting] = useState('all');
  const [preventLeaving, setPreventLeaving] = useState(false);
  const [ageRestriction, setAgeRestriction] = useState<AgeRestrictionType>('All Ages');
  const [agePickerVisible, setAgePickerVisible] = useState(false);
  const [countryPickerVisible, setCountryPickerVisible] = useState(false);
  const [selectedCountries, setSelectedCountries] = useState<Country[]>([]);

  React.useEffect(() => {
    if (channel) {
      // console.log('--- CHANNEL SETTINGS DEBUG ---');
      // console.log('Raw channel from DB:', channel);

      setVisibleToOthers(channel.visibleToOtherChannelMembers);
      setVisibleToFollowed(channel.visibleToFollowedUsers);
      setJoinMethod(channel.joinMethod || 'invite');
      setAllowPosting(channel.allowPostingBy || 'all');
      setAllowCommenting(channel.allowCommentingBy || 'all');
      setAllowStatus(channel.allowStatusPostingBy || 'all');
      setAllowInvitations(channel.allowInvitationsBy || 'all');
      setAllowChatting(channel.allowChattingBy || 'all');
      setPreventLeaving(channel.preventLeaving);
      setAgeRestriction((channel.ageRestriction as AgeRestrictionType) || 'All Ages');
      if (channel.countryRestrictions) {
        try {
          const parsed = typeof channel.countryRestrictions === 'string' ? JSON.parse(channel.countryRestrictions) : channel.countryRestrictions;
          if (Array.isArray(parsed) && parsed[0] !== 'Global') {
            setSelectedCountries(parsed);
          }
        } catch (e) { }
      }
    }
    if (!loading) {
      stopLoading();
    }
  }, [channel, loading, stopLoading]);

  const updateSetting = async (key: string, value: any) => {
    if (!id) return;
    try {
      await channelRepository.updateLocalChannelSettings(id, { [key]: value });
    } catch (err) {
      console.error(err);
    }
  };

  const getCountrySubtitle = () => {
    if (selectedCountries.length === 0) return 'All / Global';
    if (selectedCountries.length === 1) return (selectedCountries[0].name as any)?.en || selectedCountries[0].name;
    return `${selectedCountries.length} countries`;
  };

  const handleRemoveCountry = (cca2: string) => {
    const newCountries = selectedCountries.filter(c => c.cca2 !== cca2);
    setSelectedCountries(newCountries);
    // If empty, it means global
    const payload = newCountries.length === 0 ? JSON.stringify(['Global']) : JSON.stringify(newCountries);
    updateSetting('country_restrictions', payload);
  };

  const SectionHeader = ({ title }: { title: string }) => (
    <Text style={styles.sectionHeader}>{title.toUpperCase()}</Text>
  );

  const SwitchTile = ({ title, value, onValueChange }: { title: string, value: boolean, onValueChange: (v: boolean) => void }) => (
    <View style={styles.tile}>
      <Text style={styles.tileTitle}>{title}</Text>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: theme.colors.surfaceVariant, true: theme.colors.primary + '66' }}
        thumbColor={value ? theme.colors.primary : theme.colors.textSecondary}
      />
    </View>
  );

  const RadioTile = ({ title, value, groupValue, onSelect }: { title: string, value: string, groupValue: string, onSelect: (v: string) => void, key?: string }) => (
    <TouchableOpacity activeOpacity={1} style={styles.tile} onPress={() => onSelect(value)}>
      <Text style={styles.tileTitle}>{title}</Text>
      {value === groupValue ? (
        <CheckCircle2 size={22} color={theme.colors.primary} />
      ) : (
        <Circle size={22} color={theme.colors.surfaceVariant} />
      )}
    </TouchableOpacity>
  );

  const ActionTile = ({ title, subtitle, icon: Icon, onPress }: { title: string, subtitle: string, icon: any, onPress: () => void }) => (
    <TouchableOpacity activeOpacity={1} style={styles.tile} onPress={onPress}>
      <Text style={styles.tileTitle}>{title}</Text>
      <View style={styles.tileRight}>
        <Text style={styles.tileSubtitle}>{subtitle}</Text>
        <ChevronLeft size={20} color={theme.colors.textSecondary} style={{ transform: [{ rotate: '180deg' }] }} />
      </View>
    </TouchableOpacity>
  );

  if (isOffline && !channel && !loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity activeOpacity={1} onPress={() => {
            if (isDesktop && channelIdOverride) {
              router.setParams({ desktopChannelView: 'settings' });
            } else if (router.canGoBack()) {
              router.back();
            } else {
              router.replace(`/channel/settings/${id}` as any);
            }
          }} style={styles.headerButton}>
            <ChevronLeft size={28} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Privacy & Permissions</Text>
          <View style={{ width: 44 }} />
        </View>
        <OfflineNoDataWidget onRetry={() => {}} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <OfflineStaleDataBanner />
      <SlowConnectionBanner />
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity activeOpacity={1} onPress={() => {
          if (isDesktop && channelIdOverride) {
            router.setParams({ desktopChannelView: 'settings' });
          } else if (router.canGoBack()) {
            router.back();
          } else {
            router.replace(`/channel/settings/${id}` as any);
          }
        }} style={styles.headerButton}>
          <ChevronLeft size={28} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Privacy & Permissions</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <SectionHeader title="Who can see channel" />
        <ActionTile
          title="Age Restriction"
          subtitle={ageRestriction}
          icon={Calendar}
          onPress={() => setAgePickerVisible(true)}
        />
        {ageRestriction !== 'All Ages' && (
          <View style={styles.chipsContainer}>
            <View style={styles.chip}>
              <Text style={styles.chipText}>{ageRestriction}</Text>
              <TouchableOpacity onPress={() => {
                setAgeRestriction('All Ages');
                updateSetting('age_restriction', 'All Ages');
              }} activeOpacity={0.8}>
                <X size={14} color={theme.colors.text} />
              </TouchableOpacity>
            </View>
          </View>
        )}
        <SwitchTile
          title="Members in my other channels"
          value={visibleToOthers}
          onValueChange={(v) => { setVisibleToOthers(v); updateSetting('visible_to_other_channel_members', v ? 1 : 0); }}
        />
        <SwitchTile
          title="Members I'm following"
          value={visibleToFollowed}
          onValueChange={(v) => { setVisibleToFollowed(v); updateSetting('visible_to_followed_users', v ? 1 : 0); }}
        />

        <SectionHeader title="How can people join" />
        <RadioTile
          title="By sending invitation request"
          value="invite"
          groupValue={joinMethod}
          onSelect={(v) => { setJoinMethod(v); updateSetting('join_method', v); }}
        />
        <RadioTile
          title="Anyone can join"
          value="anyone"
          groupValue={joinMethod}
          onSelect={(v) => { setJoinMethod(v); updateSetting('join_method', v); }}
        />

        <SectionHeader title="Who can post in this channel" />
        {['All', 'Followers', 'Joined members', 'None (Only me)'].map(opt => (
          <RadioTile
            key={opt}
            title={opt}
            value={opt.toLowerCase()}
            groupValue={allowPosting}
            onSelect={(v) => { setAllowPosting(v); updateSetting('allow_posting_by', v); }}
          />
        ))}

        <SectionHeader title="Who can participate in chat" />
        {['All', 'Joined members', 'Selected members', 'None (Only me)'].map(opt => (
          <RadioTile
            key={opt}
            title={opt}
            value={opt.toLowerCase()}
            groupValue={allowChatting}
            onSelect={(v) => { setAllowChatting(v); updateSetting('allow_chatting_by', v); }}
          />
        ))}

        <SectionHeader title="Allow commenting by" />
        {['All', 'Followers', 'Joined members', 'None (Only me)'].map(opt => (
          <RadioTile
            key={opt}
            title={opt}
            value={opt.toLowerCase()}
            groupValue={allowCommenting}
            onSelect={(v) => { setAllowCommenting(v); updateSetting('allow_commenting_by', v); }}
          />
        ))}

        <SectionHeader title="Allow status posting by" />
        {['All', 'Joined members', 'None (Only me)'].map(opt => (
          <RadioTile
            key={opt}
            title={opt}
            value={opt.toLowerCase()}
            groupValue={allowStatus}
            onSelect={(v) => { setAllowStatus(v); updateSetting('allow_status_posting_by', v); }}
          />
        ))}

        <SectionHeader title="Allow invitations by" />
        {['All', 'Joined members', 'None (Only me)'].map(opt => (
          <RadioTile
            key={opt}
            title={opt}
            value={opt.toLowerCase()}
            groupValue={allowInvitations}
            onSelect={(v) => { setAllowInvitations(v); updateSetting('allow_invitations_by', v); }}
          />
        ))}

        <SectionHeader title="Global Restrictions" />
        <ActionTile
          title="Which country allowed"
          subtitle={getCountrySubtitle()}
          icon={Globe}
          onPress={() => setCountryPickerVisible(true)}
        />
        {selectedCountries.length > 0 && (
          <View style={styles.chipsContainer}>
            {selectedCountries.map(country => (
              <View key={country.cca2} style={styles.chip}>
                <Text style={styles.chipText}>{(country.name as any)?.en || country.name}</Text>
                <TouchableOpacity onPress={() => handleRemoveCountry(country.cca2)} activeOpacity={0.8}>
                  <X size={14} color={theme.colors.text} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
        <SwitchTile
          title="Allow members not leave"
          value={preventLeaving}
          onValueChange={(v) => { setPreventLeaving(v); updateSetting('prevent_leaving', v ? 1 : 0); }}
        />



        <View style={styles.footerSpacer} />
      </ScrollView>

      <AppAgeRestrictionPicker
        visible={agePickerVisible}
        selectedAge={ageRestriction}
        onClose={() => setAgePickerVisible(false)}
        onSelect={(age) => {
          setAgeRestriction(age);
          updateSetting('age_restriction', age);
          setAgePickerVisible(false);
        }}
      />

      <AppCountryPicker
        visible={countryPickerVisible}
        initialCountries={selectedCountries}
        onClose={() => setCountryPickerVisible(false)}
        onSelect={(countries) => {
          setSelectedCountries(countries);
          updateSetting('country_restrictions', JSON.stringify(countries));
          setCountryPickerVisible(false);
        }}
      />
    </SafeAreaView>
  );
}

const useStylesHook = (colors: any, scale: number) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    height: 60,
    paddingHorizontal: 12,
  },
  headerButton: {
    padding: 8,
  },
  headerTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '900' as const,
  },
  content: {
    flex: 1,
  },
  sectionHeader: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: '900' as const,
    letterSpacing: 1.2,
    paddingHorizontal: 20,
    marginTop: 24,
    marginBottom: 8,
  },
  tile: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.surfaceVariant,
  },
  tileTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '600' as const,
    flex: 1,
  },
  tileRight: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 8,
  },
  tileSubtitle: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '600' as const,
  },

  footerSpacer: {
    height: 60,
  },
  chipsContainer: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    paddingHorizontal: 20,
    paddingBottom: 16,
    paddingTop: 8,
    gap: 8,
  },
  chip: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: colors.surfaceVariant,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  chipText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '600' as const,
  },
});
