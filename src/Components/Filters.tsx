import  { useEffect, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Animated } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useFileManagerContext } from '../FileManagerContext';

const Filters = () => {
    const slideAnim = useRef(new Animated.Value(300)).current;
    const { filter, setFilter, } = useFileManagerContext();

    useEffect(() => {
        Animated.timing(slideAnim, {
            toValue: filter.showFilter ? 0 : 300,
            duration: 300,
            useNativeDriver: true,
        }).start();
    }, [filter.showFilter, slideAnim]);

    const toggleViewMode = () => {
        setFilter(prev => ({
            ...prev,
            fileMode: prev.fileMode === 'list' ? 'icon' : 'list',
            showFilter: false,
        }));
    };

    const changeSortMode = (mode: 'a-z' | 'z-a' | 'oldest' | 'newest') => {
        setFilter(prev => ({
            ...prev,
            sortMode: mode,
            showFilter: false,
        }));
    };

    const isActive = (mode: string) => filter.sortMode === mode;

    return (
        <Animated.View
            style={[
                styles.container,
                { transform: [{ translateX: slideAnim }] }
            ]}
        >
            <View style={styles.btncontainer}>
                <TouchableOpacity onPress={toggleViewMode} style={styles.btn}>
                    <Ionicons
                        name={filter.fileMode === 'list' ? 'grid' : 'list'}
                        size={24}
                        color="#ffffff"
                    />
                    <Text style={[styles.optionText, styles.activeText]}>
                        {filter.fileMode === 'list' ? 'Icon View' : 'List View'}
                    </Text>
                </TouchableOpacity>

                <Text style={styles.sectionTitle}>Sort By</Text>

                {['a-z', 'z-a', 'newest', 'oldest'].map(mode => (
                    <TouchableOpacity
                        key={mode}
                        onPress={() => changeSortMode(mode as any)}
                        style={styles.btn}
                    >
                        <Ionicons
                            name={filter.sortMode === mode ? 'radio-button-on' : 'radio-button-off'}
                            size={20}
                            color="#ffffff"
                        />
                        <Text
                            style={[styles.optionText, isActive(mode) && styles.activeText]}
                        >
                            {mode === 'a-z' ? 'A to Z' :
                                mode === 'z-a' ? 'Z to A' :
                                    mode === 'newest' ? 'Newest First' :
                                        'Oldest First'}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        right: 0,
        top: 0,
        width: '50%',
        minHeight: 300,
        padding: 10,
        backgroundColor: '#3f3f3f',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        zIndex: 100,
        justifyContent: 'flex-start',
        gap: 10,
    },
    btncontainer: {
        flex: 1,
        justifyContent: 'flex-start',
        gap: 10,
        marginTop: 10,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginVertical: 8,
        color: '#ffffff',
    },
    btn: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        gap: 10,
    },
    optionText: {
        fontSize: 16,
        color: '#ccc',
    },
    activeText: {
        color: '#ffffff',
        fontWeight: 'bold',
    },
});

export default Filters;