import React, { useState } from "react";
import { 
  View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator 
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

// ✅ Set API URL (Use `10.0.2.2` for Android Emulator, `localhost` for iOS/Metro)
const API_BASE_URL = "http://localhost:8000/api"; // Use localhost for web
 

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // ✅ Handle login request
  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter both email and password.");
      return;
    }
  
    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/token/`, {
        email,
        password,
      });
  
      console.log("Login Response:", response.data); // ✅ Log success response
      const { access, refresh } = response.data;
  
      await AsyncStorage.setItem("accessToken", access);
      await AsyncStorage.setItem("refreshToken", refresh);
  
      Alert.alert("Success", "Login successful!");
      navigation.navigate("Home");
  
    } catch (error) {
      console.error("Login Error:", error.response?.data || error.message); // ✅ Log error
      Alert.alert("Login Failed", error.response?.data?.detail || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Text style={styles.appName}>INSTANT TRANSFER</Text>
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
          autoCapitalize="none"
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
          <Ionicons name={showPassword ? "eye-outline" : "eye-off-outline"} size={18} color="black" />
        </TouchableOpacity>
      </View>

      <TouchableOpacity onPress={() => navigation.navigate("ForgotPassword")}>
        <Text style={styles.forgotPassword}>FORGOT PASSWORD?</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.loginButton} onPress={handleLogin} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.loginText}>LOG IN</Text>}
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
  appName: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 5,
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
