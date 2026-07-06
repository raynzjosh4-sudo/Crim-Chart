import { useStyles } from '@/core/hooks/useStyles';
import React from 'react';
import { View, Text } from 'react-native';

interface DateDividerProps {
  date: Date;
}

export const DateDivider: React.FC<DateDividerProps> = ({ date }) => {
  const styles = useStyles(colors => ({
    container: {
      width: '100%' as any,
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      paddingVertical: 24,
    },
    dividerLine: {
      flex: 1,
      height: 1,
      backgroundColor: colors.muted,
    },
    dateText: {
      paddingHorizontal: 16,
      fontSize: 12,
      fontWeight: '800' as const,
      color: colors.textSecondary,
      letterSpacing: 0.5,
    },
  }));

  const formatDate = (msgDate: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const compareDate = new Date(msgDate);
    compareDate.setHours(0, 0, 0, 0);

    if (compareDate.getTime() === today.getTime()) {
      return 'TODAY';
    } else if (compareDate.getTime() === yesterday.getTime()) {
      return 'YESTERDAY';
    } else {
      const options: Intl.DateTimeFormatOptions = {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      };
      return msgDate.toLocaleDateString('en-US', options).toUpperCase();
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.dividerLine} />
      <Text style={styles.dateText}>{formatDate(date)}</Text>
      <View style={styles.dividerLine} />
    </View>
  );
};

