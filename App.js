import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import HomeScreen from "./Screens/HomeScreen";
import DepositScreen from "./Screens/DepositScreen";
import LoginScreen from "./Screens/LoginScreen";
import SettingsScreen from "./Screens/SettingsScreen";
import WithdrawScreen from "./Screens/WithdrawalScreen";
import SignUpScreen from "./Screens/SignUpScreen";

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name = "Login" component={LoginScreen} />
        <Stack.Screen name = "Home" component={HomeScreen} />
        <Stack.Screen name = "Deposit" component={DepositScreen} />
        <Stack.Screen name = 'Settings' component={SettingsScreen} />
        <Stack.Screen name = 'Withdraw' component={WithdrawScreen} />
        <Stack.Screen name = 'SignUp' component={SignUpScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
