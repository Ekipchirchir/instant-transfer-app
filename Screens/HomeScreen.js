import React, { useState, useEffect } from "react";
import { 
  View, Text, TouchableOpacity, FlatList, StyleSheet, ActivityIndicator, Alert 
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import API_BASE_URL from "../config";

const HomeScreen = ({ navigation }) => {
  const [userData, setUserData] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserData();
    fetchTransactions();
  }, []);

  const fetchUserData = async () => {
    try {
      const token = await AsyncStorage.getItem("access_token");
      const response = await axios.get(`${API_BASE_URL}/user-details/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUserData(response.data);
    } catch (error) {
      console.error("🚨 Fetch User Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactions = async () => {
    try {
      const token = await AsyncStorage.getItem("access_token");
      const response = await axios.get(`${API_BASE_URL}/transactions/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTransactions(response.data.slice(0, 4));
    } catch (error) {
      console.error("🚨 Fetch Transactions Error:", error);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to log out?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Logout", style: "destructive", onPress: () => navigation.replace("Login") },
      ],
      { cancelable: true }
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        
        <Text style={styles.appTitle}>INSTANT TRANSFER</Text>
        
        <View style={styles.headerIcons}>
          <TouchableOpacity onPress={() => navigation.navigate("Settings")} style={styles.iconButton}>
            <Ionicons name="settings" size={24} color="white" />
          </TouchableOpacity>

          <TouchableOpacity onPress={handleLogout} style={styles.iconButton}>
            <Ionicons name="log-out" size={24} color="red" />
          </TouchableOpacity>
        </View>
      </View>

      {/* User Info */}
      <View style={styles.userCard}>
        {loading ? (
          <ActivityIndicator size="large" color="black" />
        ) : (
          <>
            <Text style={styles.userName}>{userData?.username || "John Doe"}</Text>
            <Text style={styles.userId}>{userData?.account_number || "CR92929292"}</Text>
            <Text style={styles.balance}>Derive balance: ${userData?.balance || "10"}</Text>
          </>
        )}
      </View>

      {/* Deposit & Withdraw Buttons */}
      <View style={styles.buttonsContainer}>
        <TouchableOpacity style={styles.depositButton} onPress={() => navigation.navigate("Deposit")}>
          <Ionicons name="add" size={28} color="black" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.withdrawButton} onPress={() => navigation.navigate("Withdraw")}>
          <Ionicons name="remove" size={28} color="white" />
        </TouchableOpacity>
      </View>

      <View style={styles.buttonLabels}>
        <Text style={styles.label}>DEPOSIT</Text>
        <Text style={styles.label}>WITHDRAW</Text>
      </View>

      {/* Transactions */}
      <View style={styles.transactionContainer}>
        <View style={styles.transactionHeader}>
          <Text style={styles.transactionTitle}>TRANSACTIONS</Text>
          <TouchableOpacity onPress={() => navigation.navigate("Transaction")}>
            <Text style={styles.moreText}>MORE</Text>
          </TouchableOpacity>
        </View>

        {transactions.length === 0 ? (
          <Text style={styles.noTransactions}>No transactions yet.</Text>
        ) : (
          <FlatList
            data={transactions}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <View style={styles.transactionItem}>
                <Text style={styles.transactionSymbol}>{item.transaction_type === "deposit" ? "+" : "-"}</Text>
                <Text style={styles.transactionAmount}>${item.amount}</Text>
                <Text style={styles.transactionDate}>{new Date(item.date).toLocaleDateString()}</Text>
              </View>
            )}
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    padding: 15,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "lightgreen",
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderRadius: 10,
  },
  appTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
  },
  headerIcons: {
    flexDirection: "row",
    gap: 15,
  },
  iconButton: {
    padding: 5,
  },
  userCard: {
    backgroundColor: "#F7F7C6",
    padding: 15,
    borderRadius: 10,
    marginVertical: 20,
  },
  userName: {
    fontSize: 18,
    fontWeight: "bold",
  },
  userId: {
    fontSize: 14,
    color: "#555",
  },
  balance: {
    fontSize: 16,
    fontWeight: "bold",
  },
  buttonsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginVertical: 10,
  },
  depositButton: {
    backgroundColor: "lightgreen",
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 30,
  },
  withdrawButton: {
    backgroundColor: "black",
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonLabels: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 60,
  },
  label: {
    fontSize: 14,
    fontWeight: "bold",
  },
  transactionContainer: {
    backgroundColor: "#F0F0F0",
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
  },
  transactionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  transactionTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },
  moreText: {
    color: "#007AFF",
    fontSize: 14,
  },
  transactionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 5,
  },
  transactionSymbol: {
    fontSize: 18,
    fontWeight: "bold",
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: "bold",
  },
  transactionDate: {
    fontSize: 12,
    color: "#555",
  },
});

export default HomeScreen;
