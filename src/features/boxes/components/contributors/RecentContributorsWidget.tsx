import UserAvatar from '@/components/avatar/UserAvatar';
import { BoxMemberInteractionBadge } from '@/components/widgets/BoxMemberInteractionBadge';
import { Plus } from 'lucide-react-native';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export interface Contributor {
  id: string;
  avatarUrl: string;
  name: string;
}

interface RecentContributorsWidgetProps {
  contributors: Contributor[];
  boxId?: string;
  label?: string;
  selectedMemberId?: string | null;
  onSelectMember?: (id: string | null) => void;
  onAddPress?: () => void;
}

export const RecentContributorsWidget: React.FC<RecentContributorsWidgetProps> = ({
  contributors,
  boxId,
  label = "Members",
  selectedMemberId,
  onSelectMember,
  onAddPress
}) => {
  if (!contributors) return null;

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.avatarWrapper}>
          <TouchableOpacity style={styles.addBtn} onPress={onAddPress}>
            <Plus size={24} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.name} numberOfLines={1}>Add</Text>
        </View>

        {contributors.map((user) => {
          const isSelected = selectedMemberId === user.id;
          return (
            <TouchableOpacity
              key={user.id}
              style={[styles.avatarWrapper]}
              onPress={() => onSelectMember?.(isSelected ? null : user.id)}
            >
              <View style={[styles.avatarRing, isSelected && styles.selectedRing]}>
                <UserAvatar
                  userId={user.id}
                  fallbackUrl={user.avatarUrl}
                  name={user.name}
                  size={100}
                />
                {!!boxId && <BoxMemberInteractionBadge userId={user.id} boxId={boxId} />}
              </View>
              <Text style={[styles.name, isSelected && styles.selectedName]} numberOfLines={1}>{user.name.split(' ')[0]}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
    marginBottom: 8,
  },
  label: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    paddingHorizontal: 16,
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  scrollContent: {
    paddingHorizontal: 16,
  },
  avatarWrapper: {
    alignItems: 'center',
    marginRight: 16,
    width: 110, // Fixed width prevents jumpiness and keeps text centered
  },
  avatarRing: {
    padding: 2,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedRing: {
    borderColor: '#4DA2FF',
  },
  name: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 6,
    textAlign: 'center',
  },
  selectedName: {
    color: '#4DA2FF',
    fontWeight: '800',
  },
  addBtn: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.2)',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
  }
});
// Touch for Metro bundler
