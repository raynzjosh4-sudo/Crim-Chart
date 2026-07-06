import { useCurrentTheme } from "@/core/store/useThemeStore";
import { useStyles } from "@/core/hooks/useStyles";
import { w, h, r, sp } from '@/core/utils/responsive_size';
import { Camera, Send } from 'lucide-react-native';
import React from 'react';
import { Platform, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Reusing your design configurations
import { useAppTheme } from '@/core/theme/app_theme'; // Assuming you have a theme provider set up

// Mock translation function - replace with your context.tr path
const t = (key: string) => key === 'message' ? 'Message' : key;

// Stub matching your custom button component signature

interface CommentInputFieldProps {
  value: string; // Replaces Flutter's controller tracking
  onChangeText: (text: string) => void;
  onSend: (text: string) => void;
  onImageTap?: () => void;
  onLongPressStart?: () => void;
  onLongPressEnd?: () => void;
  userImageUrl?: string; // Declared in Flutter but layout left unused
  hasMedia?: boolean;
  showTextField?: boolean;
  isTikTokStyle?: boolean;
  autoFocus?: boolean;
  onTap?: () => void;
}
export default function CommentInputField({
  value,
  onChangeText,
  onSend,
  onImageTap,
  onLongPressStart,
  onLongPressEnd,
  userImageUrl,
  onTap,
  hasMedia = false,
  showTextField = true,
  isTikTokStyle = false,
  autoFocus = false
}: CommentInputFieldProps) {
  const styles = useStyles(colors => ({
    outerContainer: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      paddingHorizontal: 16,
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: 'rgba(255,255,255,0.1)',
      backgroundColor: '#0A0A0A'
    },
    textInput: {
      flex: 1,
      backgroundColor: 'rgba(255,255,255,0.05)',
      borderRadius: 20,
      paddingHorizontal: 16,
      paddingTop: 10,
      paddingBottom: 10,
      color: colors.text,
      fontSize: 14,
      maxHeight: 100,
      minHeight: 40
    },
    iconPadding: {
      paddingLeft: 8,
      paddingBottom: 10
    },
    sendBtn: {
      width: 40,
      height: 40,
      justifyContent: 'center',
      alignItems: 'center',
      marginLeft: 8
    }
  }));
  const insets = useSafeAreaInsets();
  const theme = useAppTheme();

  // Replicates: value.text.isNotEmpty || hasMedia
  const showSend = value.trim().length > 0 || hasMedia;
  return <View style={[styles.outerContainer, {
    paddingBottom: Math.max(insets.bottom, 12)
  }]}>
            {showTextField ? <>
                    <TextInput value={value} onChangeText={onChangeText} autoFocus={autoFocus} editable={!onTap} onTouchStart={onTap} multiline placeholder={isTikTokStyle ? 'Add comment...' : t('message')} placeholderTextColor="rgba(255, 255, 255, 0.4)" style={styles.textInput} />

                    {isTikTokStyle && <Pressable onPress={onImageTap} style={styles.iconPadding}>
                            <Camera size={20} color="rgba(255, 255, 255, 0.6)" />
                        </Pressable>}
                </> : <View style={{
      flex: 1
    }} />}

            <Pressable style={[styles.sendBtn, !showSend && {
      opacity: 0.5
    }]} onPress={showSend ? () => onSend(value) : undefined} disabled={!showSend}>
                <Send size={20} color={showSend ? theme.colors.primary : theme.colors.text} />
            </Pressable>
        </View>;
}

// --- STYLES ---