import React, { useState, useEffect } from "react";
import { 
  View, Text, TouchableOpacity, StyleSheet, 
  StatusBar, SafeAreaView, Platform, ActivityIndicator 
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Linking from "expo-linking";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";

// Conditionally import WebView for Web compatibility
let WebViewComponent;
if (Platform.OS === "web") {
  WebViewComponent = require("react-native-web-webview").default;
} else {
  WebViewComponent = require("react-native-webview").WebView;
}

const DERIV_APP_ID = "70625";
const REDIRECT_URI = "https://instant-transfer-back-production.up.railway.app/callback/";
const LOGIN_URL = `https://oauth.deriv.com/oauth2/authorize?app_id=${DERIV_APP_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}`;

const DerivConnectScreen = () => {
  const navigation = useNavigation();
  const [showWebView, setShowWebView] = useState(false);
  const [webViewKey, setWebViewKey] = useState(0);

  useEffect(() => {
    // Handle deep linking if the app was opened via OAuth callback
    const handleDeepLink = async (event) => {
      const url = event.url || event;
      if (url.startsWith(REDIRECT_URI)) {
        const { queryParams } = Linking.parse(url);
        if (queryParams.access_token) {
          await AsyncStorage.setItem("access_token", queryParams.access_token);
          navigation.replace("Home");
        }
      }
    };

    // Listen for incoming links
    const subscription = Linking.addEventListener("url", handleDeepLink);
    return () => subscription.remove();
  }, [navigation]);

  const handleDerivLogin = () => {
    if (Platform.OS === "web") {
      // On web, use Expo Linking to keep login in the same tab
      Linking.openURL(LOGIN_URL);
    } else {
      // On mobile, open login in WebView
      setShowWebView(true);
      setWebViewKey((prevKey) => prevKey + 1);
    }
  };

  const handleNavigationStateChange = async (navState) => {
    if (navState.url.startsWith(REDIRECT_URI)) {
      const { queryParams } = Linking.parse(navState.url);
      if (queryParams.access_token) {
        await AsyncStorage.setItem("access_token", queryParams.access_token);
        setShowWebView(false);
        navigation.replace("Home");
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={26} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Deriv Connect</Text>
      </View>

      {/* WebView for OAuth Login */}
      {showWebView && Platform.OS !== "web" ? (
        <View style={styles.webViewContainer}>
          <TouchableOpacity 
            style={styles.closeButton}
            onPress={() => setShowWebView(false)}
          >
            <Ionicons name="close" size={24} color="white" />
          </TouchableOpacity>
          <WebViewComponent
            key={webViewKey}
            source={{ uri: LOGIN_URL }}
            onNavigationStateChange={handleNavigationStateChange}
            startInLoadingState={true}
            renderLoading={() => (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#00FF00" />
                <Text style={styles.loadingText}>Loading...</Text>
              </View>
            )}
            onError={(syntheticEvent) => {
              const { nativeEvent } = syntheticEvent;
              console.warn("WebView error: ", nativeEvent);
            }}
            style={styles.webView}
          />
        </View>
      ) : (
        // Login Button UI (when WebView is not showing)
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.loginButton} onPress={handleDerivLogin}>
            <Ionicons name="log-in-outline" size={22} color="#000" style={styles.buttonIcon} />
            <Text style={styles.loginText}>LOGIN WITH DERIV</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.cancelButton} onPress={() => navigation.goBack()}>
            <Ionicons name="close-circle-outline" size={22} color="white" style={styles.buttonIcon} />
            <Text style={styles.cancelText}>CANCEL</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#000", 
    alignItems: "center", 
    justifyContent: "center" 
  },
  header: { 
    position: "absolute", 
    top: 50, 
    left: 20, 
    flexDirection: "row", 
    alignItems: "center" 
  },
  backButton: { padding: 10 },
  headerTitle: { 
    fontSize: 22, 
    fontWeight: "bold", 
    color: "#fff", 
    marginLeft: 10 
  },
  buttonContainer: { width: "90%", alignItems: "center" },
  loginButton: { 
    flexDirection: "row", 
    backgroundColor: "#FFD700", 
    padding: 14, 
    borderRadius: 25, 
    alignItems: "center", 
    justifyContent: "center", 
    width: "100%" 
  },
  cancelButton: { 
    flexDirection: "row", 
    backgroundColor: "#FF3B30", 
    padding: 14, 
    borderRadius: 25, 
    alignItems: "center", 
    justifyContent: "center", 
    width: "100%", 
    marginTop: 10 
  },
  buttonIcon: { marginRight: 10 },
  loginText: { 
    fontSize: 18, 
    fontWeight: "bold", 
    color: "#000" 
  },
  cancelText: { 
    fontSize: 18, 
    fontWeight: "bold", 
    color: "#fff" 
  },
  webViewContainer: { flex: 1, backgroundColor: "#000", width: "100%" },
  webView: { flex: 1 },
  closeButton: { 
    position: 'absolute', 
    top: 15, 
    right: 15, 
    zIndex: 1, 
    backgroundColor: 'rgba(0,0,0,0.5)', 
    borderRadius: 15, 
    padding: 5 
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: "#000",
    alignItems: "center",
    justifyContent: "center"
  },
  loadingText: {
    color: "#00FF00",
    marginTop: 10,
    fontSize: 16
  },
});

export default DerivConnectScreen;
