import React, { useEffect, useState } from "react";
import {
  Image,
  StyleSheet,
  View,
  TouchableOpacity,
  Text,
  TextInput,
  Alert,
} from "react-native";
import { getTranslation } from "react-native-translation";
import countries from "../../data/countries.json";
import { CustomPicker } from "react-native-custom-picker";
import AsyncStorage from '@react-native-async-storage/async-storage';
import BG from '../../components/BG/BG'
import Colors from "../../utils/Colors";
import { phoneNumberWithoutZero } from "../../utils/functionsUtils";
import PopupWindow from "../../components/modal/PopupWindow";
import {sendPhoneNumber} from '../../api'
import sizes from "../../utils/sizes";
import { imageIndex } from "../../../assets/imageIndex";
import TextComp from "../../components/text/TextComp";
import { mainBtn } from "../../utils/StylesComponent";
import transFile from "../../translate/TranslateFile";
import ScreenNames from "../ScreenNames";

export default function Register({ navigation }) {
  const initCountry = countries.countries.find((item) => item.code == "+972");
  const [phone, setPhone] = useState({ phone: "" });
  const [country, setCountry] = useState(initCountry);
  const [isVisible, setIsVisible] = useState(false);
  const [modal, setModal] = useState(false);
  const [renderListener, setRenderListener] = useState(0);

  const params = {
    picker: {
      maxHeight: Platform.OS == "web" ? 150 : "80%",
      style: styles.picker,
      value: country,
      itemValue: (item) => item.code,
      getLabel: (item) => item.name + " (" + item.code + ")",
      onValueChange: (itemValue, itemIndex) => setCountry(itemValue),
      options: countries.countries,
      fieldTemplate: (val) => renderField(val),
      modalAnimationType: "slide",
    },
    phoneVerificationMessageProps: {
      title: transFile.verifyPhone_verifyMessage,
      text: country.code + " " + phoneNumberWithoutZero(phone.phone),
      noBtn:{
        onPress:()=>{ yesPress() },
        text: transFile.ok_uppercase,
      },
      yesBtn:{
        onPress:()=>{ setIsVisible (false) },
        text: transFile.edit_lowercase,
      },
    },
    phoneErrorMessageProps: {
      overlayStyle: {alignItems: 'center'},
      title: transFile.contactUs_message,
      text: getTranslation(transFile.verifyPhone_errorMessage),
      noBtn:{
        onPress: () => { setIsVisible (false)},
        text: transFile.ok_uppercase,
      },
      btnViewStyle: {justifyContent: 'center', marginTop: 25,},
    },
    bg:{
      backgroundSource:imageIndex.register_Background(),
      style:styles.main,
    },
  };

  function handleChange(event) {
    setPhone({ phone: event });
  }
  function phonenumber(inputtxt) {
    var phoneno = /^\d{4}[1-9]|\d{3}[1-9]\d|\d{2}[1-9]\d{2}|\d[1-9]\d{3}|[1-9]\d{4}$/;
    let phoneNum = phone.phone
    let phoneStart = phoneNum.slice(0,3)
    let israelPostCode = "972"
    if(phoneStart == israelPostCode){
      inputtxt = phoneNum.substring (3);
      if (inputtxt.length == 9) inputtxt = "0" + inputtxt;
      handleChange(inputtxt);
    }
    if (inputtxt.match(phoneno) && inputtxt.length == 10) {
      return true;
    } else {
      return false;
    }
  }

  const btnAction = () => {
    let varify = phonenumber(phone.phone);
    if (!varify) {
      setRenderListener(renderListener + 1);
      setIsVisible(true);
      setModal (params.phoneErrorMessageProps);   
      return;
    }
    else {
      alert (phone.phone)
      setIsVisible(true);
      setModal (params.phoneVerificationMessageProps);   
    }
  };

  // send phone to server
  const yesPress = async () => {
    try {
      let phoneToSend = country.code + phoneNumberWithoutZero(phone.phone);
      let dataFromServer = await sendPhoneNumber({ phone: phoneToSend });
      if (dataFromServer?.status == 200) {
        let serverData = dataFromServer.data;
        await AsyncStorage.setItem("@storage_Token", serverData.token);
        await AsyncStorage.setItem("@storage_Telphone", phone.phone);
        await AsyncStorage.setItem("@storage_CountryCode", country.code);
        setIsVisible(false);
        navigation.push(ScreenNames.VerificationCode, {
          token: serverData.token,
          phone: phone.phone,
          country: country.code,
          phoneObject: {
            phone: phone.phone,
            countryCode: country.code,
          },
        });
      }
    } catch (err) {
      console.error ('Send phone Error: ', err);
    }
  };

  //   picker render
  const renderField = (settings) => {
    const { selectedItem, defaultText, getLabel, clear } = settings;
    return (
      <View style={styles.costumPickerField}>
        <View>
          {!selectedItem && (
            <Text style={[styles.text, { color: Colors.CoolGrey }]}>{defaultText}</Text>
          )}
          {selectedItem && (
            <View style={styles.innerCostumPickerField}>
              <TouchableOpacity style={styles.clearButton} onPress={clear}>
                <Text style={{ color: Colors.White }}></Text>
              </TouchableOpacity>
              <Text style={[styles.text, { color: selectedItem.color }]}>
                {getLabel(selectedItem)}
              </Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <BG {...params.bg} >
        <View style={{ width: "100%", alignItems: "center", flex:1, justifyContent:"space-around" }}>
          <TextComp
            style={styles.headerText}
            translate={transFile.verifyPhone_title}
          />
          <Image
            source={imageIndex.smsLogo()}
            style={[
              styles.smsLogo,
            ]}
          />
        </View>
        {/* box down */}
        <View style={styles.boxDown}>
          <TextComp style={styles.mainText} translate={transFile.verifyPhone_message} />
          <CustomPicker {...params.picker} />

          <TextInput
            style={styles.secondInput}
            placeholder={getTranslation(transFile.verifyPhone_phoneHint)}
            onChangeText={(text) => handleChange(text)}
            keyboardType="phone-pad"
            returnKeyType="done"
            returnKeyLabel="Done"
            onSubmitEditing={btnAction}
          />
          {mainBtn(btnAction, transFile.next_uppercase)}
          {modal && <PopupWindow {...modal } isVisible={isVisible} />}
        </View>
    </BG>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  main: {
    flex: 1,
    paddingTop: 40,
    justifyContent: "space-between",
  },
  headerText: {
    color: Colors.White248RGB,
    fontSize: 20,
    textTransform: "uppercase",
    fontWeight: "bold",
    textAlign: "center",
  },
  smsLogo: {
    width: 90,
    height: 120,
    marginTop: 20,
    resizeMode: "contain",
  },
  boxDown: {
    borderTopEndRadius: 50,
    borderTopStartRadius: 50,
    backgroundColor: Colors.White,
    flex:0.7,
    paddingVertical: 30,
    width: sizes.PageWidth,
    justifyContent: "space-around",
    paddingBottom: 40,
  },
  costumPickerField: {
    borderBottomColor: Colors.CoolGrey,
    borderColor: Colors.CoolGrey,
    borderBottomWidth: 1,
    padding: 15,
  },
  innerCostumPickerField: {
    flexDirection: "row",
    alignItems: "stretch",
  },
  text: {
    fontSize: 18,
  },
  mainText:{
    paddingHorizontal:20,
    fontSize:18,
    color:Colors.SlateGrey,
    textAlign:"center"
  },
  picker: {
    width: "100%",
    alignSelf: "center",
    paddingRight: 10,
    paddingLeft: 10,
  },
  secondInput: {
    height: 40,
    borderWidth: 0,
    borderBottomWidth: 1,
    fontSize: 18,
    borderColor: Colors.CoolGrey,
    paddingHorizontal: 7,
    width: "95%",
    textAlign: "right",
  },
});
