import { setSelectedCountries } from '@/core/store/channelCreateTemp';
import { colors } from '@/core/theme/colors';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const COUNTRIES = ['Global', 'Uganda', 'Kenya', 'Tanzania', 'United States', 'United Kingdom'];

export default function CountrySelectionPage() {
    const router = useRouter();
    const [selected, setSelected] = useState<string[]>([]);

    const toggle = (c: string) => {
        setSelected(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c]);
    };

    const done = () => {
        setSelectedCountries(selected.length ? selected : ['Global']);
        router.back();
    };

    return (
        <View style={styles.container}>
            <FlatList
                data={COUNTRIES}
                keyExtractor={(i) => i}
                renderItem={({ item }) => (
                    <TouchableOpacity style={styles.row} onPress={() => toggle(item)}>
                        <Text style={styles.text}>{item}</Text>
                        <Text style={styles.check}>{selected.includes(item) ? '✓' : ''}</Text>
                    </TouchableOpacity>
                )}
            />
            <TouchableOpacity style={styles.done} onPress={done}>
                <Text style={styles.doneText}>Done</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background, padding: 16 },
    row: { paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.04)', flexDirection: 'row', justifyContent: 'space-between' },
    text: { color: colors.text, fontWeight: '700' },
    check: { color: colors.primary, fontWeight: '900' },
    done: { margin: 16, backgroundColor: 'rgba(255,255,255,0.04)', padding: 12, borderRadius: 8, alignItems: 'center' },
    doneText: { color: colors.primary, fontWeight: '900' },
});
