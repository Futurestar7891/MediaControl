import { View, Alert, ActivityIndicator, StyleSheet } from 'react-native';
import React, { useEffect, useState, useCallback } from 'react';
import { launchCamera } from 'react-native-image-picker';
import { useNavigation } from '@react-navigation/native';
import { useFileManagerContext } from '../FileManagerContext';
import { saveAsImage, saveAsPdf } from '../utils/SaveImageOrPdf';

const Camera = () => {
    const [loading, setLoading] = useState(false);
    const navigation = useNavigation();
    const { currentPath, trackFile } = useFileManagerContext();

    const handleSaveOperation = useCallback(async (type: 'image' | 'pdf', uri: string) => {
        setLoading(true);
        try {
            const timestamp = Date.now();
            const fileName = `DOC_${timestamp}`;
            let result;

            if (type === 'image') {
                const filePath = `${currentPath}/${fileName}.jpg`;
                result = await saveAsImage(uri, filePath);
                if (result.success) {
                    await trackFile(filePath);
                }
            } else {
                const filePath = `${currentPath}/${fileName}.pdf`;
                result = await saveAsPdf(uri, fileName, currentPath);
                if (result.success) {
                    await trackFile(filePath);
                }
            }

            if (result.success) {
                Alert.alert('Success', `${type.toUpperCase()} saved successfully!`);
            } else {
                Alert.alert('Error', result.message || `Failed to save ${type}`);
            }
        } finally {
            setLoading(false);
            navigation.goBack();
        }
    }, [currentPath, navigation, trackFile]);

    const handleCapture = useCallback(async () => {
        try {
            const result = await launchCamera({
                mediaType: 'photo',
                saveToPhotos: false,
                quality: 0.8
            });

            if (result.didCancel || !result.assets?.[0]?.uri) {
                navigation.goBack();
                return;
            }

            const imageUri = result.assets[0].uri;

            Alert.alert(
                'Save Photo',
                'Save photo as...',
                [
                    {
                        text: 'Image',
                        onPress: () => handleSaveOperation('image', imageUri)
                    },
                    {
                        text: 'PDF',
                        onPress: () => handleSaveOperation('pdf', imageUri)
                    },
                    {
                        text: 'Cancel',
                        style: 'cancel',
                        onPress: () => navigation.goBack(),
                    },
                ],
                { cancelable: false }
            );
        } catch (error) {
            Alert.alert('Error', 'Failed to capture image');
            navigation.goBack();
        }
    }, [navigation, handleSaveOperation]);

    useEffect(() => {
        handleCapture();
    }, [handleCapture]);

    return (
        <View style={styles.container}>
            {loading && <ActivityIndicator size="large" color="#0000ff" />}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'black',
    },
});

export default Camera;