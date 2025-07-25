// 📄 Camera.tsx
import {
    View,
    Alert,
    ActivityIndicator,
    StyleSheet,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { launchCamera } from 'react-native-image-picker';
import { useNavigation } from '@react-navigation/native';
import { useFileManagerContext } from '../FileManagerContext';
import { saveAsImage, saveAsPdf } from '../utils/SaveImageOrPdf'

const Camera = () => {
    const { appRootPath } = useFileManagerContext();
    const navigation = useNavigation();
    const [loading, setLoading] = useState(false);

    const handleCapture = async () => {
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
            const imagePath = `${appRootPath}/${imageName}`;
            const pdfName = `IMG_${timestamp}.pdf`;

            Alert.alert(
                'Save Photo',
                'Save photo as...',
                [
                    {
                        text: 'Image',
                        onPress: async () => {
                            setLoading(true);
                            await saveAsImage(
                                originalUri,
                                imagePath,
                                () => {
                                    setLoading(false);
                                    navigation.goBack();
                                },
                                () => {
                                    setLoading(false);
                                }
                            );
                        },
                    },
                    {
                        text: 'PDF',
                        onPress: async () => {
                            setLoading(true);
                            await saveAsPdf(
                                originalUri,
                                pdfName,
                                () => {
                                    setLoading(false);
                                    navigation.goBack();
                                },
                                () => {
                                    setLoading(false);
                                }
                            );
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
    };

    useEffect(() => {
        handleCapture();
    }, []);

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
