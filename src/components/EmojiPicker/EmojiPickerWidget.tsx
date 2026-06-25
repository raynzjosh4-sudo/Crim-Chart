import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { Smile, Cat, Coffee, Activity, PlaySquare } from 'lucide-react-native';
import { emojiData, lottieData } from './emojiData';
import { useStyles } from '@/core/hooks/useStyles';
import { useCurrentTheme, useThemeStore } from '@/core/store/useThemeStore';
import { ThemeTokens } from '@/core/theme/themes';
import LottieView from 'lottie-react-native';

interface EmojiPickerWidgetProps {
  onEmojiSelect: (emoji: string) => void;
  onLottieSelect?: (source: any) => void;
}

export const EmojiPickerWidget: React.FC<EmojiPickerWidgetProps> = ({
  onEmojiSelect,
  onLottieSelect,
}) => {
  const styles = useStyles(themeStyles);
  const theme = useCurrentTheme();
  const scale = useThemeStore(s => s.scale);
  
  const [activeTab, setActiveTab] = useState<number>(0);
  const [hoveredEmojiName, setHoveredEmojiName] = useState<string>('Select an emoji');

  // We map the category names to specific icons
  const getCategoryIcon = (iconName: string, isActive: boolean) => {
    const color = isActive ? theme.colors.primary : theme.colors.textSecondary;
    switch (iconName) {
      case 'Smile': return <Smile size={20 * scale} color={color} />;
      case 'Cat': return <Cat size={20 * scale} color={color} />;
      case 'Coffee': return <Coffee size={20 * scale} color={color} />;
      case 'Activity': return <Activity size={20 * scale} color={color} />;
      default: return <Smile size={20 * scale} color={color} />;
    }
  };

  return (
    <View style={styles.container}>
      {/* Header / Tabs */}
      <View style={styles.header}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsContainer}>
          {emojiData.map((category, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.tab, activeTab === index && styles.activeTab]}
              onPress={() => setActiveTab(index)}
            >
              {getCategoryIcon(category.icon, activeTab === index)}
            </TouchableOpacity>
          ))}
          <TouchableOpacity
            style={[styles.tab, activeTab === emojiData.length && styles.activeTab]}
            onPress={() => setActiveTab(emojiData.length)}
          >
            <PlaySquare size={20 * scale} color={activeTab === emojiData.length ? theme.colors.primary : theme.colors.textSecondary} />
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Grid Content */}
      <ScrollView style={styles.contentScroll} contentContainerStyle={styles.contentContainer}>
        {activeTab < emojiData.length ? (
          <>
            <Text style={styles.categoryTitle}>{emojiData[activeTab].name}</Text>
            <View style={styles.grid}>
              {emojiData[activeTab].emojis.map((item, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={styles.emojiCell}
                  onPress={() => onEmojiSelect(item.emoji)}
                  onHoverIn={() => setHoveredEmojiName(item.name)}
                  onHoverOut={() => setHoveredEmojiName('Select an emoji')}
                  // @ts-ignore
                  onMouseEnter={() => setHoveredEmojiName(item.name)}
                  onMouseLeave={() => setHoveredEmojiName('Select an emoji')}
                >
                  <Text style={styles.emojiText}>{item.emoji}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        ) : (
          <>
            <Text style={styles.categoryTitle}>Lotties</Text>
            <View style={styles.lottieGrid}>
              {lottieData.map((lottie) => (
                <TouchableOpacity
                  key={lottie.id}
                  style={styles.lottieCell}
                  onPress={() => onLottieSelect && onLottieSelect(lottie.source)}
                  onHoverIn={() => setHoveredEmojiName(lottie.name)}
                  onHoverOut={() => setHoveredEmojiName('Select a Lottie')}
                  // @ts-ignore
                  onMouseEnter={() => setHoveredEmojiName(lottie.name)}
                  onMouseLeave={() => setHoveredEmojiName('Select a Lottie')}
                >
                  <LottieView
                    source={lottie.source}
                    autoPlay
                    loop
                    style={styles.lottiePreview}
                    resizeMode="cover"
                  />
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}
      </ScrollView>

      {/* Footer (Hovered Emoji Name) */}
      <View style={styles.footer}>
        <View style={styles.footerLeft}>
          <Smile size={24 * scale} color={theme.colors.primary} />
          <Text style={styles.footerText} numberOfLines={1}>
            {hoveredEmojiName}
          </Text>
        </View>
      </View>
    </View>
  );
};

const themeStyles = (colors: ThemeTokens, scale: number): any => ({
  container: {
    width: 320 * scale,
    height: 400 * scale,
    backgroundColor: colors.background,
    borderRadius: 8 * scale,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  header: {
    height: 48 * scale,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  tabsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8 * scale,
  },
  tab: {
    padding: 12 * scale,
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: colors.primary,
  },
  contentScroll: {
    flex: 1,
  },
  contentContainer: {
    padding: 12 * scale,
  },
  categoryTitle: {
    color: colors.text,
    fontSize: 16 * scale,
    fontWeight: '700',
    marginBottom: 12 * scale,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  emojiCell: {
    width: 36 * scale,
    height: 36 * scale,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4 * scale,
  },
  emojiText: {
    fontSize: 24 * scale,
  },
  lottieGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8 * scale,
  },
  lottieCell: {
    width: 100 * scale,
    height: 100 * scale,
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 8 * scale,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  lottiePreview: {
    width: '120%',
    height: '120%',
  },
  footer: {
    height: 48 * scale,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16 * scale,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
  },
  footerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12 * scale,
  },
  footerText: {
    color: colors.textSecondary,
    fontSize: 14 * scale,
    flexShrink: 1,
  },
});
