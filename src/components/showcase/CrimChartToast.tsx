import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import Toast from 'react-native-toast-message';
import { XCircle, CheckCircle, Info, X } from 'lucide-react-native';
import { useTheme } from '@react-navigation/native';

export enum ChartToastType {
  Error = 'error',
  Success = 'success',
  Info = 'info',
}

export class ChartToast {
  static showError(title: string, message: string, durationMs: number = 4000) {
    this.show(title, message, ChartToastType.Error, durationMs);
  }

  static showSuccess(title: string, message: string, durationMs: number = 4000) {
    this.show(title, message, ChartToastType.Success, durationMs);
  }

  static showInfo(title: string, message: string, durationMs: number = 4000) {
    this.show(title, message, ChartToastType.Info, durationMs);
  }

  private static show(title: string, message: string, type: ChartToastType, durationMs: number) {
    Toast.show({
      type: 'chartToast',
      text1: title,
      text2: message,
      visibilityTime: durationMs,
      props: { type },
      position: 'top',
    });
  }
}

// Add this to your root <Toast config={toastConfig} /> component
export const toastConfig = {
  chartToast: ({ text1, text2, props, hide }: any) => {
    return (
      <ChartToastWidget
        title={text1}
        message={text2}
        type={props.type}
        onClose={hide}
      />
    );
  },
};

const ChartToastWidget = ({ title, message, type, onClose }: any) => {
  const { colors } = useTheme();

  let primaryColor = colors.primary;
  let IconComponent = Info;

  switch (type) {
    case ChartToastType.Error:
      primaryColor = colors.notification || '#FF5252';
      IconComponent = XCircle;
      break;
    case ChartToastType.Success:
      primaryColor = colors.primary || '#4CAF50';
      IconComponent = CheckCircle;
      break;
    case ChartToastType.Info:
      primaryColor = colors.primary;
      IconComponent = Info;
      break;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.card, borderColor: primaryColor }]}>
      <View style={styles.contentRow}>
        <View style={[styles.iconContainer, { backgroundColor: `${primaryColor}20` }]}>
          <IconComponent color={primaryColor} size={20} />
        </View>
        <View style={styles.textContainer}>
          <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
          <Text style={[styles.message, { color: colors.text, opacity: 0.6 }]}>{message}</Text>
        </View>
        <TouchableOpacity activeOpacity={1} onPress={onClose} style={styles.closeButton}>
          <X color="rgba(255, 255, 255, 0.3)" size={16} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 16,
    borderWidth: 1.5,
    width: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5,
  },
  contentRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: 'center',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
    marginLeft: 14,
  },
  title: {
    fontSize: 14,
    fontWeight: '800',
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'Roboto',
  },
  message: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'Roboto',
  },
  closeButton: {
    padding: 8,
  },
});
