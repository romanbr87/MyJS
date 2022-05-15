import React, { useState, useContext } from "react";
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { TransText, getTranslation } from "react-native-translation";
import TranslateFile from "../../translate/TranslateFile";
import { mainBtn } from "../../utils/StylesComponent";
import colors from "../../utils/Colors.js";
import PostInformation from "../../utils/PostInformation.js";
import AutoCompleteBox from "../../components/autocomplete/AutoCompleteBox.js";
import TextComp from "../../components/text/TextComp";
import BG from "../../components/BG/BG.js";
import CategoryBubble from "../../components/filter/CategoryBubble.js/CategoryBubble.js";
import TagPress from "../../components/filter/Tags/TagPress";
import AppContext from "../../store/AppContext.js";
import Loader from "../../components/loader/Loader";
import AppHeader from "../../components/header/AppHeader";
import { MainStore } from "../../store/MainStore.store";
import BackBtn from "../../components/backBtn/BackBtn";
import InputBox from "../../components/input/InputBox";

export default function FilterPage({ navigation }) {
  const { user } = useContext(AppContext);
  const filterOptions = MainStore.mainFilterUrl
  const initCityState = {
    cityId: filterOptions.city,
    cityText: filterOptions.cityText
  }
  const initCategoryState = {
    color: filterOptions.category,
    category: null,
  }
  const [categoryBox, setCategoryBox] = useState(initCategoryState);
  const [cityData, setCityData] = useState(initCityState);
  const initValue = filterOptions.searchContent ? filterOptions.searchContent.split(',') : []
  const [searchContent, setSearchContent] = useState('');
  const [searchByWord, setSearchByWord] = useState(initValue);
  const [isLoading, setIsLoading] = useState(false)
  const locale = user.deviceLanguage
  const { deviceLanguage, getDirection } = user
  const lanDirection = getDirection (deviceLanguage).align; 
  const plusButtonStyle = lanDirection ==='left' ? {right: 10, marginRight: 5} : {left: 10, marginLeft: 5};
 
  // clear all btn
  function clearAll() {
    let initState = {
      cityId: null,
      cityText: ""
    }
    setCategoryBox({
      color: null,
      category: null,
    });
    setCityData(initState);
    setSearchContent(null);
    setSearchByWord([])
  }
  //    change background function and update user.category with the id (for the posts)
  function changeColorBox(category, id) {
    if (categoryBox.color === category) {
      setCategoryBox({
        color: null,
        category: null,
      });
    } else {
      setCategoryBox({
        color: category,
        category: id,
      });
    }
  }

  // update btn
  async function handleApply() {
    let allWords = searchByWord.join(",");
    MainStore.updateFilterUrl({
      category: categoryBox.color,
      city: cityData.placeId || null,
      cityText: cityData.cityText,
      searchContent: allWords,
    })
    navigation.navigate("homePageMain");
  }

  // category icon
  function categoryIconShow() {
    var categoryList = [
      "MEDICAL",
      "EMERGENCY",
      "ROAD_ASSIST",
      "ITEM_NEEDED",
      "GIVE_AWAY_ITEM",
      "LOST_AND_FOUND",
      "SOCIAL",
      "GENERAL",
      "RIDE_DELIVER",
    ];
    const list = categoryList.map((categoryName, index) => {
      return (
        <CategoryBubble
          key={index}
          index={index}
          checked={categoryBox.color === categoryName}
          text={PostInformation.filterCategory[categoryName]}
          onPress={() => {
            changeColorBox(categoryName, index + 1);
          }}
        />
      );
    });
    return <View style={[styles.categoryRow, { justifyContent: getDirection(deviceLanguage).alignSelf }]}>{list}</View>;
  }
  const onSearchWordPress = () => {
    if (searchContent !== '') {
      setSearchByWord([...searchByWord, searchContent]);
      setSearchContent('');
    }
  };
  const onXbtnSearchWordPress = (index) => {
    let newArr = [...searchByWord];
    newArr.splice(index, 1);
    setSearchByWord(newArr);
  };
  const onAutoCompleteResultPress = (placeId, address) => {
    setCityData({
      placeId: placeId,
      cityText: address
    })

  }

  const params = {
    appHeader: {
      title: getTranslation(TranslateFile.filter_title),
      rightComponent: () => <BackBtn />,
      leftComponent: () => (
        <TouchableOpacity onPress={clearAll}>
          <Text style={{ color: colors.White, fontSize: 20 }}>
            <TransText dictionary={TranslateFile.filter_clear} />
          </Text>
        </TouchableOpacity>
      )
    },
    categoryHeader: {
      alignText: true,
      style: styles.header,
      translate: TranslateFile.filter_pickCategory,
    },
    keywordHeader: {
      alignText: true,
      style: styles.header,
      translate: TranslateFile.filter_byKeyword,
    },
    keywordInput: {
      value: searchContent,
      keyboardType:"default",
      returnKeyType:"next",
      onSubmitEditing: () => onSearchWordPress(),
      onChangeText: (val) => {
        setSearchContent(val);
      },
      style: [styles.keywordInput,
      lanDirection==='left'? {marginRight: 20} : {marginLeft: 20}]
    },
    tagPress: (tag,ind)=>({
      key: ind,
      index: ind,
      close: onXbtnSearchWordPress,
      name: tag,
    }),
    autoComplete:{
      style: styles.cityInput,
      title:TranslateFile.filter_pickCity,
      initValue:cityData.cityText,
      onPress:(valId, valAddress) => {
        onAutoCompleteResultPress(valId, valAddress);
      }
    }
  }

  React.useLayoutEffect(() => {
    navigation.setOptions({
      header: () => 
      <AppHeader {...params.appHeader} />,
    });
  }, [navigation]);

  return (
    <BG style={styles.container}>
      {/* search by word */}
      <View style={styles.keyWord}>
        <TextComp {...params.keywordHeader} />
        {/* view for inputBox with + button */}
        <View style={styles.keywordInputView}>
          <InputBox {...params.keywordInput} />
          <TouchableOpacity style={[styles.keywordInputPlusButton, plusButtonStyle]}
          onPress={onSearchWordPress}>
            <Text style={styles.plusButtonText}>+</Text>
          </TouchableOpacity>
        </View>
        <View style={[styles.tagPressBox,{flexDirection:getDirection(deviceLanguage).flexDirection}]}>
          {searchByWord &&
            searchByWord?.map((tag, ind) => (
              <TagPress {...params.tagPress(tag, ind)} />
            ))}
        </View>
      </View>
      {/* search by city */}
      <AutoCompleteBox {...params.autoComplete} />
      {/* choose category */}
      <View style={styles.categoryBox}>
        <TextComp {...params.categoryHeader} />
        <View style={{flex: 1, }}>{categoryIconShow()}</View>
      </View>
      {/* btn */}
      <View style={styles.apllyBtn}>
        {!isLoading ? mainBtn(handleApply, TranslateFile.next_uppercase) : <Loader />}
      </View>
    </BG>
  );
}
const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: colors.White,
    paddingHorizontal: 10,
  },
  cityBox: {
    fontSize: 16,
  },
  header: {
    marginBottom: 5,
    fontWeight: "bold",
    fontSize: 20,
    color: colors.SlateGrey
  },
  cityInput: {
    marginTop: 20, 
    zIndex:99999,  
  },
  categoryRow: {
    flexDirection: "row",
    width: "100%",
    flexWrap: "wrap",
  },
  categoryBox: {
    marginTop: 20,
  },
  apllyBtn: {
    alignItems: "center",
    justifyContent: "flex-end",
    paddingBottom: "5%",
    flex: 1,

  },
  categoryTags: {
    height: 30,
    borderRadius: 30,
    borderWidth: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  tagPressBox: {
    marginTop: 5,
    width: "100%",
    flexWrap: "wrap",
  },
  keyWord: {
    marginTop: 10
  },
  keywordInputView: {
    borderWidth: 1,
    borderRadius: 7,
    paddingHorizontal: 10,
    paddingLeft: 12,
    borderColor: colors.CoolGrey,
    height: 48,
    backgroundColor: colors.White,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    flex: 1,
  },
  keywordInput: {
    fontSize: 16,
    height: 48,
    borderColor: 'green',
    borderWidth: 1,
    color: colors.SlateGrey,
  },
  keywordInputPlusButton: {
    position: 'absolute',
    justifyContent: 'center',
    flex: 1,
    height: 48,
    borderColor: 'green',
    borderWidth: 1,
  },
  plusButtonText: {
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    textAlignVertical: 'center',
    alignContent: 'center',
    
    color: colors.CoolGrey,
    fontSize: 28,
  }
});
