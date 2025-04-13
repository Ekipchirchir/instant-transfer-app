import React, { useEffect, useState } from "react";
import { 
    View, Text, ActivityIndicator, StyleSheet, TouchableOpacity, FlatList, ScrollView
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useRoute, useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

const API_BASE_URL = "https://instant-transfer-back-production.up.railway.app/api";

const HomeScreen = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [transactions, setTransactions] = useState([]);
    const [hideBalance, setHideBalance] = useState(false);
    const route = useRoute();
    const navigation = useNavigation();

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
                    transactionsResponse = await axios.get(`${API_BASE_URL}/mpesa/transactions/${derivAccount}`);
                    console.log("Transactions API Response:", transactionsResponse.data);
                    console.log("First 3 Transactions:", transactionsResponse.data.transactions.slice(0, 3));
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
        navigation.navigate("Landing");
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
                    size={18}
                    color={item.transactionType === "deposit" ? "#2B9348" : "#E5383B"}
                />
                <View style={styles.transactionDetails}>
                    <Text style={styles.transactionText}>
                        {item.transactionType === "deposit" ? "Deposit" : "Withdrawal"}
                    </Text>
                    <Text style={styles.transactionDate}>
                        {item.transactionDate ? new Date(item.transactionDate).toLocaleDateString() : "N/A"}
                    </Text>
                </View>
                <Text style={styles.transactionAmount}>${Number(amount).toFixed(2)}</Text>
            </View>
        );
    };

    if (loading) {
        return (
            <View style={styles.loaderContainer}>
                <ActivityIndicator size="large" color="#4361EE" />
                <Text style={styles.loadingText}>Loading...</Text>
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
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity 
                    style={styles.backButton} 
                    onPress={() => navigation.navigate("DerivConnect")}
                >
                    <Ionicons name="arrow-back" size={24} color="#3A0CA3" />
                </TouchableOpacity>
                
                <Text style={styles.title}>Instant Transfer</Text>
                
                <TouchableOpacity 
                    style={styles.logoutButton} 
                    onPress={handleLogout}
                >
                    <Ionicons name="exit-outline" size={24} color="#3A0CA3" />
                </TouchableOpacity>
            </View>

            <ScrollView 
                style={styles.content} 
                contentContainerStyle={styles.contentContainer}
                showsVerticalScrollIndicator={false}
            >
                <Text style={styles.dateText}>{currentDate}</Text>
                {error ? (
                    <View style={styles.errorContainer}>
                        <Text style={styles.errorText}>{error}</Text>
                    </View>
                ) : user ? (
                    <>
                        <View style={styles.userCard}>
                            <View style={styles.userInfo}>
                                <View style={styles.avatar}>
                                    <Text style={styles.avatarText}>
                                        {user?.fullname?.charAt(0) || "G"}
                                    </Text>
                                </View>
                                <View>
                                    <Text style={styles.userName}>{user?.fullname || "Guest User"}</Text>
                                    <Text style={styles.accountNumber}>Account: {user?.deriv_account || "N/A"}</Text>
                                </View>
                            </View>
                            <View style={styles.balanceContainer}>
                                <View style={styles.balanceHeader}>
                                    <Text style={styles.balanceLabel}>Available Balance</Text>
                                    <TouchableOpacity onPress={toggleBalanceVisibility}>
                                        <Ionicons
                                            name={hideBalance ? "eye-off" : "eye"}
                                            size={20}
                                            color="#6C757D"
                                        />
                                    </TouchableOpacity>
                                </View>
                                <Text style={styles.balance}>
                                    {hideBalance ? "••••••" : `$${user?.balance?.toFixed(2) || "0.00"}`}
                                </Text>
                            </View>
                        </View>

                        <View style={styles.buttonsContainer}>
                            <TouchableOpacity 
                                style={[styles.actionButton, styles.depositButton]}
                                onPress={() => navigation.navigate("Deposit")}
                            >
                                <Ionicons name="add-circle" size={24} color="#2B9348" />
                                <Text style={styles.actionButtonText}>Deposit</Text>
                            </TouchableOpacity>
                            
                            <TouchableOpacity 
                                style={[styles.actionButton, styles.withdrawButton]}
                                onPress={() => navigation.navigate("Withdrawal")}
                            >
                                <Ionicons name="remove-circle" size={24} color="#E5383B" />
                                <Text style={styles.actionButtonText}>Withdraw</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.transactionsContainer}>
                            <Text style={styles.transactionsTitle}>Recent Transactions</Text>
                            {transactions.length > 0 ? (
                                <FlatList
                                    data={transactions}
                                    renderItem={renderTransaction}
                                    keyExtractor={(item) => item.id || String(Math.random())}
                                    scrollEnabled={false} // Keep this false, ScrollView handles scrolling
                                />
                            ) : (
                                <Text style={styles.noTransactions}>No recent transactions</Text>
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
        backgroundColor: "lightgreen",
    },
    loaderContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#F8F9FA",
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: "#4361EE",
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 20,
        paddingTop: 40,
        backgroundColor: "#FFFFFF",
        borderBottomWidth: 1,
        borderBottomColor: "#E9ECEF",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 6,
        elevation: 2,
    },
    title: {
        fontSize: 22,
        fontWeight: "700",
        color: "#212529",
        fontFamily: "System",
    },
    backButton: {
        padding: 8,
        borderRadius: 20,
        backgroundColor: "#F8F9FA",
    },
    logoutButton: {
        padding: 8,
        borderRadius: 20,
        backgroundColor: "#F8F9FA",
    },
    content: {
        flex: 1,
    },
    contentContainer: {
        padding: 20,
        paddingBottom: 80, // Extra padding for bottom tab bar
    },
    dateText: {
        fontSize: 14,
        color: "#212529",
        fontWeight: "500",
        marginBottom: 15,
        textAlign: "center",
    },
    userCard: {
        backgroundColor: "#FFFFFF",
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
        fontSize: 20,
        fontWeight: "600",
    },
    userName: {
        fontSize: 20,
        fontWeight: "600",
        color: "#212529",
        marginBottom: 4,
    },
    accountNumber: {
        fontSize: 14,
        color: "#6C757D",
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
        fontSize: 14,
        color: "#6C757D",
        fontWeight: "500",
    },
    balance: {
        fontSize: 32,
        fontWeight: "700",
        color: "#2B9348",
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
        fontSize: 14,
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
        fontSize: 16,
        fontWeight: "600",
        marginLeft: 8,
        color: "#212529",
    },
    transactionsContainer: {
        backgroundColor: "#FFFFFF",
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
        color: "#212529",
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
        fontSize: 14,
        fontWeight: "500",
        color: "#212529",
    },
    transactionDate: {
        fontSize: 12,
        color: "#6C757D",
    },
    transactionAmount: {
        fontSize: 14,
        fontWeight: "600",
        color: "#212529",
    },
    noTransactions: {
        fontSize: 14,
        color: "#6C757D",
        textAlign: "center",
    },
});

export default HomeScreen;
