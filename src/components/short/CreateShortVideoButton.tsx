import { Plus } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface CreateShortVideoButtonProps {
  onPress: () => void;
}

export const CreateShortVideoButton: React.FC<CreateShortVideoButtonProps> = ({ onPress }) => {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.iconContainer}>
        <Plus size={12} color="#000" strokeWidth={3} />
      </View>
      <Text style={styles.text}>Create Short</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  iconContainer: {
    backgroundColor: '#FFF',
    borderRadius: 8,
    padding: 2,
    marginRight: 4,
  },
  text: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },
});
