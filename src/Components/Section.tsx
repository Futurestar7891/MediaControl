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

const Section = () => {
    const { appRootPath } = useFileManagerContext();
    const [files, setFiles] = useState<string[]>([]);
    const [refreshing, setRefreshing] = useState(false);

    const loadFiles = async () => {
        try {
            const exists = await RNFS.exists(appRootPath);
            if (!exists) {
                await RNFS.mkdir(appRootPath);
            }
            const fileList = await RNFS.readDir(appRootPath);
            setFiles(fileList.map(f => f.name));
        } catch (error) {
            console.error('Error reading directory:', error);
            Alert.alert('Error', 'Failed to load files.');
        }
    };

    useFocusEffect(
        useCallback(() => {
            loadFiles();
        }, [])
    );

    const onRefresh = async () => {
        setRefreshing(true);
        await loadFiles();
        setRefreshing(false);
    };

    const renderItem = ({ item }: { item: string }) => (
        <TouchableOpacity style={styles.fileItem}>
            <Text style={styles.fileText}>{item}</Text>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.title}>MyApp Files</Text>
            {files.length > 0 ? (
                <FlatList
                    data={files}
                    renderItem={renderItem}
                    keyExtractor={(item) => item}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                    }
                />
            ) : (
                <Text style={styles.noFilesText}>No files found in myapp directory.</Text>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    fileItem: {
        padding: 15,
        backgroundColor: '#f2f2f2',
        borderRadius: 10,
        marginVertical: 5,
    },
    fileText: {
        fontSize: 16,
        color: '#3f3f3f',
    },
    noFilesText: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginTop: 20,
    },
});

export default Section;