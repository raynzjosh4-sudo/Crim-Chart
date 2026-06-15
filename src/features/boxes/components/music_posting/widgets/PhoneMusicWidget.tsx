import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ChevronDown, ChevronUp, Smartphone } from 'lucide-react-native';

export const PhoneMusicWidget: React.FC<{ onPress?: () => void; isExpanded?: boolean }> = ({ onPress, isExpanded }) => {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.leftContent}>
        <Smartphone size={18} color="#FFF" style={styles.icon} />
        <Text style={styles.title}>Load from device</Text>
      </View>
      {isExpanded ? (
        <ChevronUp size={18} color="rgba(255,255,255,0.5)" />
      ) : (
        <ChevronDown size={18} color="rgba(255,255,255,0.5)" />
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    width: '100%',
    marginBottom: 24,
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  leftContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: 8,
  },
  title: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  }
});
