import {
  ActivityIndicator,
  Button,
  Dimensions,
  LogBox,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import * as Animatable from 'react-native-animatable';
import React, {useState, useRef} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {Icon} from 'react-native-elements';

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
        }}>
        <Text style={{color: 'pink', fontSize: 30}}>NC</Text>
        <Text style={{color: 'black', fontSize: 20}}>or</Text>
        <Text style={{color: 'red', fontSize: 30}}>ANGST</Text>
      </View>

      <View
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          paddingTop: 30,
          gap: 30,
        }}>
        <Button
          title={'Play'}
          onPress={() => {
            navigation.navigate('Game');
          }}
        />
        <Button
          title={'Stats'}
          onPress={() => {
            navigation.navigate('Stats');
          }}
        />
      </View>
    </View>
  );
}

function Game() {
  const [guessed, setGuessed] = useState(false);
  const [isLoading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [corr, setCorr] = useState('');

  const shakeAnimRef = useRef();
  const pulseAnimRef = useRef();

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
        setTitle(
          root.querySelector('.fanfic-inline-title a').childNodes[0].rawText,
        );
        setCorr(correct);
        setGuessed(false);
      } else {
        console.warn(request.status);
      }
      setLoading(false);
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
    <View>
      {isLoading ? <ActivityIndicator /> : <Text>{title}</Text>}
      <Animatable.View>
        <Button
          title={'NC'}
          onPress={() => {
            if (guessed) {
              return;
            }
            if (corr === 'nc') {
              AsyncStorage.getItem('guessedNC').then(gn => {
                storeData('guessedNC', (parseInt(gn) + 1).toString());
              });
              AsyncStorage.getItem('totalNC').then(gn => {
                storeData('totalNC', (parseInt(gn) + 1).toString());
              });
            } else {
              AsyncStorage.getItem('totalAngst').then(gn => {
                storeData('totalAngst', (parseInt(gn) + 1).toString());
              });
            }
            setGuessed(true);
            setTitle('');
            setLoading(true);
          }}
        />
      </Animatable.View>
      <Animatable.View>
        <Button
          title={'Angst'}
          onPress={() => {
            if (guessed) {
              return;
            }
            if (corr === 'angst') {
              AsyncStorage.getItem('guessedAngst').then(gn => {
                storeData('guessedAngst', (parseInt(gn) + 1).toString());
              });
              AsyncStorage.getItem('totalAngst').then(gn => {
                storeData('totalAngst', (parseInt(gn) + 1).toString());
              });
            } else {
              AsyncStorage.getItem('totalNC').then(gn => {
                storeData('totalNC', (parseInt(gn) + 1).toString());
              });
            }
            setGuessed(true);
            setTitle('');
            setLoading(true);
          }}
        />
      </Animatable.View>
    </View>
  );
}

function Stats() {
  // guessedNC, guessedAngst, totalNC, totalAngst
  const [s, setS] = useState([]);
  if (s.length === 0) {
    getStats().then(stats => {
      console.log(stats);
      setS(stats);
    });
  }
  return (
    <View>
      <Text>
        Отгадано NC: {s[0]}/{s[2]} (
        {s[2] !== '0'
          ? ((parseInt(s[0]) / parseInt(s[2])) * 100).toFixed(2)
          : '0'}
        %)
      </Text>
      <Text>
        Отгадано Angst: {s[1]}/{s[3]} (
        {s[3] !== '0'
          ? ((parseInt(s[1]) / parseInt(s[3])) * 100).toFixed(2)
          : '0'}
        %)
      </Text>
    </View>
  );
}

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
