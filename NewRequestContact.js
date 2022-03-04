import React, { useState, useContext } from "react";
import {
  TouchableOpacity,
  StyleSheet,
  Text,
  View,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { TransText, getTranslation } from "react-native-translation";
import transFile from "../../translate/TranslateFile";
import ContactList from "./Details/ContactList";
import { mainBtn } from "../../utils/StylesComponent";
import Colors from "../../utils/Colors";
import BG from "../BG/BG";
import ContactsIcon from "../../../assets/svg/categories/ContactsIcon";
import AppContext from "../../store/AppContext";
import BackBtn from "../backBtn/BackBtn";
import { observer } from "mobx-react";
import TextComp from "../text/TextComp";
import PopupWindow from "../modal/PopupWindow";
import ScreenNames from "../../screens/ScreenNames";
import TranslateFile from "../../translate/TranslateFile";

const NewRequestContact = observer((props) => {
  const { postId, NewRequestStore, updateUserMessage } = props
  const postData = NewRequestStore.postData
  //true for my details radio and false for someone else radio
  const [value, setValue] = useState(true);
  const [userName, setUserName] = useState(postData.userName ? postData.userName : "");
  const [phone, setPhone] = useState(postData.phone);
  const [isLoading, setIslLoading] = useState(false);
  const [showContactsView, setShowContactsView] = useState(false);
  const [showContactsViewButton, setShowContactsViewButton] = useState(false);
  const [isPhoneNumber, setIsPhoneNumber] = useState (true);
  const [isUsername, setIsUername] = useState (true);
  const navigation = props.navigation;
  const [isVisible, setisVisible] = useState(false);
  const { user } = useContext(AppContext);
  const { getDirection, deviceLanguage } = user;
  const direction = getDirection (deviceLanguage);
  
  //{"align": "right", "alignSelf": "flex-end", "flexDirection": "row-reverse"}

  const renderContent = () => {
    return (
      <View style={{...styles.detailsBox}}>
        <View style={{...styles.textInputTitleView, flexDirection: direction.flexDirection}}>
          <TransText
            style={styles.inputsTitlesSmall}
            dictionary={transFile.name}
          />
          { !isUsername && <TransText
            style={{...styles.inputsTitlesSmall, color: Colors.red, 
            }}
            dictionary={transFile.validation_shortName}
          /> }
        </View>
        <TextInput
          value={userName}
          onChangeText={(text) => handleNameInput(text)}
          style={{...styles.secondInput,
          borderColor: isUsername ? Colors.colorBlack : Colors.red }}
          textAlign={direction.align}
          keyboardType="default"
        ></TextInput>

        {/* inputs small titles */}
        <View style={{...styles.textInputTitleView, flexDirection: direction.flexDirection}}>
          <TransText
            style={styles.inputsTitlesSmall}
            dictionary={transFile.phone}
          />
          { !isPhoneNumber && <TransText
            style={{...styles.inputsTitlesSmall, color: Colors.red, }}
            dictionary={transFile.validation_validNumber}
          /> }
        </View>
        <TextInput
          value={phone}
          onChangeText={(text) => handlePhoneInput(text)}
          style={{...styles.secondInput,
          borderColor: isPhoneNumber ? Colors.colorBlack : Colors.red }}
          textAlign={direction.align}
          keyboardType="number-pad"
          editable={!value}
          dataDetectorTypes="phoneNumber"
        ></TextInput>
      </View>
    )
  }
  //----radio props for tuggle details------
  var radio_props = [
    {
      //my phone and name inputs
      key: true,
      label: (
        <TransText
          style={styles.radioTitles}
          dictionary={transFile.newRequest_contactOptionMyDetails}
        />
      ),
      value: true,
      content: (
        renderContent()
      ),
    },
    {
      // someone else phone and name inputs
      key: false,
      label: (
        <TransText
          style={styles.radioTitles}
          dictionary={transFile.newRequest_contactOptionSomeoneElse}
        />
      ),
      content: (
        renderContent()
      ),
      value: false,
    },
  ];

  const phoneNumberValidator = (phoneNumber) => {
    let phoneRegex = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;
    let validation = phoneNumber.match(phoneRegex);
    return validation!==null;
  }

  const sendRequetToServer = () => {
    NewRequestStore.sendPostToServer(postId).then((res) => {     
      if (res.code === 200) {
        setisVisible (true);
        updateUserMessage(TranslateFile.newRequest_successMessage);
        navigation.navigate(ScreenNames.homePageMain)
      }
      else {
        updateUserMessage(TranslateFile.serverConnectionErrorMessage);
        navigation.navigate(ScreenNames.homePageMain)
      }
    }).catch(e => {
      updateUserMessage(TranslateFile.serverConnectionErrorMessage);
      navigation.navigate(ScreenNames.homePageMain)
    })
  };

  const nextBtnAction = () => {
      if (value === radio_props[1].key) 
      { 
         let isName = userName.length >= 2;
         let isValidPhoneNum = phoneNumberValidator(phone);
         setIsUername (isName) 
         setIsPhoneNumber (isValidPhoneNum) 
         if (isName && isValidPhoneNum) sendRequetToServer ();
      }
      else {
        if (userName.length !== 1) sendRequetToServer ();
        else setIsUername (false);
      }
  }    

  const showTheContactsView = () => {
    setShowContactsView(!showContactsView);
  };

  const showTheContactsViewButton = (value) => {
    setShowContactsViewButton(value);
  };

  const userNameHandler = (trueFalse) => {
    if (trueFalse) {
      handleNameInput(postData.userName);
      handlePhoneInput(postData.phone);
    } else {
      handleNameInput("");
      handlePhoneInput("");
    }
  };

  //updates the user and phone and close the modal
  const pickedContectHandler = (obj) => {
    handleNameInput (obj.name);
    handlePhoneInput (obj.phone);
    setShowContactsViewButton(true);
    setShowContactsView(!showContactsView);
  };
  const handleNameInput = (text) => {
    //setIsUername (text?.length > 0);    
    setUserName(text);
  }
  const handlePhoneInput = (text) => {
    //setIsPhoneNumber (phoneNumberValidator (text))
    setPhone(text);
  }

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => {
        return (
          <BackBtn onPress={() => {
            props.setActivePage((prev) => prev - 1);
          }} />
        );
      },
    });
  }, [navigation]);
  
  
  const sendToWhatsappMessageParams = {
    text: getTranslation(transFile.whatsAppQuestion),
    noBtn:{
      onPress: () => {
        setisVisible(false);
      },
      text: transFile.cancel_uppercase,
    },
    yesBtn:{
      onPress: () =>{ 
        setisVisible(false);
        //transFile.postedForOtherMessage
      },
      text: transFile.send,
    },
    isVisible: isVisible
  }

  //-------------------------------------------------------------------------

  return (
    <BG style={styles.container}>
      {/* top text */}
      <TextComp style={styles.textView} alignText={true} translate={transFile.newRequest_contactDescription} />
      <View>
        {/* /my details radio */}
        <View>
          <View style={{...styles.detailsRow, 
              direction: direction.align == "left" ? "ltr" : "rtl",}}>
            <Text style={styles.radioText}>{radio_props[0].label}</Text>
            <TouchableOpacity
              style={styles.radioCircle}
              onPress={() => {
                setValue(radio_props[0].key);
                userNameHandler(true);
                setIsUername (true) 
                setIsPhoneNumber (true)        
                showTheContactsViewButton(false);
              }}
            >
              {value === radio_props[0].key && (
                <View style={styles.selectedRb} />
              )}
            </TouchableOpacity>
          </View>
          {/* name and phone input */}
          <View style={styles.inputs}>
            {value === radio_props[0].key && (
              <View style={styles.containerRadio}>
                {radio_props[0].content}
              </View>
            )}
          </View>
        </View>
        <View>
          {/* someone else radio */}
          <View style={{...styles.detailsRow, 
              direction: direction.align == "left" ? "ltr" : "rtl",}}>
            <Text style={styles.radioText}>{radio_props[1].label}</Text>

            <TouchableOpacity
              style={styles.radioCircle}
              onPress={() => {
                setIsUername (true) 
                setIsPhoneNumber (true)        
                showTheContactsViewButton(true);
                setValue(radio_props[1].key);
                userNameHandler(false);
              }}
            >
              {value === radio_props[1].key && (
                <View style={styles.selectedRb} />
              )}
            </TouchableOpacity>
          </View>
          {/* name and phone inputes */}
          <View style={styles.inputs}>
            {value === radio_props[1].key && (
              <View style={styles.containerRadio}>
                {radio_props[1].content}
              </View>
            )}
          </View>
        </View>
      </View>
      <View>
        {/* page for picking other contact */}
        {showContactsViewButton && 
          <View>
            <TouchableOpacity
              onPress={showTheContactsView}
              style={{...styles.btnContacts, flexDirection: direction.flexDirection, }}
            >
              <ContactsIcon />
              <Text
                style={{
                  justifyContent: "center",
                  marginHorizontal: 5,
                }}
              >
                <TransText
                  dictionary={transFile.newRequest_contactsPicker}
                  style={{
                    color: "#747474",
                    fontSize: 18,
                    textTransform: "none",
                  }}
                />
              </Text>
            </TouchableOpacity>
          </View>
        }

        {showContactsView && (
          <ContactList
            pickedContectHandler={pickedContectHandler}
            contectViewMod={showContactsView}
            showTheContactsView={showTheContactsView}
          />
        )}
      </View>
      <View style={{ flex: 1, justifyContent: "flex-end", marginTop: 100 }}>
        {isLoading ? (
          <ActivityIndicator size="large" color={Colors.colorSeafoamBlue} />
        ) : (
          mainBtn(nextBtnAction, transFile.next_uppercase)
        )}
      </View>
      {
        (value == radio_props[1].key) && 
        <PopupWindow {...sendToWhatsappMessageParams} />
      }
    </BG>
  );
})

//-------------styles-------------------------------------
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-around",
  },
  detailsRow: {
    flexDirection: "row-reverse",
    justifyContent: "flex-end",
    paddingHorizontal: 20,
    paddingTop: 10,
  },

  radioText: {
    marginRight: 33,
    fontSize: 18,
    color: "#000",
    fontWeight: "700",
  },

  inputs: {
    justifyContent: "center",
  },

  // View of name and phone number
  detailsBox: {
    flex: 1,
    width: "100%",
    borderColor: "#ccc",
    borderRadius: 5,
    paddingLeft: 10,
    paddingRight: 10,
  },

  radioCircle: {
    height: 24,
    width: 24,
    borderRadius: 100,
    borderWidth: 2,
    borderColor: "rgb(57,55,119)",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: -10,
    marginHorizontal: 5,
  },

  selectedRb: {
    width: 15,
    height: 15,
    borderRadius: 50,
    backgroundColor: "rgb(57,55,119)",
  },

  result: {
    color: "white",
    fontWeight: "600",
    backgroundColor: "#F3FBFE",
  },

  containerRadio: {
    alignItems: "center",
  },

  secondInput: {
    height: 47,
    borderColor: "rgb(180,179,191)",
    borderRadius: 5,
    borderWidth: 1,
    fontSize: 18,
    paddingHorizontal: 16,
    width: "100%",
    marginVertical: 10,
    color: "grey",
  },

  textView: {
    width: "100%",
    paddingHorizontal: 10
  },

  btnBox: {
    flex: 1,
    alignItems: "center",
    alignSelf: "center",
    alignContent: "center",
    marginVertical: 36,
    width: 350,
  },
  inputsTitlesSmall: {
    color: "rgb(180, 179, 191)",
    marginTop: 5,
  },

  radioTitles: {
    color: "rgb(116,116,116)",
    fontWeight: "normal",
  },

  textInputTitleView: {
    alignItems: "center",
    height: 29,
    width: "100%",
    justifyContent: "space-between",
  },

  btnContacts: {
    alignItems: 'center',
    fontSize: 18,
    height: 25,
    marginHorizontal: 10,
  },
});

export default NewRequestContact
