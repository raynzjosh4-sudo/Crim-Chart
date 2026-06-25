import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Hash } from 'lucide-react-native';
import { useRouter } from 'expo-router';

export const ChannelButton = () => {
  const router = useRouter();

  return (
    <TouchableOpacity activeOpacity={1} 
      onPress={() => router.push('/channel/explore')} 
      style={styles.container}
    >
      <Hash color="#FFF" size={14} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 28,
    height: 28,
    borderColor: '#FACD11',
    borderWidth: 1.5,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    alignSelf: 'center',
  },
});
