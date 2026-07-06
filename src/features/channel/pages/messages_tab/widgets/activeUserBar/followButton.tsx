import { useStyles } from "@/core/hooks/useStyles";
import { StyleSheet, Text, TouchableOpacity } from "react-native";
export const FollowButton = ({
  onFollow
}: {
  onFollow: Function;
}) => {
  const styles = useStyles(colors => ({
    followButton: {
      backgroundColor: '#FFC400',
      paddingVertical: 10,
      paddingHorizontal: 18,
      borderRadius: 8,
      marginRight: 8
    },
    followText: {
      color: colors.background,
      fontWeight: '800'
    }
  }));
  return <TouchableOpacity activeOpacity={1} style={styles.followButton}>
        <Text style={styles.followText}>+ Follow</Text>
    </TouchableOpacity>;
};