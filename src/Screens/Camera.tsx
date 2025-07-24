import { View, Alert, ActivityIndicator, StyleSheet, Dimensions } from 'react-native';
import React, { useEffect, useState } from 'react';
import { launchCamera } from 'react-native-image-picker';
import RNFS from 'react-native-fs';
import { useFileManagerContext } from '../FileManagerContext';
import { useNavigation } from '@react-navigation/native';


const Camera = () => {
    const { appRootPath } = useFileManagerContext();
    const currentPath = appRootPath;
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
            const originalUri = image.uri;
            if (!originalUri) {
                Alert.alert('Error', 'No image URI returned.');
                navigation.goBack();
                return;
            }

            const sourcePath = originalUri.startsWith('file://')
                ? originalUri.replace('file://', '')
                : originalUri;

            const timestamp = Date.now();
            const destPath = `${currentPath}/IMG_${timestamp}.jpg`;
            // const pdfName = `IMG_${timestamp}.pdf`;
            // const pdfPath = `${currentPath}/${pdfName}`;

            Alert.alert(
                'Save Photo',
                'Save photo as...',
                [
                    {
                        text: 'Image',
                        onPress: async () => {
                            try {
                                setLoading(true);
                                await RNFS.copyFile(sourcePath, destPath);
                                setLoading(false);
                                navigation.goBack();
                            } catch (err) {
                                console.error('Failed to save image:', err);
                                Alert.alert('Error', 'Failed to save image.');
                                setLoading(false);
                            }
                        },
                    },
                    // {
                    //     text: 'PDF',
                    //     onPress: async () => {
                    //         try {
                    //             setLoading(true);
                    //             // Copy image to app folder in case original is a temp path
                    //             await RNFS.copyFile(sourcePath, destPath);

                    //             const options = {
                    //                 imagePaths: [destPath], // absolute path(s) to images
                    //                 name: pdfName,
                    //                 maxSize: {
                    //                     width: 900,
                    //                     height: Math.round((deviceHeight() / deviceWidth()) * 900),
                    //                 },
                    //                 quality: 0.7,
                    //             };

                    //             const pdf = await RNImageToPdf.createPDFbyImages(options);

                    //             // Move or rename PDF if needed
                    //             if (pdf.filePath !== pdfPath) {
                    //                 await RNFS.moveFile(pdf.filePath, pdfPath);
                    //             }

                    //             setLoading(false);
                    //             navigation.goBack();
                    //         } catch (err) {
                    //             console.error('Failed to save PDF:', err);
                    //             Alert.alert('Error', 'Failed to save PDF.');
                    //             setLoading(false);
                    //         }
                    //     },
                    // },
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
