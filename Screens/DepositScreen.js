import React, { useState } from "react";
import { 
  View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator 
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import API_BASE_URL from "../config";

const DepositScreen = ({ navigation }) => {
  const [usdAmount, setUsdAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const exchangeRate = 129;
  const minAmount = 10;
  const phoneNumber = "+254768245123";

  const handleDeposit = async () => {
    if (!usdAmount || parseFloat(usdAmount) < minAmount) {
      Alert.alert("❌ Error", `Minimum deposit is USD ${minAmount}`);
      return;
    }
  
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem("access_token");
  
      const response = await axios.post(
        `${API_BASE_URL}/deposit/`,
        { amount: usdAmount },
        { headers: { Authorization: `Bearer ${token}` } }
      );
  
      if (response.status === 201) {
        Alert.alert("✅ Success", "Deposit successful!");
  
        // 🔄 Refresh Transactions After Deposit
        setTimeout(() => {
          navigation.navigate("Transaction");
        }, 500);
      } else {
        Alert.alert("❌ Error", response.data.error || "Deposit failed.");
      }
    } catch (error) {
      console.error("🚨 Deposit Error:", error);
      Alert.alert("❌ Error", "Failed to process deposit.");
    } finally {
      setLoading(false);
    }
  };
  

  // ✅ Function to Refresh Access Token If Expired
  const refreshAccessToken = async () => {
    try {
      const refreshToken = await AsyncStorage.getItem("refresh_token");

      if (!refreshToken) {
        console.error("🚨 No refresh token found!");
        return null;
      }

      console.log("🔄 Refreshing Access Token...");

      const response = await axios.post(`${API_BASE_URL}/api/token/refresh/`, {
        refresh: refreshToken,
      });

      console.log("✅ New Access Token:", response.data.access);

      await AsyncStorage.setItem("access_token", response.data.access);
      return response.data.access;
    } catch (error) {
      console.error("🚨 Token Refresh Failed:", error);
      return null;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.header}>
          <Ionicons name="add-circle-outline" size={20} color="black" />
          <Text style={styles.headerText}> DEPOSIT</Text>
        </View>

        <Text style={styles.label}>USD</Text>
        <TextInput
          style={styles.input}
          placeholder="USD Amount"
          keyboardType="numeric"
          value={usdAmount}
          onChangeText={setUsdAmount}
        />
        <Text style={styles.minAmount}>Minimum USD {minAmount}</Text>

        <Text style={styles.label}>KES</Text>
        <TextInput
          style={styles.kesInput}
          placeholder="M-PESA Amount"
          value={usdAmount ? (usdAmount * exchangeRate).toFixed(2) : ""}
          editable={false}
        />

        <Text style={styles.exchangeRate}>1 USD = KES {exchangeRate}</Text>
        <Text style={styles.phone}>{phoneNumber}</Text>

        <TouchableOpacity 
          style={styles.button} 
          onPress={handleDeposit} 
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Text style={styles.buttonText}>DEPOSIT</Text>
              <Ionicons name="chevron-forward" size={18} color="white" />
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

// ✅ Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "lightgreen",
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    width: "85%",
    elevation: 5, 
    shadowColor: "#000", 
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  headerText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  label: {
    fontSize: 14,
    fontWeight: "bold",
    marginTop: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 5,
    marginTop: 5,
  },
  kesInput: {
    borderWidth: 1,
    borderColor: "#A7BF6F",
    padding: 10,
    borderRadius: 5,
    marginTop: 5,
    backgroundColor: "#E6F0C2",
  },
  minAmount: {
    fontSize: 12,
    color: "#666",
    marginBottom: 10,
  },
  exchangeRate: {
    fontSize: 12,
    marginTop: 10,
    color: "#444",
  },
  phone: {
    fontSize: 14,
    fontWeight: "bold",
    marginTop: 5,
  },
  button: {
    backgroundColor: "#000",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    borderRadius: 5,
    marginTop: 15,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default DepositScreen;
