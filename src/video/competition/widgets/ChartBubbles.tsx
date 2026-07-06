import { useCurrentTheme } from "@/core/store/useThemeStore";
import { useStyles } from "@/core/hooks/useStyles";
import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { Crown } from 'lucide-react-native';
interface ChartBubblesProps {
  chartPoints: number;
  isCharted: boolean;
}
export const ChartBubbles: React.FC<ChartBubblesProps> = ({
  chartPoints,
  isCharted
}) => {
  const theme = useCurrentTheme();
  const styles = useStyles(colors => ({
    bubble: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      backgroundColor: 'rgba(250,205,17,0.15)',
      borderRadius: 20,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderWidth: 1,
      borderColor: 'rgba(250,205,17,0.4)'
    },
    bubbleActive: {
      backgroundColor: '#FACD11'
    },
    count: {
      color: '#FACD11',
      fontWeight: '900',
      fontSize: 14
    },
    countActive: {
      color: colors.background
    }
  }));
  return <View style={[styles.bubble, isCharted && styles.bubbleActive]}>
    <Crown color={isCharted ? theme.colors.background : '#FACD11'} size={16} />
    <Text style={[styles.count, isCharted && styles.countActive]}>{chartPoints}</Text>
  </View>;
};