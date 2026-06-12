import { setSelectedAge } from '@/core/store/channelCreateTemp';
import { colors } from '@/core/theme/colors';
import { useRouter } from 'expo-router';
import React from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const OPTIONS = ['All Ages', '13+', '16+', '18+'];

export default function AgeSelectionPage() {
    const router = useRouter();

    const select = (age: string) => {
        setSelectedAge(age);
        router.back();
    };

    return (
        <View style={styles.container}>
            <FlatList
                data={OPTIONS}
                keyExtractor={(i) => i}
                renderItem={({ item }) => (
                    <TouchableOpacity style={styles.row} onPress={() => select(item)}>
                        <Text style={styles.text}>{item}</Text>
                    </TouchableOpacity>
                )}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background, padding: 16 },
    row: { paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.04)' },
    text: { color: colors.text, fontWeight: '700' },
});
