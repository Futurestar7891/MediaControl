import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import RNFS from 'react-native-fs';
import { useFileManagerContext } from '../FileManagerContext';

const FileOperationModal = () => {
    const {
        fileOperation,
        setFileOperation,
        currentPath,
        refreshFiles,
        setSelection,
        trackFile,
        untrackFile
    } = useFileManagerContext();

    // Recursively copy directory and contents while tracking files
    const copyDirectory = async (source: string, destination: string) => {
        await RNFS.mkdir(destination);
        const items = await RNFS.readDir(source);

        for (const item of items) {
            const targetPath = `${destination}/${item.name}`;
            if (item.isDirectory()) {
                await copyDirectory(item.path, targetPath);
            } else {
                await RNFS.copyFile(item.path, targetPath);
                // Track the newly copied file
                await trackFile(targetPath);
            }
        }
    };

    // Recursively track all files in a directory
    const trackDirectoryFiles = async (path: string) => {
        const items = await RNFS.readDir(path);
        for (const item of items) {
            if (item.isDirectory()) {
                await trackDirectoryFiles(item.path);
            } else {
                await trackFile(item.path);
            }
        }
    };

    // Execute the file operation (move or copy)
    const executeOperation = async () => {
        try {
            if (!fileOperation.type || !fileOperation.items?.length) return;

            // Validate all items first
            for (const item of fileOperation.items) {
                const destination = `${currentPath}/${item.name}`;

                // Prevent moving/copying a folder inside itself
                if (item.isDirectory() && currentPath.startsWith(item.path)) {
                    Alert.alert(
                        'Invalid Operation',
                        `Cannot ${fileOperation.type} a folder into itself or its subfolder:\n"${item.name}"`
                    );
                    return;
                }

                // Prevent overwriting existing files
                if (await RNFS.exists(destination)) {
                    Alert.alert(
                        'File Exists',
                        `A file or folder named "${item.name}" already exists in this location.\nPlease rename it before trying again.`
                    );
                    return;
                }
            }

            // Process each item
            for (const item of fileOperation.items) {
                const destination = `${currentPath}/${item.name}`;

                if (item.isDirectory()) {
                    if (fileOperation.type === 'copy') {
                        await copyDirectory(item.path, destination);
                        // Track the directory and its contents
                        await trackFile(destination);
                        await trackDirectoryFiles(destination);
                    } else {
                        // Move directory
                        await RNFS.moveFile(item.path, destination);
                        // Untrack old path and track new path
                        await untrackFile(item.path);
                        await trackFile(destination);
                        // Track all files in the moved directory
                        await trackDirectoryFiles(destination);
                    }
                } else {
                    if (fileOperation.type === 'copy') {
                        await RNFS.copyFile(item.path, destination);
                        // Track the new file
                        await trackFile(destination);
                    } else {
                        await RNFS.moveFile(item.path, destination);
                        // Untrack old path and track new path
                        await untrackFile(item.path);
                        await trackFile(destination);
                    }
                }
            }

            await refreshFiles();
            setSelection({ mode: 'none', selectedItems: [] });
            setFileOperation({ type: '', visible: false, items: [] });

        } catch (error) {
            console.error('File operation error:', error);
            Alert.alert('Error', `Failed to ${fileOperation.type} files`);
        }
    };

    const handleCancel = () => {
        setFileOperation({ ...fileOperation, visible: false });
    };

    if (!fileOperation.visible) return null;

    return (
        <View style={styles.floatingOverlay}>
            <View style={styles.modalContent}>
                <Text style={styles.title}>
                    {fileOperation.type === 'move' ? 'Move Items' : 'Copy Items'}
                </Text>
                <Text style={styles.pathText}>Destination: {currentPath}</Text>

                <View style={styles.buttonContainer}>
                    <TouchableOpacity
                        style={[styles.button, styles.cancelButton]}
                        onPress={handleCancel}
                    >
                        <Text style={styles.buttonText}>Cancel</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.button, styles.confirmButton]}
                        onPress={executeOperation}
                    >
                        <Text style={styles.buttonText}>
                            {fileOperation.type === 'move' ? 'Move Here' : 'Copy Here'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    floatingOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        backgroundColor: 'rgba(0,0,0,0.05)',
    },
    modalContent: {
        backgroundColor: 'white',
        padding: 20,
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
        color: 'black',
    },
    pathText: {
        fontSize: 14,
        color: '#666',
        marginBottom: 20,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    button: {
        flex: 1,
        padding: 12,
        borderRadius: 5,
        alignItems: 'center',
    },
    cancelButton: {
        backgroundColor: '#e74c3c',
        marginRight: 10,
    },
    confirmButton: {
        backgroundColor: '#2ecc71',
        marginLeft: 10,
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
    },
});

export default FileOperationModal;