import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Plus } from 'lucide-react-native';
import { useRouter } from 'expo-router';

interface CreateChannelButtonProps {
  onPress?: () => void;
  label?: string;
}

export const CreateChannelButton: React.FC<CreateChannelButtonProps> = ({
  onPress,
  label = 'Create Channel',
}) => {
  const router = useRouter();

  const handlePress = () => {
    if (onPress) onPress();
    router.push('/channel/create');
  };

  return (
    <TouchableOpacity style={styles.button} onPress={handlePress} activeOpacity={0.85}>
      <Plus color="#000" size={18} />
      <Text style={styles.label}>{label}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FACD11',
    borderRadius: 22,
    paddingHorizontal: 20,
    paddingVertical: 10,
    gap: 8,
    alignSelf: 'flex-start',
  },
  label: {
    color: '#000',
    fontWeight: '800',
    fontSize: 14,
  },
});
