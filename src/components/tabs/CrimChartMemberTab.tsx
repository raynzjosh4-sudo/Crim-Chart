import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { supabase } from '@/core/supabase/client';
import { Star } from 'lucide-react-native';
import AppAvatar from '@/components/avatar/AppAvatar';
import YourDataTab from '@/components/tabs/YourDataTab';
import { MediaData } from '@/components/media/types';
import { colors } from '@/core/theme/colors';

interface CrimChartUserModel {
  id: string;
  displayName: string;
  profileImageUrl: string;
}

export default function CrimChartMemberTab() {
  const [members, setMembers] = useState<CrimChartUserModel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMember, setSelectedMember] = useState<CrimChartUserModel | null>(null);
  const [selectedDataIndices, setSelectedDataIndices] = useState<number[]>([]);

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const currentUserId = user?.id;

      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .limit(30);

      if (error) throw error;

      const loaded: CrimChartUserModel[] = [];
      for (const profile of profiles ?? []) {
        const profileId = profile.id?.toString();
        if (profileId === currentUserId) continue;
        loaded.push({
          id: profileId,
          displayName: profile.display_name?.toString() ?? 'User',
          profileImageUrl:
            profile.profile_image_url?.toString() ?? 'https://i.pravatar.cc/150',
        });
      }

      setMembers(loaded);
    } catch (e) {
      console.error('Error fetching members:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMediaTap = (index: number, _item: MediaData) => {
    setSelectedDataIndices(prev => {
      if (prev.includes(index)) return prev.filter(i => i !== index);
      if (prev.length < 5) return [...prev, index];
      return prev;
    });
  };

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (members.length === 0 && !selectedMember) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyText}>No public members found.</Text>
      </View>
    );
  }

  // Detail view: selected member's public data
  if (selectedMember) {
    return (
      <View style={styles.container}>
        {/* Back Header */}
        <View style={styles.memberHeader}>
          <TouchableOpacity activeOpacity={1}
            onPress={() => {
              setSelectedMember(null);
              setSelectedDataIndices([]);
            }}
            style={styles.backButton}
          >
            <Text style={[styles.backArrow, { color: colors.text }]}>‹</Text>
          </TouchableOpacity>
          <AppAvatar
            size={28}
            imageUrl={selectedMember.profileImageUrl}
          />
          <Text style={[styles.memberName, { color: colors.text }]} numberOfLines={1}>
            {selectedMember.displayName}
          </Text>
        </View>

        <YourDataTab
          targetUserId={selectedMember.id}
          onlyPublic={true}
          selectedIndices={selectedDataIndices}
          onMediaTap={handleMediaTap}
        />
      </View>
    );
  }

  // Member list
  return (
    <FlatList
      data={members}
      keyExtractor={item => item.id}
      contentContainerStyle={styles.list}
      renderItem={({ item }) => (
        <TouchableOpacity activeOpacity={1}
          style={styles.memberRow}
          onPress={() => {
            setSelectedMember(item);
            setSelectedDataIndices([]);
          }}
          activeOpacity={0.7}
        >
          <AppAvatar size={40} imageUrl={item.profileImageUrl} />
          <View style={styles.memberInfo}>
            <Text style={[styles.displayName, { color: colors.text }]}>
              {item.displayName}
            </Text>
            <Text style={[styles.username, { color: 'rgba(255,255,255,0.6)' }]}>
              @{item.displayName}
            </Text>
          </View>
          <Star color="#FFD700" size={18} fill="#FFD700" />
        </TouchableOpacity>
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyText: { color: 'rgba(255,255,255,0.5)' },
  list: { padding: 16 },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  memberInfo: {
    flex: 1,
    marginLeft: 12,
  },
  displayName: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  username: {
    fontSize: 12,
  },
  memberHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 8,
    paddingBottom: 4,
    paddingLeft: 8,
    paddingRight: 16,
  },
  backButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  backArrow: {
    fontSize: 32,
    lineHeight: 36,
    fontWeight: '300',
  },
  memberName: {
    fontWeight: 'bold',
    fontSize: 15,
    flex: 1,
    marginLeft: 8,
  },
});
