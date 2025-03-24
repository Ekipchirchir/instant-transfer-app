import React, { useEffect, useState } from "react";
import { 
  View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert 
} from "react-native";
import { Feather } from "@expo/vector-icons"; // ✅ Feather icons for clean UI
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import * as WebBrowser from "expo-web-browser"; // ✅ Expo WebBrowser for opening links

const API_BASE_URL = "https://cleared-groove-same-turning.trycloudflare.com/api";

const SettingsScreen = () => {
  const navigation = useNavigation();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const derivAccount = await AsyncStorage.getItem("deriv_account");

        if (!derivAccount) {
          setError("❌ No account found. Please sign up via Deriv.");
          setLoading(false);
          return;
        }

        console.log(`✅ Fetching settings data for: ${derivAccount}`);

        const response = await axios.get(`${API_BASE_URL}/user/${derivAccount}`);

        if (response.status !== 200) {
          throw new Error(`Server responded with status ${response.status}`);
        }

        console.log("✅ Settings Data Received:", response.data);
        setUser(response.data);
      } catch (error) {
        console.error("❌ API Error:", error.response ? error.response.data : error.message);
        setError("❌ Failed to load user data.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleLogout = async () => {
    await AsyncStorage.clear();
    Alert.alert("Logged Out", "You have been logged out successfully.");
    navigation.replace("Landing"); // Redirect to the landing page
  };

  const changePassword = async () => {
    try {
      const url = "https://deriv.com/reset-password";
      await WebBrowser.openBrowserAsync(url);
    } catch (error) {
      console.error("❌ Error opening Deriv password reset:", error);
      Alert.alert("Error", "Could not open the Deriv password reset page.");
    }
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#007AFF" style={styles.loader} />;
  }

  return (
    <View style={styles.container}>
      {/* 🔙 Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate("Home")}>
        <Feather name="arrow-left" size={26} color="white" />
      </TouchableOpacity>

      {/* 📌 Screen Title */}
      <Text style={styles.title}>Settings</Text>

      {/* 🚪 Logout Button */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Feather name="log-out" size={26} color="white" />
      </TouchableOpacity>

      {error ? (
        <Text style={styles.error}>{error}</Text>
      ) : (
        <View style={styles.accountCard}>
          <Feather name="user" size={50} color="black" />
          <Text style={styles.sectionTitle}>ACCOUNT</Text>
          
          <View style={styles.infoBox}>
            <Text style={styles.infoText}>👤 Name: {user?.fullname || "Unknown"}</Text>
            <Text style={styles.infoText}>🔢 CR Number: {user?.deriv_account || "No Account"}</Text>
            <Text style={styles.infoText}>📧 Email: {user?.email || "No Email"}</Text>
            <Text style={styles.infoText}>💰 Balance: ${user?.balance?.toFixed(2) || "0.00"} {user?.currency || ""}</Text>
          </View>
        </View>
      )}

      <TouchableOpacity style={styles.button} onPress={changePassword}>
        <Feather name="lock" size={20} color="black" />
        <Text style={styles.buttonText}>Change Password</Text>
      </TouchableOpacity>
    </View>
  );
};

export default SettingsScreen;

// 🔹 Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "lightgreen",
    padding: 20,
    alignItems: "center",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    color: "white",
    position: "absolute",
    top: 45,
  },
  backButton: {
    position: "absolute",
    top: 40,
    left: 15,
  },
  logoutButton: {
    position: "absolute",
    top: 40,
    right: 15,
  },
  accountCard: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
    width: "90%",
    alignItems: "center",
    marginVertical: 15,
    marginTop:140,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 5,
    color: "#333",
  },
  infoBox: {
    backgroundColor: "#F9F9C5",
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
    width: "100%",
  },
  infoText: {
    fontSize: 14,
    marginVertical: 2,
    color: "#555",
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    padding: 15,
    borderRadius: 10,
    width: "90%",
    marginBottom: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    fontSize: 16,
    marginLeft: 10,
    fontWeight: "bold",
    color: "#007AFF",
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  error: {
    fontSize: 16,
    color: "red",
    textAlign: "center",
    fontWeight: "bold",
    marginTop: 10,
  },
});
