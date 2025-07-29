// Header.tsx
import { StyleSheet, View, Image, TouchableOpacity } from 'react-native';
import React from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Logo from '../assets/mediaapplogo.png';

type HeaderProps = {
    setMenu: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function Header({ setMenu }: HeaderProps) {
    return (
        <View style={styles.container}>
            <View style={styles.logoContainer}>
                <Image source={Logo} style={styles.logo} />
            </View>

            <TouchableOpacity
                style={styles.iconContainer}
                onPress={() => setMenu(prev => !prev)}
            >
                <Ionicons name="menu" size={42} color="white" />
            </TouchableOpacity>
        </View>
    );
}

// ... keep your existing styles ...
const styles = StyleSheet.create({
    container: {
        width: '100%',
        padding: 18,
        paddingLeft: 5,
        // borderColor: 'red',
        // borderWidth: 1,
        backgroundColor: '#3f3f3f',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    logoContainer: {
        width: '50%',
        // borderWidth:1,
        // borderColor:"red"
    },
    logo: {
        width: '100%',
        height: 40,
        backgroundColor: "transparent"

    },

    iconContainer: {
        width: "15%",
        alignItems: "center",
        justifyContent: "center"
    },


});
