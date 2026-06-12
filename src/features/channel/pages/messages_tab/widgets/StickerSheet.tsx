import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
  useWindowDimensions,
} from 'react-native';
import { X } from 'lucide-react-native';
import { colors } from '@/core/theme/colors';

// ─── Static require map — Metro needs static paths, no dynamic requires ───────
// Files are at assets/stickers/sticker_1.json ... sticker_50.json
// Relative path from src/features/channel/pages/messages_tab/widgets/ → 6 levels up

export const STICKER_SOURCES: Record<number, any> = {
  1:  require('../../../../../../assets/stickers/sticker_1.json'),
  2:  require('../../../../../../assets/stickers/sticker_2.json'),
  3:  require('../../../../../../assets/stickers/sticker_3.json'),
  4:  require('../../../../../../assets/stickers/sticker_4.json'),
  5:  require('../../../../../../assets/stickers/sticker_5.json'),
  6:  require('../../../../../../assets/stickers/sticker_6.json'),
  7:  require('../../../../../../assets/stickers/sticker_7.json'),
  8:  require('../../../../../../assets/stickers/sticker_8.json'),
  9:  require('../../../../../../assets/stickers/sticker_9.json'),
  10: require('../../../../../../assets/stickers/sticker_10.json'),
  11: require('../../../../../../assets/stickers/sticker_11.json'),
  12: require('../../../../../../assets/stickers/sticker_12.json'),
  13: require('../../../../../../assets/stickers/sticker_13.json'),
  14: require('../../../../../../assets/stickers/sticker_14.json'),
  15: require('../../../../../../assets/stickers/sticker_15.json'),
  16: require('../../../../../../assets/stickers/sticker_16.json'),
  17: require('../../../../../../assets/stickers/sticker_17.json'),
  18: require('../../../../../../assets/stickers/sticker_18.json'),
  19: require('../../../../../../assets/stickers/sticker_19.json'),
  20: require('../../../../../../assets/stickers/sticker_20.json'),
  21: require('../../../../../../assets/stickers/sticker_21.json'),
  22: require('../../../../../../assets/stickers/sticker_22.json'),
  23: require('../../../../../../assets/stickers/sticker_23.json'),
  24: require('../../../../../../assets/stickers/sticker_24.json'),
  25: require('../../../../../../assets/stickers/sticker_25.json'),
  26: require('../../../../../../assets/stickers/sticker_26.json'),
  27: require('../../../../../../assets/stickers/sticker_27.json'),
  28: require('../../../../../../assets/stickers/sticker_28.json'),
  29: require('../../../../../../assets/stickers/sticker_29.json'),
  30: require('../../../../../../assets/stickers/sticker_30.json'),
  31: require('../../../../../../assets/stickers/sticker_31.json'),
  32: require('../../../../../../assets/stickers/sticker_32.json'),
  33: require('../../../../../../assets/stickers/sticker_33.json'),
  34: require('../../../../../../assets/stickers/sticker_34.json'),
  35: require('../../../../../../assets/stickers/sticker_35.json'),
  36: require('../../../../../../assets/stickers/sticker_36.json'),
  37: require('../../../../../../assets/stickers/sticker_37.json'),
  38: require('../../../../../../assets/stickers/sticker_38.json'),
  39: require('../../../../../../assets/stickers/sticker_39.json'),
  40: require('../../../../../../assets/stickers/sticker_40.json'),
  41: require('../../../../../../assets/stickers/sticker_41.json'),
  42: require('../../../../../../assets/stickers/sticker_42.json'),
  43: require('../../../../../../assets/stickers/sticker_43.json'),
  44: require('../../../../../../assets/stickers/sticker_44.json'),
  45: require('../../../../../../assets/stickers/sticker_45.json'),
  46: require('../../../../../../assets/stickers/sticker_46.json'),
  47: require('../../../../../../assets/stickers/sticker_47.json'),
  48: require('../../../../../../assets/stickers/sticker_48.json'),
  49: require('../../../../../../assets/stickers/sticker_49.json'),
  50: require('../../../../../../assets/stickers/sticker_50.json'),
};

const STICKER_KEYS = Object.keys(STICKER_SOURCES).map(Number);
const NUM_COLUMNS = 4;

interface StickerSheetProps {
  visible: boolean;
  onClose: () => void;
  onStickerSelected: (stickerIndex: number) => void;
}

export const StickerSheet: React.FC<StickerSheetProps> = ({
  visible,
  onClose,
  onStickerSelected,
}) => {
  const { width, height } = useWindowDimensions();
  const itemSize = (width - 32 - (NUM_COLUMNS - 1) * 8) / NUM_COLUMNS;

  // Lazy-load lottie so it doesn't crash if not installed
  const [LottieView, setLottieView] = useState<any>(null);
  React.useEffect(() => {
    try {
      const mod = require('lottie-react-native');
      setLottieView(() => mod.default ?? mod);
    } catch {
      setLottieView(null);
    }
  }, []);

  const renderSticker = useCallback(({ item }: { item: number }) => (
    <TouchableOpacity
      style={[styles.stickerCell, { width: itemSize, height: itemSize }]}
      onPress={() => onStickerSelected(item)}
      activeOpacity={0.7}
    >
      {LottieView ? (
        <LottieView
          source={STICKER_SOURCES[item]}
          autoPlay
          loop
          style={{ width: itemSize - 16, height: itemSize - 16 }}
          resizeMode="contain"
        />
      ) : (
        <Text style={styles.fallbackEmoji}>🎯</Text>
      )}
    </TouchableOpacity>
  ), [LottieView, itemSize, onStickerSelected]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.backdrop} onPress={onClose} />

        <View style={[styles.sheet, { height: height * 0.55 }]}>
          {/* Handle */}
          <View style={styles.handle} />

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Stickers</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={20} color="rgba(255,255,255,0.7)" />
            </TouchableOpacity>
          </View>

          {/* Grid */}
          <FlatList
            data={STICKER_KEYS}
            keyExtractor={(item) => `sticker-${item}`}
            numColumns={NUM_COLUMNS}
            contentContainerStyle={styles.grid}
            renderItem={renderSticker}
            showsVerticalScrollIndicator={false}
            initialNumToRender={16}
            maxToRenderPerBatch={16}
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  sheet: {
    backgroundColor: '#0F1117',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignSelf: 'center',
    marginTop: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  title: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '900',
  },
  closeBtn: {
    padding: 4,
  },
  grid: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  stickerCell: {
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.05)',
    margin: 4,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  fallbackEmoji: {
    fontSize: 36,
  },
});
