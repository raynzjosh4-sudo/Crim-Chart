import { Plus } from "lucide-react-native";
import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { styles } from "../../app/channel/styles/_channelStyyles.styles";


// Simple Add Status card just for this context as seen in screenshot
export const AddStatusCard = ({ userImage, onstatusWidgetImageTaped }: { userImage: string | undefined; onstatusWidgetImageTaped: () => void }) => (
    <TouchableOpacity activeOpacity={1} onPress={onstatusWidgetImageTaped} style={styles.addStatusCard}>
        <View style={styles.addStatusAvatarContainer}>
            <Image source={{ uri: userImage!! }} style={styles.addStatusAvatar} />
            <View style={styles.addStatusPlus}>
                <Plus size={10} color="#000" />
            </View>
        </View>
        <Text style={styles.addStatusLabel}>Add status</Text>
    </TouchableOpacity>
);
