import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ScrollView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useRoute, useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

const ThemeContext = React.createContext();

const API_BASE_URL = "https://instant-transfer-back-production.up.railway.app/api";

const HomeScreen = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [transactions, setTransactions] = useState([]);
  const [hideBalance, setHideBalance] = useState(false);
  const route = useRoute();
  const navigation = useNavigation();

  const { theme } = React.useContext(ThemeContext) || { theme: "light" };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        let derivAccount = route.params?.deriv_account;
        if (!derivAccount) {
          derivAccount = await AsyncStorage.getItem("deriv_account");
        }
        console.log("Fetching data for derivAccount:", derivAccount);
        if (!derivAccount) {
          setError("❌ No account found. Please sign up via Deriv.");
          setLoading(false);
          return;
        }

        const userResponse = await axios.get(`${API_BASE_URL}/user/${derivAccount}`);
        console.log("User API Response:", userResponse.data);

        if (userResponse.status !== 200) {
          throw new Error(`User API responded with status ${userResponse.status}`);
        }

        let transactionsResponse;
        try {
          transactionsResponse = await axios.get(
            `${API_BASE_URL}/mpesa/transactions/${derivAccount}`
          );
          console.log("Transactions API Response:", transactionsResponse.data);
          console.log(
            "First 3 Transactions:",
            transactionsResponse.data.transactions.slice(0, 3)
          );
        } catch (txError) {
          console.warn("Transactions fetch failed:", txError.message);
          setTransactions([]);
        }

        setUser(userResponse.data);
        setTransactions(transactionsResponse?.data?.transactions?.slice(0, 3) || []);
        await AsyncStorage.setItem("deriv_account", derivAccount);
      } catch (error) {
        console.error("Fetch Error:", error.message);
        setError(`❌ Failed to load data: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [route.params?.deriv_account]);

  const handleLogout = async () => {
    await AsyncStorage.clear();
    navigation.replace("AuthStack", { screen: "Landing" });
  };

  const toggleBalanceVisibility = () => {
    setHideBalance(!hideBalance);
  };

  const renderTransaction = ({ item }) => {
    console.log("Transaction Item:", item);
    const amount = item.usdAmount !== undefined ? item.usdAmount : item.amount || 0;

    return (
      <View style={styles.transactionItem}>
        <Ionicons
          name={item.transactionType === "deposit" ? "arrow-down" : "arrow-up"}
          size={20}
          color={item.transactionType === "deposit" ? "#2B9348" : "#E5383B"}
        />
        <View style={styles.transactionDetails}>
          <Text
            style={[
              styles.transactionText,
              { color: theme === "dark" ? "#FFFFFF" : "#212529" },
            ]}
          >
            {item.transactionType === "deposit" ? "Deposit" : "Withdrawal"}
          </Text>
          <Text
            style={[
              styles.transactionDate,
              { color: theme === "dark" ? "#A0A0A0" : "#6C757D" },
            ]}
          >
            {item.transactionDate
              ? new Date(item.transactionDate).toLocaleDateString()
              : "N/A"}
          </Text>
        </View>
        <Text
          style={[
            styles.transactionAmount,
            { color: theme === "dark" ? "#FFFFFF" : "#212529" },
          ]}
        >
          ${Number(amount).toFixed(2)}
        </Text>
      </View>
    );
  };

  if (loading) {
    return (
      <View
        style={[
          styles.loaderContainer,
          { backgroundColor: theme === "dark" ? "#121212" : "#F8F9FA" },
        ]}
      >
        <ActivityIndicator size="large" color="#3A0CA3" />
        <Text
          style={[
            styles.loadingText,
            { color: theme === "dark" ? "#FFFFFF" : "#3A0CA3" },
          ]}
        >
          Loading...
        </Text>
      </View>
    );
  }

  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme === "dark" ? "#121212" : "lightgreen" },
      ]}
    >
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
          onPress={() => navigation.navigate("DerivConnect")}
        >
          <Ionicons name="arrow-back" size={24} color="#000000" />
        </TouchableOpacity>

        <Text
          style={[
            styles.title,
            { color: theme === "dark" ? "#FFFFFF" : "#212529" },
          ]}
        >
          Instant Transfer
        </Text>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <Text
          style={[
            styles.dateText,
            { color: theme === "dark" ? "#A0A0A0" : "#6C757D" },
          ]}
        >
          {currentDate}
        </Text>
        {error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : user ? (
          <>
            <View
              style={[
                styles.userCard,
                { backgroundColor: theme === "dark" ? "#1A1A1A" : "#FFFFFF" },
              ]}
            >
              <View style={styles.userInfo}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    {user?.fullname?.charAt(0) || "G"}
                  </Text>
                </View>
                <View>
                  <Text
                    style={[
                      styles.userName,
                      { color: theme === "dark" ? "#FFFFFF" : "#212529" },
                    ]}
                  >
                    {user?.fullname || "Guest User"}
                  </Text>
                  <Text
                    style={[
                      styles.accountNumber,
                      { color: theme === "dark" ? "#A0A0A0" : "#6C757D" },
                    ]}
                  >
                    Account: {user?.deriv_account || "N/A"}
                  </Text>
                </View>
              </View>
              <View style={styles.balanceContainer}>
                <View style={styles.balanceHeader}>
                  <Text
                    style={[
                      styles.balanceLabel,
                      { color: theme === "dark" ? "#A0A0A0" : "#6C757D" },
                    ]}
                  >
                    Available Balance
                  </Text>
                  <TouchableOpacity onPress={toggleBalanceVisibility}>
                    <Ionicons
                      name={hideBalance ? "eye-off" : "eye"}
                      size={22}
                      color={theme === "dark" ? "#A0A0A0" : "#6C757D"}
                    />
                  </TouchableOpacity>
                </View>
                <Text
                  style={[
                    styles.balance,
                    { color: theme === "dark" ? "#FFFFFF" : "#2B9348" },
                  ]}
                >
                  {hideBalance ? "••••••" : `$${user?.balance?.toFixed(2) || "0.00"}`}
                </Text>
              </View>
            </View>

            <View style={styles.buttonsContainer}>
              <TouchableOpacity
                style={[styles.actionButton, styles.depositButton]}
                onPress={() => navigation.navigate("Deposit")}
              >
                <Ionicons name="add-circle" size={26} color="#2B9348" />
                <Text
                  style={[
                    styles.actionButtonText,
                    { color: theme === "dark" ? "#FFFFFF" : "#212529" },
                  ]}
                >
                  Deposit
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, styles.withdrawButton]}
                onPress={() => navigation.navigate("Withdrawal")}
              >
                <Ionicons name="remove-circle" size={26} color="#E5383B" />
                <Text
                  style={[
                    styles.actionButtonText,
                    { color: theme === "dark" ? "#FFFFFF" : "#212529" },
                  ]}
                >
                  Withdraw
                </Text>
              </TouchableOpacity>
            </View>

            <View
              style={[
                styles.transactionsContainer,
                { backgroundColor: theme === "dark" ? "#1A1A1A" : "#FFFFFF" },
              ]}
            >
              <Text
                style={[
                  styles.transactionsTitle,
                  { color: theme === "dark" ? "#FFFFFF" : "#212529" },
                ]}
              >
                Recent Transactions
              </Text>
              {transactions.length > 0 ? (
                <FlatList
                  data={transactions}
                  renderItem={renderTransaction}
                  keyExtractor={(item) => item.id || String(Math.random())}
                  scrollEnabled={false}
                />
              ) : (
                <Text
                  style={[
                    styles.noTransactions,
                    { color: theme === "dark" ? "#A0A0A0" : "#6C757D" },
                  ]}
                >
                  No recent transactions
                </Text>
              )}
            </View>
          </>
        ) : (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>❌ No user data available</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: "500",
    color: "#6C757D",
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
  title: {
    fontSize: 20,
    fontWeight: "600",
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
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 80,
  },
  dateText: {
    fontSize: 14,
    fontWeight: "400",
    marginBottom: 15,
    textAlign: "center",
  },
  userCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#3A0CA3",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  avatarText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
  },
  userName: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 4,
  },
  accountNumber: {
    fontSize: 14,
    fontWeight: "400",
  },
  balanceContainer: {
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: "#E9ECEF",
  },
  balanceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  balanceLabel: {
    fontSize: 16,
    fontWeight: "500",
  },
  balance: {
    fontSize: 22,
    fontWeight: "600",
    marginTop: 5,
  },
  errorContainer: {
    backgroundColor: "#F8D7DA",
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#721C24",
  },
  errorText: {
    color: "#721C24",
    fontSize: 16,
    fontWeight: "500",
    textAlign: "center",
  },
  buttonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 15,
    borderRadius: 12,
    marginHorizontal: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  depositButton: {
    backgroundColor: "#E8F5E9",
  },
  withdrawButton: {
    backgroundColor: "#FFEBEE",
  },
  actionButtonText: {
    fontSize: 18,
    fontWeight: "600",
    marginLeft: 8,
  },
  transactionsContainer: {
    borderRadius: 16,
    padding: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  transactionsTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 10,
  },
  transactionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#E9ECEF",
  },
  transactionDetails: {
    flex: 1,
    marginLeft: 10,
  },
  transactionText: {
    fontSize: 16,
    fontWeight: "500",
  },
  transactionDate: {
    fontSize: 14,
    fontWeight: "400",
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: "500",
  },
  noTransactions: {
    fontSize: 16,
    fontWeight: "500",
    textAlign: "center",
  },
});

export default HomeScreen;
