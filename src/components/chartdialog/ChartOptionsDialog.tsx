import AppAvatar from '@/components/avatar/AppAvatar';
import { useStyles } from "@/core/hooks/useStyles";
import { useTheme } from '@react-navigation/native';
import { Image } from 'expo-image';
import { ChevronRight, RefreshCw, TriangleAlert, User } from 'lucide-react-native';
import { useState } from 'react';
import { Alert, Modal, Platform, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { OfflineStaleDataBanner, SlowConnectionBanner } from '@/components/offlineIndicators';
interface ChartOptionsDialogProps {
  visible: boolean;
  onClose: () => void;
  username: string;
  userProfileImageUrl: string;
  statusImageUrl: string;
  isChartable: boolean;
  themeColor: string;
  onChartTap: () => void;
  onProfileTap: () => void;
  onSaveTap?: () => void;
  crownTitle?: string;
  targetUserId?: string;
  onBlockUserTap?: (userId: string) => void;
}
export const ChartOptionsDialog: React.FC<ChartOptionsDialogProps> = ({
  visible,
  onClose,
  username,
  userProfileImageUrl,
  statusImageUrl,
  isChartable,
  themeColor,
  onChartTap,
  onProfileTap,
  onSaveTap,
  crownTitle,
  targetUserId,
  onBlockUserTap
}) => {
  const [showChannels, setShowChannels] = useState(false);
  const [selectedChannelIndex, setSelectedChannelIndex] = useState(-1);
  const {
    colors
  } = useTheme();
  const {
    width,
    height: screenHeight
  } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const isDesktop = Platform.OS === 'web' && width >= 768;

  const styles = useStyles(colors => ({
    overlay: {
      flex: 1,
      justifyContent: 'flex-end',
      backgroundColor: 'rgba(0, 0, 0, 0.5)'
    },
    backdrop: {
      ...StyleSheet.absoluteFillObject
    },
    sheetContainer: {
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      shadowColor: colors.background,
      shadowOpacity: 0.3,
      shadowRadius: 20,
      elevation: 10
    },
    handle: {
      width: 40,
      height: 4,
      borderRadius: 2,
      alignSelf: 'center',
      marginVertical: 12
    },
    headerArea: {
      paddingHorizontal: 16,
      paddingBottom: 12,
      paddingTop: 4
    },
    userRow: {
      flexDirection: 'row',
      alignItems: 'center'
    },
    userInfo: {
      marginLeft: 10
    },
    username: {
      fontSize: 13,
      fontWeight: '900'
    },
    hisUserText: {
      fontSize: 11,
      fontWeight: '700'
    },
    contentRow: {
      flexDirection: 'row',
      marginTop: 12
    },
    statusThumbnail: {
      width: 80,
      height: 110,
      borderRadius: 12,
      borderWidth: 1.5,
      borderColor: 'rgba(255, 255, 255, 0.12)'
    },
    expansionToggle: {
      marginLeft: 12,
      paddingTop: 34
    },
    toggleButton: {
      padding: 8,
      borderRadius: 20
    },
    actionsContainer: {
      paddingHorizontal: 16
    },
    actionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 14,
      borderRadius: 12,
      marginBottom: 4
    },
    actionText: {
      fontSize: 14,
      fontWeight: '700',
      marginLeft: 12
    }
  }));

  const ActionButton = ({
    title,
    isDestructive,
    onTap
  }: any) => {
    return <TouchableOpacity activeOpacity={1} style={[styles.actionButton, {
      backgroundColor: 'rgba(255, 255, 255, 0.05)'
    }]} onPress={() => {
      onClose();
      onTap?.();
    }}>
      {isDestructive ? <TriangleAlert size={18} color="#FF5252" /> : <User size={18} color="rgba(255, 255, 255, 0.6)" />}
      <Text style={[styles.actionText, {
        color: isDestructive ? '#FF5252' : 'rgba(255, 255, 255, 0.9)'
      }]}>
        {title}
      </Text>
      <View style={{
        flex: 1
      }} />
      {onTap && <ChevronRight size={16} color="rgba(255, 255, 255, 0.3)" />}
    </TouchableOpacity>;
  };
  return (
    <Modal visible={visible} animationType={isDesktop ? "fade" : "slide"} transparent>
      <View style={[styles.overlay, isDesktop && {
        justifyContent: 'center',
        alignItems: 'center'
      }]}>
        <TouchableOpacity style={styles.backdrop} onPress={onClose} activeOpacity={1} />
        <View style={[styles.sheetContainer, {
          backgroundColor: colors.background
        }, isDesktop && {
          width: 400,
          borderRadius: 24,
          paddingBottom: 16
        }]}>
          <SafeAreaView>
            <ScrollView style={{ maxHeight: screenHeight * 0.85 }} contentContainerStyle={{ paddingBottom: Platform.OS === 'android' ? Math.max(insets.bottom, 24) : 0 }}>
              {!isDesktop && <View style={[styles.handle, { backgroundColor: 'rgba(255, 255, 255, 0.2)' }]} />}
              <OfflineStaleDataBanner />
              <SlowConnectionBanner />
              <View style={styles.headerArea}>
                <View style={styles.userRow}>
                  <AppAvatar imageUrl={userProfileImageUrl} size={36} />
                  <View style={styles.userInfo}>
                    <Text style={[styles.username, { color: colors.text }]}>{username}</Text>
                    {crownTitle && <Text style={[styles.hisUserText, { color: themeColor }]}>{crownTitle}</Text>}
                  </View>
                </View>
                <View style={styles.contentRow}>
                  <View style={{ width: 42 }} />
                  <Image source={{ uri: statusImageUrl }} style={styles.statusThumbnail} contentFit="cover" />
                  <View style={styles.expansionToggle}>
                    <TouchableOpacity activeOpacity={1} style={[styles.toggleButton, { backgroundColor: showChannels ? 'rgba(255, 184, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)' }]} onPress={() => setShowChannels(!showChannels)}>
                      <RefreshCw size={26} color={showChannels ? colors.primary : 'rgba(255, 255, 255, 0.6)'} />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
              {showChannels && <View style={{ marginBottom: 8, padding: 16 }}>
                {/* Channel selector */}
              </View>}
              <View style={styles.actionsContainer}>
                <ActionButton title={`Block ${username}`} isDestructive onTap={() => { if (!targetUserId || !onBlockUserTap) return; onBlockUserTap(targetUserId); }} />
                <ActionButton title="Report Post" isDestructive />
                <ActionButton title={`Report ${username}`} isDestructive />
                <ActionButton title="View Profile" onTap={onProfileTap} />
                {onSaveTap && <ActionButton title="Save Status" onTap={onSaveTap} />}
                <ActionButton title="Share Status" />
              </View>
              <View style={{ height: 12 }} />
            </ScrollView>
          </SafeAreaView>
        </View>
      </View>
    </Modal>
  );
};