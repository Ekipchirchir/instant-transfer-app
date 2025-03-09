import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons"; 
import { useNavigation } from "@react-navigation/native";

const SettingsScreen = () => {
  const navigation = useNavigation();

  const handleLogout = () => {
    navigation.replace("Landing");
  };

  const editPhoneNumber = () => {
    alert("Edit Phone Number feature coming soon!");
  };

  const changePassword = () => {
    alert("Change Password feature coming soon!");
  };

  return (
    <View style={styles.container}>
      <View style={styles.accountCard}>
        <Ionicons name="person-outline" size={24} color="black" />
        <Text style={styles.sectionTitle}>ACCOUNT</Text>
        
        <View style={styles.infoBox}>
          <Text style={styles.infoText}>NAME: JOHN DOE</Text>
          <Text style={styles.infoText}>CR NUMBER: CR92929292</Text>
          <Text style={styles.infoText}>EMAIL: johndoe@gmail.com</Text>
          <Text style={styles.infoText}>PHONE: +254768245123</Text>
        </View>
      </View>

    
      <TouchableOpacity style={styles.button} onPress={editPhoneNumber}>
        <Ionicons name="call-outline" size={20} color="black" />
        <Text style={styles.buttonText}>Edit phone number  </Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={changePassword}>
        <Ionicons name="lock-closed-outline" size={20} color="black" />
        <Text style={styles.buttonText}>Change password   </Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={20} color="red" />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "lightgreen",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  accountCard: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    width: "90%",
    alignItems: "center",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 5,
  },
  infoBox: {
    backgroundColor: "#F9F9C5",
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
    width: "100%",
  },
  infoText: {
    fontSize: 14,
    marginVertical: 2,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    width: "90%",
    marginBottom: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    fontSize: 16,
    marginLeft: 10,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    width: "90%",
    marginTop: 10,
    borderColor: "red",
    borderWidth: 1,
  },
  logoutText: {
    fontSize: 16,
    marginLeft: 10,
    color: "red",
    fontWeight: "bold",
  },
});

export default SettingsScreen;
