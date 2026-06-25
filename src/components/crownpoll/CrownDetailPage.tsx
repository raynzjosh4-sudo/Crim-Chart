import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ExpandableCrownText } from './widgets/ExpandableCrownText';
import { CrownPollCard } from './widgets/CrownPollCard';
import { CrownButton } from './widgets/CrownButton';
import { CrownOptionModel } from './models/CrownOptionModel';
import { CrownModel } from './models/CrownModel';
import { ChevronLeft } from 'lucide-react-native';

interface CrownDetailPageProps {
  pollModel: CrownModel;
  option: CrownOptionModel;
  themeColor: string;
  onCrown: () => void;
}

export const CrownDetailPage: React.FC<CrownDetailPageProps> = ({
  pollModel,
  option,
  themeColor,
  onCrown,
}) => {
  const router = useRouter();
  const [isMe, setIsMe] = useState(option.isMe);
  const [crowns, setCrowns] = useState(option.crowns);
  const [showTitleInAppBar, setShowTitleInAppBar] = useState(false);

  const handleScroll = (event: any) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    if (offsetY > 80 && !showTitleInAppBar) {
      setShowTitleInAppBar(true);
    } else if (offsetY <= 80 && showTitleInAppBar) {
      setShowTitleInAppBar(false);
    }
  };

  const handleCrown = () => {
    if (!isMe) {
      setIsMe(true);
      setCrowns(c => c + 1);
    } else {
      setIsMe(false);
      setCrowns(c => c - 1);
    }
    onCrown();
  };

  const handleMediaTap = () => {
    // Navigate to media viewer based on mediaType
    console.log('Tapped media:', option.mediaType);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* App Bar equivalent */}
      <View style={styles.appBar}>
        <TouchableOpacity activeOpacity={1} onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft color="#000" size={24} />
        </TouchableOpacity>
        <View style={styles.appBarTitleContainer}>
          {showTitleInAppBar && (
            <>
              <Text style={styles.appBarTitle} numberOfLines={1}>{pollModel.title}</Text>
              <Text style={styles.appBarSubtitle} numberOfLines={1}>{option.description}</Text>
            </>
          )}
        </View>
        <View style={{ width: 40 }} /> {/* Placeholder to balance back button */}
      </View>

      <ScrollView
        style={styles.scrollView}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        <View style={styles.content}>
          <ExpandableCrownText
            text={pollModel.title}
            style={styles.pollTitle}
          />
          <View style={{ height: 8 }} />
          <ExpandableCrownText
            text={option.description}
            style={styles.optionDescription}
          />
          <View style={{ height: 24 }} />

          {/* Row with Poll Card and Button */}
          <View style={styles.interactionRow}>
            <CrownPollCard
              option={option.copyWith({ crowns, isMe })}
              themeColor={themeColor}
              onTap={handleMediaTap}
              width={140}
              height={200}
            />
            <View style={{ width: 20 }} />
            <View style={{ flex: 1 }}>
              <CrownButton
                isMe={isMe}
                crowns={crowns}
                themeColor={themeColor}
                onTap={handleCrown}
              />
            </View>
          </View>
        </View>

        {/* Placeholder for Comments List */}
        <View style={styles.commentsPlaceholder}>
          <Text style={{ textAlign: 'center', color: '#888', marginTop: 40 }}>Comments loading...</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  appBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  appBarTitleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  appBarTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
  },
  appBarSubtitle: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  pollTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  optionDescription: {
    fontSize: 16,
    color: '#444',
  },
  interactionRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  commentsPlaceholder: {
    paddingBottom: 100,
  },
});
