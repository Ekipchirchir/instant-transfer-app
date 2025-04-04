import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
  Platform,
} from "react-native";
// Conditionally require LinearGradient: on web, fall back to View.
let LinearGradient;
if (Platform.OS === "web") {
  LinearGradient = View;
} else {
  LinearGradient = require("react-native-linear-gradient").default;
}
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useRoute, useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

// On web, fallback to View for gradient wrapper
const GradientWrapper = Platform.OS === "web" ? View : LinearGradient;
// Omit gradient props on web
const gradientProps = Platform.OS === "web" ? {} : { colors: ["#000", "#1a1a1a"] };

const API_BASE_URL = "https://instant-transfer-back-production.up.railway.app/api";

const HomeScreen = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const route = useRoute();
  const navigation = useNavigation();
  const cardAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animate card on mount
    Animated.timing(cardAnim, {
      toValue: 1,
      duration: 800,
      easing: Easing.out(Easing.exp),
      useNativeDriver: true,
    }).start();
  }, [cardAnim]);

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
  }, [route.params]);

  const handleLogout = async () => {
    await AsyncStorage.clear();
    navigation.replace("DerivConnectScreen");
  };

  if (loading) {
    return (
      <GradientWrapper {...gradientProps} style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#00FF00" />
      </GradientWrapper>
    );
  }

  return (
    <GradientWrapper {...gradientProps} style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.navigate("DerivConnectScreen")}
        >
          <Ionicons name="arrow-back" size={24} color="#00FF00" />
        </TouchableOpacity>
        <Text style={styles.title}>INSTANT TRANSFER</Text>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="exit-outline" size={24} color="#00FF00" />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : (
          <>
            <Animated.View
              style={[
                styles.userCard,
                { opacity: cardAnim, transform: [{ scale: cardAnim }] },
              ]}
            >
              <Text style={styles.userName}>
                {user?.fullname || "Guest User"}
              </Text>
              <Text style={styles.accountNumber}>
                Account: {user?.deriv_account || "N/A"}
              </Text>
              <View style={styles.balanceContainer}>
                <Text style={styles.balanceLabel}>Available Balance</Text>
                <Text style={styles.balance}>
                  ${user?.balance?.toFixed(2) || "0.00"}
                </Text>
              </View>
            </Animated.View>

            <View style={styles.buttonsContainer}>
              <AnimatedTouchable
                style={[styles.actionButton, styles.depositButton]}
                onPress={() => navigation.navigate("Deposit")}
              >
                <Ionicons name="add-circle" size={20} color="#00FF00" />
                <Text style={styles.actionButtonText}>Deposit</Text>
              </AnimatedTouchable>

              <AnimatedTouchable
                style={[styles.actionButton, styles.withdrawButton]}
                onPress={() => navigation.navigate("Withdrawal")}
              >
                <Ionicons name="remove-circle" size={20} color="#00FF00" />
                <Text style={styles.actionButtonText}>Withdraw</Text>
              </AnimatedTouchable>
            </View>
          </>
        )}
      </View>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => navigation.navigate("Home")}
        >
          <Ionicons name="home" size={22} color="white" />
          <Text style={styles.navText}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navButton}
          onPress={() => navigation.navigate("Transactions")}
        >
          <Ionicons name="swap-horizontal" size={22} color="white" />
          <Text style={styles.navText}>Transactions</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navButton}
          onPress={() => navigation.navigate("Settings")}
        >
          <Ionicons name="settings" size={22} color="white" />
          <Text style={styles.navText}>Settings</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navButton}
          onPress={() => navigation.navigate("SupportScreen")}
        >
          <Ionicons name="chatbubble-ellipses" size={22} color="white" />
          <Text style={styles.navText}>Support</Text>
        </TouchableOpacity>
      </View>
    </GradientWrapper>
  );
};

// Create an animated version of TouchableOpacity for button animations
const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    paddingTop: 50,
    borderBottomWidth: 1,
    borderBottomColor: "#00FF00",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "white",
    letterSpacing: 2,
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
    justifyContent: "center",
  },
  userCard: {
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    borderRadius: 20,
    padding: 20,
    marginBottom: 30,
    borderWidth: 2,
    borderColor: "#00FF00",
    shadowColor: "#00FF00",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.7,
    shadowRadius: 10,
    elevation: 5,
  },
  userName: {
    fontSize: 26,
    fontWeight: "bold",
    color: "white",
    marginBottom: 8,
  },
  accountNumber: {
    fontSize: 16,
    color: "#00FF00",
    marginBottom: 15,
  },
  balanceContainer: {
    borderTopWidth: 1,
    borderTopColor: "#00FF00",
    paddingTop: 10,
  },
  balanceLabel: {
    fontSize: 14,
    color: "#00FF00",
    fontWeight: "500",
  },
  balance: {
    fontSize: 30,
    fontWeight: "bold",
    color: "white",
    marginTop: 5,
  },
  errorContainer: {
    backgroundColor: "#FF3333",
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  errorText: {
    color: "white",
    fontSize: 14,
    fontWeight: "500",
    textAlign: "center",
  },
  buttonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 15,
    borderRadius: 30,
    marginHorizontal: 5,
    backgroundColor: "#00AA00",
    shadowColor: "#00FF00",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 3,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
    color: "white",
  },
  bottomNav: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: "#00FF00",
  },
  navButton: {
    alignItems: "center",
  },
  navText: {
    fontSize: 12,
    fontWeight: "600",
    marginTop: 4,
    color: "white",
  },
});

export default HomeScreen;
