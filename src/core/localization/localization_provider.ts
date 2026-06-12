// src/core/localization/localization_provider.ts
import { useCallback } from 'react';

// Basic mock for the tr() translation function
const EN_US: Record<string, string> = {
  channel_title_hint: 'Channel Title',
  channel_description_hint: 'Write about the channel or community...',
  set_who_can_see_channel: 'Set who can see channel',
  age_restriction: 'Age restriction',
  all: 'All',
  members_in_my_other_channels: 'Members in my other channels',
  members_am_following: 'Members am following',
  how_can_people_join: 'How can people join',
  by_sending_invitation_request: 'By sending invitation request',
  anyone_can_join: 'Anyone can join',
  allow_commenting_by: 'Allow commenting by',
  followers: 'Followers',
  joined_members: 'Joined members',
  none_only_me: 'None only me',
  global_restrictions: 'Global restrictions',
  which_country_allowed: 'Which country is allowed to participate',
  allow_members_not_leave: 'Allow members who joined not to leave, unless sent a leaving thing',
  change_settings_anytime: 'You can change these settings anytime later in your Channels > Settings > Channel Settings.',
  wait: 'WAIT',
  create: 'CREATE',
  recording: 'Recording...',
  select_media: 'Select Media',
  gallery_tab: 'GALLERY',
  device_tab: 'DEVICE',
  gif_tab: 'GIFS',
  members_tab: 'MEMBERS',
};

export function useLocalization() {
  const tr = useCallback((key: string): string => {
    return EN_US[key] || key; // fallback to key if missing
  }, []);

  return { tr };
}
