import React, { useState, useContext } from "react";
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  TextInput,
} from "react-native";

export default function FilterPage() {
  const [searchContent, setSearchContent] = useState('');
  const lanDirection = 'right' //getDirection (deviceLanguage).align; 
  const plusButtonStyle = lanDirection ==='left' ? {right: 10, marginRight: 5} : {left: 10, marginLeft: 5};
  
  
  

  const params = {
    keywordInput: {
      value: searchContent,
      keyboardType:"default",
      returnKeyType:"next",
      onChangeText: (val) => {
        setSearchContent(val);
      },
      style: [styles.keywordInput, 
      lanDirection==='left'? { marginRight: 20} : {marginLeft: 20}]
    },
  }

  return (
      <View style={styles.keyWord}>
        <View style={styles.keywordInputView}>
          <TextInput {...params.keywordInput} />
          <TouchableOpacity style={[styles.keywordInputPlusButton, plusButtonStyle]}>
            <View style={{justifyContent: 'center'}}>
            <Text style={styles.plusButtonText}>+</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
  );
}

const styles = StyleSheet.create({
  keyWord: {
    marginTop: 10
  },
  keywordInputView: {
    borderWidth: 1,
    borderRadius: 7,
    paddingHorizontal: 10,
    borderColor: 'grey',
    height: 48,
    backgroundColor: 'white',
    justifyContent: 'center',
  },
  keywordInput: {
    fontSize: 16,
    height: 48,
    borderColor: 'red',
    //borderWidth: 1,
    color: 'grey',
  },
  keywordInputPlusButton: {
    position: 'absolute',
    justifyContent: 'center',
    flex: 1,
    height: 48,
    borderColor: 'green',
    //borderWidth: 1,
  },
  plusButtonText: {
    alignSelf: 'center',
    justifyContent: 'center',
    color: 'grey',
    fontSize: 28,
  }
});
