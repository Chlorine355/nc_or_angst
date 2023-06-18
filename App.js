import {
  ActivityIndicator,
  Dimensions,
  LogBox,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useState} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

LogBox.ignoreAllLogs(); //Ignore all log notifications

const deviceWidth = Dimensions.get('window').width;
const deviceHeight = Dimensions.get('window').height;

const storeData = async (key, value) => {
  try {
    await AsyncStorage.setItem(key, value);
  } catch (e) {
    // saving error
  }
};

const initStats = async () => {
  try {
    const guessedNC = await AsyncStorage.getItem('guessedNC');
    const guessedAngst = await AsyncStorage.getItem('guessedAngst');
    const totalNC = await AsyncStorage.getItem('totalNC');
    const totalAngst = await AsyncStorage.getItem('totalAngst');
    const maxStreak = await AsyncStorage.getItem('maxStreak');
    if (!totalNC) {
      await storeData('totalNC', '0');
    }

    if (!totalAngst) {
      await storeData('totalAngst', '0');
    }

    if (!guessedNC) {
      await storeData('guessedNC', '0');
    }

    if (!guessedAngst) {
      await storeData('guessedAngst', '0');
    }

    if (!maxStreak) {
      await storeData('maxStreak', '0');
    }

    console.log('stats initialised');
  } catch (err) {
    // saving error
  }
};

const getStats = async () => {
  try {
    const guessedNC = await AsyncStorage.getItem('guessedNC');
    const guessedAngst = await AsyncStorage.getItem('guessedAngst');
    const totalNC = await AsyncStorage.getItem('totalNC');
    const totalAngst = await AsyncStorage.getItem('totalAngst');
    console.log(guessedNC, guessedAngst, totalNC, totalAngst, 'stats returned');
    return [guessedNC, guessedAngst, totalNC, totalAngst];
  } catch (err) {
    // saving error
  }
};

function Menu({navigation}) {
  initStats();
  return (
    <View
      style={{
        height: deviceHeight,
        flex: 1,
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 80,
      }}>
      <View
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          paddingTop: 30,
          gap: 20,
        }}>
        <Text style={{color: '#ff00a6', fontSize: 50, fontWeight: 'bold'}}>
          NC
        </Text>
        <Text style={{color: 'black', fontSize: 35}}>or</Text>
        <Text style={{color: 'red', fontSize: 50, fontWeight: 'bold'}}>
          ANGST
        </Text>
      </View>

      <View
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          paddingTop: 30,
          gap: 30,
        }}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => {
            navigation.navigate('Game');
          }}>
          <Text style={styles.buttonText}>Play</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={() => {
            navigation.navigate('Stats');
          }}>
          <Text style={styles.buttonText}>Stats</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function Game({navigation}) {
  const [guessed, setGuessed] = useState(false);
  const [isLoading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [corr, setCorr] = useState('');
  const [r, setR] = useState(false);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);

  if (title === '') {
    const correct = Math.random() < 0.5 ? 'nc' : 'angst';
    let request = new XMLHttpRequest();
    request.onreadystatechange = e => {
      if (request.readyState !== 4) {
        return;
      }
      if (request.status === 200) {
        let HTMLParser = require('fast-html-parser');
        let root = HTMLParser.parse(request.responseText);
        let titles = root.querySelectorAll('.fanfic-inline-title a'); //.childNodes[0].rawText,
        setTitle(
          titles[Math.floor(Math.random() * titles.length)].childNodes[0]
            .rawText,
        );
        setCorr(correct);
        console.log(correct);
        setGuessed(false);
      } else {
        console.warn(request.status);
      }
      setLoading(false);
      AsyncStorage.getItem('maxStreak').then(ms => {
        setMaxStreak(parseInt(ms));
      });
    };
    if (correct === 'nc') {
      request.open(
        'GET',
        'https://ficbook.net/find?fandom_filter=any&fandom_group_id=1&pages_range=1&pages_min=&pages_max=&ratings%5B%5D=8&ratings%5B%5D=9&transl=1&directions%5B%5D=2&directions%5B%5D=3&directions%5B%5D=4&tags_exclude%5B%5D=1665&tags_exclude%5B%5D=2696&likes_min=&likes_max=&rewards_min=&date_create_min=2023-06-04&date_create_max=2023-06-04&date_update_min=2023-06-04&date_update_max=2023-06-04&title=&sort=5&rnd=846920819&find=%D0%9D%D0%B0%D0%B9%D1%82%D0%B8%21',
      );
    } else {
      request.open(
        'GET',
        'https://ficbook.net/find?fandom_filter=any&fandom_group_id=1&pages_range=1&pages_min=&pages_max=&transl=1&tags_include%5B%5D=1665&tags_include%5B%5D=2696&likes_min=&likes_max=&rewards_min=&date_create_min=2023-06-04&date_create_max=2023-06-04&date_update_min=2023-06-04&date_update_max=2023-06-04&title=&sort=5&rnd=1518255038&find=%D0%9D%D0%B0%D0%B9%D1%82%D0%B8%21',
      );
    }
    request.send();
  }

  return (
    <View
      style={{
        height: deviceHeight,
        borderWidth: 10,
        borderColor: guessed ? (r ? 'green' : 'red') : 'transparent',
      }}>
      <View style={styles.streak}>
        <Text>Текущая серия: {streak}</Text>
        <Text>Рекорд: {maxStreak}</Text>
      </View>
      <View style={styles.ficname}>
        {isLoading ? (
          <ActivityIndicator size="large" color={'#0000ff'} />
        ) : (
          <Text style={styles.fictitle}>{title}</Text>
        )}
      </View>
      <View style={styles.buttons}>
        <TouchableOpacity
          style={[
            styles.button,
            {
              shadowColor: '#ff00a6',
              shadowRadius: 20,
              shadowOpacity: 0.95,
              shadowOffset: {width: 0, height: 0},
              elevation: 10,
            },
          ]}
          onPress={() => {
            if (guessed) {
              return;
            }
            if (corr === 'nc') {
              setR(true);
              setStreak(streak + 1);
              if (streak >= maxStreak) {
                setMaxStreak(streak + 1);
                storeData('maxStreak', (streak + 1).toString());
              }
              AsyncStorage.getItem('guessedNC').then(gn => {
                storeData('guessedNC', (parseInt(gn) + 1).toString());
              });
              AsyncStorage.getItem('totalNC').then(gn => {
                storeData('totalNC', (parseInt(gn) + 1).toString());
              });
            } else {
              setStreak(0);
              setR(false);
              AsyncStorage.getItem('totalAngst').then(gn => {
                storeData('totalAngst', (parseInt(gn) + 1).toString());
              });
            }
            setGuessed(true);
            setTitle('');
            setLoading(true);
          }}>
          <Text style={styles.buttonText}>NC</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.button,
            {
              shadowColor: 'red',
              shadowRadius: 20,
              shadowOpacity: 0.95,
              shadowOffset: {width: 0, height: 0},
              elevation: 10,
            },
          ]}
          onPress={() => {
            if (guessed) {
              return;
            }
            if (corr === 'angst') {
              setR(true);
              setStreak(streak + 1);
              if (streak >= maxStreak) {
                setMaxStreak(streak + 1);
                storeData('maxStreak', (streak + 1).toString());
              }
              AsyncStorage.getItem('guessedAngst').then(gn => {
                storeData('guessedAngst', (parseInt(gn) + 1).toString());
              });
              AsyncStorage.getItem('totalAngst').then(gn => {
                storeData('totalAngst', (parseInt(gn) + 1).toString());
              });
            } else {
              setR(false);
              setStreak(0);
              AsyncStorage.getItem('totalNC').then(gn => {
                storeData('totalNC', (parseInt(gn) + 1).toString());
              });
            }
            setGuessed(true);
            setTitle('');
            setLoading(true);
          }}>
          <Text style={styles.buttonText}>Angst</Text>
        </TouchableOpacity>
      </View>
      <BackButton navigation={navigation} top={0} left={0} />
    </View>
  );
}

function Stats({navigation}) {
  // guessedNC, guessedAngst, totalNC, totalAngst
  const [s, setS] = useState([]);
  const [maxStreak, setMaxStreak] = useState(0);

  AsyncStorage.getItem('maxStreak').then(ms => {
    setMaxStreak(parseInt(ms));
  });

  if (s.length === 0) {
    getStats().then(stats => {
      console.log(stats);
      setS(stats);
    });
  }
  return (
    <View style={styles.statscreen}>
      <BackButton navigation={navigation} />
      <Text style={styles.stat}>
        Отгадано NC: {s[0]}/{s[2]} (
        {s[2] !== '0'
          ? ((parseInt(s[0]) / parseInt(s[2])) * 100).toFixed(2)
          : '0'}
        %)
      </Text>
      <Text style={styles.stat}>
        Отгадано Angst: {s[1]}/{s[3]} (
        {s[3] !== '0'
          ? ((parseInt(s[1]) / parseInt(s[3])) * 100).toFixed(2)
          : '0'}
        %)
      </Text>
      <Text style={styles.stat}>Лучшая серия: {maxStreak}</Text>

      <TouchableOpacity
        style={styles.resetBtn}
        onPress={() => {
          storeData('guessedNC', '0');
          storeData('guessedAngst', '0');
          storeData('totalNC', '0');
          storeData('totalAngst', '0');
          storeData('maxStreak', '0');
          setS(['0', '0', '0', '0']);
        }}>
        <Text style={styles.resetBtnText}>Сброс</Text>
      </TouchableOpacity>
    </View>
  );
}

function BackButton({navigation, top = 10, left = 10}) {
  return (
    <TouchableOpacity
      style={{position: 'absolute', top: top, left: left}}
      onPress={() => {
        navigation.navigate('Menu');
      }}>
      <Text>Back to Menu</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  ficname: {
    height: 200,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 50,
    marginLeft: -10,
    paddingHorizontal: 10,
    width: deviceWidth,
  },
  streak: {
    height: 100,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
  },
  fictitle: {textAlign: 'center', fontSize: 24},
  buttons: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
    gap: 50,
    paddingTop: 50,
    marginLeft: -10,
    width: deviceWidth,
  },
  button: {
    width: 150,
    backgroundColor: 'aliceblue',
    padding: 10,
    display: 'flex',
    alignItems: 'center',
    borderRadius: 5,
  },
  buttonText: {fontSize: 25},
  statscreen: {
    padding: 10,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 50,
    justifyContent: 'center',
    height: deviceHeight,
  },
  stat: {fontSize: 20},
  resetBtn: {
    backgroundColor: 'pink',
    padding: 20,
    borderRadius: 5,
    width: 200,
    display: 'flex',
    alignItems: 'center',
  },
  resetBtnText: {fontSize: 25, color: 'black'},
});

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{headerShown: false}}>
        <Stack.Screen name="Menu" component={Menu} />
        <Stack.Screen name="Game" component={Game} />
        <Stack.Screen name="Stats" component={Stats} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
