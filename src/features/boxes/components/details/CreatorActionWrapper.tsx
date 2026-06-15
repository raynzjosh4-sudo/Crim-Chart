import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useAuthStore } from '@/features/auth/application/useAuthStore';
import { Plus } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface Props {
  ownerId?: string;
  onAddPress: () => void;
  children: React.ReactNode;
}

export function CreatorActionWrapper({ ownerId, onAddPress, children }: Props) {
  const user = useAuthStore(state => state.user);
  const insets = useSafeAreaInsets();
  
  // Conditionally show the plus button if current user is the box creator
  // For dev/testing, we can optionally treat some cases as true, but strictly it's:
  const isCreator = user && ownerId && user.id === ownerId;

  return (
    <View style={styles.container}>
      {children}
      {isCreator && (
        <TouchableOpacity 
          style={[styles.fab, { bottom: Math.max(insets.bottom + 24, 24) }]} 
          onPress={onAddPress}
        >
          <Plus color="#FFF" size={24} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  fab: {
    position: 'absolute',
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#9C27B0',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  }
});
