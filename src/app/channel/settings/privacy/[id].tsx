import { channelRepository } from '@/channel/data/repositories/ChannelRepositoryImpl';
import { useChannelData } from '@/channel/hooks/useChannelData';
import { AgeRestrictionType, AppAgeRestrictionPicker } from '@/components/ageRestriction/AppAgeRestrictionPicker';
import { AppCountryPicker } from '@/components/countryPicker/AppCountryPicker';
import { colors } from '@/core/theme/colors';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Calendar, CheckCircle2, ChevronLeft, Circle, Globe } from 'lucide-react-native';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View, Platform, useWindowDimensions } from 'react-native';
import { Country } from 'react-native-country-picker-modal';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function PrivacyPermissionsPage({ channelIdOverride }: { channelIdOverride?: string }) {
  const router = useRouter();
  const { id: routeId } = useLocalSearchParams<{ id: string }>();
  const id = channelIdOverride || routeId;
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width >= 768;
  const { channel, loading } = useChannelData(id);

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

      setVisibleToOthers(channel.visible_to_other_channel_members === 1 || channel.visible_to_other_channel_members === true);
      setVisibleToFollowed(channel.visible_to_followed_users === 1 || channel.visible_to_followed_users === true);
      setJoinMethod(channel.join_method || channel.joinMethod || 'invite');
      setAllowPosting((channel as any).allow_posting_by || channel.allowPostingBy || 'all');
      setAllowCommenting((channel as any).allow_commenting_by || channel.allowCommentingBy || 'all');
      setAllowStatus((channel as any).allow_status_posting_by || channel.allowStatusPostingBy || 'all');
      setAllowInvitations((channel as any).allow_invitations_by || channel.allowInvitationsBy || 'all');
      setAllowChatting((channel as any).allow_chatting_by || channel.allowChattingBy || 'all');
      setPreventLeaving(channel.prevent_leaving === 1 || channel.prevent_leaving === true);
      setAgeRestriction((channel.age_restriction as AgeRestrictionType) || 'All Ages');
      if (channel.country_restrictions) {
        try {
          const parsed = typeof channel.country_restrictions === 'string' ? JSON.parse(channel.country_restrictions) : channel.country_restrictions;
          if (Array.isArray(parsed) && parsed[0] !== 'Global') {
            setSelectedCountries(parsed);
          }
        } catch (e) { }
      }
    }
  }, [channel]);

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

  const SectionHeader = ({ title }: { title: string }) => (
    <Text style={styles.sectionHeader}>{title.toUpperCase()}</Text>
  );

  const SwitchTile = ({ title, value, onValueChange }: { title: string, value: boolean, onValueChange: (v: boolean) => void }) => (
    <View style={styles.tile}>
      <Text style={styles.tileTitle}>{title}</Text>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: '#333', true: colors.primary + '66' }}
        thumbColor={value ? colors.primary : '#666'}
      />
    </View>
  );

  const RadioTile = ({ title, value, groupValue, onSelect }: { title: string, value: string, groupValue: string, onSelect: (v: string) => void, key?: string }) => (
    <TouchableOpacity activeOpacity={1} style={styles.tile} onPress={() => onSelect(value)}>
      <Text style={styles.tileTitle}>{title}</Text>
      {value === groupValue ? (
        <CheckCircle2 size={22} color={colors.primary} />
      ) : (
        <Circle size={22} color="rgba(255,255,255,0.2)" />
      )}
    </TouchableOpacity>
  );

  const ActionTile = ({ title, subtitle, icon: Icon, onPress }: { title: string, subtitle: string, icon: any, onPress: () => void }) => (
    <TouchableOpacity activeOpacity={1} style={styles.tile} onPress={onPress}>
      <Text style={styles.tileTitle}>{title}</Text>
      <View style={styles.tileRight}>
        <Text style={styles.tileSubtitle}>{subtitle}</Text>
        <ChevronLeft size={20} color="rgba(255,255,255,0.4)" style={{ transform: [{ rotate: '180deg' }] }} />
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity activeOpacity={1} onPress={() => {
          if (isDesktop && channelIdOverride) {
            router.setParams({ desktopChannelView: 'settings' });
          } else {
            router.back();
          }
        }} style={styles.headerButton}>
          <ChevronLeft size={28} color="#FFF" />
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 60,
    paddingHorizontal: 12,
  },
  headerButton: {
    padding: 8,
  },
  headerTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '900',
  },
  content: {
    flex: 1,
  },
  sectionHeader: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.2,
    paddingHorizontal: 20,
    marginTop: 24,
    marginBottom: 8,
  },
  tile: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  tileTitle: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
  },
  tileRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tileSubtitle: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 14,
    fontWeight: '600',
  },

  footerSpacer: {
    height: 60,
  },
});
