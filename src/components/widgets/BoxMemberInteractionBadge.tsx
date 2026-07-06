import { useStyles } from "@/core/hooks/useStyles";
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { supabase } from '@/core/supabase/supabaseConfig';
interface BoxMemberInteractionBadgeProps {
  userId: string;
  boxId: string;
}
export const BoxMemberInteractionBadge: React.FC<BoxMemberInteractionBadgeProps> = ({
  userId,
  boxId
}) => {
  const styles = useStyles(colors => ({
    badge: {
      position: 'absolute',
      top: 0,
      right: 0,
      backgroundColor: '#FF2D55',
      // Nice punchy red for the badge
      borderRadius: 12,
      minWidth: 22,
      height: 22,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 4,
      borderWidth: 2,
      borderColor: colors.background,
      // Matches the dark background to cut out the avatar
      zIndex: 10,
      elevation: 5,
      shadowColor: colors.background,
      shadowOffset: {
        width: 0,
        height: 2
      },
      shadowOpacity: 0.3,
      shadowRadius: 2
    },
    badgeText: {
      color: colors.text,
      fontSize: 10,
      fontWeight: '800'
    }
  }));
  const [count, setCount] = useState<number>(0);
  useEffect(() => {
    if (!userId || !boxId) return;
    const fetchCount = async () => {
      // We do a head-only query to get just the count, which is extremely fast!
      const {
        count,
        error
      } = await supabase.from('box_item_reactions').select('id, box_items!inner(box_id)', {
        count: 'exact',
        head: true
      }).eq('user_id', userId).eq('box_items.box_id', boxId);
      if (!error && count !== null) {
        setCount(count);
      }
    };
    fetchCount();
  }, [userId, boxId]);
  if (count === 0) return null;
  return <View style={styles.badge}>
      <Text style={styles.badgeText}>{count > 99 ? '99+' : count}</Text>
    </View>;
};