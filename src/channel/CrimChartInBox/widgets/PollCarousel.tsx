import React, { useRef } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Animated, ImageBackground, Dimensions } from 'react-native';
import { Play, Plus, Star } from 'lucide-react-native';

export enum PollMediaType { image, video, text }

export interface PollItem {
  id: string;
  title: string;
  mediaUrl?: string;
  type: PollMediaType;
  points: number;
  suggestedBy?: string;
}

interface PollCarouselProps {
  items: PollItem[];
  title?: string;
  isFullWidth?: boolean;
  onPointAdd?: (item: PollItem) => void;
}

const { width: screenWidth } = Dimensions.get('window');

const PollCard = ({ item, isFullWidth, onAdd }: { item: PollItem, isFullWidth: boolean, onAdd?: () => void }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, { toValue: 0.9, useNativeDriver: true }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true }).start();
    onAdd?.();
  };

  const cardWidth = isFullWidth ? screenWidth - 32 : 260;

  return (
    <View style={[styles.cardContainer, { width: cardWidth, marginLeft: isFullWidth ? 16 : 20 }]}>
      {item.type === PollMediaType.text ? (
        <View style={[styles.mediaLayer, { backgroundColor: 'rgba(228, 30, 63, 0.1)' }]}>
          <Text style={styles.textPollTitle}>{item.title}</Text>
        </View>
      ) : (
        <ImageBackground source={{ uri: item.mediaUrl }} style={styles.mediaLayer}>
          {item.type === PollMediaType.video && (
            <View style={styles.videoIconContainer}>
              <Play color="#FFF" size={32} fill="#FFF" />
            </View>
          )}
        </ImageBackground>
      )}

      {/* Gradient overlay */}
      <View style={styles.gradientOverlay} />

      {item.suggestedBy && (
        <View style={styles.suggestedBadge}>
          <Text style={styles.suggestedText}>Suggested by: {item.suggestedBy}</Text>
        </View>
      )}

      <View style={styles.bottomContent}>
        {item.type !== PollMediaType.text && (
          <Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>
        )}
        
        <View style={styles.bottomRow}>
          <View style={styles.pointsBadge}>
            <Star color="#FFF" size={14} fill="#FFF" />
            <Text style={styles.pointsText}>{item.points} Points</Text>
          </View>
          
          <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
            <TouchableOpacity 
              activeOpacity={1} 
              onPressIn={handlePressIn} 
              onPressOut={handlePressOut}
              style={styles.addButton}
            >
              <Plus color="#FFF" size={20} />
            </TouchableOpacity>
          </Animated.View>
        </View>
      </View>
    </View>
  );
};

export const PollCarousel: React.FC<PollCarouselProps> = ({
  items,
  title = 'Active Poll',
  isFullWidth = false,
  onPointAdd,
}) => {
  return (
    <View style={[styles.container, { paddingVertical: isFullWidth ? 12 : 24 }]}>
      <View style={[styles.header, { paddingHorizontal: isFullWidth ? 16 : 24 }]}>
        <Text style={[styles.headerTitle, { fontSize: isFullWidth ? 16 : 18 }]}>{title}</Text>
        <Text style={styles.voteNow}>Vote now</Text>
      </View>

      <FlatList
        data={items}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <PollCard 
            item={item} 
            isFullWidth={isFullWidth} 
            onAdd={() => onPointAdd?.(item)} 
          />
        )}
        contentContainerStyle={{ paddingRight: 20 }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontWeight: '900',
    color: '#FFF',
  },
  voteNow: {
    fontSize: 13,
    fontWeight: '600',
    color: '#E41E3F',
  },
  cardContainer: {
    height: 340,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#1A1A2E',
    marginRight: 4,
  },
  mediaLayer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textPollTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFF',
    textAlign: 'center',
    padding: 24,
  },
  videoIconContainer: {
    padding: 12,
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 99,
  },
  gradientOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  suggestedBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  suggestedText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '600',
  },
  bottomContent: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
  },
  cardTitle: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 8,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pointsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E41E3F',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  pointsText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '900',
    marginLeft: 4,
  },
  addButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
