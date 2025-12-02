import axios from 'axios';
import { useFonts } from 'expo-font';
import { useState } from 'react';
import { Alert, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Button } from 'react-native-paper';
import InputComponent from './input.jsx';

import * as SecureStore from 'expo-secure-store';




import {
    GoogleSignin,
    isErrorWithCode,
    isSuccessResponse,
    statusCodes
} from '@react-native-google-signin/google-signin';


const Axios = axios.create ({

    baseURL:'http://192.168.0.11:3002'

    
});

    


export default function Connexion({setUserInfo}) {
    const [fontsLoaded] = useFonts({
        Jaro: require('../../assets/fonts/jaro.ttf'), 
    });
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');



 //email, idToken, username, streetNumber, street, photo, isAdmin, addressID}


    const handleGoogleSignIn = async () => {
        
        try {
            await GoogleSignin.hasPlayServices();
            const response = await GoogleSignin.signIn(
            {
                prompt: 'select_account'
            }
            );
        if (isSuccessResponse(response)) {
            setUserInfo(response.data);

            const res = await Axios.post("/loginWithGoogle", {
            email: response.data.user.email,
            idToken: response.data.idToken,
            username: "skudle",
            streetNumber: 1,
            street: "rue de l europe",
            photo: null,
            isAdmin: false,
            addressID: 1
          });

          await SecureStore.setItemAsync("jwt", res.data.token);

          
        } else {
            console.log("Sign in was cancelled by the user")
        }
        } catch (error){
            
            if (isErrorWithCode(error)) {
                switch (error.code) {
                case statusCodes.IN_PROGRESS:
                    // operation (eg. sign in) already in progress
                    Alert.alert("sign in is in progress");
                    break;
                case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
                    // Android only, play services not available or outdated
                    Alert.alert("play service not available")
                    break;
                default:
                    // some other error happened
                }
            } else {
                console.log(error);
                // an error that's not related to google sign in occurred
                Alert.alert("an error that's not related to google sign in occurred");
            }
        }
    }
    

    const handleGoogleSignOut = async () => {
        try {
        await GoogleSignin.signOut();
        setUserInfo(null);
        } catch (error){
        Alert.alert("Failed to log out");
        }
    }


  function handleSubmit() {
    if (email && password){
      axios.post('http://192.168.0.11:3002/login/', {
        email,
        password
      })
      .then(res => {
        SecureStore.setItemAsync("jwt", res.data.token);
      })
      .catch(err => console.error(err.response.data));
    }
    
  }

  if (!fontsLoaded) {
    return <Text>Chargement...</Text>; 
  }

  return (
    <View style={styles.container}>


            <Pressable style={styles.singInTextWithGoogle} onPress={handleGoogleSignOut}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
            <Image source={require('../../assets/images/google-icon.png')} style={{ width: 24, height: 24, marginRight: 10 }} />
            <Text style={{ fontWeight: 'bold', fontSize: 16 }}>Sign out</Text>
        </View>
    </Pressable>



    

      <Text style={styles.text}>Welcome !</Text>
      <View>
        <InputComponent textValue="Email" secureTextEntry={false} secureEye={false} onChangeText={setEmail} />
        <InputComponent textValue="Password" secureTextEntry={true} secureEye={true} onChangeText={setPassword} />
        <Pressable onPress={handleSubmit}>
          <Text style={styles.forgotText}>Forgot your password?</Text>
        </Pressable>
      </View>
      
      
      <Button style={styles.button} buttonColor= 'black' textColor="white" contentStyle={{ height: 50 }} onPress={handleSubmit}>Sign In</Button>

      <View style={styles.orLine}>
        <View style={styles.line}></View>
        <Text style={styles.orText}> Or </Text>
        <View style={styles.line}></View>
      </View>

      {/***<Pressable style={styles.googleButton} onPress={() => promptAsync()}>
        <View style={styles.singInTextWithGoogle}>
          <Icon name="google" size={24} color="blue" style={{ marginRight: 10 }} />
          <Text>Sign In with Google</Text>
        </View>
      </Pressable>***/}

    <Pressable style={styles.singInTextWithGoogle} onPress={handleGoogleSignIn}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
            <Image source={require('../../assets/images/google-icon.png')} style={{ width: 24, height: 24, marginRight: 10 }} />
            <Text style={{ fontWeight: 'bold', fontSize: 16 }}>Sign In with Google</Text>
        </View>
    </Pressable>
      

      <View>
        <Text style={{fontWeight:"bold", margin:15}}>Don't have an account ?</Text>
      </View>

      <View style={styles.signUp}>
        <Text style={{color:"gray"}}>Sign Up</Text>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    marginTop:20,
    borderRadius: 12,
    width: '80%',
    height: '75%',
    backgroundColor: '#fff'
  },
  text : {
    marginTop: 35,
    marginBottom: 30,
    fontFamily: 'Jaro', 
    fontSize: 46,
  },

  button: {
    width: '80%',
    borderRadius: 6,
    
  },

  forgotText: {
    marginTop: -10,
    marginBottom: 25,
    fontSize: 10,
    color: '#E1ACA0', 
    alignSelf: 'flex-end'
  },

  orLine : {
    marginTop: 20,
    marginBottom: 20,
    flexDirection : 'row',
    justifyContent: 'flex-start'
  },

  orText : {
    color: 'lightgray',
    fontWeight: 900,
    fontSize: 20,
    marginTop: -13,
    marginLeft: 25,
    marginRight: 25
  },

  line : {
    backgroundColor: 'lightgray',
    height: 1,
    width: 75
  },

  singInTextWithGoogle : {
    flexDirection: 'row',
    paddingLeft : 30,
    paddingRight : 30,
    paddingTop: 10,
    paddingBottom: 10,
    borderRadius: 10,
    backgroundColor: 'white',
    borderColor: 'black',
    borderWidth: 2
  },

  signUp : {
    marginBottom: 35
  }



});