import React, { useState } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, 
  StyleSheet, Alert, ActivityIndicator, KeyboardAvoidingView, Platform 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import API_BASE_URL from '../config';

const DepositScreen = ({ navigation }) => {
  const [usdAmount, setUsdAmount] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const exchangeRate = 129;
  const minUsdAmount = 10;
  const minKesAmount = 10;

  const fetchAccessToken = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/auth/token`);
      if (!response.data?.access_token) {
        throw new Error('No access token received');
      }
      return response.data.access_token;
    } catch (error) {
      console.error('Token Error:', {
        status: error.response?.status,
        data: error.response?.data,
        url: error.config?.url
      });
      throw new Error(error.response?.data?.error || 'Failed to get token');
    }
  };

  const handleDeposit = async () => {
    const parsedAmount = parseFloat(usdAmount);
    if (isNaN(parsedAmount) || parsedAmount < minUsdAmount) {
      Alert.alert('Error', `Minimum deposit is USD ${minUsdAmount}`);
      return;
    }

    const kesAmount = Math.round(parsedAmount * exchangeRate);
    if (kesAmount < minKesAmount) {
      Alert.alert('Error', `Minimum amount is KES ${minKesAmount} (USD ${(minKesAmount/exchangeRate).toFixed(2)})`);
      return;
    }

    const phoneRegex = /^(?:\+?254|0)?[7][0-9]{8}$/;
    if (!phoneRegex.test(phoneNumber)) {
      Alert.alert('Error', 'Valid formats: 2547..., 07..., or +2547...');
      return;
    }

    setLoading(true);
    try {
      const token = await fetchAccessToken();
      
      const response = await axios.post(
        `${API_BASE_URL}/mpesa/deposit`,
        {
          amount: kesAmount.toString(),
          phone: phoneNumber,
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data?.success) {
        Alert.alert('Success', 'STK Push sent to your phone! Check your M-Pesa');
        navigation.navigate('Transactions');
      } else {
        throw new Error(response.data?.error || 'Deposit failed');
      }
    } catch (error) {
      console.error('Deposit Error:', {
        message: error.message,
        response: error.response?.data,
        url: error.config?.url
      });
      Alert.alert('Error', error.response?.data?.error || error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await AsyncStorage.clear();
    navigation.replace("DerivConnectScreen");
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#3A0CA3" />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>Deposit Funds</Text>
        
        <TouchableOpacity 
          style={styles.logoutButton} 
          onPress={handleLogout}
        >
          <Ionicons name="exit-outline" size={24} color="#3A0CA3" />
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
                placeholder={`Minimum USD ${minUsdAmount}`}
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
            <Text style={styles.minimumText}>Minimum: USD {minUsdAmount}</Text>
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
                {usdAmount ? Math.round(parseFloat(usdAmount) * exchangeRate).toLocaleString() : '0'}
              </Text>
            </View>
          </View>

         
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>M-Pesa Details</Text>
            
            <Text style={styles.label}>Phone Number</Text>
            <View style={styles.inputContainer}>
              <Text style={styles.currencySymbol}>+254</Text>
              <TextInput
                style={[styles.input, {paddingLeft: 50}]}
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
              (!usdAmount || parseFloat(usdAmount) < minUsdAmount || !phoneNumber) && styles.buttonDisabled
            ]}
            onPress={handleDeposit}
            disabled={!usdAmount || parseFloat(usdAmount) < minUsdAmount || !phoneNumber || loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Initiate Deposit</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'lightgreen',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 50,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212529',
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
});

export default DepositScreen;
