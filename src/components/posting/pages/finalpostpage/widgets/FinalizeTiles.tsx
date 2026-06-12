import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { colors } from '@/core/theme/colors';

interface FinalizeListTileProps {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  onTap?: () => void;
  trailing?: React.ReactNode;
}

export const FinalizeListTile: React.FC<FinalizeListTileProps> = ({ icon, title, subtitle, onTap, trailing }) => {
  return (
    <TouchableOpacity style={styles.tile} onPress={onTap} activeOpacity={0.7} disabled={!onTap}>
      <View style={styles.iconContainer}>{icon}</View>
      <View style={styles.textContainer}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      <View style={styles.trailingContainer}>
        {trailing || <ChevronRight color="rgba(255,255,255,0.2)" size={18} />}
      </View>
    </TouchableOpacity>
  );
};

interface FinalizeSwitchTileProps {
  icon: React.ReactNode;
  title: string;
  value: boolean;
  onChanged: (val: boolean) => void;
}

export const FinalizeSwitchTile: React.FC<FinalizeSwitchTileProps> = ({ icon, title, value, onChanged }) => {
  return (
    <View style={styles.tile}>
      <View style={styles.iconContainer}>{icon}</View>
      <View style={styles.textContainer}>
        <Text style={styles.title}>{title}</Text>
      </View>
      <View style={styles.trailingContainer}>
        <Switch
          value={value}
          onValueChange={onChanged}
          trackColor={{ false: 'rgba(255,255,255,0.1)', true: 'rgba(250,205,17,0.5)' }}
          thumbColor={value ? '#FACD11' : '#f4f3f4'}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  tile: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  iconContainer: {
    marginRight: 16,
    opacity: 0.7,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
  },
  subtitle: {
    color: '#FACD11', // primary
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  trailingContainer: {
    marginLeft: 8,
  },
});
