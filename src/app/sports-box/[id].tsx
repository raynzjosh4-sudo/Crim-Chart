import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Dimensions } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { dummySportsBoxPost } from '@/features/boxes/data/dummySportsBoxData';
import { SportsHighlightTile } from '@/features/boxes/components/details/SportsHighlightTile';
import { RecentContributorsWidget } from '@/features/boxes/components/contributors/RecentContributorsWidget';
import { useBoxDetail } from '@/features/boxes/application/useBoxDetail';
import { ActivityIndicator } from 'react-native';

export default function SportsBoxDetailPage() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const { box: fetchedBox, isLoading } = useBoxDetail(id as string);

  const post = React.useMemo(() => {
    if (!fetchedBox) return dummySportsBoxPost;
    return {
      ...dummySportsBoxPost,
      box: {
        ...dummySportsBoxPost.box,
        title: fetchedBox.title,
        description: (fetchedBox as any).raw?.description || dummySportsBoxPost.box.description,
        coverImageUrl: fetchedBox.coverImageUrl || dummySportsBoxPost.box.coverImageUrl,
      }
    };
  }, [fetchedBox]);
  const [selectedMember, setSelectedMember] = React.useState<string | null>(null);

  const contributors = React.useMemo(() => {
    const map = new Map();
    post.highlights.forEach(h => {
      if (!map.has(h.addedBy.id)) {
        map.set(h.addedBy.id, h.addedBy);
      }
    });
    return Array.from(map.values());
  }, [post]);

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <Text style={styles.boxTitle}>{post.box.title}</Text>
      <Text style={styles.boxDesc}>{post.box.description}</Text>

      {/* Live Scoreboard Header */}
      <View style={styles.scoreboardContainer}>
        <View style={styles.teamColumn}>
          <View style={[styles.teamLogo, { backgroundColor: post.matchStats.homeTeam.logoColor }]} />
          <Text style={styles.teamName}>{post.matchStats.homeTeam.name}</Text>
        </View>
        
        <View style={styles.scoreCenter}>
          <View style={styles.liveBadge}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>LIVE</Text>
          </View>
          <Text style={styles.scoreText}>
            {post.matchStats.homeTeam.score} - {post.matchStats.awayTeam.score}
          </Text>
          <Text style={styles.periodText}>{post.matchStats.period} {post.matchStats.timeRemaining}</Text>
        </View>

        <View style={styles.teamColumn}>
          <View style={[styles.teamLogo, { backgroundColor: post.matchStats.awayTeam.logoColor }]} />
          <Text style={styles.teamName}>{post.matchStats.awayTeam.name}</Text>
        </View>
      </View>

      <RecentContributorsWidget 
        contributors={contributors} 
        selectedMemberId={selectedMember}
        onSelectMember={setSelectedMember}
      />

      <TouchableOpacity activeOpacity={1} style={styles.addHighlightBtn}>
        <View style={styles.addHighlightIcon}>
          <Text style={{color: '#000', fontWeight: '900', fontSize: 16}}>+</Text>
        </View>
        <Text style={styles.addHighlightText}>Add a highlight to this match</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Top Nav Bar */}
      <View style={styles.appBar}>
        <TouchableOpacity activeOpacity={1} onPress={() => router.back()} style={styles.backBtn}>
          <ChevronLeft color="#FFF" size={28} />
        </TouchableOpacity>
        <Text style={styles.appBarTitle}>Live Sports Box</Text>
        <View style={{ width: 28 }} />
      </View>

      {isLoading ? (
        <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
          <ActivityIndicator color="#FFF" size="large" />
        </View>
      ) : (
        <FlatList
          data={selectedMember ? post.highlights.filter(h => h.addedBy.id === selectedMember) : post.highlights}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={renderHeader}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => <SportsHighlightTile highlight={item} />}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  appBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  backBtn: {
    padding: 4,
  },
  appBarTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '700',
  },
  listContent: {
    paddingBottom: 80,
  },
  headerContainer: {
    paddingTop: 16,
    paddingBottom: 24,
    paddingHorizontal: 16,
  },
  boxTitle: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: '900',
    marginBottom: 8,
  },
  boxDesc: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 20,
  },
  scoreboardContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 8,
  },
  teamColumn: {
    alignItems: 'center',
  },
  teamLogo: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginBottom: 6,
  },
  teamName: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '900',
  },
  scoreCenter: {
    alignItems: 'center',
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 6,
  },
  liveDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#EF4444',
    marginRight: 4,
  },
  liveText: {
    color: '#EF4444',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
  scoreText: {
    color: '#FFF',
    fontSize: 28,
    fontWeight: '900',
    fontVariant: ['tabular-nums'],
  },
  periodText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 4,
  },
  addHighlightBtn: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 8,
  },
  addHighlightIcon: {
    backgroundColor: '#FFF',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  addHighlightText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
