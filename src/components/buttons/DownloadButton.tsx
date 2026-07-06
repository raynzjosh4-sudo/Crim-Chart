import { useCurrentTheme } from "@/core/store/useThemeStore";
import { useStyles } from "@/core/hooks/useStyles";
import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Download } from 'lucide-react-native';
interface DownloadButtonProps {
  onPress: () => void;
  count?: number;
  isDownloading?: boolean;
  disabled?: boolean;
  color?: string;
  size?: number;
  style?: any;
  textStyle?: any;
}
export const DownloadButton: React.FC<DownloadButtonProps> = ({
  onPress,
  count = 0,
  isDownloading = false,
  disabled = false,
  color = theme.colors.text,
  size = 20,
  style,
  textStyle
}) => {
  const theme = useCurrentTheme();
  const styles = useStyles(colors => ({
    button: {
      flexDirection: 'row',
      alignItems: 'center'
    },
    text: {
      fontSize: 14,
      fontWeight: '600',
      marginLeft: 6
    }
  }));
  return <TouchableOpacity activeOpacity={1} style={[styles.button, disabled && {
    opacity: 0.3
  }, style]} disabled={disabled || isDownloading} onPress={onPress}>
      {isDownloading ? <ActivityIndicator size="small" color={color} /> : <Download size={size} color={color} />}
      <Text style={[styles.text, {
      color
    }, textStyle]}>
        {count}
      </Text>
    </TouchableOpacity>;
};