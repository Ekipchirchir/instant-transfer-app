import React from "react";
import { 
  View, Text, TouchableOpacity, StyleSheet, 
  Alert, Image, StatusBar, Platform 
} from "react-native";
import { Ionicons } from "@expo/vector-icons";  
import { useNavigation } from "@react-navigation/native";
import * as WebBrowser from "expo-web-browser";

const DERIV_APP_ID = "70625";  
const REDIRECT_URI = encodeURIComponent("https://instant-transfer-back-production.up.railway.app/callback/");

const DerivConnectScreen = () => {
  const navigation = useNavigation();

  const handleDerivLogin = async () => {
    const derivLoginUrl = `https://oauth.deriv.com/oauth2/authorize?app_id=${DERIV_APP_ID}&redirect_uri=${REDIRECT_URI}`;

    try {
      const result = await WebBrowser.openAuthSessionAsync(derivLoginUrl, REDIRECT_URI);

      if (result.type === "success") {
        console.log("✅ Login Success:", result);
        navigation.replace("Home");
      } else {
        Alert.alert("Login Canceled", "You canceled the login process.");
      }
    } catch (error) {
      console.error("🚨 Error opening Deriv login:", error);
      Alert.alert("Login Failed", "Could not open the Deriv login page.");
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="lightgreen" />

    
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={26} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Deriv Connect</Text>
      </View>

      
      <Image 
        source={{ uri: "https://deriv.com/static/og-image.png" }}  
        style={styles.logo} 
      />

      
      <Text style={styles.description}>
        Securely connect your Deriv account for fast transactions.
      </Text>

      <View style={styles.detailsContainer}>
        <View style={styles.detailItem}>
          <Ionicons name="shield-checkmark" size={20} color="#FFD700" />
          <Text style={styles.detailText}>Bank-level security</Text>
        </View>
        <View style={styles.detailItem}>
          <Ionicons name="flash" size={20} color="#FFD700" />
          <Text style={styles.detailText}>Instant processing</Text>
        </View>
        <View style={styles.detailItem}>
          <Ionicons name="lock-closed" size={20} color="#FFD700" />
          <Text style={styles.detailText}>Encrypted connection</Text>
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.loginButton} onPress={handleDerivLogin}>
          <Ionicons name="log-in-outline" size={22} color="white" style={styles.buttonIcon} />
          <Text style={styles.loginText}>LOGIN WITH DERIV</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.cancelButton} onPress={() => navigation.goBack()}>
          <Ionicons name="close-circle-outline" size={22} color="white" style={styles.buttonIcon} />
          <Text style={styles.cancelText}>CANCEL</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 20,
    justifyContent: "center",
    backgroundColor: "lightgreen", 
  },
  header: {
    position: "absolute",
    top: 50,
    left: 20,
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: {
    padding: 10,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#000",
    marginLeft: 10,
  },
  logo: {
    width: 100,
    height: 100,
    resizeMode: "contain",
    marginBottom: 20,
  },
  description: {
    fontSize: 16,
    textAlign: "center",
    color: "#000",
    marginBottom: 30,
    paddingHorizontal: 15,
  },
  buttonContainer: {
    width: "100%",
    alignItems: "center",
  },
  loginButton: {
    flexDirection: "row",
    backgroundColor: "#FFD700",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 25,
    alignItems: "center",
    width: "90%",
    justifyContent: "center",
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  cancelButton: {
    flexDirection: "row",
    backgroundColor: "#FF3B30",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 25,
    alignItems: "center",
    width: "90%",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  buttonIcon: {
    marginRight: 10,
  },
  loginText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
  },
  cancelText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
  },
  detailsContainer: {
    width: "100%",
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    padding: 10,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 8,
  },
  detailText: {
    fontSize: 14,
    color: "#000",
    marginLeft: 10,
    fontWeight: "500",
  },
});

export default DerivConnectScreen;
