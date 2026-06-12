import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import LottieView from 'lottie-react-native';

const QUICK_EMOJIS = [
  require('../../../../assets/stickers/sticker_4.json'),
  require('../../../../assets/stickers/sticker_5.json'),
  require('../../../../assets/stickers/sticker_6.json'),
  require('../../../../assets/stickers/sticker_7.json'),
  require('../../../../assets/stickers/sticker_8.json'),
];

interface QuickEmojiToolbarProps {
  onEmojiSelected: (asset: any) => void;
}

export const QuickEmojiToolbar: React.FC<QuickEmojiToolbarProps> = ({ onEmojiSelected }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Quick Emojis</Text>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {QUICK_EMOJIS.map((asset, index) => (
          <TouchableOpacity 
            key={index} 
            onPress={() => onEmojiSelected(asset)}
            style={styles.emojiWrapper}
          >
            <View style={styles.emojiContainer}>
              <LottieView
                source={asset}
                autoPlay
                loop
                style={styles.lottie}
              />
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 12,
    paddingBottom: 24,
  },
  title: {
    fontSize: 12,
    fontWeight: 'bold',
    color: 'rgba(255,255,255,0.3)',
    letterSpacing: 1.2,
    paddingHorizontal: 24,
    marginBottom: 8,
  },
  scrollContent: {
    paddingHorizontal: 16,
  },
  emojiWrapper: {
    marginRight: 12,
  },
  emojiContainer: {
    width: 90,
    height: 90,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lottie: {
    width: '100%',
    height: '100%',
  },
});
