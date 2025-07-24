// FileManagerContext.tsx
import React, { createContext, useContext, useEffect } from 'react';
import RNFS from 'react-native-fs';
import { Platform, Linking, Alert } from 'react-native';
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';

export type FileManagerContextType = {
    appRootPath: string;
};

export const FileManagerContext = createContext<FileManagerContextType | undefined>(undefined);

export const useFileManagerContext = () => {
    const context = useContext(FileManagerContext);
    if (!context) {
        throw new Error("useFileManagerContext must be used within a FileManagerContextProvider");
    }
    return context;
};

export const FileManagerContextProvider = ({ children }: { children: React.ReactNode }) => {
    const appRootPath = `${RNFS.ExternalStorageDirectoryPath}/DCIM/myapp`;

    const requestStoragePermissions = async () => {
        if (Platform.OS === 'android') {
            try {
                const permission =
                    Platform.Version >= 33
                        ? PERMISSIONS.ANDROID.READ_MEDIA_IMAGES
                        : PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE;

                let result = await check(permission);
                console.log(`Checking permission (${permission}):`, result);

                if (result === RESULTS.DENIED) {
                    result = await request(permission);
                    console.log(`Request result (${permission}):`, result);
                }

                if (result === RESULTS.BLOCKED || result === RESULTS.LIMITED) {
                    console.error('Storage permissions permanently denied. Please enable in settings.');
                    Alert.alert(
                        'Storage Permission Required',
                        `Please enable storage permissions in Settings > Apps > ManageMedia > Permissions > ${Platform.Version >= 33 ? 'Photos and videos' : 'Storage'}.`,
                        [
                            { text: 'Cancel', style: 'cancel' },
                            { text: 'Open Settings', onPress: () => Linking.openSettings() },
                        ]
                    );
                    return false;
                }
                return result === RESULTS.GRANTED;
            } catch (err) {
                console.error('Permission request error:', err);
                return false;
            }
        }
        return true;
    };

    useEffect(() => {
        const init = async () => {
            try {
                const hasPermission = await requestStoragePermissions();
                if (!hasPermission) {
                    console.error('Storage permissions denied');
                    return;
                }
                const exists = await RNFS.exists(appRootPath);
                if (!exists) {
                    await RNFS.mkdir(appRootPath);
                    console.log(`Created folder at ${appRootPath}`);
                }
            } catch (e) {
                console.error("Folder creation error:", e);
            }
        };
        init();
    }, []);

    return (
        <FileManagerContext.Provider value={{ appRootPath }}>
            {children}
        </FileManagerContext.Provider>
    );
};