import { useStyles } from '@/core/hooks/useStyles';
import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface BottomPillTabsProps {
  tabs: { key: string; title: string }[];
  activeIndex: number;
  onChange: (index: number) => void;
}

export const BottomPillTabs: React.FC<BottomPillTabsProps> = ({
  tabs,
  activeIndex,
  onChange,
}) => {
  const insets = useSafeAreaInsets();
  
  const styles = useStyles((colors, scale) => ({
    container: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: '#000000', // Pure black to match YouTube
      paddingBottom: Math.max(16 * scale, insets.bottom),
      paddingTop: 12 * scale,
      flexDirection: 'row',
      justifyContent: 'center',
    },
    scrollViewContent: {
      flexGrow: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    tabButton: {
      paddingHorizontal: 16 * scale,
      paddingVertical: 8 * scale,
      borderRadius: 24 * scale,
      marginHorizontal: 4 * scale,
    },
    tabButtonActive: {
      backgroundColor: '#2A2A2A', // YouTube's dark gray pill background for the active item
    },
    tabButtonInactive: {
      backgroundColor: 'transparent',
    },
    tabText: {
      fontSize: 15 * scale,
      fontWeight: '600',
    },
    tabTextActive: {
      color: '#FFFFFF', // White text for active
    },
    tabTextInactive: {
      color: 'rgba(255,255,255,0.7)', // Slightly faded text for inactive
    },
  }));

  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollViewContent}>
        {tabs.map((tab, index) => {
          const isActive = index === activeIndex;
          return (
            <TouchableOpacity
              key={tab.key}
              activeOpacity={0.8}
              onPress={() => onChange(index)}
              style={[
                styles.tabButton,
                isActive ? styles.tabButtonActive : styles.tabButtonInactive,
              ]}
            >
              <Text
                style={[
                  styles.tabText,
                  isActive ? styles.tabTextActive : styles.tabTextInactive,
                ]}
              >
                {tab.title}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};
