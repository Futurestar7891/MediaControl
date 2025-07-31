// Update the Section component
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
import { getFileIcon,FileIcon } from '../utils/SectionHelper';


const Section = () => {
    const {
        appRootPath,
        currentPath,
        setCurrentPath,
        refreshkey,
        selection,
        setSelection,
        setShowOptionsModal,
        setFilter,
        filter
    } = useFileManagerContext();
    const [files, setFiles] = useState<RNFS.ReadDirItem[]>([]);
    const [refreshing, setRefreshing] = useState(false);
    const [fileIcons, setFileIcons] = useState<Record<string, FileIcon>>({});



    const loadFiles = async (path: string) => {
        try {
            const exists = await RNFS.exists(path);
            if (!exists) {
                await RNFS.mkdir(path);
            }

            let fileList = await RNFS.readDir(path);
            const getTimeSafe = (file: RNFS.ReadDirItem) => file.mtime?.getTime() ?? 0;
            // Sorting logic based on filter.sortMode
            fileList = fileList.sort((a, b) => {
                // Folders always on top
                if (a.isDirectory() && !b.isDirectory()) return -1;
                if (!a.isDirectory() && b.isDirectory()) return 1;

                switch (filter.sortMode) {
                    case 'a-z':
                        return a.name.localeCompare(b.name);
                    case 'z-a':
                        return b.name.localeCompare(a.name);
                    case 'newest':
                        return getTimeSafe(b) - getTimeSafe(a);
                    case 'oldest':
                        return getTimeSafe(a) - getTimeSafe(b);
                    default:
                        return 0;
                }
            });

            setFiles(fileList);

            // Load icons for each file
            const iconMap: Record<string, FileIcon> = {};
            await Promise.all(
                fileList.map(async (file) => {
                    iconMap[file.path] = await getFileIcon(file);
                })
            );
            setFileIcons(iconMap);

        } catch (error) {
            console.error('Error reading directory:', error);
            Alert.alert('Error', 'Failed to load files.');
        }
    };




    useFocusEffect(
        useCallback(() => {
            loadFiles(currentPath);
            setSelection({ mode: 'none', selectedItems: [] });
            // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [currentPath, refreshkey,filter.sortMode])
    );

    const onRefresh = async () => {
        setRefreshing(true);
        await loadFiles(currentPath);
        setRefreshing(false);
    };

    const handleFilePress = async (file: RNFS.ReadDirItem) => {
        if (selection.mode !== 'none') {
            // In selection mode, toggle selection instead of opening
            toggleSelection(file);
            return;
        }

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

    const handleFileLongPress = (file: RNFS.ReadDirItem) => {
        // Start selection mode if not already in it
        if (selection.mode === 'none') {
            setSelection({
                mode: 'single',
                selectedItems: [file]
            });
        }
    };

    const toggleSelection = (file: RNFS.ReadDirItem) => {
        const isSelected = selection.selectedItems.some(item => item.path === file.path);
        let newSelectedItems;

        if (isSelected) {
            newSelectedItems = selection.selectedItems.filter(item => item.path !== file.path);
        } else {
            newSelectedItems = [...selection.selectedItems, file];
        }

        const newMode = newSelectedItems.length === 0 ? 'none' :
            newSelectedItems.length === 1 ? 'single' : 'multiple';

        setSelection({
            mode: newMode,
            selectedItems: newSelectedItems
        });
    };

    const isSelected = (file: RNFS.ReadDirItem) => {
        return selection.selectedItems.some(item => item.path === file.path);
    };
    //     if (file.isDirectory()) {
    //         return <Ionicons name="folder" size={24} color="#FFD54F" />;
    //     }

    //     const extension = file.name.split('.').pop()?.toLowerCase();
    //     switch (extension) {
    //         case 'jpg': case 'jpeg': case 'png': case 'gif': case 'webp':
    //             return <Ionicons name="image" size={24} color="#4FC3F7" />;
    //         case 'pdf':
    //             return <Ionicons name="document" size={24} color="#F44336" />;
    //         case 'mp3': case 'wav': case 'aac': case 'flac':
    //             return <Ionicons name="musical-notes" size={24} color="#9C27B0" />;
    //         case 'mp4': case 'mov': case 'avi': case 'mkv':
    //             return <Ionicons name="film" size={24} color="#7B1FA2" />;
    //         case 'txt': case 'md':
    //             return <Ionicons name="document-text" size={24} color="#78909C" />;
    //         case 'doc': case 'docx':
    //             return <Ionicons name="document" size={24} color="#1976D2" />;
    //         case 'xls': case 'xlsx':
    //             return <Ionicons name="document" size={24} color="#388E3C" />;
    //         case 'ppt': case 'pptx':
    //             return <Ionicons name="document" size={24} color="#F57C00" />;
    //         case 'zip': case 'rar': case '7z':
    //             return <Ionicons name="archive" size={24} color="#795548" />;
    //         default:
    //             return <Ionicons name="document" size={24} color="#9E9E9E" />;
    //     }
    // };

    const renderItem = ({ item }: { item: RNFS.ReadDirItem }) => (
        <TouchableOpacity
            style={[
                styles.fileItem,
                isSelected(item) && styles.selectedFileItem
            ]}
            onPress={() => handleFilePress(item)}
            onLongPress={() => handleFileLongPress(item)}
            delayLongPress={500} // 0.5 second delay for long press
        >
            {selection.mode !== 'none' && (
                <Ionicons
                    name={isSelected(item) ? "checkbox" : "square-outline"}
                    size={24}
                    color={isSelected(item) ? "#4CAF50" : "#000"}
                    style={styles.selectionIcon}
                />
            )}
            <Ionicons
                style={styles.fileIcon}
                name={fileIcons[item.path]?.name || 'document'}
                size={24}
                color={fileIcons[item.path]?.color}
            />

            <Text style={styles.fileText}>{item.name}</Text>
        </TouchableOpacity>
    );

    const navigateUp = () => {
        if (currentPath !== appRootPath) {
            const parentPath = currentPath.split('/').slice(0, -1).join('/');
            setCurrentPath(parentPath);
        }
    };

    const handleOptionsPress = () => {
        if (selection.mode !== 'none') {
            setShowOptionsModal(true);
        }
    };

    const handleSelectAll = () => {
        if (selection.selectedItems.length === files.length) {
            setSelection({ mode: 'none', selectedItems: [] });
        } else {
            setSelection({ mode: 'multiple', selectedItems: [...files] });
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
                    {currentPath.replace(appRootPath, 'Docify')}
                </Text>
                {selection.mode === 'none' ? (
                    <TouchableOpacity onPress={()=>setFilter((prev)=>({
                        ...prev,showFilter:true
                    }))} style={styles.sortButton}>
                        <Ionicons name="filter" size={20} color="#555" />
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity style={styles.sortButton} onPress={handleOptionsPress}>
                        <Ionicons name="ellipsis-horizontal" size={20} color="#555" />
                    </TouchableOpacity>
                )}
                {selection.mode !== 'none' && (
                    <TouchableOpacity style={styles.selectAllButton} onPress={handleSelectAll}>
                        <Text style={styles.selectAllText}>
                            {selection.selectedItems.length === files.length ? 'Deselect all' : 'Select all'}
                        </Text>
                    </TouchableOpacity>
                )}
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
    selectAllButton: {
        padding: 4,
        marginLeft: 8,
    },
    selectAllText: {
        color: '#1976D2',
        fontSize: 16,
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
    selectedFileItem: {
        backgroundColor: '#E3F2FD',
    },
    fileIcon: {
        fontSize: 24,
        marginRight: 16,
    },
    selectionIcon: {
        marginRight: 12,
    },
    fileText: {
        fontSize: 16,
        color: '#333',
        flex: 1,
    },
});

export default Section;