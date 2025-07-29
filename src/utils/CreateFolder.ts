// fileUtils.ts
import RNFS from 'react-native-fs';
import { Alert } from 'react-native';

export const createFolder = async (currentPath: string): Promise<boolean> => {
  try {
    // Keep trying until a unique folder name is found
    let success = false;
    let attempt = 0;
    let newFolderPath = '';

    while (!success && attempt < 50) {
      const folderName = `New Folder ${Math.floor(Math.random() * 1000)}`;
      newFolderPath = `${currentPath}/${folderName}`;

      const exists = await RNFS.exists(newFolderPath);
      if (!exists) {
        await RNFS.mkdir(newFolderPath);
        Alert.alert('Success', `Created folder: ${folderName}`);
        success = true;
        return true;
      }
      attempt++;
    }

    Alert.alert('Error', 'Failed to create a unique folder name');
    return false;
  } catch (error) {
    console.error('Error creating folder:', error);
    Alert.alert('Error', 'Failed to create folder');
    return false;
  }
};
