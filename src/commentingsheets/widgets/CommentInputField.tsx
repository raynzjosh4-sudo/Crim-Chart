import { useStyles } from "@/core/hooks/useStyles";
import AnimatedSendButton from '@/components/ui/AnimatedSendButton';
import { useLocalization } from '@/core/localization/LocalizationProvider';
import { colors } from '@/core/theme/colors';
import { Camera, Send } from 'lucide-react-native';
import { StyleSheet, Text, TextInput, TouchableOpacity, View, ViewStyle } from 'react-native';
interface CommentInputFieldProps {
  controller: {
    value: string;
    onChange: (v: string) => void;
  };
  onSend: (text: string) => void;
  onImageTap?: () => void;
  onLongPressStart?: () => void;
  onLongPressEnd?: () => void;
  userImageUrl?: string | null;
  hasMedia?: boolean;
  showTextField?: boolean;
  isTikTokStyle?: boolean;
  autoFocus?: boolean;
  onTap?: () => void;
  style?: ViewStyle;
}
export default function CommentInputField({
  controller,
  onSend,
  onImageTap,
  onLongPressStart,
  onLongPressEnd,
  userImageUrl,
  hasMedia = false,
  showTextField = true,
  isTikTokStyle = false,
  autoFocus = false,
  onTap,
  style
}: CommentInputFieldProps) {
  const styles = useStyles(colors => ({
    container: {
      paddingHorizontal: 20,
      paddingTop: 16,
      paddingBottom: 16,
      shadowColor: colors.background,
      shadowOffset: {
        width: 0,
        height: -5
      },
      shadowOpacity: 0.05,
      shadowRadius: 10,
      elevation: 8
    },
    row: {
      flexDirection: 'row',
      alignItems: 'flex-end'
    },
    inputWrapper: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 14,
      paddingVertical: 4,
      maxHeight: 120
    },
    input: {
      flex: 1,
      fontSize: 15,
      fontWeight: '400',
      paddingVertical: 10,
      maxHeight: 120
    },
    cameraBtn: {
      paddingLeft: 8,
      paddingVertical: 4
    },
    spacer: {
      flex: 1
    },
    space8: {
      width: 8
    },
    sendCircle: {
      width: 48,
      height: 48,
      borderRadius: 24,
      alignItems: 'center',
      justifyContent: 'center'
    },
    sendCircleShadow: {
      shadowColor: colors.primary,
      shadowOffset: {
        width: 0,
        height: 4
      },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 6
    },
    tiktokSend: {
      padding: 8
    }
  }));
  const {
    tr
  } = useLocalization();
  const showSend = controller.value.trim().length > 0 || hasMedia;
  return <View style={[styles.container, {
    backgroundColor: colors.background
  }, isTikTokStyle && {
    paddingTop: 10,
    paddingBottom: 10
  }, style]}>
      <View style={styles.row}>
        {/* Text Input Area */}
        {showTextField ? <View style={[styles.inputWrapper, {
        backgroundColor: isTikTokStyle ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.08)',
        borderRadius: isTikTokStyle ? 24 : 28,
        minHeight: isTikTokStyle ? 42 : 48
      }]}>
            {onTap ? <TouchableOpacity activeOpacity={0.7} style={[styles.input, {
          justifyContent: 'center'
        }]} onPress={e => {
          e.stopPropagation();
          onTap();
        }}>
                <Text style={{
            color: 'rgba(255,255,255,0.38)',
            fontSize: 15
          }}>
                  {isTikTokStyle ? 'Add comment...' : tr('message') || 'Message'}
                </Text>
              </TouchableOpacity> : <TextInput style={[styles.input, {
          color: 'white'
        }]} placeholder={isTikTokStyle ? 'Add comment...' : tr('message') || 'Message'} placeholderTextColor="rgba(255,255,255,0.38)" value={controller.value} onChangeText={controller.onChange} multiline maxLength={1000} autoFocus={autoFocus} editable={true} />}
            {isTikTokStyle && <TouchableOpacity activeOpacity={1} onPress={e => {
          e.stopPropagation();
          onImageTap?.();
        }} style={styles.cameraBtn}>
                <Camera color="white" size={22} />
              </TouchableOpacity>}
          </View> : <View style={styles.spacer} />}

        <View style={styles.space8} />

        {/* Send / Mic Button */}
        {isTikTokStyle ? <TouchableOpacity activeOpacity={1} onPress={showSend ? () => onSend(controller.value) : undefined} style={styles.tiktokSend}>
            <Send color={showSend ? colors.primary : 'rgba(255,255,255,0.24)'} size={28} />
          </TouchableOpacity> : <View style={[styles.sendCircle, {
        backgroundColor: showSend ? colors.primary : 'rgba(255,255,255,0.08)'
      }, showSend && styles.sendCircleShadow]}>
            <AnimatedSendButton Icon={Send} size={22} color={showSend ? 'white' : 'rgba(255,255,255,0.5)'} onTap={showSend ? () => onSend(controller.value) : () => {}} onLongPressStart={onLongPressStart} onLongPressEnd={onLongPressEnd} />
          </View>}
      </View>
    </View>;
}