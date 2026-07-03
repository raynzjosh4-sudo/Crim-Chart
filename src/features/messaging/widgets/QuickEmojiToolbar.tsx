import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import LottieView from 'lottie-react-native';
import { STICKER_SOURCES } from '@/features/channel/pages/messages_tab/widgets/StickerSheet';

// Use standard indices for quick emojis: Wave (30), Heart Hands (45), Sparkle Heart (1), Clapping (8), Fist Bump (18)
const QUICK_EMOJI_INDICES = [30, 45, 1, 8, 18];

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
        {QUICK_EMOJI_INDICES.map((index) => (
          <TouchableOpacity activeOpacity={1} 
            key={index} 
            onPress={() => onEmojiSelected(String(index))}
            style={styles.emojiWrapper}
          >
            <View style={styles.emojiContainer}>
              <LottieView
                source={STICKER_SOURCES[index]}
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
