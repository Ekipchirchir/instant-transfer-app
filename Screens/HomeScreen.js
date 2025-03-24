import React, { useEffect, useState } from "react";
import { 
    View, Text, ActivityIndicator, StyleSheet, TouchableOpacity 
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useRoute, useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

const API_BASE_URL = "https://cleared-groove-same-turning.trycloudflare.com/api";

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
        return <ActivityIndicator size="large" color="#007AFF" style={styles.loader} />;
    }

    return (
        <View style={styles.container}>
            {/* 🔙 Back Button */}
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate("DerivConnectScreen")}>
                <Ionicons name="arrow-back" size={28} color="white" />
            </TouchableOpacity>

            {/* 📌 App Title */}
            <Text style={styles.title}>Instant Transfer</Text>

            {/* 🚪 Logout Button */}
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                <Ionicons name="exit-outline" size={28} color="white" />
            </TouchableOpacity>

            {error ? (
                <Text style={styles.error}>{error}</Text>
            ) : (
                <View style={styles.userCard}>
                    <Text style={styles.userName}>Welcome, {user?.fullname || "Unknown User"}</Text>
                    <Text style={styles.accountNumber}>Account: {user?.deriv_account || "No Account"}</Text>
                    <Text style={styles.balance}>Deriv Balance: ${user?.balance?.toFixed(2) || "0.00"}</Text>

                    {/* 💰 Deposit & Withdraw Buttons */}
                    <View style={styles.buttonsContainer}>
                        <TouchableOpacity style={styles.depositButton} onPress={() => navigation.navigate("Deposit")}>
                            <Ionicons name="add-circle" size={40} color="green" />
                            <Text style={styles.buttonText}>Deposit</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.withdrawButton} onPress={() => navigation.navigate("Withdrawal")}>
                            <Ionicons name="remove-circle" size={40} color="red" />
                            <Text style={styles.buttonText}>Withdraw</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}

            {/* 📌 Bottom Navigation Bar */}
            <View style={styles.bottomNav}>
                <TouchableOpacity style={styles.navButton} onPress={() => navigation.navigate("Home")}>
                    <Ionicons name="home" size={26} color="#007AFF" />
                    <Text style={styles.navText}>Home</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.navButton} onPress={() => navigation.navigate("TransactionHistory")}>
                    <Ionicons name="swap-horizontal" size={26} color="#007AFF" />
                    <Text style={styles.navText}>Transactions</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.navButton} onPress={() => navigation.navigate("Settings")}>
                    <Ionicons name="settings" size={26} color="#007AFF" />
                    <Text style={styles.navText}>Settings</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.navButton} onPress={() => navigation.navigate("SupportScreen")}>
                    <Ionicons name="chatbubble-ellipses" size={26} color="#007AFF" />
                    <Text style={styles.navText}>Support</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default HomeScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "lightgreen",
        padding: 20,
        justifyContent: "center",
        alignItems: "center",
    },
    loader: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    title: {
        fontSize: 22,
        fontWeight: "bold",
        textAlign: "center",
        color: "white",
        position: "absolute",
        top: 45,
    },
    backButton: {
        position: "absolute",
        top: 40,
        left: 15,
    },
    logoutButton: {
        position: "absolute",
        top: 40,
        right: 15,
    },
    userCard: {
        backgroundColor: "white",
        padding: 20,
        borderRadius: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 5,
        width: "90%",
        alignItems: "center",
        marginVertical: 15,
    },
    userName: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#333",
    },
    accountNumber: {
        fontSize: 16,
        color: "#555",
    },
    balance: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#007AFF",
        marginTop: 5,
    },
    error: {
        fontSize: 16,
        color: "red",
        textAlign: "center",
        fontWeight: "bold",
        marginTop: 10,
    },
    buttonsContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        width: "100%",
        marginTop: 20,
    },
    depositButton: {
        alignItems: "center",
        padding: 10,
    },
    withdrawButton: {
        alignItems: "center",
        padding: 10,
    },
    buttonText: {
        fontSize: 14,
        fontWeight: "bold",
        marginTop: 5,
    },
    bottomNav: {
        position: "absolute",
        bottom: 0,
        flexDirection: "row",
        justifyContent: "space-around",
        width: "100%",
        backgroundColor: "white",
        paddingVertical: 15,
        borderTopWidth: 1,
        borderColor: "#ddd",
    },
    navButton: {
        alignItems: "center",
    },
    navText: {
        fontSize: 12,
        fontWeight: "bold",
        marginTop: 3,
        color: "#007AFF",
    },
});
