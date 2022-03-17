import React, { useContext, memo, useState, FC } from "react";
import { View, StyleSheet, ScrollView, TouchableOpacity, FlatList, SafeAreaView } from "react-native";
import { TransText } from "react-native-translation";
import transFile from "../../../translate/TranslateFile.js";
import postInformation from "../../../utils/PostInformation.js";
import AppContext from "../../../store/AppContext.js";
import TextComp from "../../text/TextComp.js";
import Colors from "../../../utils/Colors.js";

const UrgencyComp =  memo((props) => {
  const { setUrgencyDetails, urgencyDetails, style } = props;
  const { getDirection } = useContext(AppContext);
  const value = postInformation.urgencyId[urgencyDetails];
  const urgencyBank = postInformation.urgencyId;
  const [showPicker, setShowPicker] = useState(false);

  const handlePickerChange = (itemId) => {
    itemId !== undefined && setUrgencyDetails(itemId);
  };

  const onItemPress = (uregencyId) => {
    //alert (uregencyId);
    handlePickerChange(uregencyId);
    setShowPicker(false);
  };

  const Item = (uregency) => {
    const isChoosen = uregency.key == urgencyDetails;
    return (
      <TouchableOpacity
        onPress={() => onItemPress(uregency.key)}
      >
        <TextComp
          alignText={true}
          style={[
            styles.itemText,
            {
              color: isChoosen
                ? Colors.SlateGrey
                : Colors.BattleshipGrey,
            },
          ]}
          translate={uregency?.label}
        />
      </TouchableOpacity>
    );
  };
  const renderList = (options) => {
    if (showPicker) {
      return (
        <SafeAreaView style={styles.list}>
          <FlatList
            data={options}
            renderItem={Item}
            keyExtractor={(item, index) => index.toString()}
            scrollEnabled="true"
            sel
          />
        </SafeAreaView>
      );
    }
    
    return (
      <View>
        <TouchableOpacity
          onPress={() => setShowPicker(true)}
          style={styles.picker}
        >
          <TextComp
            alignText={true}
            style={{color: Colors.SlateGrey,}}
            translate={value?.label}
          />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={[styles.costumPickerField,style]}>
      <TransText
        style={[styles.headerText, { textAlign: getDirection.align }, showPicker && {top: -22}]}
        dictionary={transFile.urgentLevel_uppercase}
      />
      {renderList(urgencyBank)}
    </View>
  );
});

const styles = StyleSheet.create({
  costumPickerField: {
    justifyContent: "center",
  },
  list: {
    top: -5,
    borderWidth: 1,
    borderRadius: 5,
    borderColor: Colors.CoolGrey,
    backgroundColor: Colors.White,
    shadowColor: Colors.Black,
    position: "absolute",
    zIndex: 99999,
    shadowOffset: {
      width: 0,
      height: 9,
    },
    shadowOpacity: 0.2,
    shadowRadius: 7.35,
    padding: 5,
    width: "100%"
  },
  picker: {
    borderColor: Colors.CoolGrey,
    borderWidth: 1,
    borderRadius: 5,
    height: 45,
    justifyContent: "center",
    paddingHorizontal: 5,
  },
  pickerRow: {
    justifyContent: "center",
  },
  headerText: {
    width: "100%",
    color: Colors.CoolGrey,
    fontSize: 10,
    marginBottom: 5,
  },
  itemText: {
    color: Colors.SlateGrey,
    margin: 1,
  },
});

export default UrgencyComp;
