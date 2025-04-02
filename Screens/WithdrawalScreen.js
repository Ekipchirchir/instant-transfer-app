import React, { useState } from "react";
import { 
  View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator 
} from "react-native";
import { Ionicons } from "@expo/vector-icons"; 
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const WithdrawScreen = () => {
  const navigation = useNavigation();
  const [usdAmount, setUsdAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const exchangeRate = 129; 
  const minimumUsd = 10; 
  const phoneNumber = "+254768245123";
  const kesAmount = usdAmount ? (usdAmount * exchangeRate).toFixed(2) : "";

  const handleWithdraw = async () => {
    if (parseFloat(usdAmount) < minimumUsd) {
      Alert.alert("Error", `Minimum withdrawal is $${minimumUsd}`);
      return;
    }

    setLoading(true);
    try {
      const token = await AsyncStorage.getItem("access_token");
      const response = await fetch(`${API_BASE_URL}/withdraw/`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json", 
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ amount: usdAmount }),
      });
      
      const data = await response.json();
      if (response.ok) {
        Alert.alert("Success", "Withdrawal successful!");
        navigation.navigate("Transactions");
      } else {
        Alert.alert("Error", data.error || "Withdrawal failed.");
      }
    } catch (error) {
      Alert.alert("Error", "Network request failed");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await AsyncStorage.clear();
    navigation.replace("DerivConnectScreen");
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#3A0CA3" />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>Withdraw Funds</Text>
        
        <TouchableOpacity 
          style={styles.logoutButton} 
          onPress={handleLogout}
        >
          <Ionicons name="exit-outline" size={24} color="#3A0CA3" />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.withdrawCard}>
          <View style={styles.inputSection}>
            <Text style={styles.label}>Amount in USD</Text>
            <View style={styles.inputContainer}>
              <Text style={styles.currencySymbol}>$</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter amount"
                placeholderTextColor="#999"
                keyboardType="decimal-pad"
                value={usdAmount}
                onChangeText={setUsdAmount}
              />
            </View>
            <Text style={styles.minimumText}>Minimum: ${minimumUsd}</Text>
          </View>

          <View style={styles.conversionSection}>
            <View style={styles.conversionRow}>
              <Text style={styles.conversionLabel}>Exchange Rate:</Text>
              <Text style={styles.conversionValue}>1 USD = KES {exchangeRate}</Text>
            </View>
            <View style={styles.conversionRow}>
              <Text style={styles.conversionLabel}>You'll receive:</Text>
              <Text style={styles.conversionValue}>KES {kesAmount || "0.00"}</Text>
            </View>
          </View>

          <View style={styles.mpesaSection}>
            <Text style={styles.mpesaTitle}>M-PESA Details</Text>
            <Text style={styles.mpesaNumber}>{phoneNumber}</Text>
            <Text style={styles.mpesaNote}>Funds will be sent to this number</Text>
          </View>

          <TouchableOpacity 
            style={[
              styles.withdrawButton,
              (!usdAmount || parseFloat(usdAmount) < minimumUsd) && styles.disabledButton
            ]} 
            onPress={handleWithdraw}
            disabled={!usdAmount || parseFloat(usdAmount) < minimumUsd || loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.withdrawButtonText}>Confirm Withdrawal</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "lightgreen",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    paddingTop: 50,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E9ECEF",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#212529",
  },
  backButton: {
    padding: 5,
  },
  logoutButton: {
    padding: 5,
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
  },
  withdrawCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  inputSection: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: "#6C757D",
    marginBottom: 8,
    fontWeight: "500",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#CED4DA",
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  currencySymbol: {
    fontSize: 16,
    color: "#212529",
    fontWeight: "600",
    marginRight: 8,
  },
  input: {
    flex: 1,
    height: 48,
    fontSize: 16,
    color: "#212529",
  },
  minimumText: {
    fontSize: 12,
    color: "#E5383B",
    marginTop: 5,
  },
  conversionSection: {
    backgroundColor: "#F8F9FA",
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
  },
  conversionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  conversionLabel: {
    fontSize: 14,
    color: "#6C757D",
  },
  conversionValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#212529",
  },
  mpesaSection: {
    marginBottom: 25,
  },
  mpesaTitle: {
    fontSize: 14,
    color: "#6C757D",
    marginBottom: 5,
    fontWeight: "500",
  },
  mpesaNumber: {
    fontSize: 16,
    fontWeight: "600",
    color: "#212529",
  },
  mpesaNote: {
    fontSize: 12,
    color: "#6C757D",
    marginTop: 3,
  },
  withdrawButton: {
    backgroundColor: "#3A0CA3",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  disabledButton: {
    backgroundColor: "#ADB5BD",
  },
  withdrawButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default WithdrawScreen;
