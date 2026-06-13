import React, { useState, useRef } from 'react';
import { supabase } from '@/core/supabase/supabaseConfig';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useLiveStatusViews } from '@/hooks/useLiveStatusViews';
import { StatusViewsMenuDialog } from './StatusViewsMenuDialog';

interface ProfileStatusViewsBadgeProps {
  userId?: string;
  children: React.ReactNode;
  onNavigateToProfile: () => void;
}

export const ProfileStatusViewsBadge: React.FC<ProfileStatusViewsBadgeProps> = ({ 
  userId, 
  children, 
  onNavigateToProfile 
}) => {
  const router = useRouter();
  const { viewsCount } = useLiveStatusViews(userId);
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState<{ x: number; y: number } | null>(null);

  const triggerRef = useRef<any>(null);

  const handlePress = () => {
    if (viewsCount === 0) {
      onNavigateToProfile();
    } else {
      triggerRef.current?.measure((x, y, width, height, pageX, pageY) => {
        setMenuAnchor({ x: pageX, y: pageY });
        setMenuVisible(true);
      });
    }
  };

  const handleViewers = () => {
    setMenuVisible(false);
    router.push('/status-viewers');
  };

  const handleProfile = () => {
    setMenuVisible(false);
    onNavigateToProfile();
  };

  return (
    <View style={{ alignItems: 'center', justifyContent: 'center' }}>
      <TouchableOpacity activeOpacity={0.8} onPress={handlePress} style={styles.container} ref={triggerRef}>
        {children}
        {viewsCount > 0 && (
          <View style={styles.badgeContainer}>
            <Text style={styles.badgeText}>{viewsCount}</Text>
          </View>
        )}
      </TouchableOpacity>

      <StatusViewsMenuDialog
        visible={menuVisible}
        onClose={() => setMenuVisible(false)}
        anchor={menuAnchor}
        widgetSize={50}
        onViewersPress={handleViewers}
        onProfilePress={handleProfile}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    alignSelf: 'flex-start',
  },
  badgeContainer: {
    position: 'absolute',
    top: -2,
    right: -4,
    backgroundColor: '#FF3B30', 
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 5,
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
});
