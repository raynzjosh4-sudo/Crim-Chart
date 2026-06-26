import { colors } from '@/core/theme/colors';
import { CheckCircle2, Info, X, XCircle } from 'lucide-react-native';
import { Dimensions, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Toast, { ToastConfig, ToastConfigParams } from 'react-native-toast-message';

type ChartToastType = 'error' | 'success' | 'info';

interface CustomToastProps {
  title: string;
  message: string;
  type: ChartToastType;
  onClose: () => void;
}

const ChartToastWidget: React.FC<CustomToastProps> = ({ title, message, type, onClose }) => {
  let primaryColor: string;
  let IconComponent: React.ElementType;

  switch (type) {
    case 'error':
      primaryColor = colors.error;
      IconComponent = XCircle;
      break;
    case 'success':
      primaryColor = colors.primary;
      IconComponent = CheckCircle2;
      break;
    case 'info':
      primaryColor = colors.primary;
      IconComponent = Info;
      break;
    default:
      primaryColor = colors.primary;
      IconComponent = Info;
  }

  return (
    <View style={[styles.container, { borderColor: `${primaryColor}4D` }]}>
      <View style={[styles.iconContainer, { backgroundColor: `${primaryColor}1A` }]}>
        <IconComponent color={primaryColor} size={20} />
      </View>
      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.message}>{message}</Text>
      </View>
      <TouchableOpacity activeOpacity={1} onPress={onClose} style={styles.closeButton}>
        <X color="rgba(255, 255, 255, 0.3)" size={16} />
      </TouchableOpacity>
    </View>
  );
};

export const chartToastConfig: ToastConfig = {
  customToast: ({ text1, text2, props, hide }: ToastConfigParams<any>) => (
    <ChartToastWidget
      title={text1 || ''}
      message={text2 || ''}
      type={props.type || 'info'}
      onClose={hide}
    />
  )
};

export class ChartToast {
  static showError(context: any, { title, message, duration = 4000 }: { title: string; message: string; duration?: number }) {
    this._show({ title, message, type: 'error', duration });
  }

  static showSuccess(context: any, { title, message, duration = 4000 }: { title: string; message: string; duration?: number }) {
    this._show({ title, message, type: 'success', duration });
  }

  static showInfo(context: any, { title, message, duration = 4000 }: { title: string; message: string; duration?: number }) {
    this._show({ title, message, type: 'info', duration });
  }

  // To support static calls without the object format (if needed from older files)
  static showErrorSimple(title: string, message: string, duration: number = 4000) {
    this._show({ title, message, type: 'error', duration });
  }

  private static _show({ title, message, type, duration }: { title: string; message: string; type: ChartToastType; duration: number }) {
    if (Platform.OS === 'web' && Dimensions.get('window').width >= 768) {
      return; // Do not show toast on desktop layout
    }
    Toast.show({
      type: 'customToast',
      text1: title,
      text2: message,
      props: { type },
      visibilityTime: duration,
      position: 'top',
      topOffset: 60,
    });
  }
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginVertical: 8,
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1.5,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 8,
    width: Dimensions.get('window').width - 32,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    marginLeft: 14,
    justifyContent: 'center',
  },
  title: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '800',
    fontFamily: 'Inter',
  },
  message: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 12,
    fontWeight: '500',
    fontFamily: 'Inter',
    marginTop: 2,
  },
  closeButton: {
    padding: 4,
  },
});
