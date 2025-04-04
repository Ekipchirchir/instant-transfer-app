import React from "react";
import { 
  View, Text, TouchableOpacity, StyleSheet, 
  StatusBar, Dimensions, ImageBackground, Image, SafeAreaView 
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const { width, height } = Dimensions.get("window");
import InstantLogo from "../assets/instant.jpg"; // Image from assets folder

const LandingScreen = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />
      <View style={styles.container}>
        <ImageBackground 
          style={styles.background}
          blurRadius={2}
        >
          <View style={styles.content}>
            {/* Circular Logo Container */}
            <View style={styles.logoContainer}>
              <Image source={InstantLogo} style={styles.logoImage} />
            </View>

            {/* App Name */}
            <Text style={styles.appName}>INSTANT TRANSFER</Text>

            {/* Motto Split for Readability */}
            <Text style={styles.motto}>
              Instantly in your pocket!
            </Text>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={styles.mainButton}
              onPress={() => navigation.navigate("DerivConnectScreen")}
            >
              <Text style={styles.buttonText}>GET STARTED</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.bottomLinks}>
            <TouchableOpacity style={styles.linkButton}>
              <Ionicons name="help-circle" size={20} color="white" />
              <Text style={styles.linkText}>Help</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.linkButton}>
              <Ionicons name="lock-closed" size={20} color="white" />
              <Text style={styles.linkText}>Security</Text>
            </TouchableOpacity>
          </View>
        </ImageBackground>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#000",
  },
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  background: {
    flex: 1,
    width: "100%",
    justifyContent: "space-between",
    paddingBottom: 30,
    backgroundColor: "#000",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 30,
  },
  logoContainer: {
    width: 150,
    height: 150,
    borderRadius: 75,
    overflow: "hidden",
    borderWidth: 3,
    borderColor: "#00FF00", // Bright green border for emphasis
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    backgroundColor: "#000",
  },
  logoImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  appName: {
    color: "white",
    fontSize: 28,
    fontWeight: "bold",
    letterSpacing: 2,
    marginBottom: 10,
    textAlign: "center",
  },
  motto: {
    color: "#00FF00", // Corporate green accent
    fontSize: 18,
    fontStyle: "italic",
    textAlign: "center",
    lineHeight: 24,
    marginHorizontal: 20,
  },
  buttonContainer: {
    marginBottom: 80, // Moves the button further down
    alignItems: "center",
  },
  mainButton: {
    backgroundColor: "#00AA00", // Vibrant green for actionable impact
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 30,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#00FF00",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 5,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
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
    color: "white",
    fontSize: 14,
  },
});

export default LandingScreen;
