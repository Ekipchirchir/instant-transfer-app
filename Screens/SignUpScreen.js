import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons"; // Icons for UI
import { useNavigation } from "@react-navigation/native";

const SignUpScreen = () => {
  const navigation = useNavigation();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSignUp = () => {
    if (!name || !email || !phone || !password || !confirmPassword) {
      alert("Please fill all fields.");
      return;
    }
    if (password !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }
    alert("Account created successfully!");
    navigation.navigate("Home"); // Navigate to Home after sign-up
  };

  return (
    <View style={styles.container}>

      <View style={styles.signUpCard}>
        <Text style={styles.title}>SIGN UP</Text>

      
        <TextInput
          style={styles.input}
          placeholder="Full Name"
          placeholderTextColor="#666"
          value={name}
          onChangeText={setName}
        />

       
        <TextInput
          style={styles.input}
          placeholder="Email Address"
          placeholderTextColor="#666"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />

     
        <TextInput
          style={styles.input}
          placeholder="Phone Number"
          placeholderTextColor="#666"
          keyboardType="phone-pad"
          value={phone}
          onChangeText={setPhone}
        />

    
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#666"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

       
        <TextInput
          style={styles.input}
          placeholder="Confirm Password"
          placeholderTextColor="#666"
          secureTextEntry
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />

       
        <TouchableOpacity style={styles.signUpButton} onPress={handleSignUp}>
          <Text style={styles.signUpButtonText}>SIGN UP</Text>
          <Ionicons name="chevron-forward-outline" size={20} color="white" />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate("Login")}>
          <Text style={styles.loginText}>Already have an account? Login </Text>
        </TouchableOpacity>
      </View>
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
  signUpCard: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    width: "90%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  input: {
    width: "100%",
    padding: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    marginTop: 10,
    fontSize: 16,
  },
  signUpButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "black",
    padding: 15,
    borderRadius: 10,
    width: "100%",
    marginTop: 20,
    justifyContent: "center",
  },
  signUpButtonText: {
    fontSize: 16,
    color: "white",
    fontWeight: "bold",
    marginRight: 5,
  },
  loginText: {
    fontSize: 14,
    marginTop: 20,
    color: "blue",
    textAlign: "center"
  },
});

export default SignUpScreen;
