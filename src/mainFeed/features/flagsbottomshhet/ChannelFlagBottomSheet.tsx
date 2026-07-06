import { useStyles } from "@/core/hooks/useStyles";
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { X, UserPlus, Image as ImageIcon, Globe } from 'lucide-react-native';
import Toast from 'react-native-toast-message';
interface ChannelFlagBottomSheetProps {
  themeColor: string;
  onClose: () => void;
}
export const ChannelFlagBottomSheet: React.FC<ChannelFlagBottomSheetProps> = ({
  themeColor,
  onClose
}) => {
  const styles = useStyles(colors => ({
    container: {
      backgroundColor: '#121212',
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24
    },
    handle: {
      width: 40,
      height: 4,
      backgroundColor: 'rgba(255,255,255,0.24)',
      borderRadius: 2,
      alignSelf: 'center',
      marginVertical: 12
    },
    header: {
      flexDirection: 'row',
      paddingLeft: 20,
      paddingRight: 12,
      paddingTop: 8,
      paddingBottom: 16
    },
    headerTextContainer: {
      flex: 1
    },
    title: {
      color: colors.text,
      fontSize: 16,
      fontWeight: '900',
      letterSpacing: 1.2,
      marginBottom: 4
    },
    subtitle: {
      color: 'rgba(255,255,255,0.6)',
      fontSize: 12
    },
    closeBtn: {
      padding: 8
    },
    divider: {
      height: 1,
      backgroundColor: 'rgba(255,255,255,0.1)'
    },
    optionContainer: {
      flexDirection: 'row',
      paddingHorizontal: 20,
      paddingVertical: 20,
      alignItems: 'center'
    },
    iconWrapper: {
      padding: 12,
      borderRadius: 24
    },
    optionTextContainer: {
      flex: 1,
      marginLeft: 16
    },
    optionTitle: {
      color: colors.text,
      fontSize: 15,
      fontWeight: 'bold',
      marginBottom: 4
    },
    optionDesc: {
      color: 'rgba(255,255,255,0.5)',
      fontSize: 12,
      lineHeight: 16
    }
  }));
  const showFeedback = (message: string) => {
    Toast.show({
      type: 'success',
      text1: message
    });
    onClose();
  };
  return <View style={styles.container}>
      <View style={styles.handle} />
      
      <View style={styles.header}>
        <View style={styles.headerTextContainer}>
          <Text style={styles.title}>CHALLENGE RANTop</Text>
          <Text style={styles.subtitle}>Think you or someone else belongs here? Flag to compete!</Text>
        </View>
        <TouchableOpacity activeOpacity={1} onPress={onClose} style={styles.closeBtn}>
          <X color="rgba(255,255,255,0.54)" size={24} />
        </TouchableOpacity>
      </View>

      <View style={styles.divider} />

      <ChallengeOption icon={<UserPlus color={themeColor} size={24} />} title="Challenge as Myself" description="Apply to enter this ranTop directly using your profile." themeColor={themeColor} onTap={() => showFeedback('Application submitted! You are now a challenger.')} />
      <ChallengeOption icon={<ImageIcon color={themeColor} size={24} />} title="Challenge with My Data" description="Select your best media from your library to prove you win." themeColor={themeColor} onTap={() => showFeedback('Select media to start your challenge.')} />
      <ChallengeOption icon={<Globe color={themeColor} size={24} />} title="Add External Challenger" description="Bring an external user or link their data to compete." themeColor={themeColor} onTap={() => showFeedback('External challenger form opened.')} />
      <View style={{
      height: 32
    }} />
    </View>;
};
interface ChallengeOptionProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  themeColor: string;
  onTap: () => void;
}
const ChallengeOption: React.FC<ChallengeOptionProps> = ({
  icon,
  title,
  description,
  themeColor,
  onTap
}) => {
  return <TouchableOpacity onPress={onTap} style={styles.optionContainer} activeOpacity={0.7}>
      <View style={[styles.iconWrapper, {
      backgroundColor: `${themeColor}1A`
    }]}>
        {icon}
      </View>
      <View style={styles.optionTextContainer}>
        <Text style={styles.optionTitle}>{title}</Text>
        <Text style={styles.optionDesc}>{description}</Text>
      </View>
    </TouchableOpacity>;
};