import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  StatusBar,
  Alert,
  Linking,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

// Enable debug mode only during development (set to false for production)
const DEBUG_MODE = __DEV__; // __DEV__ is true in development, false in production with Expo

const DERIV_APP_ID = "70625";
const REDIRECT_URI = "https://instant-transfer-back-production.up.railway.app/callback/"; // Backend URL to handle OAuth
const APP_SCHEME = "instanttransfer://callback"; // App deep link scheme
const DERIV_LOGIN_URL = `https://oauth.deriv.com/oauth2/authorize?app_id=${DERIV_APP_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}`;
if (DEBUG_MODE) console.log("DERIV_LOGIN_URL:", DERIV_LOGIN_URL);

const DerivConnectScreen = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const parseDeepLink = (url) => {
    if (!url || !url.startsWith(APP_SCHEME)) {
      if (DEBUG_MODE) console.log("Invalid or non-matching deep link:", url);
      return {};
    }
    const queryString = url.split("?")[1] || "";
    const params = new URLSearchParams(queryString);
    return {
      token: params.get("token") || "",
      account: params.get("account") || "",
    };
  };

  const storeAuthData = async ({ token, account }) => {
    try {
      if (!token || !account) {
        throw new Error("Missing token or account in deep link");
      }
      await AsyncStorage.multiSet([
        ["access_token", token],
        ["deriv_account", account],
        ["is_logged_in", "true"],
      ]);
      if (DEBUG_MODE) {
        console.log("✅ Stored Auth Data:", {
          token: token.substring(0, 10) + "...",
          derivAccount: account,
        });
      }
      return true;
    } catch (err) {
      if (DEBUG_MODE) console.error("AsyncStorage Error:", err.message);
      throw err;
    }
  };

  const handleDeepLink = async ({ url }) => {
    if (DEBUG_MODE) console.log("Received Deep Link:", url);
    setLoading(true);
    setError(null);
    try {
      const { token, account } = parseDeepLink(url);
      if (!token || !account) {
        throw new Error("Invalid or missing token/account in deep link");
      }
      await storeAuthData({ token, account });
      if (DEBUG_MODE) console.log("✅ Login successful, navigating to Home");
      navigation.replace("MainTabs", { screen: "Home", params: { token } });
    } catch (err) {
      if (DEBUG_MODE) console.error("Deep Link Error:", err.message);
      setError("Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDerivLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      if (DEBUG_MODE) console.log("Opening Deriv OAuth URL:", DERIV_LOGIN_URL);
      await Linking.openURL(DERIV_LOGIN_URL);
    } catch (err) {
      if (DEBUG_MODE) console.error("Error opening URL:", err.message);
      setError("Failed to open the login page. Please try again.");
      setLoading(false);
    }
  };

  useEffect(() => {
    // Handle initial deep link (e.g., app opened via link)
    Linking.getInitialURL().then((url) => {
      if (url) handleDeepLink({ url });
    });

    // Add listener for deep links while app is running
    const subscription = Linking.addEventListener("url", handleDeepLink);

    // Cleanup listener on unmount
    return () => subscription.remove();
  }, []);

  const handleRetry = () => {
    setError(null);
    handleDerivLogin();
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="lightgreen" />
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={26} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Deriv Connect</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FFC107" />
          <Text style={styles.loadingText}>Connecting...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="lightgreen" />
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={26} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Deriv Connect</Text>
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
            <Text style={styles.retryText}>Retry Login</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelButton} onPress={() => navigation.goBack()}>
            <Ionicons name="close-circle-outline" size={22} color="white" style={styles.buttonIcon} />
            <Text style={styles.cancelText}>CANCEL</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="lightgreen" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={26} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Deriv Connect</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Logo */}
        <Image
          source={{ uri: "https://deriv.com/static/og-image.png" }}
          style={styles.logo}
        />

        {/* Description */}
        <Text style={styles.description}>
          Securely connect your Deriv account for fast transactions.
        </Text>

        {/* List of Benefits */}
        <View style={styles.benefitsContainer}>
          <View style={styles.benefitItem}>
            <Ionicons name="shield-checkmark" size={24} color="#FFC107" style={styles.benefitIcon} />
            <Text style={styles.benefitText}>Bank-level security</Text>
          </View>
          <View style={styles.benefitItem}>
            <Ionicons name="flash" size={24} color="#FFC107" style={styles.benefitIcon} />
            <Text style={styles.benefitText}>Instant processing</Text>
          </View>
          <View style={styles.benefitItem}>
            <Ionicons name="lock-closed" size={24} color="#FFC107" style={styles.benefitIcon} />
            <Text style={styles.benefitText}>Encrypted connection</Text>
          </View>
        </View>

        {/* Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.loginButton} onPress={handleDerivLogin}>
            <Ionicons name="log-in-outline" size={22} color="white" style={styles.buttonIcon} />
            <Text style={styles.loginText}>LOGIN WITH DERIV</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.cancelButton} onPress={() => navigation.goBack()}>
            <Ionicons name="close-circle-outline" size={22} color="white" style={styles.buttonIcon} />
            <Text style={styles.cancelText}>CANCEL</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "lightgreen", // Light green background from screenshot
  },
  header: {
    position: "absolute",
    top: 40, // Adjusted to match screenshot
    left: 20,
    right: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  backButton: {
    position: "absolute",
    left: 0,
    padding: 10,
  },
  headerTitle: {
    fontSize: 18, // Slightly larger to match screenshot
    fontWeight: "bold",
    color: "#000",
    textAlign: "center",
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 100, // Space for header
    paddingBottom: 40, // Added spacing at the bottom
  },
  logo: {
    width: 0, // Hidden since not present in screenshot
    height: 0,
    resizeMode: "contain",
    marginBottom: 0,
  },
  description: {
    fontSize: 16, // Larger font to match screenshot
    fontWeight: "600", // Slightly bold
    textAlign: "center",
    color: "#000",
    marginBottom: 40, // Increased spacing
    paddingHorizontal: 30,
    lineHeight: 28, // Adjusted for better readability
  },
  benefitsContainer: {
    width: "90%",
    marginBottom: 40, // Spacing before buttons
  },
  benefitItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.5)", // Semi-transparent white background
    borderRadius: 10, // Rounded corners
    paddingVertical: 15,
    paddingHorizontal: 20,
    marginBottom: 10, // Spacing between items
  },
  benefitIcon: {
    marginRight: 15,
  },
  benefitText: {
    fontSize: 16,
    color: "#000",
    fontWeight: "500",
  },
  buttonContainer: {
    width: "100%",
    alignItems: "center",
    marginBottom: 40, // Added spacing at the bottom of the button container
  },
  loginButton: {
    flexDirection: "row",
    backgroundColor: "#FFC107", // Yellow color from screenshot
    paddingVertical: 16, // Adjusted to match screenshot
    paddingHorizontal: 30,
    borderRadius: 30, // More rounded corners
    alignItems: "center",
    width: "90%",
    justifyContent: "center",
    marginBottom: 20, // Increased spacing between buttons
  },
  cancelButton: {
    flexDirection: "row",
    backgroundColor: "#FF4444", // Red color from screenshot
    paddingVertical: 16, // Adjusted to match screenshot
    paddingHorizontal: 30,
    borderRadius: 30, // More rounded corners
    alignItems: "center",
    justifyContent: "center",
    width: "90%",
  },
  buttonIcon: {
    marginRight: 10,
  },
  loginText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff", // White text to match screenshot
  },
  cancelText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    color: "#000",
    marginTop: 10,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  errorText: {
    fontSize: 16,
    color: "#FF4444",
    textAlign: "center",
    marginBottom: 20,
  },
  retryButton: {
    flexDirection: "row",
    backgroundColor: "#FFC107",
    paddingVertical: 16,
    paddingHorizontal: 30,
    borderRadius: 30,
    alignItems: "center",
    width: "90%",
    justifyContent: "center",
    marginBottom: 20,
  },
  retryText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
  },
});

export default DerivConnectScreen;
