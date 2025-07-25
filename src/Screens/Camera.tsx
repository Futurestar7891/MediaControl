import {
    View,
    Alert,
    ActivityIndicator,
    StyleSheet,
} from 'react-native';
import React, { useEffect, useState, useCallback } from 'react';
import { launchCamera } from 'react-native-image-picker';
import { useNavigation } from '@react-navigation/native';
import RNFS from 'react-native-fs';
import { createPdf } from 'react-native-pdf-from-image';
import { useFileManagerContext } from '../FileManagerContext';

const Camera = () => {
    const [loading, setLoading] = useState(false);
    const navigation = useNavigation();
    const { currentPath } = useFileManagerContext();

    const handleCapture = useCallback(async () => {
        try {
            const result = await launchCamera({ mediaType: 'photo', saveToPhotos: false });

            if (result.didCancel || !result.assets || result.assets.length === 0) {
                navigation.goBack();
                return;
            }

            const image = result.assets[0];
            const originalUri = image.uri?.replace('file://', '');
            if (!originalUri) {
                Alert.alert('Error', 'No image URI returned.');
                navigation.goBack();
                return;
            }

            const timestamp = Date.now();
            const imageName = `IMG_${timestamp}.jpg`;
            const imagePath = `${currentPath}/${imageName}`;
            const pdfName = `IMG_${timestamp}.pdf`;

            Alert.alert(
                'Save Photo',
                'Save photo as...',
                [
                    {
                        text: 'Image',
                        onPress: async () => {
                            setLoading(true);
                            try {
                                await RNFS.copyFile(originalUri, imagePath);
                                Alert.alert('Saved', 'Image saved successfully');
                            } catch (err) {
                                console.error('Image save error:', err);
                                Alert.alert('Error', 'Failed to save image.');
                            } finally {
                                setLoading(false);
                                navigation.goBack();
                            }
                        },
                    },
                    {
                        text: 'PDF',
                        onPress: async () => {
                            setLoading(true);
                            try {
                                const { filePath: pdfCachePath } = await createPdf({
                                    imagePaths: [originalUri],
                                    name: pdfName,
                                    paperSize: 'A4',
                                });

                                const destinationPath = `${currentPath}/${pdfName}`;
                                await RNFS.copyFile(pdfCachePath, destinationPath);
                                Alert.alert('Success', 'PDF saved Successfully');
                            } catch (err) {
                                console.error('PDF Save Error:', err);
                                Alert.alert('Error', 'Failed to save PDF.');
                            } finally {
                                setLoading(false);
                                navigation.goBack();
                            }
                        },
                    },
                    {
                        text: 'Cancel',
                        style: 'cancel',
                        onPress: () => navigation.goBack(),
                    },
                ],
                { cancelable: false }
            );
        } catch (err) {
            console.error('Camera error:', err);
            Alert.alert('Error', 'Something went wrong while capturing the image.');
            navigation.goBack();
        }
    }, [currentPath, navigation]);

    useEffect(() => {
        handleCapture();
    }, [handleCapture]);

    return (
        <View style={styles.container}>
            {loading && <ActivityIndicator size="large" color="#0000ff" />}
        </View>
    );
};

export default Camera;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});