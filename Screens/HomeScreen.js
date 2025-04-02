import React, { useEffect, useState } from "react";
import { 
    View, Text, ActivityIndicator, StyleSheet, TouchableOpacity 
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
    const route = useRoute();
    const navigation = useNavigation();

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                let derivAccount = route.params?.deriv_account;
                if (!derivAccount) {
                    derivAccount = await AsyncStorage.getItem("deriv_account");
                }
                if (!derivAccount) {
                    setError("❌ No account found. Please sign up via Deriv.");
                    setLoading(false);
                    return;
                }

                const response = await axios.get(`${API_BASE_URL}/user/${derivAccount}`);
                if (response.status !== 200) {
                    throw new Error(`Server responded with status ${response.status}`);
                }

                setUser(response.data);
                await AsyncStorage.setItem("deriv_account", derivAccount);
            } catch (error) {
                setError("❌ Failed to fetch user data.");
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, []);

    const handleLogout = async () => {
        await AsyncStorage.clear();
        navigation.replace("DerivConnectScreen");
    };

    if (loading) {
        return (
            <View style={styles.loaderContainer}>
                <ActivityIndicator size="large" color="#4361EE" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity 
                    style={styles.backButton} 
                    onPress={() => navigation.navigate("DerivConnectScreen")}
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

            <View style={styles.content}>
                {error ? (
                    <View style={styles.errorContainer}>
                        <Text style={styles.errorText}>{error}</Text>
                    </View>
                ) : (
                    <>
                        <View style={styles.userCard}>
                            <Text style={styles.userName}>{user?.fullname || "Guest User"}</Text>
                            <Text style={styles.accountNumber}>Account: {user?.deriv_account || "N/A"}</Text>
                            
                            <View style={styles.balanceContainer}>
                                <Text style={styles.balanceLabel}>Available Balance</Text>
                                <Text style={styles.balance}>${user?.balance?.toFixed(2) || "0.00"}</Text>
                            </View>
                        </View>

                        <View style={styles.buttonsContainer}>
                            <TouchableOpacity 
                                style={[styles.actionButton, styles.depositButton]}
                                onPress={() => navigation.navigate("Deposit")}
                            >
                                <Ionicons name="add-circle" size={20} color="#2B9348" />
                                <Text style={styles.actionButtonText}>Deposit</Text>
                            </TouchableOpacity>
                            
                            <TouchableOpacity 
                                style={[styles.actionButton, styles.withdrawButton]}
                                onPress={() => navigation.navigate("Withdrawal")}
                            >
                                <Ionicons name="remove-circle" size={20} color="#E5383B" />
                                <Text style={styles.actionButtonText}>Withdraw</Text>
                            </TouchableOpacity>
                        </View>
                    </>
                )}
            </View>

            <View style={styles.bottomNav}>
                <TouchableOpacity 
                    style={styles.navButton}
                    onPress={() => navigation.navigate("Home")}
                >
                    <Ionicons name="home" size={22} color="#4361EE" />
                    <Text style={styles.navText}>Home</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                    style={styles.navButton}
                    onPress={() => navigation.navigate("Transactions")}
                >
                    <Ionicons name="swap-horizontal" size={22} color="#4A4E69" />
                    <Text style={styles.navText}>Transactions</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                    style={styles.navButton}
                    onPress={() => navigation.navigate("Settings")}
                >
                    <Ionicons name="settings" size={22} color="#4A4E69" />
                    <Text style={styles.navText}>Settings</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                    style={styles.navButton}
                    onPress={() => navigation.navigate("SupportScreen")}
                >
                    <Ionicons name="chatbubble-ellipses" size={22} color="#4A4E69" />
                    <Text style={styles.navText}>Support</Text>
                </TouchableOpacity>
            </View>
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
    title: {
        fontSize: 20,
        fontWeight: "700",
        color: "#212529",
        fontFamily: "System",
    },
    backButton: {
        padding: 5,
    },
    logoutButton: {
        padding: 5,
    },
    content: {
        flex: 1,
        padding: 20,
    },
    userCard: {
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
    userName: {
        fontSize: 18,
        fontWeight: "600",
        color: "#212529",
        marginBottom: 5,
    },
    accountNumber: {
        fontSize: 14,
        color: "#6C757D",
        marginBottom: 15,
    },
    balanceContainer: {
        paddingTop: 15,
        borderTopWidth: 1,
        borderTopColor: "#E9ECEF",
    },
    balanceLabel: {
        fontSize: 12,
        color: "#6C757D",
        fontWeight: "500",
    },
    balance: {
        fontSize: 28,
        fontWeight: "700",
        color: "#2B9348",
        marginTop: 5,
    },
    errorContainer: {
        backgroundColor: "#F8D7DA",
        padding: 15,
        borderRadius: 8,
        marginBottom: 20,
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
    },
    actionButton: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        padding: 15,
        borderRadius: 8,
        marginHorizontal: 5,
    },
    depositButton: {
        backgroundColor: "#E8F5E9",
    },
    withdrawButton: {
        backgroundColor: "#FFEBEE",
    },
    actionButtonText: {
        fontSize: 14,
        fontWeight: "600",
        marginLeft: 8,
        color: "#212529",
    },
    bottomNav: {
        flexDirection: "row",
        justifyContent: "space-around",
        paddingVertical: 12,
        backgroundColor: "#FFFFFF",
        borderTopWidth: 1,
        borderTopColor: "#E9ECEF",
    },
    navButton: {
        alignItems: "center",
    },
    navText: {
        fontSize: 12,
        fontWeight: "500",
        marginTop: 4,
        color: "#4A4E69",
    },
});

export default HomeScreen;
