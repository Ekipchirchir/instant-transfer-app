import React, { useEffect, useState } from "react";
import { 
    View, Text, ActivityIndicator, StyleSheet, TouchableOpacity 
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useRoute, useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

const API_BASE_URL = "https://salem-affiliated-wanted-voices.trycloudflare.com/api";

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
                console.log("🔍 Redirected Deriv Account:", derivAccount);

                if (!derivAccount) {
                    derivAccount = await AsyncStorage.getItem("deriv_account");
                    console.log("🔍 Stored Deriv Account:", derivAccount);
                }

                if (!derivAccount) {
                    console.error("❌ No Deriv account found.");
                    setError("❌ No account found. Please sign up via Deriv.");
                    setLoading(false);
                    return;
                }

                console.log(`✅ Fetching user details for: ${derivAccount}`);

                const response = await axios.get(`${API_BASE_URL}/user/${derivAccount}`);

                if (response.status !== 200) {
                    throw new Error(`Server responded with status ${response.status}`);
                }

                console.log("✅ User Data Received:", response.data);
                setUser(response.data);

                await AsyncStorage.setItem("deriv_account", derivAccount);
            } catch (error) {
                console.error("❌ API Error:", error.response ? error.response.data : error.message);
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
        return <ActivityIndicator size="large" color="#0000ff" style={styles.loader} />;
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>INSTANT TRANSFER</Text>

            {error ? (
                <Text style={styles.error}>{error}</Text>
            ) : (
                <View style={styles.userCard}>
                    <Text style={styles.userName}>Welcome, {user?.fullname || "Unknown User"}</Text>
                    <Text style={styles.accountNumber}>Account: {user?.deriv_account || "No Account"}</Text>
                    <Text style={styles.balance}>Deriv Balance: ${user?.balance?.toFixed(2) || "0.00"}</Text>

                    {/* Deposit & Withdraw Buttons */}
                    <View style={styles.buttonsContainer}>
                        <TouchableOpacity style={styles.depositButton} onPress={() => navigation.navigate("DepositScreen")}>
                            <Ionicons name="add-circle" size={40} color="green" />
                            <Text style={styles.buttonText}>Deposit</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.withdrawButton} onPress={() => navigation.navigate("WithdrawScreen")}>
                            <Ionicons name="remove-circle" size={40} color="red" />
                            <Text style={styles.buttonText}>Withdraw</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}

            {/* Bottom Navigation */}
            <View style={styles.bottomNav}>
                <TouchableOpacity onPress={() => navigation.navigate("Home")}>
                    <Ionicons name="home-outline" size={28} color="black" />
                    <Text style={styles.navText}>Home</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => navigation.navigate("Transactions")}>
                    <Ionicons name="list-outline" size={28} color="black" />
                    <Text style={styles.navText}>Transactions</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => navigation.navigate("Settings")}>
                    <Ionicons name="settings-outline" size={28} color="black" />
                    <Text style={styles.navText}>Settings</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={handleLogout}>
                    <Ionicons name="log-out-outline" size={28} color="red" />
                    <Text style={styles.navText}>Logout</Text>
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
        marginBottom: 20,
    },
    userCard: {
        backgroundColor: "#F8F6C7",
        padding: 20,
        borderRadius: 10,
        elevation: 3,
        marginVertical: 15,
        width: "90%",
        alignItems: "center",
    },
    userName: {
        fontSize: 18,
        fontWeight: "bold",
        color: "black",
    },
    accountNumber: {
        fontSize: 16,
        color: "gray",
    },
    balance: {
        fontSize: 16,
        fontWeight: "bold",
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
        justifyContent: "space-around",
        width: "100%",
        marginTop: 15,
    },
    depositButton: {
        alignItems: "center",
    },
    withdrawButton: {
        alignItems: "center",
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
        backgroundColor: "#F8F6C7",
        paddingVertical: 15,
        borderTopWidth: 1,
        borderColor: "#ddd",
    },
    navText: {
        fontSize: 12,
        fontWeight: "bold",
        marginTop: 3,
    },
});
