import { useStyles } from "@/core/hooks/useStyles";
import { useCurrentTheme } from "@/core/store/useThemeStore";
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Compass, MessageCircle, Aperture, Users } from 'lucide-react-native';

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
  pendingRequests = 0
}) => {
  const theme = useCurrentTheme();
  const styles = useStyles(colors => ({
    container: {
      flexDirection: 'row' as const,
      justifyContent: 'space-evenly' as const,
      height: 72,
      alignItems: 'center' as const,
      backgroundColor: 'transparent'
    },
    tabItem: {
      flex: 1,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      height: '100%' as any
    },
    iconContainer: {
      position: 'relative' as const
    },
    badge: {
      position: 'absolute' as const,
      top: -6,
      right: -10,
      backgroundColor: colors.error,
      borderRadius: 12,
      paddingHorizontal: 8,
      paddingVertical: 4,
      minWidth: 24,
      alignItems: 'center' as const,
      justifyContent: 'center' as const
    },
    badgeText: {
      color: colors.onPrimary,
      fontSize: 13,
      fontWeight: '900' as const,
      lineHeight: 13
    }
  }));

  const tabs = [{
    icon: Compass,
    badge: null
  }, {
    icon: MessageCircle,
    badge: unreadMessages > 0 ? unreadMessages.toString() : null
  }, {
    icon: Aperture,
    badge: unreadMoments > 0 ? unreadMoments.toString() : null
  }, {
    icon: Users,
    badge: pendingRequests > 0 ? pendingRequests.toString() : null
  }];

  return (
    <View style={styles.container}>
      {tabs.map((tab, index) => {
        const isSelected = index === selectedIndex;
        const IconComponent = tab.icon;
        return (
          <TouchableOpacity activeOpacity={1} key={index} style={styles.tabItem} onPress={() => onTabSelected(index)}>
            <View style={styles.iconContainer}>
              <IconComponent size={32} color={isSelected ? theme.colors.primary : theme.colors.textSecondary} strokeWidth={isSelected ? 2.5 : 2} />
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