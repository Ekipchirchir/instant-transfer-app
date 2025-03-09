import React, { useState, useEffect, useCallback } from "react";
import { 
  View, Text, FlatList, ActivityIndicator, StyleSheet, RefreshControl 
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import API_BASE_URL from "../config";
import { useFocusEffect } from "@react-navigation/native";

const TransactionScreen = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);  // ⏳ Pull-to-refresh

  // 🔄 Fetch transactions when screen is focused (after withdrawal/deposit)
  useFocusEffect(
    useCallback(() => {
      fetchTransactions();
    }, [])
  );

  // 🔄 Fetch transactions from backend
  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem("access_token");
      console.log("📡 Fetching Transactions with Token:", token);
      
      const response = await axios.get(
        `${API_BASE_URL}/transactions/`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log("✅ Transactions Response Data:", response.data);
      setTransactions(response.data.reverse());  // 📌 Ensure newest transactions appear first
    } catch (error) {
      console.error("🚨 Fetch Transactions Error:", error);
    } finally {
      setLoading(false);
      setRefreshing(false); // Stop refreshing
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Transaction History</Text>
      
      {loading ? (
        <ActivityIndicator size="large" color="black" />
      ) : transactions.length === 0 ? (
        <Text style={styles.noTransactions}>No transactions yet.</Text>
      ) : (
        <FlatList
          data={transactions}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={[styles.transactionItem, item.transaction_type === "deposit" ? styles.deposit : styles.withdraw]}>
              <Text style={styles.amount}>
                {item.transaction_type === "deposit" ? "➕" : "➖"} ${item.amount}
              </Text>
              <Text style={styles.status}>{item.status}</Text>
              <Text style={styles.date}>{new Date(item.date).toLocaleString()}</Text>
            </View>
          )}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => { 
              setRefreshing(true); 
              fetchTransactions(); 
            }} />
          }
        />
      )}
    </View>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 15,
  },
  noTransactions: {
    textAlign: "center",
    fontSize: 16,
    color: "gray",
    marginTop: 20,
  },
  transactionItem: {
    padding: 15,
    borderRadius: 8,
    marginVertical: 5,
  },
  deposit: {
    backgroundColor: "lightgreen",
  },
  withdraw: {
    backgroundColor: "#FA8072",
  },
  amount: {
    fontSize: 18,
    fontWeight: "bold",
  },
  status: {
    fontSize: 14,
    color: "black",
  },
  date: {
    fontSize: 12,
    color: "black",
  },
});

export default TransactionScreen;
