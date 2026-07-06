import { useStyles } from "@/core/hooks/useStyles";
import { useCurrentTheme } from "@/core/store/useThemeStore";
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LucideIcon } from 'lucide-react-native';
interface CommentActionProps {
  icon: LucideIcon;
  label: string;
  color?: string;
  onPress?: () => void;
  size?: number;
  direction?: 'row' | 'column';
}
export const CommentAction: React.FC<CommentActionProps> = ({
  icon: Icon,
  label,
  color,
  onPress,
  size = 38,
  direction = 'column'
}) => {
  const theme = useCurrentTheme();
  const effectiveColor = color || theme.colors.text;
  const styles = useStyles(colors => ({
    container: {
      alignItems: 'center',
      gap: 4
    },
    count: {
      color: colors.text,
      fontSize: 14,
      fontWeight: '700',
      textShadowColor: 'rgba(0, 0, 0, 0.54)',
      textShadowOffset: {
        width: 0,
        height: 1
      },
      textShadowRadius: 4
    },
    countRow: {
      marginLeft: 6,
      textShadowColor: 'transparent'
    }
  }));
  return <TouchableOpacity style={[styles.container, {
    flexDirection: direction
  }]} onPress={onPress} activeOpacity={0.8}>
      <Icon size={size} color={effectiveColor} />
      {label && <Text style={[styles.count, { fontSize: size * 0.36 }]}>{label}</Text>}
    </TouchableOpacity>;
};