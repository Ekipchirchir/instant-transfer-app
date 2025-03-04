import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        {/*<View style={styles.circle}>
          <Image source={require("../assets/logo.png")} style={styles.logo} />
        </View>*/}
        <Text style={styles.appName}>INSTANT TRANSFER</Text>
        <Text style={styles.tagline}></Text>
      </View>

      <Text style={styles.title}>Transfer Instantly Anywhere!</Text>

      <View style={styles.inputContainer}>
        <Ionicons name="mail-outline" size={18} color="black" style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="Email"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />
      </View>

      <View style={styles.inputContainer}>
        <Ionicons name="lock-closed-outline" size={18} color="black" style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="Password"
          secureTextEntry={!showPassword}
          value={password}
          onChangeText={setPassword}
        />
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
          <Ionicons
            name={showPassword ? "eye-outline" : "eye-off-outline"}
            size={18}
            color="black"
          />
        </TouchableOpacity>
      </View>

      {/* Forgot Password */}
      <TouchableOpacity>
        <Text style={styles.forgotPassword}>FORGOT PASSWORD?   </Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.loginButton} onPress = {() => navigation.navigate("Home")}>
        <Text style={styles.loginText}>LOG IN</Text>
        
      </TouchableOpacity>

      <Text style={styles.signupText}>
        New User?{" "}
        <Text style={styles.signupLink} onPress={() => navigation.navigate("SignUp")}>
          SIGN UP
        </Text>
      </Text>

      <View style={styles.footer}>
        <Text style={styles.footerText}>📞 +254727000111</Text>
        <Text style={styles.footerText}>📧 instanttransfer@gmail.com</Text>
      </View>
    </View>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "lightgreen",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  circle: {
    backgroundColor: "#E1E8C3",
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    width: 70,
    height: 70,
  },
  appName: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 5,
  },
  tagline: {
    fontSize: 12,
    color: "#666",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "whitesmoke",
    borderRadius: 5,
    paddingHorizontal: 10,
    marginVertical: 5,
    width: "100%",
    height: 45,
  },
  icon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 14,
  },
  forgotPassword: {
    alignSelf: "flex-end",
    fontSize: 12,
    color: "#000",
    marginVertical: 5,
  },
  loginButton: {

    
    alignItems: "center",
    backgroundColor: "#000",
    padding: 12,
    borderRadius: 5,
    width: "100%",
    marginTop: 10,
  },
  loginText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    alignItems: "center",
  },
  signupText: {
    marginTop: 10,
    fontSize: 14,
  },
  signupLink: {
    color: "#007BFF",
    fontWeight: "bold",
  },
  footer: {
    position: "absolute",
    bottom: 20,
    alignItems: "center",
  },
  footerText: {
    fontSize: 12,
    color: "#000",
    marginVertical: 2,
  },
});

export default LoginScreen;
