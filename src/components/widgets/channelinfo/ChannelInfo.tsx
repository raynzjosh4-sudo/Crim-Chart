import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@react-navigation/native';
import ChannelName from '@/channel/widgets/ChannelName'; 
import MemberCount from '@/channel/pages/widgets2/chartmembers/MemberCount'; 
import StarterName from '@/channel/pages/widgets2/chartstarter/StarterName'; 
import AppAvatar from '@/components/avatar/AppAvatar';
import HorizontalGiftScroll from '@/gifts/horizontalgiftscroll/HorizontalGiftScroll'; 

interface ChannelInfoProps {
  channelTitle?: string;
  staterName?: string;
  staterAvatarUrl?: string;
  isActive?: boolean;
  memberCount?: number;
  isPrivate?: boolean;
  subchannelCount?: number;
}

export const ChannelInfo: React.FC<ChannelInfoProps> = ({
  channelTitle,
  staterName,
  staterAvatarUrl,
  isActive = true,
  memberCount = 560,
  isPrivate = true,
  subchannelCount = 0,
}) => {
  const { colors } = useTheme();
  const currentColor = colors.primary; 

  return (
    <View style={styles.container}>
      <ChannelName text={channelTitle} color={currentColor} />
      
      <View style={{ height: 12 }} />
      
      <HorizontalGiftScroll themeColor={currentColor} />
      
      <View style={{ height: 16 }} />
      
      <View style={styles.starterRow}>
        <AppAvatar
          imageUrl={staterAvatarUrl}
          showStatusRing
          />
        <View style={{ width: 16 }} />
        <View style={styles.starterNameWrapper}>
          <StarterName name={staterName || "Chart starter's name"} />
        </View>
      </View>

      <View style={{ height: 16 }} />
      <MemberCount count={memberCount} />
      
      <View style={{ height: 8 }} />
      <Text style={[styles.privacyText, { color: colors.text }]}>
        {isPrivate ? 'Private' : 'Public'}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  starterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  starterNameWrapper: {
    flexShrink: 1,
  },
  privacyText: {
    opacity: 0.5,
    fontStyle: 'italic',
    fontWeight: '600',
  },
});


