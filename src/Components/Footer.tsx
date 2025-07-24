import { StyleSheet, View, TouchableOpacity } from 'react-native';
import React from 'react';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Feather from 'react-native-vector-icons/Feather';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamsList } from '../App'; // adjust to your type path
export default function Footer() {

    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamsList>>();

    return (
        <View style={styles.container}>
            <TouchableOpacity>
                <FontAwesome name="home" size={36} color="#f2f2f2" />
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate('Camera')}>
                <Ionicons name="camera" size={36} color="#f2f2f2" />
            </TouchableOpacity>

            <TouchableOpacity>
                <Feather name="file-text" size={36} color="#f2f2f2" />
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
        paddingVertical: 20,
    },
});
