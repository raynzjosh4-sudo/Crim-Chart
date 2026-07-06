import { useStyles } from "@/core/hooks/useStyles";
import { useRouter } from 'expo-router';
import { ChevronRight, Music, Play, ShoppingBag } from 'lucide-react-native';
import { useEffect, useRef } from 'react';
import { Animated, Modal, PanResponder, StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback, View, Platform, useWindowDimensions } from 'react-native';
export type BoxCategory = 'audio' | 'video' | 'marketplace' | 'sports' | 'contest';
interface CreateBoxSheetProps {
  visible: boolean;
  onClose: () => void;
  menuPosition?: {
    x: number;
    y: number;
    width: number;
    height: number;
  } | null;
  onSelectCategory?: (category: BoxCategory) => void;
}
export const CreateBoxSheet: React.FC<CreateBoxSheetProps> = ({
  visible,
  onClose,
  menuPosition,
  onSelectCategory
}) => {
  const styles = useStyles(colors => ({
    overlay: {
      flex: 1,
      justifyContent: 'flex-end'
    },
    desktopOverlay: {
      flex: 1
    },
    backdrop: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0,0,0,0.7)'
    },
    desktopBackdrop: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'transparent'
    },
    container: {
      width: '100%',
      backgroundColor: '#0D0D0D',
      // Match app background
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      paddingBottom: 40
    },
    dragHandle: {
      width: 40,
      height: 4,
      backgroundColor: 'rgba(255,255,255,0.2)',
      borderRadius: 2,
      marginTop: 12,
      marginBottom: 16
    },
    header: {
      alignItems: 'center',
      paddingHorizontal: 24,
      marginBottom: 24
    },
    headerTitle: {
      color: colors.text,
      fontSize: 16,
      fontWeight: '900',
      marginBottom: 4
    },
    headerSubtitle: {
      color: 'rgba(255,255,255,0.5)',
      fontSize: 13,
      fontWeight: '500'
    },
    listContainer: {
      paddingHorizontal: 16
    },
    optionRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 10,
      paddingHorizontal: 10,
      borderRadius: 16,
      marginBottom: 6,
      backgroundColor: 'rgba(255,255,255,0.03)'
    },
    iconContainer: {
      width: 36,
      height: 36,
      borderRadius: 10,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12
    },
    textContainer: {
      flex: 1
    },
    optionTitle: {
      color: colors.text,
      fontSize: 14,
      fontWeight: '800',
      marginBottom: 2
    },
    optionSubtitle: {
      color: 'rgba(255,255,255,0.4)',
      fontSize: 11,
      fontWeight: '600'
    }
  }));
  const router = useRouter();
  const pan = useRef(new Animated.ValueXY()).current;
  const {
    width
  } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width >= 768;
  const panResponder = useRef(PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderMove: (e, gestureState) => {
      if (gestureState.dy > 0) {
        pan.setValue({
          x: 0,
          y: gestureState.dy
        });
      }
    },
    onPanResponderRelease: (e, gestureState) => {
      if (gestureState.dy > 100) {
        onClose();
      } else {
        Animated.spring(pan, {
          toValue: {
            x: 0,
            y: 0
          },
          useNativeDriver: false
        }).start();
      }
    }
  })).current;
  useEffect(() => {
    if (visible) {
      pan.setValue({
        x: 0,
        y: 0
      });
    }
  }, [visible]);
  const handleSelectCategory = (category: BoxCategory) => {
    onClose();
    if (isDesktop && onSelectCategory) {
      onSelectCategory(category);
    } else {
      router.push({
        pathname: '/boxes-create/[type]',
        params: {
          type: category
        }
      });
    }
  };
  const categories = [{
    id: 'audio',
    title: 'Audio & Sound',
    subtitle: 'Music, Podcasts, and Voice Notes',
    icon: <Music size={18} color="#1DB954" />,
    color: '#1DB954'
  }, {
    id: 'video',
    title: 'Video & Motion',
    subtitle: 'Movies, Series, and Short Clips',
    icon: <Play size={18} color="#E50914" />,
    color: '#E50914'
  }, {
    id: 'marketplace',
    title: 'Marketplace & Trade',
    subtitle: 'Selling, Swapping, and Bidding',
    icon: <ShoppingBag size={18} color="#FF9900" />,
    color: '#FF9900'
  }
  // {
  //   id: 'sports',
  //   title: 'Sports & Highlights',
  //   subtitle: 'Matches, Scores, and Brackets',
  //   icon: <Trophy size={18} color="#00529B" />,
  //   color: '#00529B'
  // },
  // {
  //   id: 'contest',
  //   title: 'Contests & Voting',
  //   subtitle: 'Competitions, Polls, and Ratings',
  //   icon: <FolderHeart size={18} color="#9C27B0" />,
  //   color: '#9C27B0'
  // }
  ] as const;
  return <Modal visible={visible} transparent animationType={isDesktop ? "fade" : "slide"} onRequestClose={onClose}>
      <View style={isDesktop ? styles.desktopOverlay : styles.overlay}>
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={isDesktop ? styles.desktopBackdrop : styles.backdrop} />
        </TouchableWithoutFeedback>

        <Animated.View style={[styles.container, isDesktop && menuPosition ? {
        position: 'absolute',
        top: menuPosition.y + menuPosition.height + 8,
        left: menuPosition.x,
        width: 320,
        paddingBottom: 24,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        transform: []
      } : {
        transform: [{
          translateY: pan.y
        }]
      }]}>
          {!isDesktop && <View {...panResponder.panHandlers} style={{
          width: '100%',
          alignItems: 'center'
        }}>
              <View style={styles.dragHandle} />
            </View>}
          <View style={[styles.header, isDesktop && {
          marginTop: 24,
          marginBottom: 16,
          paddingHorizontal: 16,
          alignItems: 'flex-start'
        }]}>
            <Text style={styles.headerTitle}>What kind of box are you building?</Text>
          </View>

          <View style={styles.listContainer}>
            {categories.map(cat => <TouchableOpacity key={cat.id} style={styles.optionRow} activeOpacity={0.7} onPress={() => handleSelectCategory(cat.id as BoxCategory)}>
                <View style={[styles.iconContainer, {
              backgroundColor: `${cat.color}1A`
            }]}>
                  {cat.icon}
                </View>
                <View style={styles.textContainer}>
                  <Text style={styles.optionTitle}>{cat.title}</Text>
                  <Text style={styles.optionSubtitle}>{cat.subtitle}</Text>
                </View>
                <ChevronRight size={16} color="rgba(255,255,255,0.2)" />
              </TouchableOpacity>)}
          </View>

        </Animated.View>
      </View>
    </Modal>;
};