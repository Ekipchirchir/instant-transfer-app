import React, { useEffect } from "react";
import { View, Text, ActivityIndicator, Alert } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import API_BASE_URL from "./config";

const AuthSuccessScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();

  useEffect(() => {
    const saveToken = async () => {
      const params = new URLSearchParams(route.params?.url);
      const derivToken = params.get("token");

      if (derivToken) {
        try {
          // Make a request to the backend to validate the token and get user details
          const response = await fetch(`${API_BASE_URL}/deriv_auth/`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ deriv_token: derivToken }),
          });

          const data = await response.json();

          if (response.ok) {
            // Save the token and user details to AsyncStorage
            await AsyncStorage.setItem("access_token", data.access_token); // Save the token
            await AsyncStorage.setItem("deriv_account", data.deriv_account); // Save the Deriv account
            await AsyncStorage.setItem("deriv_balance", data.deriv_balance.toString()); // Save the balance

            console.log("Token and user details saved successfully!");

            // Redirect to the HomeScreen
            navigation.replace("HomeScreen");
          } else {
            Alert.alert("Login Failed", data.error);
            navigation.replace("LoginScreen");
          }
        } catch (error) {
          console.error("Auth Error:", error);
          Alert.alert("Error", "An error occurred during authentication.");
          navigation.replace("LoginScreen");
        }
      } else {
        navigation.replace("LoginScreen");
      }
    };

    saveToken();
  }, [route.params?.url]);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>Authenticating...</Text>
      <ActivityIndicator size="large" color="#0000ff" />
    </View>
  );
};

export default AuthSuccessScreen;