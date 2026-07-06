import { useStyles } from "@/core/hooks/useStyles";
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Crown } from 'lucide-react-native';
import { CrownOptionModel, CrownMediaType } from '../models/CrownOptionModel';
import { LinearGradient } from 'expo-linear-gradient';
interface CrownPollCardProps {
  option: CrownOptionModel;
  onTap: () => void;
  themeColor: string;
  width?: number;
  height?: number;
}
export const CrownPollCard: React.FC<CrownPollCardProps> = ({
  option,
  onTap,
  themeColor,
  width = 140,
  height = 220
}) => {
  const styles = useStyles(colors => ({
    cardContainer: {
      borderRadius: 16,
      backgroundColor: '#E5E5E5',
      // surfaceContainerHighest fallback
      borderWidth: 2,
      borderColor: 'transparent',
      overflow: 'hidden'
    },
    cardInner: {
      flex: 1,
      borderRadius: 14,
      overflow: 'hidden'
    },
    media: {
      ...StyleSheet.absoluteFillObject,
      width: '100%',
      height: '100%'
    },
    placeholderMedia: {
      backgroundColor: '#E5E5E5'
    },
    gradientOverlay: {
      ...StyleSheet.absoluteFillObject
    },
    infoContainer: {
      position: 'absolute',
      bottom: 12,
      left: 12,
      right: 12
    },
    descriptionText: {
      color: colors.text,
      fontSize: 14,
      fontWeight: '600',
      marginBottom: 4
    },
    crownRow: {
      flexDirection: 'row',
      alignItems: 'center'
    },
    crownsText: {
      color: 'rgba(255, 255, 255, 0.9)',
      fontSize: 12,
      fontWeight: '600',
      marginLeft: 4
    }
  }));
  const [LottieView, setLottieView] = useState<any>(null);
  useEffect(() => {
    if (option.mediaType === CrownMediaType.lottie) {
      try {
        const mod = require('lottie-react-native');
        setLottieView(() => mod.default ?? mod);
      } catch (e) {
        setLottieView(null);
      }
    }
  }, [option.mediaType]);
  const renderMedia = () => {
    switch (option.mediaType) {
      case CrownMediaType.image:
        if (option.mediaUrl) {
          return <Image source={{
            uri: option.mediaUrl
          }} style={styles.media} resizeMode="cover" />;
        }
        break;
      case CrownMediaType.video:
        // Placeholder for video thumbnail
        return <View style={[styles.media, styles.placeholderMedia]}>
            {option.mediaUrl && <Image source={{
            uri: option.mediaUrl
          }} style={styles.media} resizeMode="cover" />}
          </View>;
      case CrownMediaType.audio:
        return <View style={[styles.media, {
          backgroundColor: themeColor,
          opacity: 0.2
        }]} />;
      case CrownMediaType.lottie:
        if (option.mediaUrl && LottieView) {
          // Lottie URL might be a numeric ID (for a local asset map) or a remote URL
          // If it's just numbers, we might need a map. But let's assume it's a URL or parseable JSON.
          return <View style={[styles.media, {
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#E5E5E5'
          }]}>
              <LottieView source={{
              uri: option.mediaUrl
            }} autoPlay loop style={{
              width: '80%',
              height: '80%'
            }} resizeMode="contain" />
            </View>;
        }
        break;
      case CrownMediaType.none:
      default:
        break;
    }
    return <View style={[styles.media, styles.placeholderMedia]} />;
  };
  return <TouchableOpacity activeOpacity={0.8} onPress={onTap} style={[styles.cardContainer, {
    width,
    height
  }, option.isMe && {
    borderColor: themeColor,
    borderWidth: 2
  }]}>
      <View style={styles.cardInner}>
        {renderMedia()}

        {/* Gradient Overlay */}
        <LinearGradient colors={['transparent', 'rgba(0,0,0,0.4)', 'rgba(0,0,0,0.8)']} locations={[0.5, 0.8, 1.0]} style={styles.gradientOverlay} />

        {/* Title and Info */}
        <View style={styles.infoContainer}>
          <Text style={styles.descriptionText} numberOfLines={2}>
            {option.description}
          </Text>
          <View style={styles.crownRow}>
            <Crown size={14} color="#FFD700" />
            <Text style={styles.crownsText}>{option.crowns}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>;
};