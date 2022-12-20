import React, { Component } from "react";
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    Platform,
    StatusBar,
    Image
} from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import { RFValue } from "react-native-responsive-fontsize";

import * as Google from "expo-google-app-auth";
import firebase from "firebase";

export default class LoginScreen extends Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    componentDidMount() {

    }

    isUserEqual = (googleUser, firebaseUser) => {
        if (firebaseUser) {
            var providerData = firebaseUser.providerData;
            for (var i = 0; i < providerData.length; i++) {
                if (
                    providerData[i].providerId ===
                    firebase.auth.GoogleAuthProvider.PROVIDER_ID &&
                    providerData[i].uid === googleUser.getBasicProfile().getId()
                ) {
                    // Não precisamos reautenticar a conexão do Firebase.
                    return true;
                }
            }
        }
        return false;
    };

    onSignIn = googleUser => {
        // Precisamos registrar um Observer (observador) no Firebase Auth para garantir que a autenticação seja inicializada.
        var unsubscribe = firebase.auth().onAuthStateChanged(firebaseUser => {
            unsubscribe();
            // Verifique se já estamos conectados ao Firebase com o usuário correto.
            if (!this.isUserEqual(googleUser, firebaseUser)) {
                // Crie uma credencial do Firebase com o token de ID do Google.
                var credential = firebase.auth.GoogleAuthProvider.credential(
                    googleUser.idToken,
                    googleUser.accessToken
                );

                // Login com a credencial do usuário do Google.
                firebase
                    .auth()
                    .signInWithCredential(credential)
                    .then(function (result) {
                        if (result.additionalUserInfo.isNewUser) {
                            firebase
                                .database()
                                .ref("/users/" + result.user.uid)
                                .set({
                                    gmail: result.user.email,
                                    profile_picture: result.additionalUserInfo.profile.picture,
                                    locale: result.additionalUserInfo.profile.locale,
                                    first_name: result.additionalUserInfo.profile.given_name,
                                    last_name: result.additionalUserInfo.profile.family_name,
                                    current_theme: "dark"
                                })
                                .then(function (snapshot) { });
                        }
                    })
                    .catch(error => {
                        // Trate os erros aqui.
                        var errorCode = error.code;
                        var errorMessage = error.message;
                        // O e-mail da conta do usuário que foi usada.
                        var email = error.email;
                        // O tipo do firebase.auth.AuthCredential que foi usado.
                        var credential = error.credential;
                        // ...
                    });
            } else {
                console.log("Usuário já conectado ao Firebase.");
            }
        });
    };

    signInWithGoogleAsync = async () => {
        try {
            const result = await Google.logInAsync({
                behaviour: "web",
                androidClientId:
                    "840110494340-99ijj93ruji57nqpn5kqteuohrmb9rk4.apps.googleusercontent.com",
                iosClientId:
                    "840110494340-qupn3ta1rtrcdackn652kfi6db2722b6.apps.googleusercontent.com",
                scopes: ["profile", "email"]
            });

            if (result.type === "success") {
                this.onSignIn(result);
                return result.accessToken;
            } else {
                return { cancelled: true };
            }
        } catch (e) {
            console.log(e.message);
            return { error: true };
        }
    };

    render() {
        return (
            <View style={styles.container}>
                <SafeAreaView style={styles.droidSafeArea} />
                <View style={styles.appTitle}>
                    <Image
                        source={require("../assets/logo.png")}
                        style={styles.appIcon}
                    ></Image>
                    <Text style={styles.appTitleText}>Spectagram</Text>
                </View>
                <View style={styles.buttonContainer}>
                    <TouchableOpacity
                        style={styles.button}
                        onPress={() => this.signInWithGoogleAsync()}
                    >
                        <Image
                            source={require("../assets/google_icon.png")}
                            style={styles.googleIcon}
                        ></Image>
                        <Text style={styles.googleText}>Sign in with Google</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "black"
    },
    droidSafeArea: {
        marginTop: Platform.OS === "android" ? StatusBar.currentHeight : RFValue(35)
    },
    appTitle: {
        flex: 0.4,
        justifyContent: "center",
        alignItems: "center"
    },
    appIcon: {
        width: RFValue(130),
        height: RFValue(130),
        resizeMode: "contain"
    },
    appTitleText: {
        color: "white",
        textAlign: "center",
        fontSize: RFValue(40)
    },
    buttonContainer: {
        flex: 0.3,
        justifyContent: "center",
        alignItems: "center"
    },
    button: {
        width: RFValue(250),
        height: RFValue(50),
        flexDirection: "row",
        justifyContent: "space-evenly",
        alignItems: "center",
        borderRadius: RFValue(30),
        backgroundColor: "white"
    },
    googleIcon: {
        width: RFValue(30),
        height: RFValue(30),
        resizeMode: "contain"
    },
    googleText: {
        color: "black",
        fontSize: RFValue(20)
    }
});
