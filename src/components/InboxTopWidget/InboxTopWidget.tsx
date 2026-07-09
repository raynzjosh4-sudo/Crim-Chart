import { useStyles } from "@/core/hooks/useStyles";
import UserAvatar from '@/components/avatar/UserAvatar';
import { getStatusColor } from '@/profile/utils/ConnectionStatsUtils';
import { StyleSheet, Text, View } from 'react-native';
import { UserConnectionStatsModel } from '@/profile/models/CrimChartUserModel';
export interface InboxTopWidgetProps {
  userId: string;
  displayName: string;
  avatarUrl?: string;
  participantStats: UserConnectionStatsModel | null;
}
export const InboxTopWidget: React.FC<InboxTopWidgetProps> = ({
  userId,
  displayName,
  avatarUrl,
  participantStats
}) => {
  const styles = useStyles(colors => ({
    container: {
      alignItems: 'center',
      paddingTop: 48,
      paddingBottom: 32,
      paddingHorizontal: 16,
      flexGrow: 1,
      justifyContent: 'flex-start'
    },
    avatarRing: {
      borderWidth: 3,
      borderColor: 'transparent',
      borderRadius: 60,
      padding: 4,
      marginBottom: 16
    },
    name: {
      color: colors.text,
      fontSize: 24,
      fontWeight: '900',
      marginBottom: 6
    },
    status: {
      color: colors.text,
      fontSize: 16,
      fontWeight: '700',
      textTransform: 'capitalize',
      marginBottom: 4
    },
    subStatus: {
      color: 'rgba(255,255,255,0.4)',
      fontSize: 13,
      fontWeight: '500',
      textTransform: 'capitalize'
    }
  }));
  // Calculate seriousness (sent + accepted)
  const sentCount = participantStats?.relSentCount || 0;
  const acceptedCount = participantStats?.relAcceptedCount || 0;
  const totalInboxes = sentCount + acceptedCount;

  // We only show the color if the user wants their circle shown
  const ringColor = participantStats?.showStatusCircle !== false ? getStatusColor(totalInboxes) : 'transparent';
  return <View style={styles.container}>
      <View style={[styles.avatarRing, {
      borderColor: ringColor
    }]}>
        <UserAvatar userId={userId} fallbackUrl={avatarUrl} name={displayName} size={100} />
      </View>
      <Text style={styles.name}>{displayName}</Text>
      
      {/* Show Relationship Status if not hidden */}
      {participantStats?.showStatusText !== false && participantStats?.relationshipStatus && (
        <Text style={[styles.status, ringColor !== 'transparent' ? { color: ringColor } : {}]}>
          {participantStats.relationshipStatus}
        </Text>
      )}

      {/* Show Age Preferences if not hidden */}
      {participantStats?.showAgePref !== false && participantStats?.preferredAgeRanges && participantStats.preferredAgeRanges.length > 0 && <Text style={styles.subStatus}>
          Interested in {participantStats.preferredAgeRanges.join(', ')}
        </Text>}

      {/* Show Country Preferences if not hidden */}
      {participantStats?.showCountryPref !== false && participantStats?.preferredCountries && participantStats.preferredCountries.length > 0 && <Text style={styles.subStatus}>
          Mostly dates in {participantStats.preferredCountries.join(', ')}
        </Text>}
    </View>;
};