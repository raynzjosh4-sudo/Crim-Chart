import { Text, View } from "react-native";
import { useChannelStyles } from "../styles/_channelStyyles.styles";

// Date Divider for chat
export const DateDivider = ({ date }: { date: string }) => {
    const styles = useChannelStyles();
    return (
        <View style={styles.dateDividerContainer}>
            <View style={styles.dateLine} />
            <Text style={styles.dateText}>{date}</Text>
            <View style={styles.dateLine} />
        </View>
    );
};

export default function IgnoredRoute() { return null; }
