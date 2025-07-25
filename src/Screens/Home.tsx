// Home.tsx
import React from 'react';
import { View, StyleSheet, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../Components/Header';
import Footer from '../Components/Footer';
import Section from '../Components/Section';

export default function Home() {
    return (
        <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
            <StatusBar />
            <View><Header /></View>
            <View style={styles.sectionContainer}>
                <Section />
            </View>
            <View><Footer /></View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: 'black',
    },
    sectionContainer: {
        flex: 1,
        marginBottom: 1,
        backgroundColor: "white",
    },
});