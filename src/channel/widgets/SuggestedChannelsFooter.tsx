import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export const SuggestedChannelsFooter: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>
        Explore more channels to find new moments
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingBottom: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.4)', // onSurface with alpha
  },
});
