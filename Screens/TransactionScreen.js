import React, { useEffect, useState } from "react";
import { 
  View, Text, StyleSheet, FlatList, 
  ActivityIndicator, TouchableOpacity, RefreshControl, Alert
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const API_BASE_URL = "https://instant-transfer-back-production.up.railway.app/api";

const TransactionsScreen = () => {
  const navigation = useNavigation();
  const [transactions, setTransactions] = useState([]);
  const [balance, setBalance] = useState(0); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const fetchTransactionData = async () => {
    try {
      const derivAccount = await AsyncStorage.getItem("deriv_account");
      if (!derivAccount) {
        setError("No account found. Please sign up via Deriv.");
        setLoading(false);
        return;
      }

      const response = await axios.get(`${API_BASE_URL}/mpesa/transactions/${derivAccount}`);
      if (response.status !== 200) {
        throw new Error(`Server responded with status ${response.status}`);
      }

      if (response.data.success) {
        setTransactions(response.data.transactions);
        const userResponse = await axios.get(`${API_BASE_URL}/user/${derivAccount}`); 
        if (userResponse.data.success) {
          setBalance(userResponse.data.user.balance);
        }
      } else {
        setError(response.data.error || "No transactions found");
      }
    } catch (error) {
      console.error("API Error:", error.response ? error.response.data : error.message);
      setError("Failed to load transaction history.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchTransactionData();
  };

  const handleLogout = async () => {
    Alert.alert(
      "Confirm Logout",
      "Are you sure you want to log out?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Log Out", 
          onPress: async () => {
            await AsyncStorage.clear();
            navigation.replace("Landing");
          }
        }
      ]
    );
  };

  useEffect(() => {
    fetchTransactionData();
  }, []);

  const renderTransactionItem = ({ item }) => (
    <View style={[
      styles.transactionItem,
      item.status === "completed" ? styles.depositItem : styles.pendingItem
    ]}>
      <View style={styles.transactionIcon}>
        <Feather 
          name="arrow-down-circle" 
          size={24} 
          color={item.status === "completed" ? "#2B9348" : "#F08C00"} 
        />
      </View>
      <View style={styles.transactionDetails}>
        <Text style={styles.transactionType}>Deposit</Text>
        <Text style={styles.transactionDate}>
          {new Date(item.transactionDate || item.createdAt).toLocaleString()}
        </Text>
        <Text style={styles.transactionReceipt}>
          Receipt: {item.mpesaReceiptNumber}
        </Text>
      </View>
      <View style={styles.transactionAmountContainer}>
        <Text style={[
          styles.transactionAmount,
          item.status === "completed" ? styles.depositAmount : styles.pendingAmount
        ]}>
          +KES {item.amount} (~${(item.amount / 129).toFixed(2)})
        </Text>
        <Text style={[
          styles.transactionStatus,
          item.status === "completed" ? styles.completedStatus : styles.pendingStatus
        ]}>
          {item.status.toUpperCase()}
        </Text>
      </View>
    </View>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#3A0CA3" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Feather name="arrow-left" size={24} color="#3A0CA3" />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>Transaction History</Text>
        
        <TouchableOpacity 
          style={styles.logoutButton} 
          onPress={handleLogout}
        >
          <Feather name="log-out" size={24} color="#3A0CA3" />
        </TouchableOpacity>
      </View>

      {error ? (
        <View style={styles.errorContainer}>
          <Feather name="alert-circle" size={20} color="#E5383B" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : (
        <FlatList
          contentContainerStyle={styles.contentContainer}
          data={transactions}
          renderItem={renderTransactionItem}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={
            <View style={styles.balanceCard}>
              <Text style={styles.balanceLabel}>Current Balance</Text>
              <Text style={styles.balanceAmount}>
                ${balance.toFixed(2)}
              </Text>
            </View>
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Feather name="file-text" size={40} color="#ADB5BD" />
              <Text style={styles.emptyText}>No transactions yet</Text>
              <Text style={styles.emptySubtext}>Your transactions will appear here</Text>
            </View>
          }
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#3A0CA3"
            />
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "lightgreen",
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
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
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  errorContainer: {
    backgroundColor: "#FFF5F5",
    padding: 15,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    margin: 20,
    borderWidth: 1,
    borderColor: "#FFE3E3",
  },
  errorText: {
    color: "#E5383B",
    fontSize: 14,
    fontWeight: "500",
    marginLeft: 10,
  },
  balanceCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  balanceLabel: {
    fontSize: 14,
    color: "#6C757D",
    marginBottom: 5,
  },
  balanceAmount: {
    fontSize: 28,
    fontWeight: "700",
    color: "#212529",
  },
  transactionItem: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    padding: 16,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  depositItem: {
    borderLeftWidth: 4,
    borderLeftColor: "#2B9348",
  },
  pendingItem: {
    borderLeftWidth: 4,
    borderLeftColor: "#F08C00",
  },
  transactionIcon: {
    marginRight: 12,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionType: {
    fontSize: 15,
    fontWeight: "500",
    color: "#212529",
  },
  transactionDate: {
    fontSize: 12,
    color: "#6C757D",
    marginTop: 2,
  },
  transactionReceipt: {
    fontSize: 12,
    color: "#6C757D",
    marginTop: 2,
  },
  transactionAmountContainer: {
    alignItems: "flex-end",
  },
  transactionAmount: {
    fontSize: 15,
    fontWeight: "600",
  },
  depositAmount: {
    color: "#2B9348",
  },
  pendingAmount: {
    color: "#F08C00",
  },
  transactionStatus: {
    fontSize: 11,
    fontWeight: "600",
    marginTop: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    overflow: "hidden",
  },
  completedStatus: {
    backgroundColor: "#EBFBEE",
    color: "#2B9348",
  },
  pendingStatus: {
    backgroundColor: "#FFF3BF",
    color: "#F08C00",
  },
  emptyContainer: {
    alignItems: "center",
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#212529",
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#6C757D",
    marginTop: 4,
  },
});

export default TransactionsScreen;
