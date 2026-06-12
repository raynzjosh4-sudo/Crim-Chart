import React from 'react';
import { Dimensions, Modal, StyleSheet, Text, TouchableOpacity, View, ScrollView } from 'react-native';
import LottieView from 'lottie-react-native';

const STICKERS = [
  require('../../../../assets/stickers/sticker_4.json'),
  require('../../../../assets/stickers/sticker_5.json'),
  require('../../../../assets/stickers/sticker_6.json'),
  require('../../../../assets/stickers/sticker_7.json'),
  require('../../../../assets/stickers/sticker_8.json'),
  require('../../../../assets/stickers/sticker_9.json'),
  require('../../../../assets/stickers/sticker_39.json'),
  require('../../../../assets/stickers/sticker_40.json'),
  require('../../../../assets/stickers/sticker_41.json'),
  require('../../../../assets/stickers/sticker_42.json'),
  require('../../../../assets/stickers/sticker_43.json'),
  require('../../../../assets/stickers/sticker_44.json'),
  require('../../../../assets/stickers/sticker_45.json'),
  require('../../../../assets/stickers/sticker_46.json'),
  require('../../../../assets/stickers/sticker_47.json'),
  require('../../../../assets/stickers/sticker_48.json'),
  require('../../../../assets/stickers/sticker_49.json'),
  require('../../../../assets/stickers/sticker_50.json'),
];

interface LottieEmojiSheetProps {
  visible: boolean;
  onClose: () => void;
  onEmojiSelected: (asset: any) => void;
}

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export const LottieEmojiSheet: React.FC<LottieEmojiSheetProps> = ({ visible, onClose, onEmojiSelected }) => {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.touchableClose} onPress={onClose} activeOpacity={1} />
        
        <View style={styles.sheet}>
          <View style={styles.handle} />
          
          <View style={styles.header}>
            <Text style={styles.title}>Stickers</Text>
          </View>
          
          <ScrollView contentContainerStyle={styles.grid}>
            {STICKERS.map((asset, index) => (
              <TouchableOpacity
                key={index}
                style={styles.gridItem}
                onPress={() => {
                  onEmojiSelected(asset);
                  onClose();
                }}
              >
                <LottieView
                  source={asset}
                  autoPlay
                  loop
                  style={styles.lottie}
                />
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  touchableClose: {
    flex: 1,
  },
  sheet: {
    height: SCREEN_HEIGHT * 0.7,
    backgroundColor: '#1E1E1E',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    alignItems: 'center',
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 2,
    marginTop: 12,
    marginBottom: 8,
  },
  header: {
    width: '100%',
    paddingHorizontal: 24,
    paddingVertical: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFF',
    letterSpacing: -0.5,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    justifyContent: 'space-between',
  },
  gridItem: {
    width: '22%', // Roughly 4 items per row
    aspectRatio: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    padding: 8,
    marginBottom: 12,
  },
  lottie: {
    width: '100%',
    height: '100%',
  },
});
