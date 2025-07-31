// Home.tsx
import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../Components/Header';
import Footer from '../Components/Footer';
import Section from '../Components/Section';
import OptionMenu from '../Components/OptionMenu';
import Rename from '../Components/Rename';
import SelectionSlider from '../Components/SelectionSlider';
import { useFileManagerContext } from '../FileManagerContext';
import FileOperationModal from '../Components/FileOperationModel';
import Filters from '../Components/Filters';

export default function Home() {
    const [menuVisible, setMenuVisible] = useState(false);
    const { showrename, showOptionsModal,fileOperation,filter } = useFileManagerContext();

    return (
        <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
            <View style={styles.headerContainer}>
                <Header setMenu={setMenuVisible} />
                {menuVisible && (
                    <OptionMenu
                        visible={menuVisible}
                        setVisible={setMenuVisible}
                        onClose={() => setMenuVisible(false)}
                    />
                )}
            </View>

            <View style={styles.sectionContainer}>
                <Section />
                {showrename.value && <Rename />}
                {showOptionsModal && <SelectionSlider />}
                {fileOperation.visible && <FileOperationModal/>}
                {filter.showFilter && <Filters/>}

            </View>

            <View>
                <Footer />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#3f3f3f',
    },
    headerContainer: {
        position: 'relative',
        zIndex: 1,
    },
    sectionContainer: {
        flex: 1,
        backgroundColor: 'white',
        position: 'relative',
    },
});