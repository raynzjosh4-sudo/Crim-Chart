import ChartAppBar from '@/components/chartappbar/ChartAppBar';
import { colors } from '@/core/theme/colors';
import { useRouter } from 'expo-router';
import { Check } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { FlatList, Image, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const CHANNELS = Array.from({ length: 15 }, (_, i) => ({
  id: i,
  name: `Channel ${i + 1}`,
  members: (i + 1) * 123,
  icon: `https://i.pravatar.cc/150?u=channel${i}`,
}));

export default function ChannelSuggestionsPage() {
  const router = useRouter();
  const [selectedChannels, setSelectedChannels] = useState<Set<number>>(new Set());

  useEffect(() => {
    // Select first 10 by default
    const initial = new Set<number>();
    for (let i = 0; i < 10; i++) initial.add(i);
    setSelectedChannels(initial);
  }, []);

  const toggleChannel = (id: number) => {
    const next = new Set(selectedChannels);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedChannels(next);
  };

  const handleFinish = () => {
    router.replace('/' as any);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ChartAppBar
        title=""
        showBorder
        actions={[
          <TouchableOpacity
            key="skip"
            onPress={handleFinish}
          >
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
        ]}
      />

      <View style={styles.content}>
        <Text style={styles.title}>Channels for you</Text>
        <Text style={styles.subtitle}>
          Based on your interests, we think you'll love these channels. Select at least 3 to get started.
        </Text>

        <View style={styles.spacerMedium} />

        <FlatList
          data={CHANNELS}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.listPadding}
          renderItem={({ item }) => {
            const isSelected = selectedChannels.has(item.id);
            return (
              <TouchableOpacity
                style={[styles.channelItem, isSelected && styles.channelItemSelected]}
                onPress={() => toggleChannel(item.id)}
              >
                <Image source={{ uri: item.icon }} style={styles.channelIcon} />
                <View style={styles.channelInfo}>
                  <Text style={styles.channelName}>{item.name}</Text>
                  <Text style={styles.memberCount}>{item.members} members</Text>
                </View>
                <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
                  {isSelected && <Check size={14} color="#000" />}
                </View>
              </TouchableOpacity>
            );
          }}
        />

        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.finishButton, selectedChannels.size < 3 && styles.finishButtonDisabled]}
            onPress={handleFinish}
            disabled={selectedChannels.size < 3}
          >
            <Text style={styles.finishButtonText}>Finish</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
  },
  title: {
    color: colors.text,
    fontSize: 24,
    fontWeight: 'bold',
    paddingHorizontal: 24,
    marginTop: 20,
  },
  subtitle: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 14,
    paddingHorizontal: 24,
    marginTop: 8,
  },
  spacerMedium: {
    height: 16,
  },
  listPadding: {
    paddingHorizontal: 24,
    paddingBottom: 100,
  },
  channelItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  channelItemSelected: {
    backgroundColor: 'rgba(255, 179, 0, 0.05)',
    borderColor: colors.primary,
  },
  channelIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  channelInfo: {
    flex: 1,
    marginLeft: 16,
  },
  channelName: {
    color: colors.text,
    fontSize: 16,
    fontWeight: 'bold',
  },
  memberCount: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 12,
    marginTop: 4,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 24,
    backgroundColor: colors.background,
  },
  finishButton: {
    backgroundColor: colors.primary,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  finishButtonDisabled: {
    opacity: 0.5,
  },
  finishButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  skipText: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

