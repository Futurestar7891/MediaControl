// 📄 utils/saveImageOrPdf.ts
// import { Platform } from 'react-native';
import RNFS from 'react-native-fs';
import { createPdf } from 'react-native-pdf-from-image';
// import { savePdfToMediaStore } from './savePdfToMediaStore';

type SaveResult = {
  success: boolean;
  message?: string;
  filePath?: string;
};

export const saveAsImage = async (
  originalUri: string,
  destinationPath: string,
): Promise<SaveResult> => {
  try {
    const cleanUri = originalUri.replace('file://', '');
    await RNFS.copyFile(cleanUri, destinationPath);
    return { success: true, filePath: destinationPath };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Image save failed',
    };
  }
};

export const saveAsPdf = async (
  originalUri: string,
  pdfName: string,
  targetPath: string,
): Promise<SaveResult> => {
  try {
    const cleanUri = originalUri.replace('file://', '');
    const { filePath: pdfCachePath } = await createPdf({
      imagePaths: [cleanUri],
      name: pdfName,
      paperSize: 'A4',
    });

    const finalPath = `${targetPath}/${pdfName}.pdf`;

    // Simply copy the file to destination (works for both platforms)
    await RNFS.copyFile(pdfCachePath, finalPath);

    return { success: true, filePath: finalPath };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'PDF save failed',
    };
  }
};