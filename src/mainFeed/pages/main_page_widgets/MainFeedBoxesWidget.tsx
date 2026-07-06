import { useStyles } from "@/core/hooks/useStyles";
import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { BoxCard, BoxModel } from '@/features/boxes/components/BoxCard';
import { useRouter } from 'expo-router';
const DUMMY_BOXES: BoxModel[] = [{
  id: '1',
  title: 'Summer Hits',
  boxType: 'music',
  itemCount: 42,
  coverImageUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=200&auto=format&fit=crop'
}, {
  id: '2',
  title: 'Vintage Cameras',
  boxType: 'store',
  itemCount: 15,
  coverImageUrl: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=200&auto=format&fit=crop'
}, {
  id: '3',
  title: 'Top 10 Scifi',
  boxType: 'movie',
  itemCount: 10,
  coverImageUrl: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=200&auto=format&fit=crop'
}, {
  id: '4',
  title: 'NBA Finals',
  boxType: 'sports',
  itemCount: 8,
  coverImageUrl: 'https://images.unsplash.com/photo-1504450758481-7338eba7524a?q=80&w=200&auto=format&fit=crop'
}];
export const MainFeedBoxesWidget = () => {
  const styles = useStyles(colors => ({
    container: {
      paddingVertical: 20,
      borderBottomWidth: 1,
      borderBottomColor: 'rgba(255,255,255,0.05)'
    },
    headerTitle: {
      color: colors.text,
      fontSize: 18,
      fontWeight: '800',
      paddingHorizontal: 16,
      marginBottom: 16
    },
    scrollContent: {
      paddingHorizontal: 16
    }
  }));
  const router = useRouter();
  const handleBoxPress = (box: BoxModel) => {
    // Navigate based on boxType
    router.push(`/${box.boxType}-box/${box.id}` as any);
  };
  return <View style={styles.container}>
      <Text style={styles.headerTitle}>Discover Boxes</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {DUMMY_BOXES.map(box => <BoxCard key={box.id} box={box} onPress={handleBoxPress} />)}
      </ScrollView>
    </View>;
};