import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Dimensions,
  Image,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const { width, height } = Dimensions.get("window");
import InstantLogo from "../assets/instant.jpg"; 

const ThemeContext = React.createContext();

const LandingScreen = ({ navigation }) => {
  const { theme } = React.useContext(ThemeContext) || { theme: "light" };

  return (
    <SafeAreaView
      style={[
        styles.safeArea,
        { backgroundColor: theme === "dark" ? "#1A1A1A" : "lightgreen" },
      ]}
    >
      <StatusBar barStyle={theme === "dark" ? "light-content" : "dark-content"} />
      <View
        style={[
          styles.container,
          { backgroundColor: theme === "dark" ? "#1A1A1A" : "lightgreen" },
        ]}
      >
        <View style={styles.content}>
          <View style={styles.logoContainer}>
            <Image source={InstantLogo} style={styles.logoImage} />
          </View>

          <View style={styles.titleContainer}>
            <Text
              style={[
                styles.appName,
                { color: theme === "dark" ? "#FFFFFF" : "#212529" },
              ]}
            >
              INSTANT TRANSFER
            </Text>
            <View style={styles.underline} />
          </View>

          
          <Text
            style={[
              styles.motto,
              { color: theme === "dark" ? "#FFFFFF" : "#212529" },
            ]}
          >
            Instantly in your pocket with{" "}
            <Text style={styles.mottoHighlight}>M-Pesa</Text>!
          </Text>

          
          <View style={styles.benefitsContainer}>
            <Text
              style={[
                styles.benefitsText,
                { color: theme === "dark" ? "#FFFFFF" : "#212529" },
              ]}
            >
              Experience instant transfers with M-Pesa on a secure and trusted platform. Enjoy easy deposits and withdrawals, all powered by Deriv.
            </Text>
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.mainButton}
            onPress={() => navigation.navigate("DerivConnect")}
          >
            <Text style={styles.buttonText}>GET STARTED</Text>
          </TouchableOpacity>
        </View>

        
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: "space-between",
    paddingBottom: 30,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 30,
  },
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: "hidden",
    borderWidth: 3,
    borderColor: "#00FF00",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    backgroundColor: "#000",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  logoImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  titleContainer: {
    alignItems: "center",
    marginBottom: 10,
  },
  appName: {
    fontSize: 28,
    fontWeight: "700",
    fontFamily: "System",
    letterSpacing: 3, 
    textAlign: "center",
    textTransform: "uppercase",
    textShadowColor: "rgba(0, 0, 0, 0.5)", 
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  underline: {
    width: 150, 
    borderBottomWidth: 3,
    borderBottomColor: "#2B9348", 
    marginTop: 5,
  },
  motto: {
    fontSize: 18,
    fontStyle: "italic",
    fontFamily: "System",
    textAlign: "center",
    lineHeight: 24,
    marginHorizontal: 20,
    marginBottom: 20,
  },
  mottoHighlight: {
    color: "#2B9348",
    fontWeight: "600",
  },
  benefitsContainer: {
    marginVertical: 20,
    paddingHorizontal: 20,
  },
  benefitsText: {
    fontSize: 16,
    fontFamily: "System",
    fontWeight: "500",
    textAlign: "center",
    lineHeight: 22,
  },
  buttonContainer: {
    marginBottom: 80,
    alignItems: "center",
  },
  mainButton: {
    backgroundColor: "#2B9348",
    paddingVertical: 15,
    paddingHorizontal: 50,
    borderRadius: 30,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  buttonText: {
    color: "#FFFFFF", 
    fontSize: 18,
    fontWeight: "bold",
    fontFamily: "System",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  bottomLinks: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 30,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  linkButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  linkText: {
    fontSize: 16,
    fontFamily: "System",
    textDecorationLine: "underline",
  },
});

export default LandingScreen;
