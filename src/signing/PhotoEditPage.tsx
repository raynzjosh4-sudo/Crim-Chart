import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, FlatList, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { User, Camera } from 'lucide-react-native';
import { useThemeSettings } from '@/core/theme/theme_provider';
import { useLocalization } from '@/core/localization/LocalizationProvider';
import ChartAppBar from '@/components/chartappbar/ChartAppBar';
import { colors } from '@/core/theme/colors';

export default function PhotoEditPage() {
    const router = useRouter();
    const { tr } = useLocalization();
    const { themeMode } = useThemeSettings();

    const [isLoading, setIsLoading] = useState(false);
    const [pickerVisible, setPickerVisible] = useState(false);

    const handleSave = async () => {
        setIsLoading(true);
        await new Promise(resolve => setTimeout(resolve, 800));
        setIsLoading(false);
        if (router.canGoBack()) {
            router.back();
        } else {
            router.push('/channelIntro' as any);
        }
    };

    const handleChangePhoto = async () => {
        setIsLoading(true);
        await new Promise(resolve => setTimeout(resolve, 800));
        setIsLoading(false);
        setPickerVisible(true);
    };

    const renderGalleryPicker = () => {
        // Generating some dummy images for the gallery mock
        const dummyImages = Array.from({ length: 20 }).map((_, i) => ({
            id: i,
            uri: i === 0 ? 'camera' : `https://i.pravatar.cc/150?u=${i}`,
        }));

        return (
            <Modal visible={pickerVisible} animationType="slide" transparent={true}>
                <View style={styles.modalOverlay}>
                    <View style={[styles.bottomSheet, { backgroundColor: colors.background }]}>
                        <View style={[styles.dragHandle, { backgroundColor: 'rgba(255, 255, 255, 0.2)' }]} />
                        <Text style={[styles.bottomSheetTitle, { color: colors.text }]}>
                            {tr('gallery_title') || 'Gallery'}
                        </Text>
                        <FlatList
                            data={dummyImages}
                            numColumns={3}
                            keyExtractor={item => item.id.toString()}
                            contentContainerStyle={styles.galleryContent}
                            renderItem={({ item }) => {
                                if (item.uri === 'camera') {
                                    return (
                                        <TouchableOpacity 
                                            style={[styles.galleryItem, { backgroundColor: 'rgba(255, 255, 255, 0.05)' }]}
                                            onPress={() => setPickerVisible(false)}
                                        >
                                            <Camera color={colors.text} size={30} />
                                        </TouchableOpacity>
                                    );
                                }
                                return (
                                    <TouchableOpacity 
                                        style={styles.galleryItem}
                                        onPress={() => setPickerVisible(false)}
                                    >
                                        <Image source={{ uri: item.uri }} style={styles.galleryImage} />
                                    </TouchableOpacity>
                                );
                            }}
                        />
                    </View>
                </View>
            </Modal>
        );
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <ChartAppBar 
                title={tr('gallery_title') || 'Gallery'} 
                showBorder={true} 
                isLoading={isLoading}
                backgroundColor={colors.background}
                actions={[
                    <TouchableOpacity key="save" onPress={handleSave} disabled={isLoading} style={styles.actionButton}>
                        <Text style={[styles.saveText, { color: colors.primary }]}>
                            {tr('save') || 'Save'}
                        </Text>
                    </TouchableOpacity>
                ]}
            />
            <SafeAreaView style={styles.safeArea} edges={['bottom', 'left', 'right']}>
                <View style={styles.spacer} />

                <View style={[styles.avatarContainer, { borderColor: 'rgba(255, 255, 255, 0.1)' }]}>
                    <View style={[styles.avatarInner, { backgroundColor: 'rgba(255, 255, 255, 0.05)' }]}>
                        <User color="rgba(255, 255, 255, 0.1)" size={150} />
                    </View>
                </View>

                <View style={styles.spacer} />

                <TouchableOpacity 
                    onPress={handleChangePhoto}
                    disabled={isLoading}
                    style={styles.changePhotoButton}
                >
                    <Text style={[styles.changePhotoText, { color: 'rgba(255, 255, 255, 0.7)' }]}>
                        {tr('change_photo') || 'Change Photo'}
                    </Text>
                </TouchableOpacity>

                <View style={styles.space60} />
            </SafeAreaView>

            {renderGalleryPicker()}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    safeArea: { flex: 1, alignItems: 'center' },
    spacer: { flex: 1 },
    space60: { height: 60 },
    actionButton: {
        paddingHorizontal: 16,
        justifyContent: 'center',
    },
    saveText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    avatarContainer: {
        width: 300,
        height: 300,
        borderRadius: 150,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
    },
    avatarInner: {
        width: '100%',
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    changePhotoButton: {
        paddingVertical: 12,
        paddingHorizontal: 24,
    },
    changePhotoText: {
        fontSize: 16,
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    bottomSheet: {
        height: '70%',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingHorizontal: 16,
        paddingTop: 12,
    },
    dragHandle: {
        width: 40,
        height: 4,
        borderRadius: 2,
        alignSelf: 'center',
        marginBottom: 20,
    },
    bottomSheetTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    galleryContent: {
        paddingBottom: 40,
    },
    galleryItem: {
        flex: 1,
        aspectRatio: 1,
        margin: 4,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
    },
    galleryImage: {
        width: '100%',
        height: '100%',
    },
});
