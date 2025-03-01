import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons"; // Icons for UI
import { useNavigation } from "@react-navigation/native";

const WithdrawScreen = () => {
  const navigation = useNavigation();
  const [usdAmount, setUsdAmount] = useState("");
  const exchangeRate = 129; // 1 USD = 129 KES
  const minimumUsd = 10; // Minimum withdrawal amount
  const phoneNumber = "+254768245123"; // User's phone number (placeholder)


  const kesAmount = usdAmount ? (usdAmount * exchangeRate).toFixed(2) : "";


  const handleWithdraw = () => {
    if (!usdAmount || usdAmount < minimumUsd) {
      alert(`Minimum withdrawal amount is USD ${minimumUsd}`);
      return;
    }
    alert(`Withdrawal request of USD ${usdAmount} (~KES ${kesAmount}) sent!`);
  };

  return (
    <View style={styles.container}>
   
      <View style={styles.withdrawCard}>
        {/*<Ionicons name="remove-outline" size={20} color="black" />*/}
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
        <Text style={styles.note}>Minimum 10 USD {minimumUsd}</Text>

        
        <Text style={styles.label}>KES</Text>
        <TextInput
          style={styles.disabledInput}
          value={kesAmount}
          editable={false}
          placeholder="M-PESA Amount"
        />

        <Text style={styles.exchangeRate}>1 USD = KES {exchangeRate}</Text>
        <Text style={styles.phone}>{phoneNumber}</Text>

        <TouchableOpacity style={styles.withdrawButton} onPress={handleWithdraw}>
          <Text style={styles.withdrawButtonText}>WITHDRAW</Text>
          <Ionicons name="chevron-forward-outline" size={20} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
};


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
