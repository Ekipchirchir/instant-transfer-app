import React, { useState } from "react";
import { 
  View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator 
} from "react-native";
import { Ionicons } from "@expo/vector-icons"; 
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import API_BASE_URL from "../config";

const WithdrawScreen = () => {
  const navigation = useNavigation();
  const [usdAmount, setUsdAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const exchangeRate = 129; 
  const minimumUsd = 10; 
  const phoneNumber = "+254768245123";
  const kesAmount = usdAmount ? (usdAmount * exchangeRate).toFixed(2) : "";

  const handleWithdraw = async () => {
    if (!usdAmount || parseFloat(usdAmount) < minimumUsd) {
      Alert.alert("❌ Error", `Minimum withdrawal amount is USD ${minimumUsd}`);
      return;
    }

    setLoading(true);
    try {
      const token = await AsyncStorage.getItem("access_token");

      console.log("📡 Sending Withdrawal Request:", { amount: usdAmount });

      const response = await axios.post(
        `${API_BASE_URL}/withdraw/`,
        { amount: usdAmount },
        { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }
      );

      console.log("🛜 Response Status:", response.status);
      console.log("🔍 Response Data:", response.data);

      if (response.status === 201) {
        Alert.alert("✅ Success", "Withdrawal successful!");

        // 🔄 Navigate to TransactionScreen after withdrawal
        setTimeout(() => {
          console.log("🔄 Navigating to TransactionScreen...");
          navigation.navigate("Transaction");
        }, 500);
      } else {
        Alert.alert("❌ Error", response.data.error || "Withdrawal failed.");
      }
    } catch (error) {
      console.error("🚨 Withdrawal Error:", error);
      Alert.alert("❌ Error", "Failed to process withdrawal.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.withdrawCard}>
        <Text style={styles.title}>WITHDRAW</Text>

        <Text style={styles.label}>USD</Text>
        <TextInput
          style={styles.input}
          placeholder="$ USD Amount"
          placeholderTextColor="#666"
          keyboardType="numeric"
          value={usdAmount}
          onChangeText={setUsdAmount}
        />
        <Text style={styles.note}>Minimum USD {minimumUsd}</Text>

        <Text style={styles.label}>KES</Text>
        <TextInput
          style={styles.disabledInput}
          value={kesAmount}
          editable={false}
          placeholder="M-PESA Amount"
        />

        <Text style={styles.exchangeRate}>1 USD = KES {exchangeRate}</Text>
        <Text style={styles.phone}>{phoneNumber}</Text>

        <TouchableOpacity 
          style={styles.withdrawButton} 
          onPress={handleWithdraw} 
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Text style={styles.withdrawButtonText}>WITHDRAW</Text>
              <Ionicons name="chevron-forward-outline" size={20} color="white" />
            </>
          )}
        </TouchableOpacity>
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
    padding: 20,
  },
  withdrawCard: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    width: "90%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 5,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    alignSelf: "flex-start",
    marginTop: 10,
  },
  input: {
    width: "100%",
    padding: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    marginTop: 5,
    fontSize: 16,
  },
  disabledInput: {
    width: "100%",
    padding: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    backgroundColor: "#F9F9C5",
    marginTop: 5,
    fontSize: 16,
  },
  note: {
    fontSize: 12,
    color: "red",
    alignSelf: "flex-start",
    marginTop: 2,
  },
  exchangeRate: {
    fontSize: 14,
    marginTop: 10,
    fontWeight: "600",
  },
  phone: {
    fontSize: 14,
    marginTop: 5,
    fontWeight: "600",
  },
  withdrawButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "black",
    padding: 15,
    borderRadius: 10,
    width: "100%",
    marginTop: 15,
    justifyContent: "center",
  },
  withdrawButtonText: {
    fontSize: 16,
    color: "white",
    fontWeight: "bold",
    marginRight: 5,
  },
});

export default WithdrawScreen;
