import React, { useState } from "react";
import { 
  View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator 
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import API_BASE_URL from "../config";
import { CommonActions } from "@react-navigation/native";


const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    try {
      setLoading(true);
      console.log("📡 Sending Request Data:", { email, password });
  
      const response = await axios.post(`${API_BASE_URL}/token/`, { email, password }, {
        headers: { "Content-Type": "application/json" },
      });
  
      console.log("🛜 Response Status:", response.status);
      console.log("🔍 Response Data:", response.data);
  
      if (response.status === 200) {
        await AsyncStorage.setItem("access_token", response.data.access);
        await AsyncStorage.setItem("refresh_token", response.data.refresh);
  
        Alert.alert("✅ Success", "Logged in successfully!");
  
        // ✅ Ensure navigation resets correctly
        setTimeout(() => {
          navigation.replace("Main"); // Navigate to the Main stack with bottom tabs

        }, 500); // Small delay to ensure navigation is ready
      }
    } catch (error) {
      console.error("🚨 Login Error:", error.response?.data || error);
      Alert.alert("❌ Login Failed", error.response?.data?.detail || "Invalid credentials");
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
        <Text style={styles.signupLink} onPress={() => navigation.navigate("DerivConnect")}>
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
