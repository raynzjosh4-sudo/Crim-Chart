import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity, ScrollView } from 'react-native';
import { Image as ExpoImage } from 'expo-image';
import { MessageCircle } from 'lucide-react-native';
import { colors } from '@/core/theme/colors';
import { MessageModel } from '../models/MessageModel';

interface ActiveUsersBarProps {
  users: MessageModel[];
  onlineUserIds?: Set<string>;
  typingMap?: Record<string, boolean>;
}

interface ActiveUserItemProps {
  key?: React.Key;
  user: MessageModel;
  isOnline: boolean;
  isTyping: boolean;
}

const ActiveUserItem: React.FC<ActiveUserItemProps> = ({ user, isOnline, isTyping }) => {
  const pulseAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isTyping) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 0,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.stopAnimation();
      pulseAnim.setValue(0);
    }
  }, [isTyping, pulseAnim]);

  const flashOpacity = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 1.0],
  });

  const pulseScale = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.8, 1.2],
  });

  const borderColor = isTyping ? '#69F0AE' : isOnline ? '#69F0AE' : 'rgba(250, 205, 17, 0.3)';

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      style={styles.itemContainer}
      onPress={() => {
        // TODO: Show UserProfileBottomSheet
        console.log('Show UserProfileBottomSheet for', user.user.name);
      }}
    >
      <View style={styles.avatarWrapper}>
        {/* Pulsing Border */}
        <Animated.View
          style={[
            styles.borderRing,
            {
              borderColor,
              opacity: isTyping ? flashOpacity : 1,
            },
          ]}
        >
          <View style={styles.imageContainer}>
            <ExpoImage
              source={{ uri: user.user.avatarUrl }}
              style={styles.image}
              contentFit="cover"
            />
          </View>
        </Animated.View>

        {/* Typing Bubble */}
        {isTyping && (
          <Animated.View
            style={[
              styles.typingBadge,
              { transform: [{ scale: pulseScale }] },
            ]}
          >
            <MessageCircle size={10} color="#000" />
          </Animated.View>
        )}

        {/* Online Dot */}
        {isOnline && !isTyping && (
          <View style={styles.onlineDot} />
        )}
      </View>

      <View style={styles.nameRow}>
        <Text style={styles.nameText} numberOfLines={1}>
          {user.user.name.split(' ')[0]}
        </Text>
        {/* Add Verified Badge if user.user.isActive exists (extend model if needed) */}
      </View>
    </TouchableOpacity>
  );
};

export const ActiveUsersBar: React.FC<ActiveUsersBarProps> = ({
  users,
  onlineUserIds = new Set(),
  typingMap = {},
}) => {
  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {users.map((user, index) => {
          const isOnline = onlineUserIds.has(user.user.id);
          const isTyping = typingMap[user.user.id] === true;

          return (
            <ActiveUserItem
              key={user.user.id || index.toString()}
              user={user}
              isOnline={isOnline}
              isTyping={isTyping}
            />
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 110,
    paddingVertical: 10,
  },
  scrollContent: {
    paddingHorizontal: 16,
  },
  itemContainer: {
    marginRight: 16,
    alignItems: 'center',
    width: 60,
  },
  avatarWrapper: {
    marginBottom: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  borderRing: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
    backgroundColor: '#333', // fallback color
  },
  image: {
    width: '100%',
    height: '100%',
  },
  typingBadge: {
    position: 'absolute',
    top: -12,
    backgroundColor: '#69F0AE',
    borderRadius: 12,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  onlineDot: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 12,
    height: 12,
    backgroundColor: '#69F0AE',
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.background, // Match screen background
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  nameText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFF',
  },
});
