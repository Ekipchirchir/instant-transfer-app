import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const DepositScreen = () => {
  const [usdAmount, setUsdAmount] = useState("");
  const exchangeRate = 129;
  const minAmount = 10;
  const phoneNumber = "+254768245123";

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

        
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>DEPOSIT</Text>
          <Ionicons name="chevron-forward" size={18} color="white" />
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
