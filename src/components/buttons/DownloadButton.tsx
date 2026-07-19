import { useStyles } from "@/core/hooks/useStyles";
import { useCurrentTheme } from "@/core/store/useThemeStore";
import { Download } from 'lucide-react-native';
import { ActivityIndicator, Text, TouchableOpacity } from 'react-native';
import { RequireAuthWrapper } from "../wrappers/RequireAuthWrapper";
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
  color,
  size = 20,
  style,
  textStyle
}) => {
  const theme = useCurrentTheme();
  const finalColor = color || theme.colors.text;

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
  return (
    <RequireAuthWrapper>
      {({ checkAuth }) => (
        <TouchableOpacity activeOpacity={1} style={[styles.button, disabled && {
          opacity: 0.3
        }, style]} disabled={disabled || isDownloading} onPress={(e) => checkAuth(onPress, e)}>
          {isDownloading ? <ActivityIndicator size="small" color={finalColor} /> : <Download size={size} color={finalColor} />}
          <Text style={[styles.text, {
            color: finalColor
          }, textStyle]}>
            {count}
          </Text>
        </TouchableOpacity>
      )}
    </RequireAuthWrapper>
  );
};