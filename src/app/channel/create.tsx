import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Switch } from 'react-native';
import { useTheme } from '@react-navigation/native';
import ChartAppBar from '@/components/chartappbar/ChartAppBar';
import { useRouter } from 'expo-router';
import { Camera, Calendar, ChevronRight, Globe } from 'lucide-react-native';
import { Image as ExpoImage } from 'expo-image';
import { useLocalization } from '@/core/localization/localization_provider';
import { ChartLinearLoader } from '@/components/loader/ChartLinearLoader';
import { useChannelCreationController, ChannelCreationStatus } from '@/channel/application/useChannelCreationController';
import { CommentingSheet } from '@/components/Commentingsheets/widgets/CommentingSheet';
import { MediaData } from '@/channel/pages/widgets2/chartcard/models/media_data';

export default function CreateChannelPage() {
  const { colors } = useTheme();
  const router = useRouter();
  const { tr } = useLocalization();
  
  const createChannel = useChannelCreationController(state => state.createChannel);
  const creationStatus = useChannelCreationController(state => state.status);
  const draftCountries = useChannelCreationController(state => state.draftCountries);
  const draftAge = useChannelCreationController(state => state.draftAge);
  const isLoading = creationStatus === ChannelCreationStatus.processing;

  const [title, setTitle] = useState('Channel Title');
  const [description, setDescription] = useState('Write about the channel or community...');
  const [selectedMedia, setSelectedMedia] = useState<MediaData | null>(null);
  const [isMediaPickerVisible, setIsMediaPickerVisible] = useState(false);

  // Settings State
  const [membersOtherChannels, setMembersOtherChannels] = useState(false);
  const [membersFollowing, setMembersFollowing] = useState(true);
  const [joinMethod, setJoinMethod] = useState('invite');
  const [preventLeaving, setPreventLeaving] = useState(false);
  const [allowCommentingBy, setAllowCommentingBy] = useState('all');

  const handleCreate = () => {
    if (isLoading) return;
    if (title.trim().length === 0) {
      console.log('Validation failed: Name is empty');
      return;
    }

    createChannel({
      name: title.trim(),
      description: description.trim(),
      mediaPath: selectedMedia?.contentUrl,
      ageRestriction: draftAge,
      membersOtherChannels,
      membersFollowing,
      joinMethod,
      preventLeaving,
      countryRestrictions: draftCountries,
      allowCommentingBy,
    }).then(() => {
      // In a real app we'd navigate back inside the success listener
      // For now, it will just show the success state.
      router.back();
    }).catch((e) => {
      console.error('Create channel failed', e);
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ChartAppBar 
        title={tr('create_channel')} 
        showBack={true} 
        centerTitle={true}
        titleStyle={{ fontWeight: '900', textTransform: 'lowercase' }}
      />

      <ChartLinearLoader isLoading={isLoading} />
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Interactive Avatar Selector */}
        <View style={styles.avatarContainer}>
          <TouchableOpacity onPress={() => setIsMediaPickerVisible(true)} activeOpacity={0.8}>
            <View style={[styles.avatarCircle, { backgroundColor: 'rgba(255, 255, 255, 0.05)' }]}>
              {selectedMedia ? (
                <ExpoImage source={{ uri: selectedMedia.contentUrl }} style={styles.avatarImage} contentFit="cover" />
              ) : (
                <Camera size={40} color="#FFD700" opacity={0.8} />
              )}
            </View>
          </TouchableOpacity>
        </View>

        {/* Essential Identity Fields */}
        <TextInput
          style={[styles.input, { color: colors.text, backgroundColor: 'rgba(255,255,255,0.05)' }]}
          placeholder={tr('channel_title_hint')}
          placeholderTextColor="rgba(255,255,255,0.3)"
          value={title}
          onChangeText={setTitle}
        />
        <TextInput
          style={[styles.input, styles.textArea, { color: colors.text, backgroundColor: 'rgba(255,255,255,0.05)' }]}
          placeholder={tr('channel_description_hint')}
          placeholderTextColor="rgba(255,255,255,0.3)"
          multiline
          numberOfLines={4}
          value={description}
          onChangeText={setDescription}
        />

        <View style={styles.spacer} />

        {/* Embedded Settings: Who can see channel */}
        <Text style={styles.sectionHeader}>{tr('set_who_can_see_channel').toUpperCase()}</Text>
        <ActionTile 
          title={tr('age_restriction')} 
          subtitle={draftAge === 'All Ages' ? tr('all') : draftAge} 
          icon={<Calendar size={20} color="rgba(255,255,255,0.4)" />}
          onPress={() => router.push('/channel/age' as any)} 
        />
        <ToggleTile 
          title={tr('members_in_my_other_channels')} 
          value={membersOtherChannels} 
          onChanged={setMembersOtherChannels} 
        />
        <ToggleTile 
          title={tr('members_am_following')} 
          value={membersFollowing} 
          onChanged={setMembersFollowing} 
        />

        <View style={styles.spacer} />

        {/* Embedded Settings: How can people join */}
        <Text style={styles.sectionHeader}>{tr('how_can_people_join').toUpperCase()}</Text>
        <RadioTile 
          title={tr('by_sending_invitation_request')} 
          value="invite" 
          groupValue={joinMethod} 
          onChanged={setJoinMethod} 
        />
        <RadioTile 
          title={tr('anyone_can_join')} 
          value="anyone" 
          groupValue={joinMethod} 
          onChanged={setJoinMethod} 
        />

        <View style={styles.spacer} />

        {/* Embedded Settings: Allow commenting by */}
        <Text style={styles.sectionHeader}>{tr('allow_commenting_by').toUpperCase()}</Text>
        <RadioTile title={tr('all')} value="all" groupValue={allowCommentingBy} onChanged={setAllowCommentingBy} />
        <RadioTile title={tr('followers')} value="followers" groupValue={allowCommentingBy} onChanged={setAllowCommentingBy} />
        <RadioTile title={tr('joined_members')} value="joined" groupValue={allowCommentingBy} onChanged={setAllowCommentingBy} />
        <RadioTile title={tr('none_only_me')} value="none" groupValue={allowCommentingBy} onChanged={setAllowCommentingBy} />

        <View style={styles.spacer} />

        {/* Embedded Settings: Global restrictions */}
        <Text style={styles.sectionHeader}>{tr('global_restrictions').toUpperCase()}</Text>
        <ActionTile 
          title={tr('which_country_allowed')} 
          subtitle={draftCountries.length === 1 && draftCountries[0] === 'Global' ? tr('all') : `${draftCountries.length} Selected`} 
          icon={<Globe size={20} color="rgba(255,255,255,0.4)" />}
          onPress={() => router.push('/channel/country' as any)} 
        />
        <ToggleTile 
          title={tr('allow_members_not_leave')} 
          value={preventLeaving} 
          onChanged={setPreventLeaving} 
        />
        <View style={{ height: 16 }} />
        <Text style={[styles.helpText, { color: 'rgba(255,255,255,0.4)' }]}>
          {tr('change_settings_anytime')}
        </Text>

        <View style={{ height: 24 }} />

        {/* Right-Aligned Premium Action Box */}
        <View style={styles.createButtonContainer}>
          <TouchableOpacity onPress={handleCreate} activeOpacity={0.7}>
            <View style={[styles.createButton, isLoading ? styles.createButtonLoading : styles.createButtonActive]}>
              <Text style={[styles.createButtonText, isLoading ? { color: 'rgba(250, 205, 17, 0.5)' } : {}]}>
                {isLoading ? tr('wait') : tr('create')}
              </Text>
            </View>
          </TouchableOpacity>
        </View>

      </ScrollView>

      {/* Media Picker Bottom Sheet */}
      <CommentingSheet 
        visible={isMediaPickerVisible}
        onClose={() => setIsMediaPickerVisible(false)}
        onMediaSelected={(media) => setSelectedMedia(media)}
      />
    </View>
  );
}

// ----------------------------------------------------
// Reusable Sub-components
// ----------------------------------------------------

const ActionTile = ({ title, subtitle, icon, onPress }: any) => (
  <TouchableOpacity style={styles.tile} onPress={onPress}>
    <View style={{ flex: 1, paddingRight: 16 }}>
      <Text style={styles.tileTitle}>{title}</Text>
    </View>
    <View style={styles.tileTrailing}>
      <Text style={styles.tileSubtitle}>{subtitle}</Text>
      <ChevronRight size={20} color="rgba(255,255,255,0.4)" style={{ marginLeft: 8 }} />
    </View>
  </TouchableOpacity>
);

const ToggleTile = ({ title, value, onChanged }: any) => (
  <View style={styles.tile}>
    <View style={{ flex: 1, paddingRight: 16 }}>
      <Text style={styles.tileTitle}>{title}</Text>
    </View>
    <Switch 
      value={value} 
      onValueChange={onChanged} 
      trackColor={{ false: 'rgba(255,255,255,0.1)', true: 'rgba(250, 205, 17, 0.5)' }}
      thumbColor={value ? '#FACD11' : '#f4f3f4'}
      style={{ transform: [{ scale: 0.8 }] }}
    />
  </View>
);

const RadioTile = ({ title, value, groupValue, onChanged }: any) => {
  const isSelected = value === groupValue;
  return (
    <TouchableOpacity style={styles.tile} onPress={() => onChanged(value)}>
      <View style={{ flex: 1, paddingRight: 16 }}>
        <Text style={styles.tileTitle}>{title}</Text>
      </View>
      <View style={[styles.radioOuter, isSelected && styles.radioOuterSelected]}>
        {isSelected && <View style={styles.radioInner} />}
      </View>
    </TouchableOpacity>
  );
};

// ----------------------------------------------------
// Styles
// ----------------------------------------------------

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingHorizontal: 24, paddingVertical: 24, paddingBottom: 60 },
  avatarContainer: { alignItems: 'center', marginBottom: 32 },
  avatarCircle: {
    width: 110,
    height: 110,
    borderRadius: 55,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  avatarImage: { width: '100%', height: '100%' },
  input: {
    minHeight: 56,
    borderRadius: 16,
    paddingHorizontal: 18,
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 16,
  },
  textArea: {
    height: 100,
    paddingTop: 18,
    textAlignVertical: 'top',
  },
  spacer: { height: 16 },
  sectionHeader: {
    color: '#FFD700',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.8,
    marginBottom: 16,
    marginTop: 8,
    marginLeft: 4,
  },
  tile: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
  tileTitle: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
  },
  tileTrailing: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tileSubtitle: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 13,
    fontWeight: '600',
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioOuterSelected: {
    borderColor: '#FACD11',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FACD11',
  },
  hintText: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 12,
    marginLeft: 4,
    marginTop: 16,
    marginBottom: 24,
  },
  createButtonContainer: {
    alignItems: 'flex-end',
    marginTop: 16,
  },
  actionRow: {
    alignItems: 'flex-end',
  },
  helpText: {
    fontSize: 12,
    lineHeight: 18,
    marginLeft: 4,
  },
  createButton: {
    width: 120,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  createButtonActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)', // Match surfaceContainerHigh with alpha 0.3 approx
  },
  createButtonLoading: {
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
  },
  createButtonText: {
    color: '#FACD11',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 1.0,
  },
});
