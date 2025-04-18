import React, { useState, useCallback } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity,
  ActivityIndicator, Alert, ScrollView
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import * as WebBrowser from "expo-web-browser";

const API_BASE_URL = "https://instant-transfer-back-production.up.railway.app/api";

const ThemeContext = React.createContext();

const SettingsScreen = () => {
  const navigation = useNavigation();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const { theme } = React.useContext(ThemeContext) || { theme: "light" };

  useFocusEffect(
    useCallback(() => {
      const fetchUserData = async () => {
        setLoading(true);
        try {
          const derivAccount = await AsyncStorage.getItem("deriv_account");
          if (!derivAccount) {
            setError("No account found. Please sign up via Deriv.");
            setLoading(false);
            return;
          }

          const response = await axios.get(`${API_BASE_URL}/user/${derivAccount}`);
          if (response.status !== 200) throw new Error(`Server error ${response.status}`);

          setUser(response.data);
          setError("");
        } catch (error) {
          console.error("API Error:", error.response ? error.response.data : error.message);
          setError("Failed to load user data. Please try again.");
        } finally {
          setLoading(false);
        }
      };

      fetchUserData();
    }, [])
  );

  const handleLogout = async () => {
    await AsyncStorage.clear();
    navigation.replace("AuthStack", { screen: "Landing" });
  };

  const changePassword = async () => {
    try {
      await WebBrowser.openBrowserAsync("https://deriv.com/reset-password");
    } catch (error) {
      Alert.alert("Error", "Could not open the password reset page.");
    }
  };

  const navigateToSupport = () => {
    navigation.navigate("SupportScreen");
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#3A0CA3" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.header,
          {
            backgroundColor: theme === "dark" ? "#1A1A1A" : "#FFFFFF",
            borderBottomColor: theme === "dark" ? "#333333" : "#E9ECEF",
          },
        ]}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.navigate("Home")}
        >
          <Ionicons name="arrow-back" size={24} color="#000000" />
        </TouchableOpacity>

        <Text
          style={[
            styles.headerTitle,
            { color: theme === "dark" ? "#FFFFFF" : "#212529" },
          ]}
        >
          Account Settings
        </Text>

        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {error ? (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle" size={20} color="#E5383B" /> 
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : (
          <>
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Ionicons name="person" size={24} color="#3A0CA3" /> 
                <Text style={styles.cardTitle}>Account Information</Text>
              </View>

              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Full Name</Text>
                <Text style={styles.infoValue}>{user?.fullname || "Not available"}</Text>
              </View>

              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Account Number</Text>
                <Text style={styles.infoValue}>{user?.deriv_account || "Not available"}</Text>
              </View>

              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Email Address</Text>
                <Text style={styles.infoValue}>{user?.email || "Not available"}</Text>
              </View>

              <View style={[styles.infoItem, { borderBottomWidth: 0 }]}>
                <Text style={styles.infoLabel}>Current Balance</Text>
                <Text style={[styles.infoValue, { color: "#2B9348" }]}>
                  ${user?.balance?.toFixed(2) || "0.00"} {user?.currency || ""}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.optionButton}
              onPress={changePassword}
            >
              <View style={styles.optionContent}>
                <Ionicons name="lock-closed" size={20} color="#3A0CA3" /> 
                <Text style={styles.optionText}>Change Password</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#ADB5BD" /> 
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.optionButton}
              onPress={() => navigation.navigate("Support")}
            >
              <View style={styles.optionContent}>
                <Ionicons name="help-circle" size={20} color="#3A0CA3" /> 
                <Text style={styles.optionText}>Help & Support</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#ADB5BD" /> 
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.optionButton}
              onPress={() => navigation.navigate("TermsScreen")}
            >
              <View style={styles.optionContent}>
                <Ionicons name="document-text" size={20} color="#3A0CA3" /> 
                <Text style={styles.optionText}>Terms & Conditions</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#ADB5BD" /> 
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "lightgreen",
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    paddingTop: 40,
    borderBottomWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  headerTitle: {
    fontSize: 20, 
    fontWeight: "600",
  },
  backButton: {
    padding: 10,
    borderRadius: 20,
    backgroundColor: "#00FF00",
  },
  logoutButton: {
    padding: 10,
    borderRadius: 20,
    backgroundColor: "#FF4444",
    shadowColor: "#000",
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  errorContainer: {
    backgroundColor: "#FFF5F5",
    padding: 15,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#FFE3E3",
  },
  errorText: {
    color: "#E5383B",
    fontSize: 14,
    fontWeight: "500",
    marginLeft: 10,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#E9ECEF",
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#3A0CA3",
    marginLeft: 10,
  },
  infoItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F3F5",
  },
  infoLabel: {
    fontSize: 14,
    color: "#6C757D",
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "500",
    color: "#212529",
  },
  optionButton: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    padding: 16,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  optionContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  optionText: {
    fontSize: 15,
    fontWeight: "500",
    color: "#212529",
    marginLeft: 10,
  },
});

export default SettingsScreen;
