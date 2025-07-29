// FileManagerContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import RNFS from 'react-native-fs';
import { Platform, Linking, Alert } from 'react-native';
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';

export type FileOperation = {
    type: string;
    items: RNFS.ReadDirItem[];
    visible: boolean;
};
export type RenameState = {
    title: string;
    name: string;
    value: boolean;
    path: string;
};

export type SelectionState = {
    mode: 'none' | 'single' | 'multiple';
    selectedItems: RNFS.ReadDirItem[];
};

export type FileManagerContextType = {
    appRootPath: string;
    currentPath: string;
    setCurrentPath: (path: string) => void;
    refreshFiles: () => Promise<void>;
    refreshkey: number;
    showrename: RenameState;
    setShowRename: React.Dispatch<React.SetStateAction<RenameState>>;
    selection: SelectionState;
    setSelection: React.Dispatch<React.SetStateAction<SelectionState>>;
    showOptionsModal: boolean;
    setShowOptionsModal: React.Dispatch<React.SetStateAction<boolean>>;
    fileOperation: FileOperation;
    setFileOperation: React.Dispatch<React.SetStateAction<FileOperation>>;
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
    const appRootPath = `${RNFS.ExternalStorageDirectoryPath}/Download/Docify`;
    const [currentPath, setCurrentPath] = useState(appRootPath);
    const [refreshkey, setRefreshKey] = useState(0);
    const [showrename, setShowRename] = useState<RenameState>({
        title: "",
        value: false,
        name: "",
        path: ""

    });
    const [selection, setSelection] = useState<SelectionState>({
        mode: 'none',
        selectedItems: []
    });
    const [showOptionsModal, setShowOptionsModal] = useState(false);

    const [fileOperation, setFileOperation] = useState<FileOperation>({
        type: "",
        items: [],
        visible: false
    })

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

    const refreshFiles = async () => {
        try {
            const exists = await RNFS.exists(currentPath);
            if (!exists) {
                await RNFS.mkdir(currentPath);
            }
            setRefreshKey(prev => prev + 1);
        } catch (error) {
            console.error('Error refreshing files:', error);
        }
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
    }, [appRootPath]);

    return (
        <FileManagerContext.Provider value={{
            setShowRename,
            showrename,
            refreshkey,
            appRootPath,
            currentPath,
            setCurrentPath,
            refreshFiles,
            selection,
            setSelection,
            showOptionsModal,
            setShowOptionsModal,
            fileOperation,
            setFileOperation
        }}>
            {children}
        </FileManagerContext.Provider>
    );
};