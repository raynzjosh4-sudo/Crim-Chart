import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Compass, MessageCircle, MonitorPlay, Users } from 'lucide-react-native';
import { colors } from '@/core/theme/colors';

interface ChannelNavBarProps {
  selectedIndex: number;
  onTabSelected: (index: number) => void;
  unreadMessages?: number;
  unreadMoments?: number;
  totalMembers?: number;
  pendingRequests?: number;
}

export const ChannelNavBar: React.FC<ChannelNavBarProps> = ({
  selectedIndex,
  onTabSelected,
  unreadMessages = 0,
  unreadMoments = 0,
  totalMembers = 0,
  pendingRequests = 0,
}) => {
  const tabs = [
    { icon: Compass, badge: null },
    { icon: MessageCircle, badge: unreadMessages > 0 ? unreadMessages.toString() : null },
    { icon: MonitorPlay, badge: unreadMoments > 0 ? unreadMoments.toString() : null },
    { icon: Users, badge: pendingRequests > 0 ? pendingRequests.toString() : null },
  ];

  return (
    <View style={styles.container}>
      {tabs.map((tab, index) => {
        const isSelected = index === selectedIndex;
        const IconComponent = tab.icon;
        
        return (
          <TouchableOpacity activeOpacity={1} 
            key={index} 
            style={styles.tabItem} 
            onPress={() => onTabSelected(index)}
          >
            <View style={styles.iconContainer}>
              <IconComponent 
                size={32} 
                color={isSelected ? colors.primary : 'rgba(255,255,255,0.7)'} 
                strokeWidth={isSelected ? 2.5 : 2}
              />
              {tab.badge && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{tab.badge}</Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    height: 72,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  iconContainer: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -6,
    right: -10,
    backgroundColor: '#E41E3F',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    minWidth: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '900',
    lineHeight: 13,
  },
});
