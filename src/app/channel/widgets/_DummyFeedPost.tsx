import { Image, Text, TouchableOpacity, View } from "react-native";
import { styles } from "../styles/_channelStyyles.styles";

// Dummy Feed Post Placeholder just to match the screenshot exactly
export const DummyFeedPost = () => (
    <View style={styles.feedPostContainer}>
        <View style={styles.feedPostHeader}>
            <Image source={{ uri: 'https://i.pravatar.cc/150?img=33' }} style={styles.feedAvatar} />
            <Text style={styles.feedAuthor}>raynz</Text>
        </View>
        <Text style={styles.feedContent}>
            🚀 Hey! Join my other channel: the good ones that are now in
        </Text>
        <View style={styles.inviteCard}>
            <View style={styles.inviteCardLeft}>
                <View style={styles.inviteChannelAvatar} />
                <View style={styles.inviteChannelInfo}>
                    <Text style={styles.inviteChannelTitle} numberOfLines={1}>the good ones that ar...</Text>
                    <Text style={styles.inviteChannelSub}>you r to get a list and in the ...</Text>
                </View>
            </View>
            <TouchableOpacity style={styles.joinButton}>
                <Text style={styles.joinButtonText}>JOIN</Text>
            </TouchableOpacity>
        </View>
    </View>
);
