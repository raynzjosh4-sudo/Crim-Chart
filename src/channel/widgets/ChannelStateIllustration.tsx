import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ShieldAlert, Sparkles, LucideIcon } from 'lucide-react-native';
import { colors } from '@/core/theme/colors';

interface ChannelStateIllustrationProps {
  title: string;
  subtitle?: string;
  IconComponent?: LucideIcon;
  illustrationHeight?: number;
}

export const ChannelStateIllustration: React.FC<ChannelStateIllustrationProps> & {
  Error: React.FC<Partial<ChannelStateIllustrationProps>>;
  Empty: React.FC<ChannelStateIllustrationProps>;
} = ({
  title,
  subtitle,
  IconComponent = Sparkles,
  illustrationHeight = 120,
}) => {
  const iconColor = 'rgba(250, 205, 17, 0.6)'; // Primary with opacity

  return (
    <View style={styles.container}>
      <IconComponent size={illustrationHeight} color={iconColor} strokeWidth={1} />
      
      <View style={{ height: 24 }} />
      
      <Text style={styles.titleText} textAlign="center">
        {title}
      </Text>
      
      {subtitle && (
        <React.Fragment>
          <View style={{ height: 8 }} />
          <Text style={styles.subtitleText} textAlign="center">
            {subtitle}
          </Text>
        </React.Fragment>
      )}
    </View>
  );
};

ChannelStateIllustration.Error = ({
  title = 'Oops! Something went wrong while connecting.',
  subtitle = 'Please check your connection or try again later.',
  ...props
}) => (
  <ChannelStateIllustration
    title={title}
    subtitle={subtitle}
    IconComponent={ShieldAlert}
    {...props}
  />
);

ChannelStateIllustration.Empty = ({
  title,
  subtitle,
  ...props
}) => (
  <ChannelStateIllustration
    title={title}
    subtitle={subtitle}
    IconComponent={Sparkles}
    {...props}
  />
);

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  titleText: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 16,
    fontWeight: '500',
  },
  subtitleText: {
    color: 'rgba(255, 255, 255, 0.3)',
    fontSize: 13,
  },
});
