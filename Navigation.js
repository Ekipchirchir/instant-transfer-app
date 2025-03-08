import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { refreshToken } from "./apis";
import HomeScreen from "./Screens/HomeScreen";
import LoginScreen from "./Screens/LoginScreen";
import SignUpScreen from "./Screens/SignUpScreen";
import LandingScreen from "./Screens/LandingScreen";
import DepositScreen from "./Screens/DepositScreen";
import SettingsScreen from "./Screens/SettingsScreen";
import WithdrawScreen from "./Screens/WithdrawalScreen";
import TransactionScreen from "./Screens/TransactionScreen";

const Stack = createStackNavigator();

const Navigation = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const token = await AsyncStorage.getItem("access_token");
        if (!token) {
          setIsLoggedIn(false);
        } else {
          const newToken = await refreshToken();
          setIsLoggedIn(!!newToken);
        }
      } catch (error) {
        console.error("Error checking login status:", error);
        setIsLoggedIn(false);
      } finally {
        setIsCheckingAuth(false);
      }
    };

    checkLoginStatus();
  }, []);

  if (isCheckingAuth) {
    return null; // Prevent flickering before auth state is determined
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {/* Authentication Screens */}
        <Stack.Screen name="Landing" component={LandingScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="SignUp" component={SignUpScreen} />

        {/* App Screens */}
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Deposit" component={DepositScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
        <Stack.Screen name="Withdraw" component={WithdrawScreen} />
        <Stack.Screen name="Transaction" component={TransactionScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default Navigation;
