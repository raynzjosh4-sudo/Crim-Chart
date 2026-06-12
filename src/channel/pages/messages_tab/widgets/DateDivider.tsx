import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface DateDividerProps {
  date: Date;
}

export const DateDivider: React.FC<DateDividerProps> = ({ date }) => {
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

const styles = StyleSheet.create({
  container: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  dateText: {
    paddingHorizontal: 16,
    fontSize: 12,
    fontWeight: '800',
    color: 'rgba(255,255,255,0.3)',
    letterSpacing: 0.5,
  },
});
