import { StyleSheet, View, Image } from 'react-native';
import React from 'react';
// import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Ionicons from 'react-native-vector-icons/Ionicons';
// import Feather from 'react-native-vector-icons/Feather';
import Logo from '../assets/mediaapplogo.png';

export default function Header() {
    return (
        <View style={styles.container}>
            <View style={styles.logoContainer}>
                <Image source={Logo} style={styles.logo} />
            </View>

            <View style={styles.iconContainer}>
                <Ionicons name="menu" size={42} color="white" />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        padding: 18,
        paddingLeft: 5,
        // borderColor: 'red',
        borderWidth: 1,
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
