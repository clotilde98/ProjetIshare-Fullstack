import { useState } from "react";
import { Text, View } from "react-native";
import Login from './components/login.jsx';
import { useEffect } from "react";
import * as SecureStore from 'expo-secure-store';


import {
  GoogleSignin,
} from '@react-native-google-signin/google-signin';

GoogleSignin.configure({
  webClientId: '1027280401462-sd77d2qaggcilr0q9u3hp87vce2j27aa.apps.googleusercontent.com',
});


export default function Index() {
  const [userInfo, setUserInfo] = useState(null);
  useEffect(() => {
    if (userInfo) {
      console.log(userInfo);
    }
  }, [userInfo]);

    
  return (
    <View style={{flex: 1, justifyContent: "center"}}>
      <Login setUserInfo={setUserInfo}></Login>
      {userInfo ? <Text>{JSON.stringify(userInfo, null, 2)}</Text> : null}
    </View >
  );
}
