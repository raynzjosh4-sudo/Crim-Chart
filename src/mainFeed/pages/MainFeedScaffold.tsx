import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@react-navigation/native';
// Assuming these are all React components in the project
import { MainFeedBody } from '@/mainFeed/pages/main_page_widgets/MainFeedBody';
import { MainFeedAppBar } from '@/mainFeed/pages/main_page_widgets/MainFeedAppBar';
import { VideoFeedPage } from '@/mainFeed/pages/export'; // Or wherever this points
import { FirstPostMainPage } from '@/mainFeed/pages/export';
import { ChannelsPage } from '@/mainFeed/pages/export';
import { ProfilePage } from '@/mainFeed/pages/export';
import { AppBottomNavBar } from '@/components/navbar/AppBottomNavBar';
import { CrimChartUserModel } from '@/profile/models/CrimChartUserModel';

interface MainFeedScaffoldProps {
  selectedIndex: number;
  onItemTapped: (index: number) => void;
  homeBadgeCount: number;
  // In React Native, lists are usually FlatList. We skip strict scroll/paging controllers for this mock wrapper.
  isRefreshing: boolean;
  onRefresh: () => Promise<void>;
  discoveredChannels?: CrimChartUserModel[];
  cards?: any[];
  isLoading?: boolean;
  onLoadMore?: () => void;
}

export const MainFeedScaffold: React.FC<MainFeedScaffoldProps> = ({
  selectedIndex,
  onItemTapped,
  homeBadgeCount,
  isRefreshing,
  onRefresh,
  discoveredChannels = [], cards = [], isLoading = false, onLoadMore,
}) => {
  const { colors } = useTheme();

  const renderBody = () => {
    switch (selectedIndex) {
      case 0:
        return (
          <MainFeedBody
            isRefreshing={isRefreshing}
            onRefresh={onRefresh}
            discoveredChannels={discoveredChannels}
            cards={cards}
            isLoading={isLoading}
            onLoadMore={onLoadMore!}
          />
        );
      case 1:
        return <VideoFeedPage showBack={false} />;
      case 2:
        return <FirstPostMainPage postDestination="" />;
      case 3:
        return <ChannelsPage />;
      case 5:
        return <ProfilePage showBack={false} />;
      default:
        return (
          <View style={styles.center}>
            <Text style={{ color: colors.text }}>Coming Soon</Text>
          </View>
        );
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {selectedIndex === 0 && <MainFeedAppBar />}
      
      <View style={styles.bodyContainer}>
        {renderBody()}
      </View>
      
      <AppBottomNavBar
        selectedIndex={selectedIndex}
        onItemTapped={onItemTapped}
        homeBadgeCount={homeBadgeCount}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  bodyContainer: {
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

