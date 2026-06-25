import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ChevronLeft, CheckCircle2, Circle } from 'lucide-react-native';
import { colors } from '@/core/theme/colors';

const AGES = ['All Ages', '13+', '16+', '18+', '21+'];

export default function AgeSelectionPage() {
  const router = useRouter();
  const [selectedAge, setSelectedAge] = useState('All Ages');

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity activeOpacity={1} onPress={() => router.back()} style={styles.headerButton}>
          <ChevronLeft size={28} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>SELECT AGE RESTRICTION</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView style={styles.content}>
        {AGES.map((age) => (
          <TouchableOpacity activeOpacity={1} 
            key={age} 
            style={styles.tile} 
            onPress={() => {
              setSelectedAge(age);
              router.back();
            }}
          >
            <Text style={styles.tileTitle}>{age}</Text>
            {age === selectedAge ? (
              <CheckCircle2 size={22} color={colors.primary} />
            ) : (
              <Circle size={22} color="rgba(255,255,255,0.2)" />
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 60,
    paddingHorizontal: 12,
  },
  headerButton: {
    padding: 8,
  },
  headerTitle: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '900',
  },
  content: {
    flex: 1,
    paddingTop: 16,
  },
  tile: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  tileTitle: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
