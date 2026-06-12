import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Gift, Coins } from 'lucide-react-native';
import { CrimChartUserModel } from '@/profile/models/CrimChartUserModel';

interface ChartStatusCardProps {
  user: CrimChartUserModel;
}

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

export const ChartStatusCard: React.FC<ChartStatusCardProps> = ({ user }) => {
  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.crownIcon}>🏰</Text>
        <View style={{ flex: 1, marginLeft: 16 }}>
          <Text style={styles.label}>CURRENT CHART</Text>
          <Text style={styles.displayName}>{user.displayName}</Text>
        </View>
      </View>

      <View style={styles.badgesRow}>
        <EarningBadge
          label="Gifts Earned"
          value={String(user.giftsEarned ?? 0)}
          color="#FF80AB"
          Icon={Gift}
        />
        <View style={{ width: 16 }} />
        <EarningBadge
          label="Coins Earned"
          value={formatNumber(user.coinsEarned ?? 0)}
          color="#FFB74D"
          Icon={Coins}
        />
      </View>

      <Text style={styles.footnote}>
        Keep building your Chart to earn more rewards!
      </Text>
    </View>
  );
};

interface EarningBadgeProps {
  label: string;
  value: string;
  color: string;
  Icon: React.ComponentType<{ color: string; size: number }>;
}

const EarningBadge: React.FC<EarningBadgeProps> = ({ label, value, color, Icon }) => (
  <View style={{ flex: 1 }}>
    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
      <Icon color={color} size={16} />
      <Text style={[styles.badgeLabel, { marginLeft: 8 }]}>{label.toUpperCase()}</Text>
    </View>
    <Text style={styles.badgeValue}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
  },
  crownIcon: {
    fontSize: 28,
  },
  label: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  displayName: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: 'bold',
  },
  badgesRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  badgeLabel: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  badgeValue: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '900',
  },
  footnote: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 11,
    fontStyle: 'italic',
  },
});
