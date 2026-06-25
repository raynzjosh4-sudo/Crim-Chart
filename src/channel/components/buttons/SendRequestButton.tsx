import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { colors } from '@/core/theme/colors';

interface SendRequestButtonProps {
    onPress: () => Promise<void>;
}

export const SendRequestButton: React.FC<SendRequestButtonProps> = ({ onPress }) => {
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);

    const handlePress = async () => {
        if (loading || sent) return;
        setLoading(true);
        try {
            await onPress();
            setSent(true);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    if (sent) {
        return (
            <TouchableOpacity style={[styles.button, styles.sentButton]} disabled>
                <Text style={styles.sentText}>Sent</Text>
            </TouchableOpacity>
        );
    }

    return (
        <TouchableOpacity style={styles.button} onPress={handlePress} disabled={loading}>
            {loading ? (
                <ActivityIndicator size="small" color="#000" />
            ) : (
                <Text style={styles.text}>Send</Text>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        backgroundColor: colors.primary,
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 16,
        minWidth: 70,
        alignItems: 'center',
        justifyContent: 'center',
    },
    sentButton: {
        backgroundColor: '#222',
        borderWidth: 1,
        borderColor: '#333',
    },
    text: {
        color: '#000',
        fontWeight: 'bold',
        fontSize: 13,
    },
    sentText: {
        color: '#888',
        fontWeight: 'bold',
        fontSize: 13,
    }
});
