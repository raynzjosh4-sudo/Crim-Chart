import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Plus } from 'lucide-react-native';
import { useTheme } from '@react-navigation/native';
import AppAvatar from '@/components/avatar/AppAvatar';

interface StoryUser {
  displayName: string;
  profileImageUrl: string;
}

export interface StoryModel {
  user: StoryUser;
  isLive: boolean;
  isPublic: boolean;
  hasUnviewedStatus: boolean;
}

interface StoryListWidgetProps {
  stories: StoryModel[];
  onStoryTap: (story: StoryModel, index: number) => void;
}

export const StoryListWidget: React.FC<StoryListWidgetProps> = ({ stories, onStoryTap }) => {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {stories.map((story, index) => (
          <TouchableOpacity
            key={`${story.user.displayName}-${index}`}
            style={styles.storyItem}
            activeOpacity={0.8}
            onPress={() => onStoryTap(story, index)}
          >
            <View style={styles.avatarWrapper}>
              <AppAvatar
                size={90}
                imageUrl={story.user.profileImageUrl}
                showStatusRing={story.hasUnviewedStatus}
                showActiveDot={true}
                useHexagon={false}
              />
              
              {index === 0 && (
                <View style={[styles.addButton, { backgroundColor: colors.primary, borderColor: colors.background }]}>
                  <Plus size={20} color={colors.background} />
                </View>
              )}

              {story.isLive && (
                <View style={styles.liveBadgeContainer}>
                  <View style={[styles.liveBadge, { borderColor: colors.background }]}>
                    <Text style={styles.liveText}>LIVE</Text>
                  </View>
                </View>
              )}
            </View>
            <View style={styles.nameWrapper}>
              <Text
                style={[
                  styles.nameText,
                  { color: story.hasUnviewedStatus ? colors.text : 'rgba(255, 255, 255, 0.6)' },
                ]}
                numberOfLines={1}
              >
                {story.user.displayName}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 135,
    paddingVertical: 8,
  },
  scrollContent: {
    paddingHorizontal: 10,
  },
  storyItem: {
    paddingHorizontal: 10,
    alignItems: 'center',
  },
  avatarWrapper: {
    position: 'relative',
  },
  addButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  liveBadgeContainer: {
    position: 'absolute',
    bottom: -4,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  liveBadge: {
    backgroundColor: '#FF4081', // Colors.pinkAccent approximate
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 2,
  },
  liveText: {
    fontSize: 10,
    fontWeight: '900',
    color: 'white',
    letterSpacing: 0.5,
  },
  nameWrapper: {
    width: 90,
    marginTop: 6,
    alignItems: 'center',
  },
  nameText: {
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
  },
});

