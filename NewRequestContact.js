import React, { useState, useContext, useEffect } from "react";
import {
  TouchableOpacity,
  StyleSheet,
  Text,
  View,
  TextInput,
  ActivityIndicator,
  Alert,
} from "react-native";
import { TransText } from "react-native-translation";
import transFile from "../../TranslateFile";
import { DataStorage } from "../../DataStorage";
import ContactList from "./Contant/ContactList";
import { mainBtn } from "../../StylesComponent";
import postInformation from "../../PostInformation";
import { axiosRequest } from "../../utils/functionsUtils";
import Colors from "../../Colors";
import urls from "../../../api/urls";
import BG from "../../BG/BG";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Button } from "react-native-paper";
import Icon from "react-native-vector-icons/Ionicons";
import * as Localization from 'expo-localization';

const locale = Localization.locale 
const side = lovale === 'he-IL' ? "right" : "left";

export default function NewRequestContact(props) {
  //true for my details radio and false for someone else radio
  const [value, setValue] = useState(true);
  const [userData, setUserData] = useContext(DataStorage);
  //checker for the input value (first with my phone, second empty)
  const [inputFlag, setInputFlag] = useState(true);
  const [userName, setUserName] = useState(
    props.postDataToServer.userName ? props.postDataToServer.userName : ""
  );
  const [phone, setPhone] = useState(props.postDataToServer.phone);
  const [isLoading, setIslLoading] = useState(false);
  const [showContactsView, setShowContactsView] = useState(false);
  const [showContactsViewButton, setShowContactsViewButton] = useState(false);
  const postData = props.postDataToServer;
  const nowTime = new Date().getTime();
  const [postContainer, setPostContainer] = useState({
    lat: postData.lat,
    lng: postData.lng,
    phone: postData.phone,
    expireDate: postInformation.expireDate[postData.expireDate].value + nowTime,
    content: postData.content,
    userName: postData.userName ? postData.userName : "",
    radius: postInformation?.radius[postData.radius]?.value,
    cityId: postData.city,
    attachments: [],
    categoryType: postData.categoryId,
    urgencyType: postData?.urgencyId?.value,
  });
  const activePageFlag = props.activePage;
  const navigation = props.navigation;

  // ------ axios request --------//
  const sendPostToServer = async (images, editOrNew) => {
    if (activePageFlag == 2) {
      const postImages = images ? images : [];
      const mainUrl = userData.mainUrl;
      let sentPostDomain = "";
      if (editOrNew == false) {
        sentPostDomain = urls.createNewPost(postData.token);
      } else {
        sentPostDomain = urls.editPostRequest(postData.id, postData.token);
      }
      let fullPostDataToServer = postContainer;
      fullPostDataToServer.attachments = postImages;
      console.log("data sent to server:", fullPostDataToServer);
      let data = axiosRequest(sentPostDomain, "POST", fullPostDataToServer);
      // checking the data Promise recieved by the function
      data
        .then(async (serverData) => {
          console.log("serverData", serverData);
          let newUser = { ...userData.userDetails };
          newUser.userName = userName;
          AsyncStorage.setItem("USER", JSON.stringify(newUser));
          setUserData({
            ...userData,
            updateUserMessage: transFile.newRequest_successMessage,
            userDetails: { ...userData.userDetails, userName: userName },
            flag: userData.flag + 1,
          });
          // await props.setActivePage(0);
          setIslLoading(false);
          navigation.navigate("homePageMain");
        })
        .catch((mes) => {
          setIslLoading(false);
          console.log("error axios line 72 newRequestContact", mes);
          Alert.alert(mes);
        });
    }
  };
  const sendImageAndPostToServer = async (editOrNew) => {
    let imagesLength = props.postDataToServer.image?.length;
    if (imagesLength > 0) {
      const url =
        props.userData.mainUrl +
        props.userData.urlType.imageUplaod +
        `token=${props.postDataToServer.token}`;
      let imageToServer = axiosRequest(
        url,
        "post",
        props.postDataToServer.image
      );
      imageToServer
        .then((dataFromServer) => {
          console.log("axios image", dataFromServer);
          sendPostToServer(dataFromServer, editOrNew);
        })
        .catch((error) => console.log("error uploading pic", error));
    } else {
      console.log("no pic");
      sendPostToServer(undefined, editOrNew);
    }
  };

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
        <View style={styles.detailsBox}>
          <TransText
            style={[styles.inputsTitlesSmall]}
            dictionary={transFile.name}
          />
          <TextInput
            value={userName}
            editable={true}
            onChangeText={(text) => inputsChangeHandler("userName", text)}
            style={styles.secondInput}
            keyboardType="default"
          ></TextInput>
          <TransText
            style={styles.inputsTitlesSmall}
            dictionary={transFile.phone}
          />
          <TextInput
            value={phone}
            editable={false}
            onChangeText={(text) => inputsChangeHandler("phone", text)}
            style={styles.secondInput}
            keyboardType="default"
          ></TextInput>
        </View>
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
        <View style={styles.detailsBox}>
          <TransText
            style={styles.inputsTitlesSmall}
            dictionary={transFile.name}
          />
          <TextInput
            value={userName}
            onChangeText={(text) => inputsChangeHandler("userName", text)}
            style={styles.secondInput}
            keyboardType="default"
          ></TextInput>

          {/* inputs small titles */}
          <TransText
            style={styles.inputsTitlesSmall}
            dictionary={transFile.phone}
          />
          <TextInput
            value={phone}
            onChangeText={(text) => inputsChangeHandler("phone", text)}
            style={styles.secondInput}
            keyboardType="number-pad"
          ></TextInput>
        </View>
      ),
      value: false,
    },
  ];

  const nextBtnAction = async () => {
    setIslLoading(true);
    sendImageAndPostToServer(props.editOrNew);
  };

  const showTheContactsView = () => {
    setShowContactsView(!showContactsView);
  };

  const showTheContactsViewButton = (value) => {
    setShowContactsViewButton(value);
  };

  const userNameHandler = (trueFalse) => {
    if (trueFalse) {
      setUserName(props.postDataToServer.userName);
      setPhone(props.postDataToServer.phone);
    } else {
      setUserName("");
      setPhone("");
    }
  };

  //updates the user and phone and close the modal
  const pickedContectHandler = (obj) => {
    setUserName(obj.name);
    setPhone(obj.phone);
    setShowContactsViewButton(true);
    setShowContactsView(!showContactsView);
  };

  //inputs change and validation
  const inputsChangeHandler = (field, text) => {
    if (field === "userName") {
      console.log("text", text);
      setPostContainer({ ...postContainer, userName: text });
      setUserName(text);
    } else {
      setPhone(text);
    }
  };
  //-------------------------------------------------------------------------

  return (
    // <KeyboardAvoidingView behavior="padding" style={{ flex: 1,  height:sizes.PageHieght - 250,  }}>
    <BG style={styles.container}>
      {/* <View style={styles.container}> */}
      {/* top text */}
      <View style={styles.textView}>
        <Text style={styles.explain}>
          <TransText dictionary={transFile.newRequest_contactDescription} />
        </Text>
      </View>

      <View>
        {/* /my details radio */}
        <View>
          <View style={styles.detailsRow}>
            <Text style={styles.radioText}>{radio_props[0].label}</Text>

            <TouchableOpacity
              style={styles.radioCircle}
              onPress={() => {
                setInputFlag(1);
                setInputFlag(radio_props[0].key);
                setValue(radio_props[0].key);
                userNameHandler(true);
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
          <View style={styles.detailsRow}>
            <Text style={styles.radioText}>{radio_props[1].label}</Text>

            <TouchableOpacity
              style={styles.radioCircle}
              onPress={() => {
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
        { showContactsViewButton && (
          <Button 
            onPress={showTheContactsView}
            style={styles.btnContacts}>
                
            <Icon name="rocket" size={12} color='#747474' />
            <Text> 
              <TransText dictionary={transFile.newRequest_contactsPicker} 
                style={{textTransform: 'none', color: '#747474' }}/>
            </Text>
          </Button>
          )}  
                
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
      {/* </View> */}
      {/* </KeyboardAvoidingView> */}
    </BG>
  );
}

//-------------styles-------------------------------------
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-around",
  },
  detailsRow: {
    flexDirection: "row-reverse",
    justifyContent: "flex-end",
    direction: "rtl",
    paddingRight: 20,
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
    alignItems: "flex-start",
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
    marginHorizontal: 10,
    marginLeft: "-2.5%",
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
    textAlign: "left",
    marginVertical: 10,
    color: "grey",
  },

  explain: {
    width: "80%",
    textAlign: "left",
  },

  textView: {
    width: "100%",
    alignItems: side === 'left' ? "flex-start" : "flex-end",
    justifyContent: side === 'left' ? "flex-start" : "flex-end",
    marginLeft: "2%",
  },

  btnBox: {
    flex: 1,
    alignItems: "center",
    alignSelf: "center",
    alignContent: "center",
    justifyContent: "flex-end",
    marginVertical: 36,
    width: 350,
  },
  inputsTitlesSmall: {
    color: "rgb(180, 179, 191)",
    marginTop: 10,
  },

  radioTitles: {
    color: "rgb(116,116,116)",
    fontWeight: "normal"
  },

  btnContacts: {
    alignItems: "flex-start",
    justifyContent: "flex-start",
    color: '#747474',
    fontWeight: "normal",
    textTransform: 'none',
    height: 47,
  },
});
