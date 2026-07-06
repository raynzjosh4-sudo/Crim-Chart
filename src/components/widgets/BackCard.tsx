import { useStyles } from "@/core/hooks/useStyles";
import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Animated, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { CrimChartUserModel } from '@/profile/models/CrimChartUserModel';
interface BackCardProps {
  width: number;
  height: number;
  opacity?: number;
  color?: string;
  model?: CrimChartUserModel;
  onTap?: () => void;
}
export const BackCard: React.FC<BackCardProps> = ({
  width,
  height,
  opacity = 1.0,
  color = '#FF4081',
  model,
  onTap
}) => {
  const styles = useStyles(colors => ({
    container: {
      backgroundColor: '#121212',
      borderRadius: 24,
      borderWidth: 2,
      overflow: 'hidden',
      shadowColor: colors.background,
      shadowOffset: {
        width: 0,
        height: 10
      },
      shadowOpacity: 0.4,
      shadowRadius: 20,
      elevation: 10
    },
    gradientOverlay: {
      ...StyleSheet.absoluteFillObject,
      justifyContent: 'flex-end',
      padding: 16,
      backgroundColor: 'rgba(0,0,0,0.4)' // Simplified gradient alternative
    },
    nameText: {
      color: 'white',
      fontSize: 14,
      fontWeight: '900',
      letterSpacing: 1.2
    },
    kpText: {
      fontSize: 11,
      fontWeight: '800'
    }
  }));
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const pulse = () => {
    Animated.sequence([Animated.timing(scaleAnim, {
      toValue: 1.15,
      duration: 150,
      useNativeDriver: true
    }), Animated.timing(scaleAnim, {
      toValue: 1.0,
      duration: 150,
      useNativeDriver: true
    })]).start();
  };
  return <TouchableOpacity activeOpacity={0.9} onPress={() => {
    pulse();
    onTap?.();
  }}>
      <Animated.View style={[styles.container, {
      width,
      height,
      borderColor: `${color}CC`,
      transform: [{
        scale: scaleAnim
      }],
      opacity
    }]}>
        {model?.profileImageUrl && <Image source={{
        uri: model.profileImageUrl
      }} style={[StyleSheet.absoluteFill, {
        opacity: 0.7
      }]} contentFit="cover" />}
        
        {model && <View style={styles.gradientOverlay}>
            <Text style={styles.nameText}>{model.displayName.toUpperCase()}</Text>
            <View style={{
          height: 2
        }} />
            <Text style={[styles.kpText, {
          color: `${color}E6`
        }]}>
              {model.channelCount} KP
            </Text>
          </View>}
      </Animated.View>
    </TouchableOpacity>;
};