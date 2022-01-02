import React, { useState, useEffect } from 'react';
import {
    StyleSheet,
    TouchableOpacity,
    Text,
    View,
    TextInput,
    SafeAreaView,
    FlatList,
    ActivityIndicator,
    Modal,
    Button,
} from 'react-native';
import * as Contacts from 'expo-contacts';
import Colors from '../../../Colors';


export default function ContactList(props) {
    //------hooks----------
    const [contacts, setContacts] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [serchTermInput, setSerchTermInput] = useState('');
    const [DATA,setDATA] = useState([
        {
          title: "Main dishes",
          data: ["Pizza", "Burger", "Risotto"]
        },
        {
          title: "Sides",
          data: ["French Fries", "Onion Rings", "Fried Shrimps"]
        },
        {
          title: "Drinks",
          data: ["Water", "Coke", "Beer"]
        },
        {
          title: "Desserts",
          data: ["Cheese Cake", "Ice Cream"]
        }
      ])
    //------functions-------------------
    const loadContacts = async () => {

        const { status } = await Contacts.requestPermissionsAsync();
        if (status === 'granted') {
            const { data } = await Contacts.getContactsAsync();
            data.sort((a, b) => a.name.localeCompare(b.name));
            setContacts(data);
            setIsLoading(false)
        }

    }
    
    const getContactsDividedByLetters = (array) => {
        function getFirstLetterFrom(value) {
            return value.slice(0, 1).toUpperCase();
        }

    let res, res1 = [{"title": '', data: []}];
    if (array.length==0 || array == undefined) res = [{"title": '', data: []}];
    else res = array.reduce(function (list, name, index) {
        let newName = name
        let listItem = list.find((item) => item.title.toUpperCase() && item.title.toUpperCase() === getFirstLetterFrom(newName.name));
        if (!listItem) {
            list.push({"title": getFirstLetterFrom(newName.name), "data": [newName]})
        } else {
            listItem.data.push(newName)
        }
    
        return list;
    }, [])
        
    console.log (res[20]);
    return res1
    }
    
    useEffect(() => {
        setIsLoading(true);
        loadContacts();
    }, [])

    //how items appear in the flatlist
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
                        <Text style={styles.contactsRendered}>
                            {item.name}
                        </Text>
                        <Text style={styles.contactsRendered}>
                            {item.phoneNumbers[0].number}
                        </Text>
                    </TouchableOpacity>
                </View>

            )
        }

    }


    const Item = ({ title, style1, style2, style3 }) => (
        <View style={style1}>
            <TouchableOpacity
                onPress={() => {
                    props.pickedContectHandler(title)
                    setSerchTermInput('')
                }}>
                <Text style={style2}>
                    {title}
                </Text>
                <Text style={style3}>
                    {title}
                </Text>
            </TouchableOpacity>
        </View>
    );

    const Titleitem = ({ title, style1, style2 }) => (
        <View style={style1}>
            <Text style={style2}>
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
                return Lowercasecontact.indexOf(searchLowercase) > -1;
            })
            return filteredContacts

        }
        return contacts
    };

    const handleCencleBtn = () => {
        setSerchTermInput('')
        props.showTheContactsView()
    }


    //--------------------------------------------------------------------------------------------
    return (
        <Modal visible={props.contactViewMod} animationType="slide" style={styles.container} >
            <View style={{ flex: 1 }}>
                <SafeAreaView />
                <View style={{ backgroundColor: "grey" }}>
                    <TextInput
                        placeholder="Search"
                        placeholderTextColor="rgb(116,116,116)"
                        style={styles.inputSerch}
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
                            <ActivityIndicator size="large" color="#bad555" />
                        </View>
                    )}
                    <FlatList
                        data={searchContacts()}
                        renderItem={renderItem}
                        keyExtractor={(item, index) => index.toString()}
                        ListEmptyComponent={() => (
                            <View
                                style={{
                                    flex: 1,
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginTop: 50,

                                }}
                            >
                                <Text style={{ color: 'gray' }}>No Contacts Found</Text>
                            </View>
                        )}
                    />
                </View>
                <View>
                    <Button title={"cancle"} onPress={handleCencleBtn} style={styles.cancelButton} />
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
        color: '#7d90a0',
        borderWidth: 1,
        borderColor: '#7d90a0',
        backgroundColor: Colors.colorWhite,
    },

    cancelButton: {
        justifyContent: "center",
        margin: 20,
        width: "80%",
        alignItems: "center",
    },

    cnclBtnView: {
        justifyContent: "center",
        margin:0
    },

    serchBtn: {
        width: "20%"
    },

    contactsTitle: {
        paddingTop: 10,
        paddingBottom: 10,
        paddingHorizontal: 5,
        marginTop: -5,
        marginHorizontal: 20,
        color: 'black',
        fontWeight: 'bold',
        fontSize: 20,
        flex: 1,
        flexDirection: "row"
    },

    contactsTitleView: {
        minHeight: 30,
        backgroundColor: "#dcdcdc",
    },

    contactsRendered: {
        padding: 5,
        marginHorizontal: 20,
        color: 'black',
        fontSize: 16,
        flex: 1,
        flexDirection: "row",
    },

    contactsRendered2: {
        padding: 5,
        marginHorizontal: 20,
        color: 'black',
        fontSize: 16,
        flex: 1,
        flexDirection: "row",
        borderBottomColor: Colors.colordarkCoral,
        borderBottomWidth: 0.5,
    },

    contactsRenderedView: {
        marginTop: -5,
        minHeight: 70,
        backgroundColor: "#f5f5dc",
    },
});
