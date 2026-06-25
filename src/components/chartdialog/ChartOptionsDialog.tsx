import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView, SafeAreaView, StyleSheet, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { ChevronRight, TriangleAlert, User, RefreshCw } from 'lucide-react-native';
import { useTheme } from '@react-navigation/native';
import AppAvatar from '@/components/avatar/AppAvatar';
 

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
}

const { height: screenHeight } = Dimensions.get('window');

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
}) => {
  const [showChannels, setShowChannels] = useState(false);
  const [selectedChannelIndex, setSelectedChannelIndex] = useState(-1);
  const { colors } = useTheme();

  const ActionButton = ({ title, isDestructive, onTap }: any) => (
    <TouchableOpacity activeOpacity={1}
      style={[styles.actionButton, { backgroundColor: 'rgba(255, 255, 255, 0.05)' }]}
      onPress={() => {
        onClose();
        onTap?.();
      }}
    >
      {isDestructive ? (
        <TriangleAlert size={18} color="#FF5252" />
      ) : (
        <User size={18} color="rgba(255, 255, 255, 0.6)" />
      )}
      <Text style={[styles.actionText, { color: isDestructive ? '#FF5252' : 'rgba(255, 255, 255, 0.9)' }]}>
        {title}
      </Text>
      <View style={{ flex: 1 }} />
      <ChevronRight size={16} color="rgba(255, 255, 255, 0.3)" />
    </TouchableOpacity>
  );

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.backdrop} onPress={onClose} activeOpacity={1} />
        <View style={[styles.sheetContainer, { backgroundColor: colors.background }]}>
          <SafeAreaView>
            <ScrollView style={{ maxHeight: screenHeight * 0.85 }}>
              <View style={[styles.handle, { backgroundColor: 'rgba(255, 255, 255, 0.2)' }]} />

              <View style={styles.headerArea}>
                <View style={styles.userRow}>
                  <AppAvatar
                    size={32}
                    imageUrl={userProfileImageUrl}
                    showStatusRing
                    showActiveDot={false}
                    onImageTap={() => {
                      onClose();
                      onProfileTap();
                    }}
                  />
                  <View style={styles.userInfo}>
                    <Text style={[styles.username, { color: colors.text }]}>{username}</Text>
                    <Text style={[styles.hisUserText, { color: colors.primary }]}>His User</Text>
                  </View>
                </View>

                <View style={styles.contentRow}>
                  <View style={{ width: 42 }} />
                  <Image source={{ uri: statusImageUrl }} style={styles.statusThumbnail} contentFit="cover" />
                  <View style={styles.expansionToggle}>
                    <TouchableOpacity activeOpacity={1}
                      style={[
                        styles.toggleButton,
                        { backgroundColor: showChannels ? 'rgba(255, 184, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)' }
                      ]}
                      onPress={() => setShowChannels(!showChannels)}
                    >
                      <RefreshCw size={26} color={showChannels ? colors.primary : 'rgba(255, 255, 255, 0.6)'} />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

              {showChannels && (
                <View style={{ marginBottom: 8, padding: 16 }}>
                  {/* Channel selector – coming soon */}
                </View>
              )}

              <View style={styles.actionsContainer}>
                <ActionButton title={`Block ${username}`} isDestructive />
                <ActionButton title="Report Post" isDestructive />
                <ActionButton title={`Report ${username}`} isDestructive />
                <ActionButton title="View Profile" onTap={onProfileTap} />
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

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  sheetContainer: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginVertical: 12,
  },
  headerArea: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    paddingTop: 4,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userInfo: {
    marginLeft: 10,
  },
  username: {
    fontSize: 13,
    fontWeight: '900',
  },
  hisUserText: {
    fontSize: 11,
    fontWeight: '700',
  },
  contentRow: {
    flexDirection: 'row',
    marginTop: 12,
  },
  statusThumbnail: {
    width: 80,
    height: 110,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  expansionToggle: {
    marginLeft: 12,
    paddingTop: 34,
  },
  toggleButton: {
    padding: 8,
    borderRadius: 20,
  },
  actionsContainer: {
    paddingHorizontal: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 4,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 12,
  },
});

