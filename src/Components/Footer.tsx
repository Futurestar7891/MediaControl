// Footer.tsx
import { StyleSheet, View, TouchableOpacity } from 'react-native';
// import React from 'react';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Feather from 'react-native-vector-icons/Feather';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamsList } from '../App';
import { useFileManagerContext } from '../FileManagerContext';

export default function Footer() {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamsList>>();
    const { appRootPath, setCurrentPath } = useFileManagerContext();

    const handleHomePress = () => {
        setCurrentPath(appRootPath);
    
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity onPress={handleHomePress}>
                <FontAwesome name="home" size={44} color="#f2f2f2" />
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate('Camera')}>
                <Ionicons name="camera" size={44} color="#f2f2f2" />
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate('Notes')}>
                <Feather name="file-text" size={44} color="#f2f2f2" />
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        minHeight: 75,
        backgroundColor: '#3f3f3f',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 35,
        paddingVertical: 10,
    },
});