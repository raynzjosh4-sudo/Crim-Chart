import { Text, View } from "react-native";
import { styles } from "../styles/_channelStyyles.styles";

// Date Divider for chat
export const DateDivider = ({ date }: { date: string }) => (
    <View style={styles.dateDividerContainer}>
        <View style={styles.dateLine} />
        <Text style={styles.dateText}>{date}</Text>
        <View style={styles.dateLine} />
    </View>
);
