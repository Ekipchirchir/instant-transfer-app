import React from "react";
import { View, Text, TouchableOpacity, Image, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

const LandingScreen = ({ navigation }) => {
  return (
    <LinearGradient colors={["lightgreen", "#fff"]} style={styles.container}>
      {/* App Logo 
      <Image
        source={require("../assets/logo.png")} // Replace with your logo
        style={styles.logo}
      />
      */}

      {/* App Name & Tagline */}
      <Text style={styles.appName}>Instant Transfer</Text>
      <Text style={styles.tagline}>For seamless, secure, and instant money transfers. 
        Whether you're depositing funds, withdrawing cash, or tracking your 
        transaction history,
        our app ensures a smooth and reliable experience.</Text>

      {/* Call to Action */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.loginButton}
          onPress={() => navigation.navigate("Login")}
        >
          <Text style={styles.buttonText}>LOGIN</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.signupButton}
          onPress={() => navigation.navigate("SignUp")}
        >
          <Text style={styles.buttonTextAlt}>SIGN UP</Text>
        </TouchableOpacity>
      </View>

      {/* Contact & Support Icons */}
      <View style={styles.iconContainer}>
        <TouchableOpacity>
          <Ionicons name="logo-whatsapp" size={28} color="black" />
        </TouchableOpacity>
        <TouchableOpacity>
          <Ionicons name="call-outline" size={28} color="black" />
        </TouchableOpacity>
        <TouchableOpacity>
          <Ionicons name="mail-outline" size={28} color="black" />
        </TouchableOpacity>
      </View>

      
    </LinearGradient>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 20,
  },
  appName: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 5,
  },
  tagline: {
    fontSize: 16,
    color: "#555",
    textAlign: "center",
    marginBottom: 30,
   fontWeight: "450"
  },
  buttonContainer: {
    width: "100%",
    alignItems: "center",
    marginBottom: 20,
  },
  loginButton: {
    backgroundColor: "black",
    paddingVertical: 14,
    paddingHorizontal: 80,
    borderRadius: 30,
    marginBottom: 10,
  },
  signupButton: {
    borderWidth: 2,
    borderColor: "green",
    paddingVertical: 14,
    paddingHorizontal: 74,
    borderRadius: 30,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "white",
  },
  buttonTextAlt: {
    fontSize: 16,
    fontWeight: "bold",
    color: "black",
  },
  iconContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "50%",
    marginBottom: 30,
  },
});

export default LandingScreen;
