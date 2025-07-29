// // 📄 src/utils/savePdfToMediaStore.ts
// import { NativeModules, Platform } from 'react-native';

// const { MediaStoreSaver } = NativeModules;

// export const savePdfToMediaStore = async (
//   pdfPath: string,
//   fileName: string,
// ): Promise<boolean> => {
//   if (Platform.OS !== 'android') {
//     console.warn('MediaStore is only supported on Android');
//     return false;
//   }

//   try {
//     const result: boolean = await MediaStoreSaver.savePdf(pdfPath, fileName);
//     return result;
//   } catch (error) {
//     console.error('Error saving PDF to MediaStore:', error);
//     return false;
//   }
// };
