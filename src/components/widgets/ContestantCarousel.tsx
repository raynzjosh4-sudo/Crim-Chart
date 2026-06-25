import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { Plus } from 'lucide-react-native';
import { useTheme } from '@react-navigation/native';
import { CrimChartUserModel } from '@/profile/models/CrimChartUserModel';
import AppAvatar from '@/components/avatar/AppAvatar';

interface ContestantCarouselProps {
  contestants?: CrimChartUserModel[];
}

export const ContestantCarousel: React.FC<ContestantCarouselProps> = ({ contestants = [] }) => {
  const { colors } = useTheme();
  const [hasCrowned, setHasCrowned] = useState(false);
  const [clickedIndex, setClickedIndex] = useState<number | null>(null);

  const localContestants = contestants.length > 0 ? contestants : [
    { id: 'm1', displayName: '-', profileImageUrl: 'https://i.pravatar.cc/150?img=1', channelCount: 0 } as CrimChartUserModel,
    { id: 'm2', displayName: 'Sarah', profileImageUrl: 'https://i.pravatar.cc/150?img=2', channelCount: 0 } as CrimChartUserModel,
    { id: 'm3', displayName: 'Mike', profileImageUrl: 'https://i.pravatar.cc/150?img=3', channelCount: 0 } as CrimChartUserModel,
  ];

  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Add Button */}
        <View style={styles.slot}>
          <TouchableOpacity activeOpacity={1} style={[styles.addButton, { backgroundColor: 'rgba(255, 255, 255, 0.1)', borderColor: 'rgba(255, 255, 255, 0.1)' }]}>
            <Plus size={44} color="rgba(255, 255, 255, 0.8)" />
          </TouchableOpacity>
        </View>

        {/* Contestants */}
        {localContestants.map((contestant, index) => {
          const isWinner = clickedIndex === index;
          const isOther = hasCrowned && !isWinner;
          const driftX = isOther ? (clickedIndex! - index) * 60 : 0;
          const driftY = isOther ? -100 : 0;

          return (
            <View key={contestant.id} style={styles.slot}>
              <TouchableOpacity activeOpacity={0.9} style={[styles.card, { backgroundColor: 'rgba(255, 255, 255, 0.1)' }]}>
                {contestant.profileImageUrl && (
                  <Image source={{ uri: contestant.profileImageUrl }} style={StyleSheet.absoluteFill} contentFit="cover" />
                )}
                <View style={styles.avatarPosition}>
                  <AppAvatar size={42} imageUrl={contestant.profileImageUrl} showStatusRing showActiveDot />
                </View>
              </TouchableOpacity>
              
              <Text style={styles.nameText} numberOfLines={1}>{contestant.displayName}</Text>
              <Text style={styles.pointsText}>{(contestant.channelCount ?? 0 / 1000).toFixed(1)}k</Text>
              
              <TouchableOpacity activeOpacity={1}
                onPress={() => {
                  if (hasCrowned) return;
                  setHasCrowned(true);
                  setClickedIndex(index);
                }}
                disabled={hasCrowned}
                style={[
                  styles.crownButton,
                  isOther && styles.crownButtonOther,
                  isWinner && styles.crownButtonWinner,
                  { transform: [{ translateX: driftX }, { translateY: driftY }, { scale: isOther ? 0.4 : isWinner && hasCrowned ? 1.2 : 1 }] }
                ]}
              >
                {!isOther && <Text style={styles.crownText}>CROWN</Text>}
              </TouchableOpacity>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 420,
  },
  scrollContent: {
    paddingHorizontal: 16,
  },
  slot: {
    width: 150,
    alignItems: 'center',
  },
  addButton: {
    width: 136,
    height: 200,
    borderRadius: 16,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: 136,
    height: 240,
    borderRadius: 16,
    overflow: 'hidden',
  },
  avatarPosition: {
    position: 'absolute',
    top: 8,
    left: 8,
  },
  nameText: {
    marginTop: 10,
    fontSize: 14,
    fontWeight: '900',
    color: 'white',
    letterSpacing: -0.2,
  },
  pointsText: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: '600',
    color: '#FFD700',
  },
  crownButton: {
    marginTop: 12,
    width: 100,
    height: 36,
    backgroundColor: '#FFD700',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FFD700',
    shadowOpacity: 0.4,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
  },
  crownButtonOther: {
    width: 30,
    height: 30,
    borderRadius: 15,
    padding: 0,
    opacity: 0.1,
  },
  crownButtonWinner: {
    opacity: 0,
  },
  crownText: {
    color: 'black',
    fontSize: 11,
    fontWeight: '900',
  },
});


