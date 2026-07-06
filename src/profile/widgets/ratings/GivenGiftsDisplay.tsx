import { useStyles } from "@/core/hooks/useStyles";
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { GiftAggregation } from './GiftAggregationModels';
import { AllGivenGiftsSheet } from './AllGivenGiftsSheet';
import { ChevronRight } from 'lucide-react-native';
interface GivenGiftsDisplayProps {
  aggregations: GiftAggregation[];
  totalGifts: number;
}
export const GivenGiftsDisplay: React.FC<GivenGiftsDisplayProps> = ({
  aggregations,
  totalGifts
}) => {
  const styles = useStyles(colors => ({
    container: {
      paddingHorizontal: 16,
      paddingVertical: 12,
      backgroundColor: 'rgba(255,255,255,0.03)',
      borderRadius: 12,
      marginHorizontal: 16,
      marginBottom: 12
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12
    },
    title: {
      color: colors.text,
      fontWeight: '800',
      fontSize: 14
    },
    totalBadge: {
      color: '#FACD11',
      fontWeight: '900',
      fontSize: 16,
      backgroundColor: 'rgba(250,205,17,0.1)',
      borderRadius: 10,
      paddingHorizontal: 10,
      paddingVertical: 2
    },
    topRow: {
      flexDirection: 'row',
      gap: 12
    },
    giftItem: {
      alignItems: 'center'
    },
    giftIcon: {
      width: 48,
      height: 48,
      borderRadius: 10,
      backgroundColor: '#2A2A2A'
    },
    giftEmoji: {
      fontSize: 36
    },
    giftCount: {
      color: 'rgba(255,255,255,0.6)',
      fontSize: 11,
      marginTop: 4
    },
    seeAllBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 12,
      gap: 4
    },
    seeAllText: {
      color: '#FACD11',
      fontWeight: '700',
      fontSize: 13
    }
  }));
  const [showAll, setShowAll] = useState(false);
  const topThree = aggregations.slice(0, 3);
  return <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Gifts Received</Text>
        <Text style={styles.totalBadge}>{totalGifts}</Text>
      </View>

      <View style={styles.topRow}>
        {topThree.map(g => <View key={g.giftId} style={styles.giftItem}>
            {g.giftImageUrl ? <Image source={{
          uri: g.giftImageUrl
        }} style={styles.giftIcon} /> : <Text style={styles.giftEmoji}>🎁</Text>}
            <Text style={styles.giftCount}>×{g.totalReceived}</Text>
          </View>)}
      </View>

      {aggregations.length > 3 && <TouchableOpacity activeOpacity={1} style={styles.seeAllBtn} onPress={() => setShowAll(true)}>
          <Text style={styles.seeAllText}>See all gifts</Text>
          <ChevronRight color="#FACD11" size={16} />
        </TouchableOpacity>}

      <AllGivenGiftsSheet visible={showAll} aggregations={aggregations} onClose={() => setShowAll(false)} />
    </View>;
};