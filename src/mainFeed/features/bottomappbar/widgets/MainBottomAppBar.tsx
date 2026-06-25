import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { MessageCircle, PlaySquare, PlusSquare, Podcast, User, FlaskConical } from 'lucide-react-native';
import { useTheme } from '@react-navigation/native';

interface MainBottomAppBarProps {
  selectedIndex: number;
  onItemTapped: (index: number) => void;
  homeBadgeCount?: number;
}

export const MainBottomAppBar: React.FC<MainBottomAppBarProps> = ({
  selectedIndex,
  onItemTapped,
  homeBadgeCount = 0,
}) => {
  const { colors } = useTheme();

  const tabs = [
    { icon: MessageCircle, label: 'Messages', isBadge: true, showDot: true },
    { icon: PlaySquare, label: 'Short' },
    { icon: PlusSquare, label: 'Add' },
    { icon: Podcast, label: 'posts', isBadge: true, count: homeBadgeCount },
    { icon: User, label: 'Profile' },
    { icon: FlaskConical, label: 'Lab' },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
      {tabs.map((tab, index) => {
        const isSelected = selectedIndex === index;
        const color = isSelected ? colors.text : 'rgba(255,255,255,0.5)';
        
        return (
          <TouchableOpacity activeOpacity={1}
            key={index}
            style={styles.tab}
            onPress={() => onItemTapped(index)}
            activeOpacity={0.7}
          >
            {tab.isBadge ? (
              null
            ) : (
              <tab.icon color={color} size={28} />
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    height: 60,
    borderTopWidth: 0.5,
    elevation: 8,
  },
  tab: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
