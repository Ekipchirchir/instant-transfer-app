import React from "react";
import { 
  View, Text, TouchableOpacity, StyleSheet, 
  StatusBar, Dimensions, ImageBackground
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const { width, height } = Dimensions.get("window");

const LandingScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <ImageBackground 
        style={styles.background}
        blurRadius={2}
      >
        <View style={styles.content}>
          <Ionicons name="swap-horizontal" size={50} color="white" style={styles.logo} />
          
          <Text style={styles.appName}>INSTANT TRANSFER</Text>
          
          <Text style={styles.tagline}>
            Fast Deriv deposits & withdrawals
          </Text>
          
          <TouchableOpacity 
            style={styles.mainButton}
            onPress={() => navigation.navigate("DerivConnect")}
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
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  background: {
    flex: 1,
    width: '100%',
    justifyContent: 'space-between',
    paddingBottom: 30,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  logo: {
    marginBottom: 20,
  },
  appName: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    letterSpacing: 2,
  },
  tagline: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 40,
  },
  mainButton: {
    backgroundColor: '#4361EE',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 30,
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  bottomLinks: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 30,
  },
  linkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  linkText: {
    color: 'white',
    fontSize: 14,
  },
});

export default LandingScreen;
