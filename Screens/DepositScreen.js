import React, { useState } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, 
  StyleSheet, Alert, ActivityIndicator 
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

  return (
    <View style={styles.container}>
      <View style={styles.navbar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.navButton}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.navTitle}>Deposit</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>USD Amount</Text>
        <TextInput
          style={styles.input}
          placeholder={`Minimum USD ${minUsdAmount}`}
          keyboardType="decimal-pad"
          value={usdAmount}
          onChangeText={(text) => {
            if (/^\d*\.?\d*$/.test(text) || text === '') {
              setUsdAmount(text);
            }
          }}
        />

        <Text style={styles.label}>KES Equivalent</Text>
        <TextInput
          style={styles.kesInput}
          value={usdAmount ? Math.round(parseFloat(usdAmount) * exchangeRate).toString() : ''}
          editable={false}
        />
        <Text style={styles.exchangeRate}>1 USD = KES {exchangeRate}</Text>

        <Text style={styles.label}>M-Pesa Phone Number</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. 254712345678, 0712345678"
          keyboardType="phone-pad"
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          maxLength={12}
        />
        <Text style={styles.note}>Enter your M-Pesa registered number</Text>

        <TouchableOpacity 
          style={[styles.button, loading && styles.buttonDisabled]} 
          onPress={handleDeposit} 
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>DEPOSIT</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'lightgreen',
    justifyContent: 'center',
    alignItems: 'center',
  },
  navbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '90%',
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
  },
  navButton: {
    padding: 10,
  },
  navTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  card: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    width: '85%',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 5,
    marginTop: 5,
    fontSize: 16,
  },
  kesInput: {
    borderWidth: 1,
    borderColor: '#A7BF6F',
    padding: 10,
    borderRadius: 5,
    marginTop: 5,
    backgroundColor: '#E6F0C2',
    fontSize: 16,
    fontWeight: 'bold',
  },
  exchangeRate: {
    fontSize: 12,
    marginTop: 5,
    color: '#444',
    textAlign: 'right',
  },
  note: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
    marginBottom: 15,
  },
  button: {
    backgroundColor: '#000',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
    borderRadius: 5,
    marginTop: 15,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default DepositScreen;
