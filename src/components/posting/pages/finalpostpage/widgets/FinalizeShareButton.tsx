import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Send } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface FinalizeShareButtonProps {
  onTap: () => void;
  isLoading?: boolean;
  statusText?: string;
}

export const FinalizeShareButton: React.FC<FinalizeShareButtonProps> = ({ onTap, isLoading = false, statusText = 'SHARE' }) => {
  const insets = useSafeAreaInsets();
  
  return (
    <View style={[styles.container, { paddingBottom: Math.max(16, insets.bottom + 16) }]}>
      <TouchableOpacity 
        style={styles.button} 
        onPress={onTap} 
        activeOpacity={0.8}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#000" size="small" />
        ) : (
          <>
            <Send color="#000" size={18} />
            <Text style={styles.text}>{statusText}</Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  button: {
    height: 52,
    backgroundColor: '#FACD11', // primary color
    borderRadius: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FACD11',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  text: {
    color: '#000',
    fontWeight: '900',
    fontSize: 14,
    letterSpacing: 1.2,
    marginLeft: 8,
  },
});
