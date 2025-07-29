// SelectionSlider.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, ScrollView, Alert } from 'react-native';
import RNFS from 'react-native-fs';
import FileViewer from 'react-native-file-viewer';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useFileManagerContext } from '../FileManagerContext';

// import Pdf from 'react-native-pdf';
// import ImageResizer from 'react-native-image-resizer';

const SelectionSlider = () => {
    const {
        selection,
        setSelection,
        showOptionsModal,
        setShowOptionsModal,
        setShowRename,
        refreshFiles,
        currentPath,
        setCurrentPath,
        setFileOperation
    } = useFileManagerContext();

    const handleDelete = async () => {
        try {
            Alert.alert(
                'Confirm Delete',
                `Are you sure you want to delete ${selection.selectedItems.length} item(s)?`,
                [
                    {
                        text: 'Cancel',
                        style: 'cancel',
                    },
                    {
                        text: 'Delete',
                        onPress: async () => {
                            try {
                                const deletePromises = selection.selectedItems.map(item =>
                                    RNFS.unlink(item.path)
                                );
                                await Promise.all(deletePromises);
                                setSelection({ mode: 'none', selectedItems: [] });
                                setShowOptionsModal(false);
                                await refreshFiles();
                                Alert.alert('Success', 'Items deleted successfully');
                            } catch (error) {
                                console.error('Error deleting files:', error);
                                Alert.alert('Error', 'Failed to delete selected items');
                            }
                        },
                        style: 'destructive',
                    },
                ],
            );
        } catch (error) {
            console.error('Error deleting files:', error);
            Alert.alert('Error', 'Failed to delete selected items');
        }
    };

    const handleRename = () => {
        if (selection.selectedItems.length === 1) {
            const file = selection.selectedItems[0];
            setShowRename({
                title: file.isDirectory() ? "Rename Folder" : "Rename File",
                value: true,
                name: file.name,
                path:file.path
            });
            setShowOptionsModal(false);
        }
    };

    const handleConvertToPdf = async () => {
        if (selection.selectedItems.every(item => isImage(item))) {
            try {
                Alert.alert('Info', 'Converting images to PDF...');

                // Create a PDF from images
                const pdfPath = `${currentPath}/converted_${Date.now()}.pdf`;
                // Note: Actual PDF creation would require a native module or external service
                // This is a placeholder implementation

                // For demo purposes, we'll just create an empty file
                await RNFS.writeFile(pdfPath, '', 'base64');

                Alert.alert('Success', 'PDF created successfully');
                await refreshFiles();
                setSelection({ mode: 'none', selectedItems: [] });
                setShowOptionsModal(false);
            } catch (error) {
                console.error('Error converting to PDF:', error);
                Alert.alert('Error', 'Failed to convert images to PDF');
            }
        }
    };

    // const handleConvertToImage = async () => {
    //     if (selection.selectedItems.length === 1 && isPdf(selection.selectedItems[0])) {
    //         try {
    //             Alert.alert('Info', 'Converting PDF to images...');
    //             const pdfFile = selection.selectedItems[0];

    //             // Extract images from PDF
    //             // Note: Actual PDF extraction would require a native module
    //             // This is a placeholder implementation

    //             // For demo, we'll just create a dummy image
    //             const imagePath = `${currentPath}/extracted_page_1.jpg`;
    //             await RNFS.writeFile(imagePath, '', 'base64');

    //             Alert.alert('Success', 'Images extracted successfully');
    //             await refreshFiles();
    //             setSelection({ mode: 'none', selectedItems: [] });
    //             setShowOptionsModal(false);
    //         } catch (error) {
    //             console.error('Error converting to images:', error);
    //             Alert.alert('Error', 'Failed to convert PDF to images');
    //         }
    //     }
    // };

    // const handleCompress = async () => {
    //     if (selection.selectedItems.length === 1 && isImage(selection.selectedItems[0])) {
    //         try {
    //             Alert.alert('Info', 'Compressing image...');
    //             const imageFile = selection.selectedItems[0];

    //             // Compress the image
    //             const result = await ImageResizer.createResizedImage(
    //                 imageFile.path,
    //                 800, // width
    //                 800, // height
    //                 'JPEG', // format
    //                 70, // quality (0-100)
    //                 0, // rotation
    //                 null, // outputPath (null to generate a new path)
    //                 false // keep metadata
    //             );

    //             // Create new filename
    //             const compressedPath = `${currentPath}/compressed_${imageFile.name}`;
    //             await RNFS.moveFile(result.uri, compressedPath);

    //             Alert.alert('Success', 'Image compressed successfully');
    //             await refreshFiles();
    //             setSelection({ mode: 'none', selectedItems: [] });
    //             setShowOptionsModal(false);
    //         } catch (error) {
    //             console.error('Error compressing image:', error);
    //             Alert.alert('Error', 'Failed to compress image');
    //         }
    //     }
    // };

    const handleOpenWith = async () => {
        if (selection.selectedItems.length === 1 && !selection.selectedItems[0].isDirectory()) {
            const file = selection.selectedItems[0];
            try {
                const filePath = file.path.startsWith('file://') ? file.path : `file://${file.path}`;
                await FileViewer.open(filePath, {
                    showOpenWithDialog: true,
                    onDismiss: () => {
                        setSelection({ mode: 'none', selectedItems: [] });
                        setShowOptionsModal(false);
                    },
                });
            } catch (error) {
                console.error('Error opening file:', error);
                Alert.alert('Error', `Cannot open ${file.name}`);
            }
        }
    };

    const handleMove = () => {
         const appRootPath = `${RNFS.ExternalStorageDirectoryPath}/Download/myapp`;
        setFileOperation({
            type: 'move',
            visible: true,
            items: selection.selectedItems
        });
        setShowOptionsModal(false);
        setSelection({ mode: 'none', selectedItems: [] });
        setCurrentPath(appRootPath);

    };

    const handleCopy = () => {
        const appRootPath = `${RNFS.ExternalStorageDirectoryPath}/Download/myapp`;
        setFileOperation({
            type: 'copy',
            visible: true,
            items: selection.selectedItems
        });
        setShowOptionsModal(false);
        setSelection({ mode: 'none', selectedItems: [] });
        setCurrentPath(appRootPath);
        

    };

    const isImage = (file: RNFS.ReadDirItem) => {
        const extension = file.name.split('.').pop()?.toLowerCase();
        return ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension || '');
    };

    const isPdf = (file: RNFS.ReadDirItem) => {
        const extension = file.name.split('.').pop()?.toLowerCase();
        return extension === 'pdf';
    };

    return (
        <Modal
            visible={showOptionsModal}
            animationType="slide"
            transparent={true}
            onRequestClose={() => setShowOptionsModal(false)}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.sliderContainer}>
                    <View style={styles.header}>
                        <Text style={styles.headerText}>
                            {selection.selectedItems.length} item{selection.selectedItems.length !== 1 ? 's' : ''} selected
                        </Text>
                        <TouchableOpacity onPress={() => setShowOptionsModal(false)}>
                            <Ionicons name="close" size={24} color="#555" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView contentContainerStyle={styles.optionsContainer}>
                        {selection.selectedItems.length === 1 && !selection.selectedItems[0].isDirectory() && (
                            <TouchableOpacity style={styles.option} onPress={handleOpenWith}>
                                <Ionicons name="open" size={20} color="#555" />
                                <Text style={styles.optionText}>Open with</Text>
                            </TouchableOpacity>
                        )}

                        {selection.selectedItems.length > 1 && selection.selectedItems.every(item => isImage(item)) && (
                            <TouchableOpacity style={styles.option} onPress={handleConvertToPdf}>
                                <Ionicons name="document" size={20} color="#555" />
                                <Text style={styles.optionText}>Create PDF</Text>
                            </TouchableOpacity>
                        )}

                        {selection.selectedItems.length === 1 && isPdf(selection.selectedItems[0]) && (
                            <TouchableOpacity style={styles.option}>
                                <Ionicons name="image" size={20} color="#555" />
                                <Text style={styles.optionText}>Convert to images</Text>
                            </TouchableOpacity>
                        )}

                        {selection.selectedItems.length === 1 && isImage(selection.selectedItems[0]) && (
                            <TouchableOpacity style={styles.option}>
                                <Ionicons name="resize" size={20} color="#555" />
                                <Text style={styles.optionText}>Compress image</Text>
                            </TouchableOpacity>
                        )}

                        {selection.selectedItems.length === 1 && (
                            <TouchableOpacity style={styles.option} onPress={handleRename}>
                                <Ionicons name="pencil" size={20} color="#555" />
                                <Text style={styles.optionText}>Rename</Text>
                            </TouchableOpacity>
                        )}

                        <TouchableOpacity style={styles.option} onPress={handleMove}>
                            <Ionicons name="move" size={20} color="#555" />
                            <Text style={styles.optionText}>Move</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.option} onPress={handleCopy}>
                            <Ionicons name="copy" size={20} color="#555" />
                            <Text style={styles.optionText}>Copy</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.option} onPress={handleDelete}>
                            <Ionicons name="trash" size={20} color="#e74c3c" />
                            <Text style={styles.optionText}>Delete</Text>
                        </TouchableOpacity>
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    sliderContainer: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
        maxHeight: '60%',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingBottom: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        marginBottom: 10,
    },
    headerText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    optionsContainer: {
        paddingVertical: 10,
    },
    option: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 15,
        paddingHorizontal: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#f5f5f5',
    },
    optionText: {
        fontSize: 16,
        marginLeft: 15,
        color: '#555',
    },
});

export default SelectionSlider;