import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Modal } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ChevronLeft, Calendar, Globe, CheckCircle2, Circle } from 'lucide-react-native';
import { colors } from '@/core/theme/colors';

export default function PrivacyPermissionsPage() {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  // Settings State
  const [visibleToOthers, setVisibleToOthers] = useState(true);
  const [visibleToFollowed, setVisibleToFollowed] = useState(true);
  const [joinMethod, setJoinMethod] = useState('invite');
  const [allowCommenting, setAllowCommenting] = useState('all');
  const [allowStatus, setAllowStatus] = useState('all');
  const [allowInvitations, setAllowInvitations] = useState('all');
  const [preventLeaving, setPreventLeaving] = useState(false);
  const [ageRestriction, setAgeRestriction] = useState('All Ages');

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

  const RadioTile = ({ title, value, groupValue, onSelect }: { title: string, value: string, groupValue: string, onSelect: (v: string) => void }) => (
    <TouchableOpacity style={styles.tile} onPress={() => onSelect(value)}>
      <Text style={styles.tileTitle}>{title}</Text>
      {value === groupValue ? (
        <CheckCircle2 size={22} color={colors.primary} />
      ) : (
        <Circle size={22} color="rgba(255,255,255,0.2)" />
      )}
    </TouchableOpacity>
  );

  const ActionTile = ({ title, subtitle, icon: Icon, onPress }: { title: string, subtitle: string, icon: any, onPress: () => void }) => (
    <TouchableOpacity style={styles.tile} onPress={onPress}>
      <Text style={styles.tileTitle}>{title}</Text>
      <View style={styles.tileRight}>
        <Text style={styles.tileSubtitle}>{subtitle}</Text>
        <ChevronLeft size={20} color="rgba(255,255,255,0.4)" style={{ transform: [{ rotate: '180deg' }] }} />
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
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
          onPress={() => router.push(`/channel/settings/privacy/age/${id}` as any)} 
        />
        <SwitchTile 
          title="Members in my other channels" 
          value={visibleToOthers} 
          onValueChange={setVisibleToOthers} 
        />
        <SwitchTile 
          title="Members I'm following" 
          value={visibleToFollowed} 
          onValueChange={setVisibleToFollowed} 
        />

        <SectionHeader title="How can people join" />
        <RadioTile 
          title="By sending invitation request" 
          value="invite" 
          groupValue={joinMethod} 
          onSelect={setJoinMethod} 
        />
        <RadioTile 
          title="Anyone can join" 
          value="anyone" 
          groupValue={joinMethod} 
          onSelect={setJoinMethod} 
        />

        <SectionHeader title="Allow commenting by" />
        {['All', 'Followers', 'Joined members', 'None (Only me)'].map(opt => (
          <RadioTile 
            key={opt} 
            title={opt} 
            value={opt.toLowerCase()} 
            groupValue={allowCommenting} 
            onSelect={setAllowCommenting} 
          />
        ))}

        <SectionHeader title="Allow status posting by" />
        {['All', 'Joined members', 'None (Only me)'].map(opt => (
          <RadioTile 
            key={opt} 
            title={opt} 
            value={opt.toLowerCase()} 
            groupValue={allowStatus} 
            onSelect={setAllowStatus} 
          />
        ))}

        <SectionHeader title="Global Restrictions" />
        <ActionTile 
          title="Which country allowed" 
          subtitle="All" 
          icon={Globe} 
          onPress={() => router.push(`/channel/settings/privacy/country/${id}` as any)} 
        />
        <SwitchTile 
          title="Allow members not leave" 
          value={preventLeaving} 
          onValueChange={setPreventLeaving} 
        />

        <View style={styles.saveContainer}>
          <TouchableOpacity style={styles.saveButton} onPress={() => router.back()}>
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footerSpacer} />
      </ScrollView>
    </View>
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
  saveContainer: {
    paddingHorizontal: 20,
    marginTop: 32,
    alignItems: 'flex-end',
  },
  saveButton: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    width: 120,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FFD700',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 1.0,
  },
  footerSpacer: {
    height: 60,
  },
});
