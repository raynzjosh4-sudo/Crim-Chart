import React from 'react';
import { View, Text, StyleSheet, Modal, Switch, TouchableWithoutFeedback, Platform } from 'react-native';
import { Eye, MessageSquare } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface AdvancedSettingsSheetProps {
  visible: boolean;
  onClose: () => void;
  isPublic: boolean;
  allowComments: boolean;
  onPublicChanged: (val: boolean) => void;
  onAllowCommentsChanged: (val: boolean) => void;
}

export const AdvancedSettingsSheet: React.FC<AdvancedSettingsSheetProps> = ({
  visible,
  onClose,
  isPublic,
  allowComments,
  onPublicChanged,
  onAllowCommentsChanged,
}) => {
  const insets = useSafeAreaInsets();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={[styles.sheetContainer, { paddingBottom: Math.max(20, insets.bottom + 20) }]}>
              <View style={styles.handle} />
              
              <Text style={styles.title}>Advanced Settings</Text>
              
              <View style={styles.spacing} />

              <View style={styles.tile}>
                <View style={styles.iconContainer}>
                  <Eye color="rgba(255,255,255,0.7)" size={22} />
                </View>
                <View style={styles.textContainer}>
                  <Text style={styles.tileTitle}>Public</Text>
                </View>
                <Switch
                  value={isPublic}
                  onValueChange={onPublicChanged}
                  trackColor={{ false: 'rgba(255,255,255,0.1)', true: 'rgba(250,205,17,0.5)' }}
                  thumbColor={isPublic ? '#FACD11' : '#f4f3f4'}
                  style={Platform.OS === 'ios' ? { transform: [{ scale: 0.8 }] } : {}}
                />
              </View>

              <View style={styles.tile}>
                <View style={styles.iconContainer}>
                  <MessageSquare color="rgba(255,255,255,0.7)" size={22} />
                </View>
                <View style={styles.textContainer}>
                  <Text style={styles.tileTitle}>Allow Comments</Text>
                </View>
                <Switch
                  value={allowComments}
                  onValueChange={onAllowCommentsChanged}
                  trackColor={{ false: 'rgba(255,255,255,0.1)', true: 'rgba(250,205,17,0.5)' }}
                  thumbColor={allowComments ? '#FACD11' : '#f4f3f4'}
                  style={Platform.OS === 'ios' ? { transform: [{ scale: 0.8 }] } : {}}
                />
              </View>

              <View style={styles.spacing} />

              <Text style={styles.description}>
                Advanced settings allow you to control the visibility of your post on the global feed and manage interactions like comments.
              </Text>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: '#0D0D0D', // Scaffold background
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 10,
    alignItems: 'center',
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginBottom: 24,
  },
  title: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '900',
  },
  spacing: {
    height: 24,
  },
  tile: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    width: '100%',
  },
  iconContainer: {
    marginRight: 16,
    opacity: 0.7,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  tileTitle: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
  },
  description: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '500',
    textAlign: 'center',
    paddingHorizontal: 24,
  }
});
