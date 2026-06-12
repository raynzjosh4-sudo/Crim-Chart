import React, { useEffect, useState } from 'react';
import { View, FlatList, ActivityIndicator, StyleSheet } from 'react-native';
import { useTheme } from '@react-navigation/native';
import ChartAppBar from '@/components/chartappbar/ChartAppBar';
import { tagRemoteSource } from '@/channel/data/sources/TagRemoteSource';
import { TagEntity } from '@/channel/domain/entities/TagEntity';
import TagCard from '@/channel/widgets/TagCard';

export default function TagDiscoveryPage() {
  const { colors } = useTheme();
  const [tags, setTags] = useState<TagEntity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    tagRemoteSource.getTags(0).then(setTags).finally(() => setIsLoading(false));
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ChartAppBar title="Tags" />
      {isLoading
        ? <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} />
        : <FlatList data={tags} keyExtractor={(t) => t.id} renderItem={({ item }) => <TagCard tag={item} />} />
      }
    </View>
  );
}

const styles = StyleSheet.create({ container: { flex: 1 } });
