import React, { useEffect, useState } from "react";
import { 
  View, Text, StyleSheet, ScrollView, 
  ActivityIndicator, TouchableOpacity, RefreshControl, Alert
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.errorContainer}>
          <Feather name="alert-circle" size={20} color="#E5383B" />
          <Text style={styles.errorText}>Render Error: {this.state.error?.message || "Unknown error"}</Text>
        </View>
      );
    }
    return this.props.children;
  }
}

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
      console.log('Fetching transactions for account:', derivAccount);
      if (!derivAccount) {
        setError("No account found. Please sign up via Deriv.");
        setLoading(false);
        return;
      }

      const response = await axios.get(`${API_BASE_URL}/mpesa/transactions/${derivAccount}`);
      console.log('Transactions API Response:', JSON.stringify(response.data, null, 2));

      if (response.status !== 200) {
        throw new Error(`Server responded with status ${response.status}`);
      }

      if (response.data.success) {
        setTransactions(response.data.transactions || []);
        console.log('Transactions set:', response.data.transactions?.length || 0);
        const userResponse = await axios.get(`${API_BASE_URL}/mpesa/user/${derivAccount}`);
        console.log('User API Response:', JSON.stringify(userResponse.data, null, 2));
        if (userResponse.data.success) {
          setBalance(userResponse.data.user.balance);
        } else {
          console.warn('Failed to fetch user balance:', userResponse.data.error);
        }
      } else {
        setError(response.data.error || "No transactions found");
        console.log('Error from API:', response.data.error);
      }
    } catch (error) {
      console.error("API Error:", error.response ? error.response.data : error.message);
      setError(error.response?.data?.error || "Failed to load transaction history.");
    } finally {
      setLoading(false);
      setRefreshing(false);
      console.log('Loading state set to false');
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
    console.log('TransactionsScreen mounted');
    fetchTransactionData();
  }, []);

  const renderTransactionItem = (item) => {
    console.log('Rendering transaction item:', item.id);
    try {
      const transactionDate = item.transactionDate || item.createdAt;
      const parsedDate = new Date(transactionDate);
      const isValidDate = !isNaN(parsedDate.getTime());
      const displayDate = isValidDate
        ? parsedDate.toLocaleString()
        : "Date Not Available";

      const isWithdrawal = item.transactionType === 'withdrawal';

      return (
        <View style={[
          styles.transactionItem,
          item.status === "completed" ? (isWithdrawal ? styles.withdrawalItem : styles.depositItem) : styles.pendingItem
        ]}>
          <View style={styles.transactionIcon}>
            <Feather 
              name={isWithdrawal ? "arrow-up-circle" : "arrow-down-circle"} 
              size={24} 
              color={item.status === "completed" ? (isWithdrawal ? "#E5383B" : "#2B9348") : "#F08C00"} 
            />
          </View>
          <View style={styles.transactionDetails}>
            <Text style={styles.transactionType}>{isWithdrawal ? "Withdrawal" : "Deposit"}</Text>
            <Text style={styles.transactionDate}>
              {displayDate}
            </Text>
            <Text style={styles.transactionReceipt}>
              Receipt: {item.mpesaReceiptNumber || "N/A"}
            </Text>
            {item.status === "failed" && item.failureReason && (
              <Text style={styles.failureReason}>
                Failed: {item.failureReason}
              </Text>
            )}
            {item.status === "completed" && item.derivTransactionId && (
              <Text style={styles.transactionReceipt}>
                Deriv TxID: {item.derivTransactionId}
              </Text>
            )}
          </View>
          <View style={styles.transactionAmountContainer}>
            <Text style={[
              styles.transactionAmount,
              item.status === "completed" ? (isWithdrawal ? styles.withdrawalAmount : styles.depositAmount) : styles.pendingAmount
            ]}>
              {isWithdrawal ? "-" : "+"}KES {item.amount} (~${item.usdAmount?.toFixed(2) || "0.00"})
            </Text>
            <Text style={[
              styles.transactionStatus,
              item.status === "completed" ? styles.completedStatus : styles.pendingStatus
            ]}>
              {item.status?.toUpperCase() || "UNKNOWN"}
            </Text>
          </View>
        </View>
      );
    } catch (error) {
      console.error('Error rendering transaction item:', item.id, error.message);
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Error rendering transaction: {error.message}</Text>
        </View>
      );
    }
  };

  console.log('Rendering TransactionsScreen, loading:', loading, 'error:', error, 'transactions:', transactions.length);

  if (loading && !refreshing) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#3A0CA3" />
        <Text>Loading transactions...</Text>
      </View>
    );
  }

  return (
    <ErrorBoundary>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => navigation.navigate("Home")}
          >
            <Feather name="arrow-back" size={24} color="#3A0CA3" />
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
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.contentContainer}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor="#3A0CA3"
              />
            }
          >
            <View style={styles.balanceCard}>
              <Text style={styles.balanceLabel}>Current Balance</Text>
              <Text style={styles.balanceAmount}>
                ${balance?.toFixed(2) || "0.00"}
              </Text>
            </View>

            {transactions.length > 0 ? (
              transactions.map((item) => (
                <React.Fragment key={item.id}>
                  {renderTransactionItem(item)}
                </React.Fragment>
              ))
            ) : (
              <View style={styles.emptyContainer}>
                <Feather name="file-text" size={40} color="#ADB5BD" />
                <Text style={styles.emptyText}>No transactions yet</Text>
                <Text style={styles.emptySubtext}>Your transactions will appear here</Text>
              </View>
            )}
          </ScrollView>
        )}
      </View>
    </ErrorBoundary>
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
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 120,
    flexGrow: 1,
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
    minHeight: 80,
  },
  depositItem: {
    borderLeftWidth: 4,
    borderLeftColor: "#2B9348",
  },
  withdrawalItem: {
    borderLeftWidth: 4,
    borderLeftColor: "#E5383B",
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
  failureReason: {
    fontSize: 12,
    color: "#E5383B",
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
  withdrawalAmount: {
    color: "#E5383B",
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
