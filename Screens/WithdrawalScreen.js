import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView, 
  Platform,
  ScrollView,
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
  const [status, setStatus] = useState(""); // Tracks "pending", "received", "sent", "error"
  const [transactionId, setTransactionId] = useState(null); // Store backend transaction ID
  const exchangeRate = 124;
  const minimumUsd = 2;
  const kesAmount = usdAmount ? (parseFloat(usdAmount) * exchangeRate).toFixed(0) : "0"; // Rounded to match DepositScreen

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const derivAccount = await AsyncStorage.getItem("deriv_account");
        if (!derivAccount) {
          Alert.alert("Error", "User not logged in. Please log in again.");
          navigation.replace("DerivConnectScreen");
          return;
        }

        const response = await fetch(`${API_BASE_URL}/mpesa/user/${derivAccount}`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });
        const data = await response.json();
        if (data.success) {
          setBalance(data.user.balance || 0);
        } else {
          Alert.alert("Error", "Failed to fetch balance.");
        }

        const storedPhone = await AsyncStorage.getItem("phone_number");
        if (storedPhone) setPhoneNumber(storedPhone);
      } catch (error) {
        setError("Failed to load user data. Please try again.");
        Alert.alert("Error", "Failed to load user data.");
      }
    };
    fetchUserData();
  }, [navigation]);

  const handleRequestVerification = async () => {
    setVerificationLoading(true);
    try {
      const derivAccount = await AsyncStorage.getItem("deriv_account");
      const token = await AsyncStorage.getItem("access_token");
      if (!derivAccount || !token) {
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
      if (data.success) {
        Alert.alert("Success", "Verification code sent to your email.");
        setIsVerificationRequested(true);
      } else {
        Alert.alert("Error", data.error || "Failed to request verification code.");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to request verification code.");
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
      Alert.alert("Error", "Insufficient balance.");
      return;
    }
    const phoneRegex = /^[0-9]{9,12}$/;
    if (!phoneRegex.test(phoneNumber.replace(/^\+?254/, ""))) {
      Alert.alert("Invalid Phone", "Please enter a valid phone number (e.g., 0712345678)");
      return;
    }
    if (!verificationCode) {
      Alert.alert("Error", "Please enter the verification code.");
      return;
    }
    if (verificationCode.length < 8) {
      Alert.alert("Error", "Verification code must be at least 8 characters.");
      return;
    }

    setLoading(true);
    setStatus("pending");

    try {
      const token = await AsyncStorage.getItem("access_token");
      const derivAccount = await AsyncStorage.getItem("deriv_account");
      const formattedPhone = phoneNumber;

      const response = await fetch(`${API_BASE_URL}/mpesa/withdraw`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          amount: parsedAmount,
          phone: formattedPhone,
          deriv_account: derivAccount,
          verification_code: verificationCode,
          payment_agent: "CR3474231",
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Withdrawal failed.");

      if (data.success) {
        setTransactionId(data.data.transactionId);
        pollWithdrawalStatus(data.data.transactionId); 
      } else {
        throw new Error(data.error || "Failed to initiate withdrawal.");
      }
    } catch (error) {
      setStatus("error");
      Alert.alert("Error", error.message);
      setLoading(false);
    }
  };

  const pollWithdrawalStatus = async (transactionId) => {
    const token = await AsyncStorage.getItem("access_token");
    const interval = setInterval(async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/mpesa/withdraw/status/${transactionId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();

        if (data.status === "received") {
          setStatus("received"); // Funds hit CR3474231
        } else if (data.status === "sent") {
          setStatus("sent"); // Funds sent to M-Pesa
          clearInterval(interval);
          setLoading(false);
          Alert.alert("Success", "Funds sent to your M-Pesa account!", [
            { text: "OK", onPress: () => navigation.navigate("Transactions", { refresh: true }) },
          ]);
        } else if (data.status === "error") {
          setStatus("error");
          clearInterval(interval);
          setLoading(false);
          Alert.alert("Error", data.error || "Withdrawal failed.");
        }
      } catch (error) {
        setStatus("error");
        clearInterval(interval);
        setLoading(false);
        Alert.alert("Error", "Failed to check withdrawal status.");
      }
    }, 5000); // Poll every 5 seconds
  };

  const handleLogout = async () => {
    await AsyncStorage.clear();
    navigation.replace("DerivConnectScreen");
  };

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => navigation.goBack()}>
          <Text style={styles.buttonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate("Home")}>
            <Ionicons name="arrow-back" size={24} color="#3A0CA3" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Withdraw Funds</Text>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="exit-outline" size={24} color="#3A0CA3" />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <View style={styles.card}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Withdraw Amount</Text>
              <Text style={styles.label}>USD Amount</Text>
              <View style={styles.inputContainer}>
                <Text style={styles.currencySymbol}>$</Text>
                <TextInput
                  style={styles.input}
                  placeholder={`Minimum USD ${minimumUsd.toFixed(2)}`}
                  placeholderTextColor="#999"
                  keyboardType="decimal-pad"
                  value={usdAmount}
                  onChangeText={(text) => {
                    if (/^\d*\.?\d*$/.test(text) || text === "") setUsdAmount(text);
                  }}
                />
              </View>
              <Text style={styles.minimumText}>
                Minimum: USD {minimumUsd.toFixed(2)} | Balance: USD {balance.toFixed(2)}
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Conversion</Text>
              <View style={styles.conversionRow}>
                <Text style={styles.conversionLabel}>Exchange Rate:</Text>
                <Text style={styles.conversionValue}>1 USD = KES {exchangeRate}</Text>
              </View>
              <View style={styles.conversionRow}>
                <Text style={styles.conversionLabel}>KES Equivalent:</Text>
                <Text style={styles.conversionValue}>KES {kesAmount}</Text>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>M-Pesa Details</Text>
              <Text style={styles.label}>Phone Number</Text>
              <View style={styles.inputContainer}>
                <Text style={styles.currencySymbol}>+254</Text>
                <TextInput
                  style={[styles.input, { paddingLeft: 50 }]}
                  placeholder="712345678"
                  placeholderTextColor="#999"
                  keyboardType="phone-pad"
                  value={phoneNumber.replace(/^\+?254/, "")}
                  onChangeText={(text) => {
                    if (/^[0-7]?[0-9]{0,8}$/.test(text)) {
                      setPhoneNumber(text.startsWith("0") ? `254${text.substring(1)}` : `254${text}`);
                    }
                  }}
                  maxLength={9}
                />
              </View>
              <Text style={styles.note}>Funds will be sent to this M-Pesa number</Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Verification</Text>
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
                  styles.button,
                  styles.requestButton,
                  (isVerificationRequested || verificationLoading) && styles.buttonDisabled,
                ]}
                onPress={handleRequestVerification}
                disabled={isVerificationRequested || verificationLoading}
              >
                {verificationLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>
                    {isVerificationRequested ? "Code Sent" : "Request Code"}
                  </Text>
                )}
              </TouchableOpacity>
            </View>

            {loading && (
              <View style={styles.statusContainer}>
                <ActivityIndicator size="large" color="#3A0CA3" />
              </View>
            )}

            {!loading && status !== "sent" && (
              <TouchableOpacity
                style={[
                  styles.button,
                  (!usdAmount ||
                    parseFloat(usdAmount) < minimumUsd ||
                    parseFloat(usdAmount) > balance ||
                    !phoneNumber ||
                    !verificationCode ||
                    loading) &&
                    styles.buttonDisabled,
                ]}
                onPress={handleWithdraw}
                disabled={
                  !usdAmount ||
                  parseFloat(usdAmount) < minimumUsd ||
                  parseFloat(usdAmount) > balance ||
                  !phoneNumber ||
                  !verificationCode ||
                  loading
                }
              >
                <Text style={styles.buttonText}>Confirm Withdrawal</Text>
              </TouchableOpacity>
            )}

            <Text style={styles.footerNote}>
              By proceeding, you agree to INSTANT TRANSFER's terms of service.
              Transactions may take 1-3 minutes to process.
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "lightgreen",
  },
  scrollContainer: {
    flexGrow: 1,
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
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#3A0CA3",
    marginBottom: 15,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#E9ECEF",
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
  conversionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
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
  note: {
    fontSize: 12,
    color: "#6C757D",
    marginTop: 5,
  },
  button: {
    backgroundColor: "#3A0CA3",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },
  requestButton: {
    padding: 12, 
  },
  buttonDisabled: {
    backgroundColor: "#ADB5BD",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  footerNote: {
    fontSize: 11,
    color: "#6C757D",
    marginTop: 20,
    textAlign: "center",
    lineHeight: 16,
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
  statusContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
});

export default WithdrawScreen;
