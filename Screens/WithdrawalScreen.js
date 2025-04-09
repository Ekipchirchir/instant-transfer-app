import React, { useState, useEffect } from "react";
import { 
  View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator 
} from "react-native";
import { Ionicons } from "@expo/vector-icons"; 
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import API_BASE_URL from "../config";

const WithdrawScreen = () => {
  const navigation = useNavigation();
  const [usdAmount, setUsdAmount] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(false);
  const [verificationLoading, setVerificationLoading] = useState(false);
  const [isVerificationRequested, setIsVerificationRequested] = useState(false);
  const [error, setError] = useState(null);
  const exchangeRate = 129; 
  const minimumUsd = 2; // Deriv's minimum for withdraw endpoint
  const kesAmount = usdAmount ? (parseFloat(usdAmount) * exchangeRate).toFixed(2) : "0.00";

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        console.log("Fetching user data...");
        const derivAccount = await AsyncStorage.getItem("deriv_account");
        if (!derivAccount) {
          console.log("No deriv_account found in AsyncStorage");
          Alert.alert("Error", "User not logged in. Please log in again.");
          navigation.replace("DerivConnectScreen");
          return;
        }

        console.log("Deriv Account:", derivAccount);
        const response = await fetch(`${API_BASE_URL}/mpesa/user/${derivAccount}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        const data = await response.json();
        console.log("Fetch User Response:", data);
        if (data.success) {
          setBalance(data.user.balance || 0);
        } else {
          console.log("Failed to fetch balance:", data.error);
          Alert.alert("Error", "Failed to fetch balance.");
        }

        const storedPhone = await AsyncStorage.getItem("phone_number");
        if (storedPhone) {
          console.log("Stored Phone Number:", storedPhone);
          setPhoneNumber(storedPhone);
        }
      } catch (error) {
        console.error("Fetch User Data Error:", error);
        setError("Failed to load user data. Please try again.");
        Alert.alert("Error", "Failed to load user data.");
      }
    };
    fetchUserData();
  }, [navigation]);

  const handleRequestVerification = async () => {
    setVerificationLoading(true);
    try {
      console.log("Requesting verification code...");
      const derivAccount = await AsyncStorage.getItem("deriv_account");
      const token = await AsyncStorage.getItem("access_token");

      if (!derivAccount || !token) {
        console.log("Missing deriv_account or token");
        Alert.alert("Error", "User not logged in. Please log in again.");
        navigation.replace("DerivConnectScreen");
        return;
      }

      const response = await fetch(`${API_BASE_URL}/mpesa/request-verification`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ deriv_account: derivAccount }),
      });

      const data = await response.json();
      console.log("Request Verification Response:", data);
      if (data.success) {
        Alert.alert(
          "Success",
          "Verification code sent to your email. Check your inbox (and spam/junk folder) for an email titled 'Verification Code for Withdrawal'."
        );
        setIsVerificationRequested(true);
      } else {
        Alert.alert("Error", data.error || "Failed to request verification code.");
      }
    } catch (error) {
      console.error("Request Verification Error:", error);
      Alert.alert("Error", "Failed to request verification code. Please try again.");
    } finally {
      setVerificationLoading(false);
    }
  };

  const handleWithdraw = async () => {
    const parsedAmount = parseFloat(usdAmount);
    if (isNaN(parsedAmount) || parsedAmount < minimumUsd) {
      Alert.alert("Error", `Minimum withdrawal is $${minimumUsd}`);
      return;
    }

    if (parsedAmount > balance) {
      Alert.alert("Error", "Insufficient balance for withdrawal.");
      return;
    }

    const phoneRegex = /^[0-9]{9,12}$/; 
    if (!phoneRegex.test(phoneNumber.replace(/^\+?254/, ''))) {
      Alert.alert("Invalid Phone", "Please enter a valid phone number (e.g., 0712345678)");
      return;
    }

    if (!verificationCode) {
      Alert.alert("Error", "Please enter the verification code sent to your email.");
      return;
    }

    if (verificationCode.length < 8) {
      Alert.alert("Error", "Verification code must be at least 8 characters long.");
      return;
    }

    setLoading(true);
    try {
      console.log("Initiating withdrawal...");
      const token = await AsyncStorage.getItem("access_token");
      const derivAccount = await AsyncStorage.getItem("deriv_account");
      const formattedPhone = phoneNumber; // Let backend handle formatting

      const response = await fetch(`${API_BASE_URL}/mpesa/withdraw`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json", 
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ 
          amount: parsedAmount, 
          phone: formattedPhone, 
          deriv_account: derivAccount,
          verification_code: verificationCode,
        }),
      });
      
      const data = await response.json();
      console.log("Withdraw Response:", data);
      if (response.ok && data.success) {
        Alert.alert("Success", "Withdrawal request initiated! You will receive the funds shortly.");
        navigation.navigate("Transactions", { refresh: true });
      } else {
        Alert.alert("Error", data.error || "Withdrawal failed.");
      }
    } catch (error) {
      console.error("Withdraw Error:", error);
      Alert.alert(
        "Error",
        "Network request failed. Please try again.",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Retry", onPress: handleWithdraw }, 
        ]
      );
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      console.log("Logging out...");
      await AsyncStorage.clear();
      navigation.replace("DerivConnectScreen");
    } catch (error) {
      console.error("Logout Error:", error);
      Alert.alert("Error", "Failed to log out. Please try again.");
    }
  };

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => navigation.goBack()}>
          <Text style={styles.retryButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.navigate("Home")}
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
                placeholder={`Minimum $${minimumUsd}`}
                placeholderTextColor="#999"
                keyboardType="decimal-pad"
                value={usdAmount}
                onChangeText={(text) => {
                  if (/^\d*\.?\d*$/.test(text) || text === '') {
                    setUsdAmount(text);
                  }
                }}
              />
            </View>
            <Text style={styles.minimumText}>Minimum: ${minimumUsd} | Balance: ${balance.toFixed(2)}</Text>
          </View>

          <View style={styles.conversionSection}>
            <View style={styles.conversionRow}>
              <Text style={styles.conversionLabel}>Exchange Rate:</Text>
              <Text style={styles.conversionValue}>1 USD = KES {exchangeRate}</Text>
            </View>
            <View style={styles.conversionRow}>
              <Text style={styles.conversionLabel}>You'll receive:</Text>
              <Text style={styles.conversionValue}>KES {kesAmount}</Text>
            </View>
          </View>

          <View style={styles.mpesaSection}>
            <Text style={styles.mpesaTitle}>M-PESA Details</Text>
            <Text style={styles.label}>Phone Number</Text>
            <View style={styles.inputContainer}>
              <Text style={styles.currencySymbol}>+254</Text>
              <TextInput
                style={[styles.input, { paddingLeft: 50 }]}
                placeholder="712345678"
                placeholderTextColor="#999"
                keyboardType="phone-pad"
                value={phoneNumber.replace(/^\+?254/, '')}
                onChangeText={(text) => {
                  if (/^[0-7]?[0-9]{0,8}$/.test(text)) {
                    setPhoneNumber(text.startsWith('0') ? `254${text.substring(1)}` : `254${text}`);
                  }
                }}
                maxLength={9}
              />
            </View>
            <Text style={styles.mpesaNote}>Funds will be sent to this M-Pesa registered number</Text>
          </View>

          <View style={styles.verificationSection}>
            <Text style={styles.label}>Verification Code</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Enter code from email"
                placeholderTextColor="#999"
                value={verificationCode}
                onChangeText={setVerificationCode}
                maxLength={128} 
              />
            </View>
            <TouchableOpacity
              style={[
                styles.requestButton,
                (isVerificationRequested || verificationLoading) && styles.disabledButton,
              ]}
              onPress={handleRequestVerification}
              disabled={isVerificationRequested || verificationLoading}
            >
              {verificationLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.requestButtonText}>
                  {isVerificationRequested ? "Code Sent" : "Request Code"}
                </Text>
              )}
            </TouchableOpacity>
          </View>

          <TouchableOpacity 
            style={[
              styles.withdrawButton,
              (!usdAmount || parseFloat(usdAmount) < minimumUsd || parseFloat(usdAmount) > balance || !phoneNumber || !verificationCode || loading) && styles.disabledButton
            ]} 
            onPress={handleWithdraw}
            disabled={!usdAmount || parseFloat(usdAmount) < minimumUsd || parseFloat(usdAmount) > balance || !phoneNumber || !verificationCode || loading}
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
    position: "relative",
  },
  currencySymbol: {
    position: "absolute",
    left: 12,
    fontSize: 16,
    color: "#212529",
    fontWeight: "600",
  },
  input: {
    flex: 1,
    height: 48,
    fontSize: 16,
    color: "#212529",
    paddingLeft: 30,
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
  mpesaNote: {
    fontSize: 12,
    color: "#6C757D",
    marginTop: 3,
  },
  verificationSection: {
    marginBottom: 20,
  },
  requestButton: {
    backgroundColor: "#3A0CA3",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  disabledButton: {
    backgroundColor: "#ADB5BD",
  },
  requestButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  withdrawButton: {
    backgroundColor: "#3A0CA3",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  withdrawButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  errorText: {
    fontSize: 16,
    color: "#E5383B",
    textAlign: "center",
    marginTop: 20,
  },
  retryButton: {
    backgroundColor: "#3A0CA3",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
    marginHorizontal: 20,
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default WithdrawScreen;
