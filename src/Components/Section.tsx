import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    TouchableOpacity,
    Alert,
    RefreshControl,
    Image
} from 'react-native';
import RNFS from 'react-native-fs';
import { useFocusEffect } from '@react-navigation/native';
import { useFileManagerContext } from '../FileManagerContext';
import FileViewer from "react-native-file-viewer";
import Ionicons from 'react-native-vector-icons/Ionicons';
import { getFileIcon, FileIcon } from '../utils/SectionHelper';

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
        filter,
        isTrackedFile
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
            console.log("original",fileList);

            // Filter files to only show tracked ones and directories
            const filteredFiles = [];
            for (const file of fileList) {
                if (file.isDirectory() || await isTrackedFile(file.path)) {
                    filteredFiles.push(file);
                }
            }

            // Sorting logic
            fileList = filteredFiles.sort((a, b) => {
                if (a.isDirectory() && !b.isDirectory()) return -1;
                if (!a.isDirectory() && b.isDirectory()) return 1;

                switch (filter.sortMode) {
                    case 'a-z':
                        return a.name.localeCompare(b.name);
                    case 'z-a':
                        return b.name.localeCompare(a.name);
                    case 'newest':
                        return (b.mtime?.getTime() || 0) - (a.mtime?.getTime() || 0);
                    case 'oldest':
                        return (a.mtime?.getTime() || 0) - (b.mtime?.getTime() || 0);
                    default:
                        return 0;
                }
            });

            setFiles(fileList);
            console.log("filtered",fileList);
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
        }, [currentPath, refreshkey, filter.sortMode])
    );

    const onRefresh = async () => {
        setRefreshing(true);
        await loadFiles(currentPath);
        setRefreshing(false);
    };

    const handleFilePress = async (file: RNFS.ReadDirItem) => {
        if (selection.mode !== 'none') {
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

    const renderList = ({ item }: { item: RNFS.ReadDirItem }) => (
        <TouchableOpacity
            style={[
                styles.fileItem,
                isSelected(item) && styles.selectedFileItem
            ]}
            onPress={() => handleFilePress(item)}
            onLongPress={() => handleFileLongPress(item)}
            delayLongPress={500}
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

    const renderIcon = ({ item }: { item: RNFS.ReadDirItem }) => {
        const icon = fileIcons[item.path];
        const imageSource = typeof icon?.source === 'string'
            ? { uri: icon.source }
            : icon?.source;

        return (
            <View style={styles.gridItemWrapper}>
                <TouchableOpacity
                    style={[
                        styles.gridItemContainer,
                        isSelected(item) && styles.selectedFileItem
                    ]}
                    onPress={() => handleFilePress(item)}
                    onLongPress={() => handleFileLongPress(item)}
                    delayLongPress={500}
                >
                    <View style={styles.imageContainer}>
                        <Image
                            style={styles.gridImage}
                            source={imageSource || require('../assets/icon.png')}
                            defaultSource={require('../assets/icon.png')}
                            onError={() => console.log('Error loading image for:', item.name)}
                        />

                        {selection.mode !== 'none' && (
                            <Ionicons
                                name={isSelected(item) ? "checkbox" : "square-outline"}
                                size={24}
                                color={isSelected(item) ? "#4CAF50" : "#000"}
                                style={styles.gridSelectionIcon}
                            />
                        )}

                        <Text style={styles.gridFileText} numberOfLines={1}>
                            {item.name}
                        </Text>
                    </View>
                </TouchableOpacity>
            </View>
        );
    };


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
                    <TouchableOpacity onPress={() => setFilter((prev) => ({
                        ...prev, showFilter: true
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
                key={filter.fileMode}
                data={files}
                renderItem={filter.fileMode === "list" ? renderList : renderIcon}
                keyExtractor={(item) => item.path}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
                numColumns={filter.fileMode === "list" ? 1 : 3}
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
        padding: 8,
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
    // Grid view styles
    gridItemWrapper: {
        width: '33.33%', // Exactly 3 items per row
        padding: 4,
    },
    gridItemContainer: {
        width: '100%',
        aspectRatio: 1 / 1, // Square container
        backgroundColor: '#fff',
        borderRadius: 2,
        overflow: 'hidden',
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 5,
        padding:2
    },
    imageContainer: {
        width: "100%",
        aspectRatio: 1 / 1,
        position: 'relative',
        alignItems: "center",
      

    },
    gridImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    gridSelectionIcon: {
        position: 'absolute',
        top: 8,
        left: 8,
        backgroundColor: 'rgba(255, 255, 255, 0.7)',
        borderRadius: 4,
    },
    gridFileText: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'transparent',
        color: 'black',
        fontWeight: '900',
        fontSize: 12,
        textAlign: 'center',
    },
});
export default Section;