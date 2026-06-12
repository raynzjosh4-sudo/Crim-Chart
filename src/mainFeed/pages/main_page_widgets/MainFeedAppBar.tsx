import React from 'react';
import {
  View, Text, TouchableOpacity, Image, StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Bell, Search } from 'lucide-react-native';

interface MainFeedAppBarProps {
  badgeCount?: number;
  onSearchPress?: () => void;
  onBellPress?: () => void;
  logoUrl?: string;
}

export const MainFeedAppBar: React.FC<MainFeedAppBarProps> = ({
  badgeCount = 0,
  onSearchPress,
  onBellPress,
  logoUrl,
}) => {
  return (
    <View style={styles.container}>
      {/* Logo / Brand */}
      <View style={styles.brand}>
        {logoUrl ? (
          <Image source={{ uri: logoUrl }} style={styles.logo} resizeMode="contain" />
        ) : (
          <Text style={styles.brandText}>CrimChart</Text>
        )}
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity onPress={onSearchPress} style={styles.actionBtn}>
          <Search color="#FFF" size={24} />
        </TouchableOpacity>

        <TouchableOpacity onPress={onBellPress} style={styles.actionBtn}>
          <Bell color="#FFF" size={24} />
          {badgeCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{badgeCount > 99 ? '99+' : badgeCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 48,
    paddingBottom: 12,
    backgroundColor: '#0D0D0D',
  },
  brand: {},
  brandText: {
    color: '#FACD11',
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: -1,
  },
  logo: { width: 120, height: 32 },
  actions: { flexDirection: 'row', gap: 4 },
  actionBtn: { padding: 8, position: 'relative' },
  badge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#FF5252',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: '#0D0D0D',
  },
  badgeText: { color: '#FFF', fontSize: 10, fontWeight: '800' },
});
