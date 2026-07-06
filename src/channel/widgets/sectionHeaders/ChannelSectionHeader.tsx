import { useStyles } from "@/core/hooks/useStyles";
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

interface ChannelSectionHeaderProps {
  title: string;
  subtitle?: string;
  showAction?: boolean;
  actionText?: string;
  onActionPressed?: () => void;
}

export const ChannelSectionHeader: React.FC<ChannelSectionHeaderProps> = ({
  title,
  subtitle,
  showAction = true,
  actionText = 'See all',
  onActionPressed
}) => {
  const styles = useStyles(colors => ({
    container: {
      flexDirection: 'row' as const,
      justifyContent: 'space-between' as const,
      alignItems: 'flex-end' as const,
      paddingLeft: 20,
      paddingRight: 12,
      paddingTop: 16,
      paddingBottom: 8
    },
    textContainer: {
      flex: 1
    },
    title: {
      fontSize: 18,
      fontWeight: '900' as const,
      color: colors.text,
      letterSpacing: -0.5
    },
    subtitle: {
      fontSize: 12,
      fontWeight: '500' as const,
      color: colors.textSecondary,
      letterSpacing: -0.2,
      marginTop: 2
    },
    actionBtn: {
      backgroundColor: colors.surfaceVariant,
      paddingHorizontal: 16,
      paddingVertical: 6,
      borderRadius: 20
    },
    actionText: {
      fontSize: 12,
      fontWeight: 'bold' as const,
      color: colors.primary
    }
  }));

  return (
    <View style={styles.container}>
      <View style={styles.textContainer}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      
      {showAction && (
        <TouchableOpacity activeOpacity={0.7} style={styles.actionBtn} onPress={onActionPressed}>
          <Text style={styles.actionText}>{actionText}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};