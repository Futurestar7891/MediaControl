import { StyleSheet, Text, TouchableOpacity, Animated, View, Alert } from 'react-native';
import { useEffect, useRef } from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useFileManagerContext, } from '../FileManagerContext';
// import { createFolder } from '../utils/CreateFolder';

type OptionMenuProps = {
    visible: boolean;
    onClose: () => void;
    setVisible: (value: boolean) => void
};

export default function OptionMenu({ visible, onClose, setVisible }: OptionMenuProps) {
    const slideAnim = useRef(new Animated.Value(50)).current;
    const { setShowRename } = useFileManagerContext();

    useEffect(() => {
        Animated.timing(slideAnim, {
            toValue: visible ? 0 : -300,
            duration: 300,
            useNativeDriver: true,
        }).start();
    }, [visible, slideAnim]);


    const handleFunction = async (name: string) => {
        try {
            console.log("entered in handlefuntion");
            switch (name) {
                case 'create':
                    setShowRename((prev) => ({
                        ...prev,
                        title: 'Create Folder',
                        value: true,
                        name: "create"
                    }));


                    break;
                case 'import':
                    // Handle upload
                    break;
                case 'createpdf':
                    // Handle PDF creation
                    break;
                case 'mergepdf':
                    // Handle PDF merging
                    break;
            }
            setVisible(!visible);
        } catch (error) {
            console.error('Error:', error);
            Alert.alert('Error', `Failed to perform ${name} operation`);
        }
    };

    return (
        <Animated.View
            style={[
                styles.container,
                {
                    transform: [{ translateX: slideAnim }],
                },
            ]}
        >

            <View>
                <Ionicons onPress={onClose} name="arrow-back" width={24} size={28} color={'green'} />
            </View>
            <View style={styles.btncontainer}>
                <TouchableOpacity onPress={() => handleFunction("create")} style={styles.btn}>
                    <Ionicons name="add" size={28} color={'#ffffff'} />
                    <Text>Create Folder</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => handleFunction("import")} style={styles.btn}>
                    <Ionicons name="cloud-download" size={28} color={'#ffffff'} />
                    <Text>Import file/Folder</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => handleFunction("createpdf")} style={styles.btn}>
                    <Ionicons name="document" size={28} color={'#ffffff'} />
                    <Text>Create Pdf</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => handleFunction("mergepdf")} style={styles.btn}>
                    <Ionicons name="documents" size={28} color={'#ffffff'} />
                    <Text>Merge Pdf</Text>
                </TouchableOpacity>
            </View>

        </Animated.View>
    );
}

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
        justifyContent: "flex-start",
        gap: 10
    },
    btncontainer: {
        flex: 1,
        justifyContent: "flex-start",
        gap: 10,
    },
    btn: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,

        gap: 10,
    },


});