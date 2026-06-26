import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
  useWindowDimensions,
  Platform,
} from 'react-native';
import { X } from 'lucide-react-native';
import { colors } from '@/core/theme/colors';

// ─── Static require map — Metro needs static paths, no dynamic requires ───────
// Files are at assets/stickers/sticker_1.json ... sticker_50.json
// Relative path from src/features/channel/pages/messages_tab/widgets/ → 6 levels up

export const STICKER_SOURCES: Record<number, any> = {
  1: require('../../../../../../assets/stickers/sticker_1.json'),
  2: require('../../../../../../assets/stickers/sticker_2.json'),
  3: require('../../../../../../assets/stickers/sticker_3.json'),
  4: require('../../../../../../assets/stickers/sticker_4.json'),
  5: require('../../../../../../assets/stickers/sticker_5.json'),
  6: require('../../../../../../assets/stickers/sticker_6.json'),
  7: require('../../../../../../assets/stickers/sticker_7.json'),
  8: require('../../../../../../assets/stickers/sticker_8.json'),
  9: require('../../../../../../assets/stickers/sticker_9.json'),
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
  51: require('../../../../../../assets/stickers/sticker_51.json'),
  52: require('../../../../../../assets/stickers/sticker_52.json'),
  53: require('../../../../../../assets/stickers/sticker_53.json'),
  54: require('../../../../../../assets/stickers/sticker_54.json'),
  55: require('../../../../../../assets/stickers/sticker_55.json'),
  56: require('../../../../../../assets/stickers/sticker_56.json'),
  57: require('../../../../../../assets/stickers/sticker_57.json'),
  58: require('../../../../../../assets/stickers/sticker_58.json'),
  59: require('../../../../../../assets/stickers/sticker_59.json'),
  60: require('../../../../../../assets/stickers/sticker_60.json'),
  61: require('../../../../../../assets/stickers/sticker_61.json'),
  62: require('../../../../../../assets/stickers/sticker_62.json'),
  63: require('../../../../../../assets/stickers/sticker_63.json'),
  64: require('../../../../../../assets/stickers/sticker_64.json'),
  65: require('../../../../../../assets/stickers/sticker_65.json'),
  66: require('../../../../../../assets/stickers/sticker_66.json'),
  67: require('../../../../../../assets/stickers/sticker_67.json'),
  68: require('../../../../../../assets/stickers/sticker_68.json'),
  69: require('../../../../../../assets/stickers/sticker_69.json'),
  70: require('../../../../../../assets/stickers/sticker_70.json'),
  71: require('../../../../../../assets/stickers/sticker_71.json'),
  72: require('../../../../../../assets/stickers/sticker_72.json'),
  73: require('../../../../../../assets/stickers/sticker_73.json'),
  74: require('../../../../../../assets/stickers/sticker_74.json'),
  75: require('../../../../../../assets/stickers/sticker_75.json'),
  76: require('../../../../../../assets/stickers/sticker_76.json'),
  77: require('../../../../../../assets/stickers/sticker_77.json'),
  78: require('../../../../../../assets/stickers/sticker_78.json'),
  79: require('../../../../../../assets/stickers/sticker_79.json'),
  80: require('../../../../../../assets/stickers/sticker_80.json'),
  81: require('../../../../../../assets/stickers/sticker_81.json'),
  82: require('../../../../../../assets/stickers/sticker_82.json'),
  83: require('../../../../../../assets/stickers/sticker_83.json'),
  84: require('../../../../../../assets/stickers/sticker_84.json'),
  85: require('../../../../../../assets/stickers/sticker_85.json'),
  86: require('../../../../../../assets/stickers/sticker_86.json'),
  87: require('../../../../../../assets/stickers/sticker_87.json'),
  88: require('../../../../../../assets/stickers/sticker_88.json'),
  89: require('../../../../../../assets/stickers/sticker_89.json'),
  90: require('../../../../../../assets/stickers/sticker_90.json'),
  91: require('../../../../../../assets/stickers/sticker_91.json'),
  92: require('../../../../../../assets/stickers/sticker_92.json'),
  93: require('../../../../../../assets/stickers/sticker_93.json'),
  94: require('../../../../../../assets/stickers/sticker_94.json'),
  95: require('../../../../../../assets/stickers/sticker_95.json'),
  96: require('../../../../../../assets/stickers/sticker_96.json'),
  97: require('../../../../../../assets/stickers/sticker_97.json'),
  98: require('../../../../../../assets/stickers/sticker_98.json'),
  99: require('../../../../../../assets/stickers/sticker_99.json'),
  100: require('../../../../../../assets/stickers/sticker_100.json'),
  101: require('../../../../../../assets/stickers/sticker_101.json'),
  102: require('../../../../../../assets/stickers/sticker_102.json'),
  103: require('../../../../../../assets/stickers/sticker_103.json'),
  104: require('../../../../../../assets/stickers/sticker_104.json'),
  105: require('../../../../../../assets/stickers/sticker_105.json'),
  106: require('../../../../../../assets/stickers/sticker_106.json'),
  107: require('../../../../../../assets/stickers/sticker_107.json'),
  108: require('../../../../../../assets/stickers/sticker_108.json'),
  109: require('../../../../../../assets/stickers/sticker_109.json'),
  110: require('../../../../../../assets/stickers/sticker_110.json'),
  111: require('../../../../../../assets/stickers/sticker_111.json'),
  112: require('../../../../../../assets/stickers/sticker_112.json'),
  113: require('../../../../../../assets/stickers/sticker_113.json'),
  114: require('../../../../../../assets/stickers/sticker_114.json'),
  115: require('../../../../../../assets/stickers/sticker_115.json'),
  116: require('../../../../../../assets/stickers/sticker_116.json'),
  117: require('../../../../../../assets/stickers/sticker_117.json'),
  118: require('../../../../../../assets/stickers/sticker_118.json'),
  119: require('../../../../../../assets/stickers/sticker_119.json'),
  120: require('../../../../../../assets/stickers/sticker_120.json'),
  121: require('../../../../../../assets/stickers/sticker_121.json'),
  122: require('../../../../../../assets/stickers/sticker_122.json'),
  123: require('../../../../../../assets/stickers/sticker_123.json'),
  124: require('../../../../../../assets/stickers/sticker_124.json'),
  125: require('../../../../../../assets/stickers/sticker_125.json'),
  126: require('../../../../../../assets/stickers/sticker_126.json'),
  127: require('../../../../../../assets/stickers/sticker_127.json'),
  128: require('../../../../../../assets/stickers/sticker_128.json'),
  129: require('../../../../../../assets/stickers/sticker_129.json'),
  130: require('../../../../../../assets/stickers/sticker_130.json'),
  131: require('../../../../../../assets/stickers/sticker_131.json'),
  132: require('../../../../../../assets/stickers/sticker_132.json'),
  133: require('../../../../../../assets/stickers/sticker_133.json'),
  134: require('../../../../../../assets/stickers/sticker_134.json'),
  135: require('../../../../../../assets/stickers/sticker_135.json'),
  136: require('../../../../../../assets/stickers/sticker_136.json'),
  137: require('../../../../../../assets/stickers/sticker_137.json'),
  138: require('../../../../../../assets/stickers/sticker_138.json'),
  139: require('../../../../../../assets/stickers/sticker_139.json'),
  140: require('../../../../../../assets/stickers/sticker_140.json'),
  141: require('../../../../../../assets/stickers/sticker_141.json'),
  142: require('../../../../../../assets/stickers/sticker_142.json'),
  143: require('../../../../../../assets/stickers/sticker_143.json'),
  144: require('../../../../../../assets/stickers/sticker_144.json'),
  145: require('../../../../../../assets/stickers/sticker_145.json'),
  146: require('../../../../../../assets/stickers/sticker_146.json'),
  147: require('../../../../../../assets/stickers/sticker_147.json'),
  148: require('../../../../../../assets/stickers/sticker_148.json'),
  149: require('../../../../../../assets/stickers/sticker_149.json'),
  150: require('../../../../../../assets/stickers/sticker_150.json'),
  151: require('../../../../../../assets/stickers/sticker_151.json'),
  152: require('../../../../../../assets/stickers/sticker_152.json'),
  153: require('../../../../../../assets/stickers/sticker_153.json'),
  154: require('../../../../../../assets/stickers/sticker_154.json'),
  155: require('../../../../../../assets/stickers/sticker_155.json'),
  156: require('../../../../../../assets/stickers/sticker_156.json'),
  157: require('../../../../../../assets/stickers/sticker_157.json'),
  158: require('../../../../../../assets/stickers/sticker_158.json'),
  159: require('../../../../../../assets/stickers/sticker_159.json'),
  160: require('../../../../../../assets/stickers/sticker_160.json'),
  161: require('../../../../../../assets/stickers/sticker_161.json'),
  162: require('../../../../../../assets/stickers/sticker_162.json'),
  163: require('../../../../../../assets/stickers/sticker_163.json'),
  164: require('../../../../../../assets/stickers/sticker_164.json'),
  165: require('../../../../../../assets/stickers/sticker_165.json'),
  166: require('../../../../../../assets/stickers/sticker_166.json'),
  167: require('../../../../../../assets/stickers/sticker_167.json'),
  168: require('../../../../../../assets/stickers/sticker_168.json'),
  169: require('../../../../../../assets/stickers/sticker_169.json'),
  170: require('../../../../../../assets/stickers/sticker_170.json'),
  171: require('../../../../../../assets/stickers/sticker_171.json'),
  172: require('../../../../../../assets/stickers/sticker_172.json'),
  173: require('../../../../../../assets/stickers/sticker_173.json'),
  174: require('../../../../../../assets/stickers/sticker_174.json'),
  175: require('../../../../../../assets/stickers/sticker_175.json'),
  176: require('../../../../../../assets/stickers/sticker_176.json'),
  177: require('../../../../../../assets/stickers/sticker_177.json'),
  178: require('../../../../../../assets/stickers/sticker_178.json'),
  179: require('../../../../../../assets/stickers/sticker_179.json'),
  180: require('../../../../../../assets/stickers/sticker_180.json'),
  181: require('../../../../../../assets/stickers/sticker_181.json'),
  182: require('../../../../../../assets/stickers/sticker_182.json'),
  183: require('../../../../../../assets/stickers/sticker_183.json'),
  184: require('../../../../../../assets/stickers/sticker_184.json'),
  185: require('../../../../../../assets/stickers/sticker_185.json'),
  186: require('../../../../../../assets/stickers/sticker_186.json'),
  187: require('../../../../../../assets/stickers/sticker_187.json'),
  188: require('../../../../../../assets/stickers/sticker_188.json'),
  189: require('../../../../../../assets/stickers/sticker_189.json'),
  190: require('../../../../../../assets/stickers/sticker_190.json'),
  191: require('../../../../../../assets/stickers/sticker_191.json'),
  192: require('../../../../../../assets/stickers/sticker_192.json'),
  193: require('../../../../../../assets/stickers/sticker_193.json'),
  194: require('../../../../../../assets/stickers/sticker_194.json'),
  195: require('../../../../../../assets/stickers/sticker_195.json'),
  196: require('../../../../../../assets/stickers/sticker_196.json'),
  197: require('../../../../../../assets/stickers/sticker_197.json'),
  198: require('../../../../../../assets/stickers/sticker_198.json'),
  199: require('../../../../../../assets/stickers/sticker_199.json'),
  200: require('../../../../../../assets/stickers/sticker_200.json'),
  201: require('../../../../../../assets/stickers/sticker_201.json'),
  202: require('../../../../../../assets/stickers/sticker_202.json'),
  203: require('../../../../../../assets/stickers/sticker_203.json'),
  204: require('../../../../../../assets/stickers/sticker_204.json'),
  205: require('../../../../../../assets/stickers/sticker_205.json'),
  206: require('../../../../../../assets/stickers/sticker_206.json'),
  207: require('../../../../../../assets/stickers/sticker_207.json'),
  208: require('../../../../../../assets/stickers/sticker_208.json'),
  209: require('../../../../../../assets/stickers/sticker_209.json'),
  210: require('../../../../../../assets/stickers/sticker_210.json'),
  211: require('../../../../../../assets/stickers/sticker_211.json'),
  212: require('../../../../../../assets/stickers/sticker_212.json'),
  213: require('../../../../../../assets/stickers/sticker_213.json'),
  214: require('../../../../../../assets/stickers/sticker_214.json'),
  215: require('../../../../../../assets/stickers/sticker_215.json'),
  216: require('../../../../../../assets/stickers/sticker_216.json'),
  217: require('../../../../../../assets/stickers/sticker_217.json'),
  218: require('../../../../../../assets/stickers/sticker_218.json'),
  219: require('../../../../../../assets/stickers/sticker_219.json'),
  220: require('../../../../../../assets/stickers/sticker_220.json'),
  221: require('../../../../../../assets/stickers/sticker_221.json'),
  222: require('../../../../../../assets/stickers/sticker_222.json'),
  223: require('../../../../../../assets/stickers/sticker_223.json'),
  224: require('../../../../../../assets/stickers/sticker_224.json'),
  225: require('../../../../../../assets/stickers/sticker_225.json'),
  226: require('../../../../../../assets/stickers/sticker_226.json'),
  227: require('../../../../../../assets/stickers/sticker_227.json'),
  228: require('../../../../../../assets/stickers/sticker_228.json'),
  229: require('../../../../../../assets/stickers/sticker_229.json'),
  230: require('../../../../../../assets/stickers/sticker_230.json'),
  231: require('../../../../../../assets/stickers/sticker_231.json'),
  232: require('../../../../../../assets/stickers/sticker_232.json'),
  233: require('../../../../../../assets/stickers/sticker_233.json'),
  234: require('../../../../../../assets/stickers/sticker_234.json'),
  235: require('../../../../../../assets/stickers/sticker_235.json'),
  236: require('../../../../../../assets/stickers/sticker_236.json'),
  237: require('../../../../../../assets/stickers/sticker_237.json'),
  238: require('../../../../../../assets/stickers/sticker_238.json'),
  239: require('../../../../../../assets/stickers/sticker_239.json'),
  240: require('../../../../../../assets/stickers/sticker_240.json'),
  241: require('../../../../../../assets/stickers/sticker_241.json'),
  242: require('../../../../../../assets/stickers/sticker_242.json'),
  243: require('../../../../../../assets/stickers/sticker_243.json'),
  244: require('../../../../../../assets/stickers/sticker_244.json'),
  245: require('../../../../../../assets/stickers/sticker_245.json'),
  246: require('../../../../../../assets/stickers/sticker_246.json'),
  247: require('../../../../../../assets/stickers/sticker_247.json'),
  248: require('../../../../../../assets/stickers/sticker_248.json'),
  249: require('../../../../../../assets/stickers/sticker_249.json'),
  250: require('../../../../../../assets/stickers/sticker_250.json'),
  251: require('../../../../../../assets/stickers/sticker_251.json'),
  252: require('../../../../../../assets/stickers/sticker_252.json'),
  253: require('../../../../../../assets/stickers/sticker_253.json'),
  254: require('../../../../../../assets/stickers/sticker_254.json'),
  255: require('../../../../../../assets/stickers/sticker_255.json'),
  256: require('../../../../../../assets/stickers/sticker_256.json'),
  257: require('../../../../../../assets/stickers/sticker_257.json'),
  258: require('../../../../../../assets/stickers/sticker_258.json'),
  259: require('../../../../../../assets/stickers/sticker_259.json'),
  260: require('../../../../../../assets/stickers/sticker_260.json'),
  261: require('../../../../../../assets/stickers/sticker_261.json'),
  262: require('../../../../../../assets/stickers/sticker_262.json'),
  263: require('../../../../../../assets/stickers/sticker_263.json'),
  264: require('../../../../../../assets/stickers/sticker_264.json'),
  265: require('../../../../../../assets/stickers/sticker_265.json'),
  266: require('../../../../../../assets/stickers/sticker_266.json'),
  267: require('../../../../../../assets/stickers/sticker_267.json'),
  268: require('../../../../../../assets/stickers/sticker_268.json'),
  269: require('../../../../../../assets/stickers/sticker_269.json'),
  270: require('../../../../../../assets/stickers/sticker_270.json'),
  271: require('../../../../../../assets/stickers/sticker_271.json'),
  272: require('../../../../../../assets/stickers/sticker_272.json'),
  273: require('../../../../../../assets/stickers/sticker_273.json'),
  274: require('../../../../../../assets/stickers/sticker_274.json'),
  275: require('../../../../../../assets/stickers/sticker_275.json'),
  276: require('../../../../../../assets/stickers/sticker_276.json'),
  277: require('../../../../../../assets/stickers/sticker_277.json'),
  278: require('../../../../../../assets/stickers/sticker_278.json'),
  279: require('../../../../../../assets/stickers/sticker_279.json'),
  280: require('../../../../../../assets/stickers/sticker_280.json'),
  281: require('../../../../../../assets/stickers/sticker_281.json'),
  282: require('../../../../../../assets/stickers/sticker_282.json'),
  283: require('../../../../../../assets/stickers/sticker_283.json'),
  284: require('../../../../../../assets/stickers/sticker_284.json'),
  285: require('../../../../../../assets/stickers/sticker_285.json'),
  286: require('../../../../../../assets/stickers/sticker_286.json'),
  287: require('../../../../../../assets/stickers/sticker_287.json'),
  288: require('../../../../../../assets/stickers/sticker_288.json'),
  289: require('../../../../../../assets/stickers/sticker_289.json'),
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
  const isDesktop = Platform.OS === 'web' && width >= 768;
  const sheetWidth = isDesktop ? 400 : '100%';
  const containerWidth = isDesktop ? 400 : width;
  const itemSize = (containerWidth - 32 - (NUM_COLUMNS - 1) * 8) / NUM_COLUMNS;

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
          source={
            Platform.OS === 'web'
              ? { uri: `data:application/json;charset=utf-8,${encodeURIComponent(JSON.stringify(STICKER_SOURCES[item]))}` }
              : STICKER_SOURCES[item]
          }
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
      animationType={isDesktop ? "fade" : "slide"}
      onRequestClose={onClose}
    >
      <View style={[styles.overlay, isDesktop && styles.overlayDesktop]}>
        <TouchableOpacity style={styles.backdrop} onPress={onClose} />

        <View style={[
          styles.sheet, 
          { 
            height: isDesktop ? 500 : height * 0.55,
            width: sheetWidth,
            borderRadius: isDesktop ? 24 : undefined,
          }
        ]}>
          {!isDesktop && <View style={styles.handle} />}

          <View style={styles.header}>
            <Text style={styles.title}>Stickers</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={20} color="rgba(255,255,255,0.7)" />
            </TouchableOpacity>
          </View>

          <FlatList
            style={{ flex: 1 }}
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
  overlayDesktop: {
    justifyContent: 'center',
    alignItems: 'center',
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
