import { useStyles } from "@/core/hooks/useStyles";
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
interface TagCarouselProps {
  title?: string;
  trailingText?: string;
  onSeeAllPressed?: () => void;
}
export const TagCarousel: React.FC<TagCarouselProps> = ({
  title,
  trailingText,
  onSeeAllPressed
}) => {
  const styles = useStyles(colors => ({
    container: {
      marginBottom: 24
    },
    headerRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      marginBottom: 12
    },
    title: {
      color: 'rgba(255,255,255,0.95)',
      fontSize: 16,
      fontWeight: '900'
    },
    trailingText: {
      color: 'rgba(255,255,255,0.5)',
      fontSize: 13,
      fontWeight: '700'
    },
    scrollContent: {
      paddingHorizontal: 20
    },
    smallCard: {
      width: 120,
      // Very small card
      height: 160,
      backgroundColor: '#1E1E1E',
      borderRadius: 12,
      marginRight: 12,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.1)'
    },
    cardText: {
      color: colors.text,
      fontSize: 14,
      fontWeight: 'bold'
    }
  }));
  return <View style={styles.container}>
      {title && <View style={styles.headerRow}>
          <Text style={styles.title}>{title}</Text>
          {trailingText && <TouchableOpacity activeOpacity={1} onPress={onSeeAllPressed}>
              <Text style={styles.trailingText}>{trailingText}</Text>
            </TouchableOpacity>}
        </View>}

      {/* Very small scrolling tag cards as requested */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {[1, 2, 3, 4, 5].map(item => <View key={item} style={styles.smallCard}>
            <Text style={styles.cardText}>Tag #{item}</Text>
          </View>)}
      </ScrollView>
    </View>;
};