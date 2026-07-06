import { useStyles } from "@/core/hooks/useStyles";
import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, Dimensions, Animated, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import AppAvatar from '@/components/avatar/AppAvatar';
import { GivenGiftsDisplay } from '@/profile/widgets/ratings/GivenGiftsDisplay';
const {
  width: SCREEN_WIDTH
} = Dimensions.get('window');
export interface CarouselMember {
  id: string;
  name: string;
  avatarUrl?: string | null;
  title?: string;
  pointsDisplay?: string;
  receivedGifts?: any[]; // Replace any with the actual Gift type if available
}
interface ScalingAvatarCarouselProps {
  members: CarouselMember[];
  viewportFraction?: number;
  minScale?: number;
  maxScale?: number;
}
export const ScalingAvatarCarousel: React.FC<ScalingAvatarCarouselProps> = ({
  members,
  viewportFraction = 0.65,
  minScale = 0.4,
  maxScale = 1.0
}) => {
  const styles = useStyles(colors => ({
    container: {
      alignItems: 'center',
      width: '100%'
    },
    detailsContainer: {
      marginTop: 12,
      alignItems: 'center',
      paddingHorizontal: 20
    },
    nameText: {
      color: colors.text,
      fontSize: 22,
      fontWeight: '900',
      letterSpacing: -0.5,
      textAlign: 'center'
    },
    titleText: {
      color: '#FACD11',
      // Primary color
      fontSize: 16,
      fontWeight: '800',
      letterSpacing: 0.2,
      marginTop: 6,
      textAlign: 'center'
    },
    pointsText: {
      color: 'rgba(255,255,255,0.6)',
      fontSize: 20,
      fontWeight: '900',
      letterSpacing: 0.2,
      marginTop: 8
    }
  }));
  const scrollX = useRef(new Animated.Value(0)).current;
  const [currentIndex, setCurrentIndex] = useState(Math.floor(members.length / 2));
  const ITEM_WIDTH = SCREEN_WIDTH * viewportFraction;
  const SPACER_WIDTH = (SCREEN_WIDTH - ITEM_WIDTH) / 2;
  const handleScroll = Animated.event([{
    nativeEvent: {
      contentOffset: {
        x: scrollX
      }
    }
  }], {
    useNativeDriver: true
  });
  const onMomentumScrollEnd = (event: any) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / ITEM_WIDTH);
    setCurrentIndex(Math.max(0, Math.min(index, members.length - 1)));
  };
  const currentMember = members[currentIndex] || members[0];
  return <View style={styles.container}>
      <View style={{
      height: 250
    }}>
        <Animated.ScrollView horizontal showsHorizontalScrollIndicator={false} snapToInterval={ITEM_WIDTH} decelerationRate="fast" onScroll={handleScroll} scrollEventThrottle={16} onMomentumScrollEnd={onMomentumScrollEnd} contentContainerStyle={{
        paddingHorizontal: SPACER_WIDTH
      }}>
          {members.map((member, index) => {
          const inputRange = [(index - 1) * ITEM_WIDTH, index * ITEM_WIDTH, (index + 1) * ITEM_WIDTH];
          const scale = scrollX.interpolate({
            inputRange,
            outputRange: [minScale, maxScale, minScale],
            extrapolate: 'clamp'
          });
          const opacity = scrollX.interpolate({
            inputRange,
            outputRange: [0.4, 1.0, 0.4],
            extrapolate: 'clamp'
          });
          return <View key={member.id} style={{
            width: ITEM_WIDTH,
            justifyContent: 'center',
            alignItems: 'center'
          }}>
                <Animated.View style={{
              transform: [{
                scale
              }],
              opacity
            }}>
                  <AppAvatar size={240} url={member.avatarUrl} showStatusRing={true} showActiveDot={false} />
                </Animated.View>
              </View>;
        })}
        </Animated.ScrollView>
      </View>

      <View style={styles.detailsContainer}>
        <Text style={styles.nameText} numberOfLines={1}>
          {currentMember?.name}
        </Text>

        {currentMember?.title && <Text style={styles.titleText}>{currentMember.title}</Text>}

        {currentMember?.pointsDisplay && <Text style={styles.pointsText}>{currentMember.pointsDisplay}</Text>}

        {currentMember?.receivedGifts && currentMember.receivedGifts.length > 0 && <View style={{
        marginTop: 12
      }}>
            <GivenGiftsDisplay aggregations={currentMember.receivedGifts} totalGifts={currentMember.receivedGifts.length} />
          </View>}
      </View>
    </View>;
};