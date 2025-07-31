import React, { createContext, useContext, useEffect, useState } from 'react';
import RNFS from 'react-native-fs';
import { Platform, Linking, Alert } from 'react-native';
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

export type FilterState = {
    fileMode: 'list' | 'icon';
    sortMode: 'a-z' | 'z-a' | 'oldest' | 'newest';
    showFilter: boolean;
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
    filter: FilterState;
    setFilter: React.Dispatch<React.SetStateAction<FilterState>>;
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
    });
    const [filter, setFilter] = useState<FilterState>({
        fileMode: 'list',
        sortMode: 'a-z',
        showFilter: false
    });

    const requestStoragePermissions = async () => {
        if (Platform.OS === 'android') {
            try {
                const permission =
                    Platform.Version >= 33
                        ? PERMISSIONS.ANDROID.READ_MEDIA_IMAGES
                        : PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE;

                let result = await check(permission);
                if (result === RESULTS.DENIED) {
                    result = await request(permission);
                }

                if (result === RESULTS.BLOCKED || result === RESULTS.LIMITED) {
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

    const loadFilterState = async () => {
        try {
            const savedState = await AsyncStorage.getItem('@FileManager/filterState');
            if (savedState) {
                setFilter(JSON.parse(savedState));
            }
        } catch (error) {
            console.error('Failed to load filter state:', error);
        }
    };

    const saveFilterState = async (newState: FilterState) => {
        try {
            await AsyncStorage.setItem('@FileManager/filterState', JSON.stringify(newState));
        } catch (error) {
            console.error('Failed to save filter state:', error);
        }
    };

    useEffect(() => {
        loadFilterState();
    }, []);

    useEffect(() => {
        saveFilterState(filter);
    }, [filter]);

    useEffect(() => {
        const init = async () => {
            const hasPermission = await requestStoragePermissions();
            if (!hasPermission) return;

            const exists = await RNFS.exists(appRootPath);
            if (!exists) {
                await RNFS.mkdir(appRootPath);
            }
        };
        init();
    }, [appRootPath]);

    return (
        <FileManagerContext.Provider value={{
            appRootPath,
            currentPath,
            setCurrentPath,
            refreshFiles,
            refreshkey,
            showrename,
            setShowRename,
            selection,
            setSelection,
            showOptionsModal,
            setShowOptionsModal,
            fileOperation,
            setFileOperation,
            filter,
            setFilter
        }}>
            {children}
        </FileManagerContext.Provider>
    );
};