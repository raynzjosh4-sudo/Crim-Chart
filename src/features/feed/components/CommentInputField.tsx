import React, { useState } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { Camera, Send } from 'lucide-react-native';
import { colors } from '@/core/theme/colors';

interface CommentInputFieldProps {
  onSend: (text: string) => void;
  onImageTap?: () => void;
  onTap?: () => void;
}

export const CommentInputField: React.FC<CommentInputFieldProps> = ({ onSend, onImageTap, onTap }) => {
  const [text, setText] = useState('');

  const handleSend = () => {
    if (text.trim()) {
      onSend(text);
      setText('');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputRow}>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Add comment..."
            placeholderTextColor="rgba(255, 255, 255, 0.38)"
            value={text}
            onChangeText={setText}
            onFocus={onTap}
            multiline
          />
          <TouchableOpacity activeOpacity={1} onPress={onImageTap} style={styles.cameraButton}>
            <Camera size={22} color="#FFF" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity activeOpacity={1} 
          style={styles.sendButton} 
          onPress={handleSend}
          disabled={!text.trim()}
        >
          <Send 
            size={28} 
            color={text.trim() ? colors.primary : 'rgba(255, 255, 255, 0.24)'} 
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
    backgroundColor: '#000',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  inputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 24,
    paddingHorizontal: 14,
    minHeight: 42,
    maxHeight: 120,
  },
  input: {
    flex: 1,
    color: '#FFF',
    fontSize: 15,
    paddingVertical: 10,
  },
  cameraButton: {
    paddingLeft: 8,
  },
  sendButton: {
    padding: 4,
  },
});
