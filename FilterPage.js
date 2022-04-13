import React, { useState, useContext } from "react";
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
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
  const chooseCityPlaceholder = getTranslation(TranslateFile.filter_pickCity);
  const initValue = filterOptions.searchContent ? filterOptions.searchContent.split(',') : []
  const [searchContent, setSearchContent] = useState('');
  const [searchByWord, setSearchByWord] = useState(initValue);
  const [isLoading, setIsLoading] = useState(false)
  const locale = user.deviceLanguage
  const { deviceLanguage, getDirection } = user

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
      placeholder: locale == "he-IL" ? "הכנס מילים" : "Enter Here",
      style: styles.keyWordInput,
      onChangeText: (val) => {
        setSearchContent(val);
      }
    },
    tagPress: (tag,ind)=>({
      key: ind,
      index: ind,
      close: onXbtnSearchWordPress,
      name: tag,
    }),
    autoComplete:{
      style:{ marginTop: 30 },
      title:TranslateFile.filter_pickCity,
      initValue:cityData.cityText,
      placeholder:chooseCityPlaceholder,
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
      {/* choose category */}
      <View style={styles.categoryBox}>
        <TextComp {...params.categoryHeader} />
        <View style={{ width: "100%" }}>{categoryIconShow()}</View>
      </View>
      {/* search by word */}
      <View style={styles.keyWord}>
        <TextComp {...params.keywordHeader} />
        <View style={styles.keywordInputView}>
        <InputBox {...params.keywordInput} />
        <TouchableOpacity style={styles.keywordInputPlusButton}
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
    marginBottom: 10,
    fontWeight: "bold",
    fontSize: 18,
    color: colors.SlateGrey
  },
  cityInput: {
    borderWidth: 1,
    padding: 15,
    borderRadius: 7,
    borderColor: colors.CoolGrey,
    height: 48,
    fontSize: 16,
    backgroundColor: colors.White,
    
  },
  categoryRow: {
    flexDirection: "row",
    width: "100%",
    flexWrap: "wrap",
  },
  categoryBox: {
    marginTop: 10
  },
  keyWord: {
    marginTop: 20
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
    margin: 5,
    paddingHorizontal: 8,
  },
  tagPressBox: {
    marginTop:5,
    width: "100%",
    flexWrap: "wrap",
  },
  keywordInputView: {
    justifyContent: 'center',
    borderWidth: 1,
    padding: 15,
    borderRadius: 7,
    borderColor: colors.CoolGrey,
    height: 48,
    backgroundColor: colors.White,

  },
  keyWordInput: {
    fontSize: 16,
  },
  keywordInputPlusButton: {
    position: 'absolute',
    justifyContent: 'center',
    right: 10,
    marginHorizontal: 10,
  },
  plusButtonText: {
    color: colors.CoolGrey,
    fontSize: 25,
  }
});
