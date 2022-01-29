import React, { useState, useEffect, useContext } from "react";
import { View, StyleSheet } from "react-native";
import { Button, Overlay } from "react-native-elements";
import transFile from "../../../TranslateFile";
import { TransText, getTranslation } from "react-native-translation";
import { useNavigation } from "@react-navigation/native";
import AppContext from "../../../../store/AppContext";

function JumpingMessage(props) {

  const cancel = getTranslation(transFile.cancel_uppercase);


  if (props.overlayScreens == true || props.msgType !== 1) {

      const {renderPosts} = useContext(AppContext);
  
      const Navigation = useNavigation();
      const [yeButton, setYesButton] = useState();
      const [noButton, setNoButton] = useState();
      сonst [title, setTitle] = useState ("");
      const [bodyTxt, setBodyTxt] = useState ("");
      const [isLoaded, setIsLoaded] = useState (false);
  
      const action = () => {
        if  (props.msgType === 0)  {
            props.changePostStatus(props.post);
            props.setisVisibleClose(false);
            renderPosts()
            Navigation.navigate("homePageMain");
        }

        props.setoverlayScreens(false);
      }

      useEffect(() => {
      switch (props.msgType) {
        case 0: 
          setYesButton (transFile.yes);
          setNoButton(transFile.no);
          setTitle (transFile.close)
          setBodyTxt (transFile.closeNote)
          break;
  
          case 1: 
          setYesButton (transFile.yesDelete);
          setNoButton(transFile.no);
          setTitle (transFile.delete);
          setBodyTxt (transFile.deleteNote)
          break;
  
      }
  
      setIsLoaded (true);
  
      }, [])
  
    return (
      <View>
        <Overlay overlayStyle={styles.overlayStyle} isVisible={true}>
          <TransText style={styles.headerText} dictionary={title} />

          <TransText style={styles.text} dictionary={bodyTxt} />

          <View style={{ flexDirection: "row-reverse" }}>
            <Button
              onPress={action}
              type="clear"
              title={() => {
                return (
                  <TransText
                    style={styles.TransTextyesDelete}
                    dictionary={yeButton}
                  />
                );
              }}
            />
            <Button
              onPress={() => props.setisVisible(false)}
              type="clear"
              title={() => {
                return (
                  <TransText
                    style={styles.TransText}
                    dictionary={noButton}
                  />
                );
              }}
            />
          </View>
        </Overlay>

      </View>
    );

  } else {
    const [counter, setCounter] = useState(3);

    useEffect(() => {
      var counterStatus = counter;

      const interval = setInterval(() => {
        if (counterStatus > 0) {
          counterStatus--;
          console.log('counterStatus',counterStatus);
          setCounter(counterStatus);
        } else if (counterStatus === 0 && props.overlayScreens == false) {
          props.deletePost(props.post);
          props.setisVisible(false)
          clearInterval(interval);
        }
      }, 1000);
      return () => {
        clearInterval(interval);
      };
    }, []);

    return (
      <View>
        <Overlay overlayStyle={styles.overlayStyle}>
          <TransText
            style={styles.text1}
            dictionary={transFile.deletedMessage}
          />
          <Button
            onPress={() => {
              props.setisVisible(false);
              props.setoverlayScreens(true);
            }}
            type="clear"
            titleStyle={styles.TransText}
            title={`${cancel}(${counter})`}
          />
        </Overlay>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  overlayStyle: { margin: 20, borderRadius: 9 },
  headerText: {
    fontSize: 22,
    textAlign: "right",
    margin:10
  },
  text: {
    fontSize: 18,
    textAlign: "right",
     margin:10,
    color: "grey",
  },
  text1: {
    fontSize: 18,
    textAlign: "center",
    marginLeft: 70,
    marginRight: 70,
    marginTop: 50,
    color: "grey",
  },
  TransTextyesDelete: {
    marginTop: 15,
    marginBottom: 15,
    marginLeft: 10,
    marginRight: 10,
    fontSize: 23,
    color: "red",
  },
  TransText: {
    marginTop: 15,
    marginBottom: 15,
    marginLeft: 10,
    marginRight: 10,
    fontSize: 23,
  },
});

export default JumpingMessage;