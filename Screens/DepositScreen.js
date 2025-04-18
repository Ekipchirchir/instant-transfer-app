import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator, KeyboardAvoidingView, Platform,
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import API_BASE_URL from '../config';

// Assuming ThemeContext is available from Navigation.js (as in HomeScreen.js)
const ThemeContext = React.createContext();

const DepositScreen = ({ navigation, route }) => {
  const [usdAmount, setUsdAmount] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const exchangeRate = 134;
  const minUsdAmount = 2;
  const maxUsdAmount = 2000;
  const minKesAmount = Math.ceil(minUsdAmount * exchangeRate);

  // Access theme from ThemeContext
  const { theme } = React.useContext(ThemeContext) || { theme: "light" };

  useEffect(() => {
    const checkAuth = async () => {
      const derivAccount = await AsyncStorage.getItem('deriv_account');
      console.log('AsyncStorage deriv_account:', derivAccount);
      if (!derivAccount) {
        console.warn('No deriv_account found. Redirecting to Auth.');
        navigation.navigate('Auth');
      }
    };
    checkAuth();
  }, [navigation]);

  const fetchAccessToken = async () => {
    try {
      console.log('Fetching M-Pesa access token from:', `${API_BASE_URL}/auth/token`);
      const response = await axios.get(`${API_BASE_URL}/auth/token`, { timeout: 10000 });
      if (!response.data?.access_token) {
        throw new Error('No access token received from backend');
      }
      console.log('Access Token Retrieved:', response.data.access_token);
      return response.data.access_token;
    } catch (error) {
      console.error('Token Fetch Error:', {
        status: error.response?.status,
        data: error.response?.data,
        url: error.config?.url
      });
      throw error;
    }
  };

  const handleDeposit = async () => {
    const parsedAmount = parseFloat(usdAmount);
    if (isNaN(parsedAmount) || parsedAmount < minUsdAmount) {
      Alert.alert('Invalid Amount', `Minimum deposit is USD ${minUsdAmount.toFixed(2)} (KES ${minKesAmount}) to meet Deriv's minimum requirement`);
      return;
    }

    if (parsedAmount > maxUsdAmount) {
      Alert.alert('Invalid Amount', `Maximum deposit is USD ${maxUsdAmount.toFixed(2)} (KES ${Math.round(maxUsdAmount * exchangeRate)}) to stay within Deriv's maximum limit`);
      return;
    }

    const kesAmount = Math.round(parsedAmount * exchangeRate);

    const phoneRegex = /^(?:\+?254|0)?[7][0-9]{8}$/;
    if (!phoneRegex.test(phoneNumber)) {
      Alert.alert('Invalid Phone', 'Please use a valid M-Pesa registered number\nFormats: 2547..., 07..., or 7...');
      return;
    }

    setLoading(true);
    try {
      const token = await fetchAccessToken();
      const derivAccount = await AsyncStorage.getItem('deriv_account');
      if (!derivAccount) {
        throw new Error('User not logged in. Please log in again.');
      }

      const payload = {
        amount: kesAmount.toString(),
        phone: phoneNumber,
        deriv_account: derivAccount
      };

      console.log('Initiating STK Push with:', {
        url: `${API_BASE_URL}/mpesa/deposit`,
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: payload
      });

      const response = await axios.post(
        `${API_BASE_URL}/mpesa/deposit`,
        payload,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          timeout: 30000
        }
      );

      console.log('STK Push Response:', response.data);

      if (response.data?.success) {
        Alert.alert(
          'Payment Initiated',
          'STK Push sent to your phone!\nPlease enter your M-Pesa PIN to complete the payment.',
          [{ text: 'OK', onPress: () => navigation.navigate('Transactions', { refresh: true }) }]
        );
      } else {
        throw new Error(response.data?.error || 'Payment initiation failed');
      }
    } catch (error) {
      console.error('Deposit Error:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        url: error.config?.url
      });

      const errorMessage = error.response?.data?.error ||
        (error.response?.status === 404 ? 'Payment service unavailable. Please try again.' :
          error.message.includes('timeout') ? 'Request timed out. Check your connection.' :
            'Payment failed. Please try again.');

      Alert.alert('Payment Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.clear();
      console.log('Logged out: AsyncStorage cleared');
      navigation.replace('Auth');
    } catch (error) {
      console.error('Logout Error:', error);
      Alert.alert('Error', 'Failed to log out. Please try again.');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
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
            Deposit Funds
          </Text>

          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
          >
            <Ionicons name="log-out-outline" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <View style={styles.card}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Deposit Amount</Text>
              <Text style={styles.label}>USD Amount</Text>
              <View style={styles.inputContainer}>
                <Text style={styles.currencySymbol}>$</Text>
                <TextInput
                  style={styles.input}
                  placeholder={`Minimum USD ${minUsdAmount.toFixed(2)}`}
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
              <Text style={styles.minimumText}>Minimum: USD {minUsdAmount.toFixed(2)} (KES {minKesAmount})</Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Conversion</Text>
              <View style={styles.conversionRow}>
                <Text style={styles.conversionLabel}>Exchange Rate:</Text>
                <Text style={styles.conversionValue}>1 USD = KES {exchangeRate}</Text>
              </View>
              <View style={styles.conversionRow}>
                <Text style={styles.conversionLabel}>KES Equivalent:</Text>
                <Text style={styles.conversionValue}>
                  {usdAmount ? Math.round(parseFloat(usdAmount) * exchangeRate) : '0'} KES
                </Text>
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
                  value={phoneNumber.replace(/^\+?254/, '')}
                  onChangeText={(text) => {
                    if (/^[0-7]?[0-9]{0,8}$/.test(text)) {
                      setPhoneNumber(text.startsWith('0') ? `254${text.substring(1)}` : `254${text}`);
                    }
                  }}
                  maxLength={9}
                />
              </View>
              <Text style={styles.note}>Your M-Pesa registered number</Text>
            </View>

            <TouchableOpacity
              style={[
                styles.button,
                (!usdAmount || parseFloat(usdAmount) < minUsdAmount || !phoneNumber || loading) && styles.buttonDisabled
              ]}
              onPress={handleDeposit}
              disabled={!usdAmount || parseFloat(usdAmount) < minUsdAmount || !phoneNumber || loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Initiate M-Pesa Payment</Text>
              )}
            </TouchableOpacity>

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
    backgroundColor: 'lightgreen',
  },
  scrollContainer: {
    flexGrow: 1,
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
    fontSize: 20, // Updated to match HomeScreen.js
    fontWeight: '600',
    // color: '#212529', // Now theme-based
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
    flex: 1,
    padding: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
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
    fontWeight: '600',
    color: '#3A0CA3',
    marginBottom: 15,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  label: {
    fontSize: 14,
    color: '#6C757D',
    marginBottom: 8,
    fontWeight: '500',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#CED4DA',
    borderRadius: 8,
    paddingHorizontal: 12,
    position: 'relative',
  },
  currencySymbol: {
    position: 'absolute',
    left: 12,
    fontSize: 16,
    color: '#212529',
    fontWeight: '600',
  },
  input: {
    flex: 1,
    height: 48,
    fontSize: 16,
    color: '#212529',
    paddingLeft: 30,
  },
  minimumText: {
    fontSize: 12,
    color: '#E5383B',
    marginTop: 5,
  },
  conversionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  conversionLabel: {
    fontSize: 14,
    color: '#6C757D',
  },
  conversionValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#212529',
  },
  note: {
    fontSize: 12,
    color: '#6C757D',
    marginTop: 5,
  },
  button: {
    backgroundColor: '#3A0CA3',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  buttonDisabled: {
    backgroundColor: '#ADB5BD',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  footerNote: {
    fontSize: 11,
    color: '#6C757D',
    marginTop: 20,
    textAlign: 'center',
    lineHeight: 16,
  },
});

export default DepositScreen;
