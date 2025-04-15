import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const API_BASE_URL = "https://instant-transfer-back-production.up.railway.app/api";

const ThemeContext = React.createContext();

const TransactionItem = ({ item }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const heightAnim = useRef(new Animated.Value(0)).current;
  const [isExpanded, setIsExpanded] = useState(false);

  const onPressIn = () => {
    Animated.timing(scaleAnim, {
      toValue: 0.98,
      duration: 100,
      useNativeDriver: true,
    }).start();
  };

  const onPressOut = () => {
    Animated.timing(scaleAnim, {
      toValue: 1,
      duration: 100,
      useNativeDriver: true,
    }).start();
  };

  const toggleExpand = () => {
    const newExpandedState = !isExpanded;
    setIsExpanded(newExpandedState);
    Animated.timing(heightAnim, {
      toValue: newExpandedState ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const transactionDate = item.transactionDate || item.createdAt;
  const parsedDate = new Date(transactionDate);
  const isValidDate = !isNaN(parsedDate.getTime());
  const displayDate = isValidDate
    ? parsedDate.toLocaleString("en-US", {
        month: "short",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "N/A";

  const isWithdrawal = item.transactionType === "withdrawal";
  const paymentMethod = item.mpesaReceiptNumber ? "M-Pesa" : "Deriv";
  // Updated exchange rate logic: 134 for deposits, 124 for withdrawals
  const exchangeRate = isWithdrawal ? 124 : 134;
  const kesAmount = item.usdAmount ? (item.usdAmount * exchangeRate).toFixed(0) : "0";

  const displayReceipt =
    item.status === "completed"
      ? item.mpesaReceiptNumber || item.derivTransactionId?.slice(0, 8) || "N/A"
      : "";

  const animatedHeight = heightAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 90],
  });

  return (
    <Animated.View style={[styles.transactionItem, { transform: [{ scale: scaleAnim }] }]}>
      <TouchableOpacity
        activeOpacity={0.9}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        onPress={toggleExpand}
      >
        <View style={styles.transactionContainer}>
          <View style={styles.transactionLeft}>
            <Ionicons
              name={isWithdrawal ? "arrow-up" : "arrow-down"}
              size={20}
              color={isWithdrawal ? "#E5383B" : "#2B9348"}
            />
            <View style={styles.transactionDetails}>
              <Text style={styles.transactionType}>
                {isWithdrawal ? "Withdrawal" : "Deposit"}
              </Text>
              <Text style={styles.transactionDate}>{displayDate}</Text>
            </View>
          </View>
          <View style={styles.transactionRight}>
            <Text
              style={[
                styles.transactionAmount,
                isWithdrawal ? styles.withdrawalAmount : styles.depositAmount,
              ]}
            >
              {isWithdrawal ? "-" : "+"}${item.usdAmount?.toFixed(2) || "0.00"}
            </Text>
            <Text
              style={[
                styles.transactionStatus,
                item.status === "completed"
                  ? styles.completedStatus
                  : item.status === "failed"
                  ? styles.failedStatus
                  : styles.pendingStatus,
              ]}
            >
              {item.status.toUpperCase()}
            </Text>
          </View>
          <Ionicons
            name={isExpanded ? "chevron-up" : "chevron-down"}
            size={20}
            color="#6C757D"
            style={styles.expandIcon}
          />
        </View>
        {displayReceipt ? (
          <Text style={styles.transactionReceipt}>{displayReceipt}</Text>
        ) : null}
      </TouchableOpacity>
      <Animated.View style={[styles.detailsContainer, { height: animatedHeight }]}>
        <View style={styles.detailsContent}>
          {item.status === "completed" && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Transaction ID:</Text>
              <Text style={styles.detailValue}>
                {item.mpesaReceiptNumber || item.derivTransactionId || "N/A"}
              </Text>
            </View>
          )}
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Payment Method:</Text>
            <Text style={styles.detailValue}>{paymentMethod}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Amount (USD):</Text>
            <Text style={styles.detailValue}>${item.usdAmount?.toFixed(2) || "0.00"}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Amount (KES):</Text>
            <Text style={styles.detailValue}>KES {kesAmount}</Text>
          </View>
        </View>
      </Animated.View>
    </Animated.View>
  );
};

const TransactionsScreen = () => {
  const navigation = useNavigation();
  const [transactions, setTransactions] = useState([]);
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;

  const { theme } = React.useContext(ThemeContext) || { theme: "light" };

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
        setTransactions(response.data.transactions || []);
        const userResponse = await axios.get(`${API_BASE_URL}/mpesa/user/${derivAccount}`);
        if (userResponse.data.success) {
          setBalance(userResponse.data.user.balance);
        }
      } else {
        setError(response.data.error || "No transactions found");
      }
    } catch (error) {
      setError(error.response?.data?.error || "Failed to load transactions.");
    } finally {
      setLoading(false);
      setRefreshing(false);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }).start();
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchTransactionData();
  };

  const handleLogout = async () => {
    await AsyncStorage.clear();
    navigation.replace("AuthStack", { screen: "Landing" });
  };

  useEffect(() => {
    fetchTransactionData();
  }, []);

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4361EE" />
        <Text style={styles.loadingText}></Text>
      </View>
    );
  }

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
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
          Transaction History
        </Text>
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.balanceContainer}>
        <Text style={styles.balanceTitle}>Your Balance</Text>
        <Text style={styles.balanceValue}>${balance.toFixed(2)}</Text>
      </View>

      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#4361EE" />
        }
      >
        {error ? (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-triangle" size={20} color="#E5383B" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : transactions.length > 0 ? (
          transactions.map((item) => <TransactionItem key={item.id} item={item} />)
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="list" size={48} color="#6C757D" />
            <Text style={styles.emptyText}>No Transactions</Text>
            <Text style={styles.emptySubText}>Your history will appear here.</Text>
          </View>
        )}
      </ScrollView>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "lightgreen",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "lightgreen",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: "#4361EE",
    fontFamily: "System",
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
    fontSize: 20,
    fontWeight: "600",
    fontFamily: "System",
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
  balanceContainer: {
    backgroundColor: "#DDE4FF",
    padding: 20,
    margin: 16,
    borderRadius: 12,
    alignItems: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  balanceTitle: {
    fontSize: 16,
    color: "#4361EE",
    fontFamily: "System",
    fontWeight: "500",
  },
  balanceValue: {
    fontSize: 24,
    fontWeight: "700",
    color: "#2B9348",
    marginTop: 8,
    fontFamily: "System",
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 80,
  },
  transactionItem: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    overflow: "hidden",
  },
  transactionContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 14,
  },
  transactionLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  transactionDetails: {
    marginLeft: 12,
    flex: 1,
  },
  transactionType: {
    fontSize: 14,
    fontWeight: "600",
    color: "#212529",
    fontFamily: "System",
  },
  transactionDate: {
    fontSize: 12,
    color: "#6C757D",
    marginTop: 2,
    fontFamily: "System",
  },
  transactionRight: {
    alignItems: "flex-end",
    flexDirection: "row",
    alignItems: "center",
  },
  transactionAmount: {
    fontSize: 14,
    fontWeight: "700",
    fontFamily: "System",
    marginRight: 10,
  },
  depositAmount: {
    color: "#2B9348",
  },
  withdrawalAmount: {
    color: "#E5383B",
  },
  transactionStatus: {
    fontSize: 11,
    fontWeight: "600",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    marginTop: 4,
    color: "#FFFFFF",
    fontFamily: "System",
  },
  completedStatus: {
    backgroundColor: "#2B9348",
  },
  pendingStatus: {
    backgroundColor: "#F08C00",
  },
  failedStatus: {
    backgroundColor: "#E5383B",
  },
  transactionReceipt: {
    fontSize: 12,
    color: "#6C757D",
    paddingHorizontal: 14,
    paddingBottom: 10,
    fontFamily: "System",
  },
  expandIcon: {
    marginLeft: 10,
  },
  detailsContainer: {
    overflow: "hidden",
    backgroundColor: "#F8F9FA",
  },
  detailsContent: {
    padding: 14,
    paddingTop: 0,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 4,
  },
  detailLabel: {
    fontSize: 12,
    color: "#6C757D",
    fontFamily: "System",
    fontWeight: "500",
  },
  detailValue: {
    fontSize: 12,
    color: "#212529",
    fontFamily: "System",
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF4F4",
    padding: 12,
    borderRadius: 8,
    marginVertical: 10,
    borderLeftWidth: 4,
    borderLeftColor: "#E5383B",
  },
  errorText: {
    fontSize: 14,
    color: "#E5383B",
    marginLeft: 10,
    fontFamily: "System",
    flexShrink: 1,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#212529",
    marginTop: 12,
    fontFamily: "System",
  },
  emptySubText: {
    fontSize: 12,
    color: "#6C757D",
    marginTop: 4,
    fontFamily: "System",
  },
});

export default TransactionsScreen;
