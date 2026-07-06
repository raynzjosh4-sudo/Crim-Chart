import { useCurrentTheme } from "@/core/store/useThemeStore";
import { useStyles } from "@/core/hooks/useStyles";
import React from 'react';
import { Text, TouchableOpacity, StyleSheet } from 'react-native';
interface CrownButtonProps {
  isMe: boolean;
  crowns: number;
  themeColor: string;
  onTap: () => void;
}
const getLuminance = (hexColor: string) => {
  const hex = hexColor.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16) / 255;
  const g = parseInt(hex.substr(2, 2), 16) / 255;
  const b = parseInt(hex.substr(4, 2), 16) / 255;
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
export const CrownButton: React.FC<CrownButtonProps> = ({
  isMe,
  crowns,
  themeColor,
  onTap
}) => {
  const theme = useCurrentTheme();
  const styles = useStyles(colors => ({
    container: {
      paddingVertical: 14,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 10
    },
    text: {
      fontSize: 15,
      fontWeight: 'bold'
    }
  }));
  const isLight = getLuminance(themeColor) > 0.5;
  const textColor = isMe ? themeColor : isLight ? theme.colors.background : theme.colors.text;
  return <TouchableOpacity activeOpacity={0.8} onPress={onTap} style={[styles.container, {
    backgroundColor: isMe ? `${themeColor}26` : themeColor,
    // 0.15 alpha
    borderColor: isMe ? `${themeColor}80` : 'transparent',
    // 0.5 alpha
    borderWidth: isMe ? 1.5 : 0
  }]}>
      <Text style={[styles.text, {
      color: textColor
    }]}>
        {isMe ? `Crowned  •  ${crowns}` : `Crown  •  ${crowns}`}
      </Text>
    </TouchableOpacity>;
};