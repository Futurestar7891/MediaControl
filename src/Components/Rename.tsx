import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TextInput, View, TouchableOpacity, Alert } from 'react-native';
import RNFS from 'react-native-fs';
import { useFileManagerContext } from '../FileManagerContext';


const Rename = () => {
    const { currentPath, refreshFiles, setShowRename, showrename } = useFileManagerContext();
    const [newName, setNewName] = useState(showrename.name || '');
    const [error, setError] = useState('');
    const [originalExtension, setOriginalExtension] = useState('');

    useEffect(() => {
        if (!showrename.title.includes("Rename")) {
            // Folder creation
            setNewName(`Folder_${new Date().toISOString().replace(/[:.]/g, '-')}`);
            setOriginalExtension('');
        } else {
            // File/folder rename
            setNewName(showrename.name || '');

            // Extract original extension if it's a file (not directory)
            if (!showrename.path.endsWith('/')) {
                const lastDotIndex = showrename.name.lastIndexOf('.');
                if (lastDotIndex > 0) {  // Only if there's an extension
                    setOriginalExtension(showrename.name.substring(lastDotIndex));
                } else {
                    setOriginalExtension('');
                }
            } else {
                setOriginalExtension('');
            }
        }
        setError('');
    }, [showrename.value, showrename.name, showrename.title, showrename.path]);

    const validateName = (name: string) => {
        const trimmedName = name.trim();

        // Empty name check
        if (!trimmedName) {
            return 'Name cannot be empty';
        }

        // Check for invalid characters (including dots for folders)
        const invalidChars = /[\\/:*?"<>|]/;
        if (invalidChars.test(trimmedName)) {
            return 'Name contains invalid characters (\\ / : * ? " < > |)';
        }

        // Special check for dots in folder names
        if (showrename.path.endsWith('/') && trimmedName.includes('.')) {
            return 'Folder names cannot contain dots';
        }

        return '';
    };

    const getFinalName = (name: string) => {
        const trimmedName = name.trim();
        const validationError = validateName(trimmedName);
        if (validationError) {
            setError(validationError);
            return null;
        }

        // If it's a folder, return as-is (dots already checked)
        if (showrename.path.endsWith('/')) {
            return trimmedName;
        }

        // For files with original extension
        if (originalExtension) {
            const lastDotIndex = trimmedName.lastIndexOf('.');

            // If the new name already has the same extension, return as-is
            if (trimmedName.endsWith(originalExtension)) {
                return trimmedName;
            }

            // If the new name has a different extension, preserve the original
            if (lastDotIndex > 0) {
                return trimmedName.substring(0, lastDotIndex) + originalExtension;
            }

            // If no extension in new name, add the original
            return trimmedName + originalExtension;
        }

        // For files with no original extension
        return trimmedName;
    };

    const handleAction = async () => {
        const finalName = getFinalName(newName);
        if (!finalName) return; // Error already set by getFinalName

        try {
            if (showrename.title.includes("Rename")) {
                // Rename existing file/folder
                const oldPath = showrename.path;
                const newPath = `${currentPath}/${finalName}`;

                if (await RNFS.exists(newPath)) {
                    setError(`${showrename.title.includes("Folder") ? 'Folder' : 'File'} already exists`);
                    return;
                }

                await RNFS.moveFile(oldPath, newPath);
                Alert.alert('Success', `${showrename.title} successful`);
            } else {
                // Create new folder
                const fullPath = `${currentPath}/${finalName}`;
                if (await RNFS.exists(fullPath)) {
                    setError('Folder already exists');
                    return;
                }
                await RNFS.mkdir(fullPath);
                Alert.alert('Success', 'Folder created successfully');
            }

            await refreshFiles();
            setShowRename({ title: '', value: false, name: '', path: '' });
        } catch (eror) {
            console.error('Operation failed:', eror);
            setError(showrename.title.includes("Rename")
                ? `Failed to ${showrename.title.toLowerCase()}`
                : 'Failed to create folder');
        }
    };

    const handleCancel = () => {
        setShowRename({ title: '', value: false, name: '', path: '' });
        setError('');
    };

    return (
        <View style={styles.overlay}>
            <View style={styles.dialog}>
                <Text style={styles.title}>{showrename.title}</Text>
                <TextInput
                    value={newName}
                    onChangeText={setNewName}
                    style={[styles.input, error ? styles.inputError : null]}
                    placeholder={`Enter ${showrename.title.includes("Folder") ? 'folder' : 'file'} name`}
                    autoFocus={true}
                />
                {error ? <Text style={styles.errorText}>{error}</Text> : null}
                <View style={styles.buttons}>
                    <TouchableOpacity onPress={handleCancel} style={[styles.button, styles.cancelButton]}>
                        <Text style={styles.buttonText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleAction} style={styles.button}>
                        <Text style={styles.buttonText}>OK</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};


const styles = StyleSheet.create({
    overlay: {
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 100,
    },
    dialog: {
        width: '80%',
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 20,
        elevation: 6,
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 10,
        color: 'black'
    },
    input: {
        borderColor: '#999',
        borderWidth: 1,
        padding: 10,
        borderRadius: 6,
        marginBottom: 10,
        color: 'black'
    },
    inputError: {
        borderColor: 'red',
    },
    errorText: {
        color: 'red',
        marginBottom: 10,
        fontSize: 13,
    },
    buttons: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
    },
    button: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        backgroundColor: '#007bff',
        borderRadius: 5,
        marginLeft: 10,
    },
    cancelButton: {
        backgroundColor: '#dc3545',
    },
    buttonText: {
        color: '#fff',
        fontWeight: '600',
    },
});

export default Rename;