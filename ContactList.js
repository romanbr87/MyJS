import React, { useState, useEffect, useContext } from 'react';
import {
    StyleSheet,
    TouchableOpacity,
    Text,
    Button,
    View,
    TextInput,
    SafeAreaView,
    SectionList,
    ActivityIndicator,
    Modal,
} from 'react-native';
import * as Contacts from 'expo-contacts';
import Colors from "../../../Colors";
import transFile from "../../../TranslateFile";
import { getTranslation } from 'react-native-translation/src/LanguageProvider';
import * as Localization from 'expo-localization';
import { DataStorage } from "../../../DataStorage";

export default function ContactList(props) {
    //------hooks----------
    const [contacts, setContacts] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [serchTermInput, setSerchTermInput] = useState('');
    const [userData] = useContext(DataStorage);
    const { deviceLanguage, getDirection } = userData;

    //------functions-------------------
    const loadContacts = async () => {

        const { status } = await Contacts.requestPermissionsAsync();
        if (status === 'granted') {
            const { data } = await Contacts.getContactsAsync();
            data.sort((a, b) => a.name.localeCompare(b.name));
            console.log (data);
            setContacts(data);
            setIsLoading(false)
        }

    }

    useEffect(() => {
        setIsLoading(true);
        loadContacts();
    }, [])

    //how items appear in the sectionlist
    const renderItem = ({ item }) => {
        if (item.phoneNumbers && item.name) {
            return (
                <View style={styles.contactsRenderedView}>
                    <TouchableOpacity
                        onPress={() => {
                            props.pickedContectHandler({ name: item.name, phone: item.phoneNumbers[0].number })
                            setSerchTermInput('')
                        }}
                    >
                        <View style={styles.contactsRendered}>
                            <Text style={{fontWeight: 'bold', }}>{item?.firstName}</Text>
                            <Text style={{marginHorizontal: item?.firstName ? 10 : 0, }}>{item?.lastName}</Text>
                        </View>
                    </TouchableOpacity>
                </View>

            )
        }

        else return <View />

    }
  
    //how titles appear in the sectionlist
    const renderSectionHeader = ({ section: { title } }) => (
        <View style={styles.contactsTitleView}>
            <Text style={styles.contactsTitle}>
                {title}
            </Text>
        </View>
    );

    //filter the contacts in the list by val!
    const searchContacts = () => {
        debugger
        if (serchTermInput !== '') {
            let filteredContacts = contacts.filter(contact => {
                let Lowercasecontact = contact.name.toLowerCase();
                let searchLowercase = serchTermInput.toLowerCase();
                return Lowercasecontact.includes(searchLowercase);
            })
            return filteredContacts

        }
        return contacts
    };

    //Returns data object for sectionlist
    const getContactsDividedByLetters = (array) => {
        function getFirstLetterFrom(value) {
            return value.slice(0, 1).toUpperCase();
        }

        let res;
        if (array.length==0 || !array) res = [{"title": '', data: []}];
        else res = array.reduce(function (list, name) {
            let newName = name;
            let listItem = list.find((item) => item.title.toUpperCase() && item.title.toUpperCase() === getFirstLetterFrom(newName.name));
            if (!listItem) {
                list.push({"title": getFirstLetterFrom(newName.name), "data": [newName]})
            } else {
                listItem.data.push(newName)
            }
        
            return list;
        }, [])
            
        return res
    }

    const handleCencleBtn = () => {
        setSerchTermInput('')
        props.showTheContactsView()
    }


    //--------------------------------------------------------------------------------------------
    return (
        <Modal visible={props.contactViewMod} animationType="slide" style={styles.container} >
            <View style={{ flex: 1 }}>
                <SafeAreaView />
                <View style={{ backgroundColor: Colors.colorCloud }}>
                    <TextInput
                        placeholder={getTranslation(transFile.name)+ '...'}
                        style={{...styles.inputSerch, textAlign: getDirection(deviceLanguage).align}}
                        onChangeText={(value) => { setSerchTermInput(value) }}
                    />
                </View>
                <View style={{ flex: 0.95 }}>
                    {isLoading && (
                        <View
                            style={{
                                ...StyleSheet.absoluteFill,
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            <ActivityIndicator size="large" color={Colors.colorSeafoamBlue} />
                        </View>
                    )}
                    <SectionList
                        sections={getContactsDividedByLetters(searchContacts())}
                        renderItem={renderItem}
                        keyExtractor={(item, index) => item + index}
                        ListEmptyComponent={() => (
                            <View style={emptyContactsList}>
                                <Text style={{ color: Colors.colorCloud }}>No Contacts Found</Text>
                            </View>
                        )}
                        renderSectionHeader={renderSectionHeader}
                        refreshing={true}
                     />
                </View>
                <View>
                    <Button title={getTranslation(transFile.cancel_uppercase)} onPress={handleCencleBtn} style={styles.cancelButton} />
                </View>
            </View>

        </Modal>
    )
}

//---------styles----------
const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        marginHorizontal: 15,
    },

    serchInputVeiw: {
        flexDirection: "row",
        width: "100%",
        justifyContent: "space-between",
        paddingHorizontal: 15,
    },

    inputSerch: {
        marginTop: 10,
        marginBottom: 10,
        marginHorizontal: 10,
        height: 50,
        fontSize: 20,
        padding: 10,
        color: Colors.colorBlack,
        borderWidth: 1,
        borderColor: Colors.colorCloud,
        backgroundColor: Colors.colorWhite,
        borderRadius: 10,
    },

    emptyContactsList: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 50,
    },

    cancelButton: {
        justifyContent: "center",
        margin: 20,
        width: "100%",
        alignItems: "center",
    },

    cnclBtnView: {
        justifyContent: "center",
        margin:0
    },

    serchBtn: {
        width: "100%"
    },

    contactsTitle: {
        paddingTop: 10,
        paddingBottom: 5,
        paddingHorizontal: 5,
        marginTop: -5,
        marginHorizontal: 20,
        color: Colors.colorBlack,
        fontWeight: 'bold',
        fontSize: 18,
        flex: 1,
        flexDirection: "row"
    },

    contactsTitleView: {
        minHeight: 30,
        backgroundColor: Colors.colorCloud,
    },

    contactsRendered: {
        paddingHorizontal: 5,
        paddingVertical: 15,
        marginHorizontal: 20,
        color: Colors.colorBlack,
        fontSize: 16,
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
    },


    contactsRenderedView: {
        minHeight: 35,
        backgroundColor: Colors.colorWhite,
        borderBottomColor: Colors.colorCloud,
        borderBottomWidth: 1,
    },
});
