import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Plus } from 'lucide-react-native';
import { colors } from '@/core/theme/colors';

interface ChannelFilterChipsProps {
  filters: string[];
  activeFilter: string;
  onFilterChanged: (filter: string) => void;

}

export const ChannelFilterChips: React.FC<ChannelFilterChipsProps> = ({
  filters,
  activeFilter,
  onFilterChanged,

}) => {
  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {filters.map((filter) => {
          const isSelected = filter === activeFilter;
          return (
            <TouchableOpacity
              key={filter}
              onPress={() => onFilterChanged(filter)}
              style={[
                styles.chip,
                isSelected ? styles.chipSelected : styles.chipUnselected,
              ]}
            >
              <Text
                style={[
                  styles.chipText,
                  isSelected ? styles.chipTextSelected : styles.chipTextUnselected,
                ]}
              >
                {filter}
              </Text>
            </TouchableOpacity>
          );
        })}

      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 44,
    paddingVertical: 4,
    marginBottom: 8,
  },
  scrollContent: {
    paddingHorizontal: 12,
    gap: 8,
    alignItems: 'center',
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chipSelected: {
    backgroundColor: 'rgba(255, 184, 0, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255, 184, 0, 0.3)',
  },
  chipUnselected: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  chipText: {
    fontSize: 13,
    letterSpacing: 0.1,
  },
  chipTextSelected: {
    color: colors.primary,
    fontWeight: '800',
  },
  chipTextUnselected: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontWeight: '600',
  },
  addButton: {
    width: 44,
    height: 34,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 4,
  },
});
