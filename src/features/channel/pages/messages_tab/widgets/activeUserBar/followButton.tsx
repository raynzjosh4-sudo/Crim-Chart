import { StyleSheet, Text, TouchableOpacity } from "react-native";



export const FollowButton = ({ onFollow }: {
    onFollow: Function
}) => {
    return <TouchableOpacity activeOpacity={1} style={styles.followButton}>
        <Text style={styles.followText}>+ Follow</Text>
    </TouchableOpacity>
}
const styles = StyleSheet.create({
    followButton: { backgroundColor: '#FFC400', paddingVertical: 10, paddingHorizontal: 18, borderRadius: 8, marginRight: 8 },
    followText: { color: '#000', fontWeight: '800' },

})