import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    TouchableOpacity,
    Alert,
    RefreshControl,
} from 'react-native';
import RNFS from 'react-native-fs';
import { useFocusEffect } from '@react-navigation/native';
import { useFileManagerContext } from '../FileManagerContext';
import FileViewer from "react-native-file-viewer";
import Ionicons from 'react-native-vector-icons/Ionicons';

const Section = () => {
    const { appRootPath, currentPath, setCurrentPath } = useFileManagerContext();
    const [files, setFiles] = useState<RNFS.ReadDirItem[]>([]);
    const [refreshing, setRefreshing] = useState(false);

    const loadFiles = async (path: string) => {
        try {
            const exists = await RNFS.exists(path);
            if (!exists) {
                await RNFS.mkdir(path);
            }
            const fileList = await RNFS.readDir(path);
            setFiles(fileList.sort((a, b) => {
                if (a.isDirectory() && !b.isDirectory()) return -1;
                if (!a.isDirectory() && b.isDirectory()) return 1;
                return a.name.localeCompare(b.name);
            }));
        } catch (error) {
            console.error('Error reading directory:', error);
            Alert.alert('Error', 'Failed to load files.');
        }
    };

    useFocusEffect(
        useCallback(() => {
            loadFiles(currentPath);
        }, [currentPath])
    );

    const onRefresh = async () => {
        setRefreshing(true);
        await loadFiles(currentPath);
        setRefreshing(false);
    };

    const handleFilePress = async (file: RNFS.ReadDirItem) => {
        if (file.isDirectory()) {
            setCurrentPath(file.path);
            return;
        }

        try {
            const filePath = file.path.startsWith('file://') ? file.path : `file://${file.path}`;
            await FileViewer.open(filePath, {
                showOpenWithDialog: true,
                onDismiss: () => console.log('File viewer dismissed'),
            });
        } catch (error) {
            console.error('Error opening file:', error);
            Alert.alert('Error', `Cannot open ${file.name}`);
        }
    };

    const getFileIcon = (file: RNFS.ReadDirItem) => {
        if (file.isDirectory()) {
            return '📁';
        }

        const extension = file.name.split('.').pop()?.toLowerCase();
        switch (extension) {
            case 'jpg': case 'jpeg': case 'png': case 'gif': return '🖼️';
            case 'pdf': return '📄';
            case 'mp3': case 'wav': case 'aac': return '🎵';
            case 'mp4': case 'mov': case 'avi': return '🎬';
            case 'txt': case 'doc': case 'docx': return '📝';
            default: return '📄';
        }
    };

    const renderItem = ({ item }: { item: RNFS.ReadDirItem }) => (
        <TouchableOpacity
            style={styles.fileItem}
            onPress={() => handleFilePress(item)}
        >
            <Text style={styles.fileIcon}>{getFileIcon(item)}</Text>
            <Text style={styles.fileText}>{item.name}</Text>
        </TouchableOpacity>
    );

    const navigateUp = () => {
        if (currentPath !== appRootPath) {
            const parentPath = currentPath.split('/').slice(0, -1).join('/');
            setCurrentPath(parentPath);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.pathContainer}>
                <TouchableOpacity
                    onPress={navigateUp}
                    style={styles.upButton}
                    disabled={currentPath === appRootPath}
                >
                    <Ionicons
                        name="arrow-back"
                        size={24}
                        color={currentPath === appRootPath ? '#ccc' : '#555'}
                        style={styles.backIcon}
                    />
                </TouchableOpacity>
                <Text style={styles.pathText} numberOfLines={1} ellipsizeMode="middle">
                    {currentPath.replace(appRootPath, 'MyApp')}
                </Text>
                <TouchableOpacity style={styles.sortButton}>
                    <Ionicons name="filter" size={20} color="#555" />
                </TouchableOpacity>
            </View>

            <FlatList
                data={files}
                renderItem={renderItem}
                keyExtractor={(item) => item.path}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.noFilesText}>No files found in this directory</Text>
                    </View>
                }
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    pathContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        backgroundColor: '#f8f8f8',
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    upButton: {
        padding: 4,
        marginRight: 8,
    },
    backIcon: {
        width: 24,
        height: 24,
    },
    pathText: {
        flex: 1,
        fontSize: 16,
        color: '#555',
        marginHorizontal: 8,
    },
    sortButton: {
        padding: 4,
        marginLeft: 8,
    },
    listContent: {
        padding: 16,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    noFilesText: {
        fontSize: 16,
        color: '#888',
    },
    fileItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        backgroundColor: '#fff',
        borderRadius: 8,
        marginBottom: 8,
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    fileIcon: {
        fontSize: 24,
        marginRight: 16,
    },
    fileText: {
        fontSize: 16,
        color: '#333',
        flex: 1,
    },
});

export default Section;