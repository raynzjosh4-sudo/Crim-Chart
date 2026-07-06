import React from 'react';
import {
  View, Text, Image, TouchableOpacity, StyleSheet,
  ScrollView,
} from 'react-native';
import { Play } from 'lucide-react-native';
import { CrimChartUserModel } from '@/profile/models/CrimChartUserModel';
import { useStyles } from '@/core/hooks/useStyles';
import { useCurrentTheme } from '@/core/store/useThemeStore';
import { ThemeTokens } from '@/core/theme/themes';

interface ChannelsWidgetProps {
  models: CrimChartUserModel[];
  onSeeAll?: () => void;
  onChannelPress?: (channel: CrimChartUserModel) => void;
}

export const ChannelsWidget: React.FC<ChannelsWidgetProps> = ({
  models,
  onSeeAll,
  onChannelPress,
}) => {
  const theme = useCurrentTheme();
  const styles = useStyles(themeStyles);
  
  if (models.length === 0) return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Channels</Text>
        {onSeeAll && (
          <TouchableOpacity activeOpacity={1} onPress={onSeeAll}>
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        )}
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.list}
      >
        {models.map(model => (
          <TouchableOpacity activeOpacity={1}
            key={model.id}
            style={styles.card}
            onPress={() => onChannelPress?.(model)}
            activeOpacity={0.85}
          >
            <View style={styles.imgWrapper}>
              <Image
                source={{ uri: model.profileImageUrl ?? '' }}
                style={styles.img}
              />
              <View style={styles.playBadge}>
                <Play color={theme.colors.onPrimary} size={12} fill={theme.colors.onPrimary} />
              </View>
            </View>
            <Text style={styles.cardName} numberOfLines={2}>
              {model.displayName}
            </Text>
            <Text style={styles.cardSub}>
              {model.followersCount} charts
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const themeStyles = (colors: ThemeTokens) => StyleSheet.create({
  container: { marginBottom: 8 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  title: {
    color: colors.text,
    fontWeight: '900',
    fontSize: 16,
    letterSpacing: -0.2,
  },
  seeAll: { color: colors.primary, fontWeight: '800', fontSize: 13 },
  list: { paddingHorizontal: 16, gap: 12 },
  card: { width: 120, alignItems: 'center' },
  imgWrapper: {
    width: 110,
    height: 160,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: colors.surface,
    marginBottom: 8,
    position: 'relative',
  },
  img: { width: '100%', height: '100%' },
  playBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.6)',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardName: {
    color: colors.text,
    fontWeight: '700',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 16,
  },
  cardSub: {
    color: colors.textSecondary,
    fontSize: 10,
    marginTop: 2,
    textAlign: 'center',
  },
});
