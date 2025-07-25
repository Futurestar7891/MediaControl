// 📄 utils/saveImageOrPdf.ts
import { Alert } from 'react-native';
import RNFS from 'react-native-fs';
import { createPdf } from 'react-native-pdf-from-image';
import { savePdfToMediaStore } from './savePdfToMediaStore';

export const saveAsImage = async (
  originalUri: string,
  destinationPath: string,
  onSuccess: () => void,
  onError: () => void,
) => {
  try {
    await RNFS.copyFile(originalUri, destinationPath);
    Alert.alert('Saved', 'Image saved successfully');
    onSuccess();
  } catch (err) {
    console.error('Image save error:', err);
    Alert.alert('Error', 'Failed to save image.');
    onError();
  }
};

export const saveAsPdf = async (
  originalUri: string,
  pdfName: string,
  onSuccess: () => void,
  onError: () => void,
) => {
  try {
    const { filePath: pdfCachePath } = await createPdf({
      imagePaths: [originalUri],
      name: pdfName,
      paperSize: 'A4',
    });

    const success = await savePdfToMediaStore(pdfCachePath, pdfName);

    if (success) {
      Alert.alert('Success', 'PDF saved Successfully');
      onSuccess();
    } else {
      Alert.alert('Error', 'Failed to save PDF');
      onError();
    }
  } catch (err) {
    console.error('PDF Save Error:', err);
    Alert.alert('Error', 'Failed to save PDF.');
    onError();
  }
};
