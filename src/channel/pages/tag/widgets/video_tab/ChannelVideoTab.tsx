import { useStyles } from "@/core/hooks/useStyles";
import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
export const ChannelVideoTab: React.FC = () => {
  const styles = useStyles(colors => ({
    container: {
      flex: 1,
      backgroundColor: colors.background
    },
    header: {
      fontSize: 16,
      color: colors.text,
      padding: 16,
      textAlign: 'center',
      backgroundColor: '#2A2A2A',
      margin: 16,
      borderRadius: 12
    },
    emptyContainer: {
      height: 200,
      justifyContent: 'center',
      alignItems: 'center'
    },
    emptyText: {
      fontSize: 16,
      color: 'rgba(255,255,255,0.5)',
      fontWeight: 'bold'
    }
  }));
  return <View style={styles.container}>
      <Text style={styles.header}>Video Promotion Banner</Text>
      
      <FlatList data={[]} // Mock empty list
    numColumns={2} ListEmptyComponent={<View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No videos yet</Text>
          </View>} renderItem={({
      item
    }) => <View />} keyExtractor={(_, index) => index.toString()} />
    </View>;
};