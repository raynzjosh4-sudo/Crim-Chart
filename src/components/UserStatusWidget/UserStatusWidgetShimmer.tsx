import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';

export const UserStatusWidgetShimmer: React.FC = () => {
  const color = 'rgba(255, 255, 255, 0.05)';

  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.listContent}>
        {[1, 2, 3, 4, 5].map((_, index) => (
          <View key={index} style={[styles.itemContainer, { backgroundColor: color }]} />
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
  },
  listContent: {
    paddingHorizontal: 16,
  },
  itemContainer: {
    width: 86,
    height: 130,
    marginRight: 12,
    borderRadius: 16,
  },
});
