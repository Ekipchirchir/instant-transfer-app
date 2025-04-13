import React, { useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import * as Linking from "expo-linking";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";

import HomeScreen from "./Screens/HomeScreen";
import TransactionScreen from "./Screens/TransactionScreen";
import DepositScreen from "./Screens/DepositScreen";
import WithdrawalScreen from "./Screens/WithdrawalScreen";
import SettingsScreen from "./Screens/SettingsScreen";
import DerivConnectScreen from "./Screens/DerivConnectScreen";
import LandingScreen from "./Screens/LandingScreen";
import SupportScreen from "./Screens/SupportScreen";

const linking = {
  prefixes: ["instanttransfer://"],
  config: {
    screens: {
      AuthStack: {
        screens: {
          Landing: "auth-failed",
          DerivConnect: "DerivConnectScreen",
        },
      },
      MainTabs: {
        screens: {
          Home: "auth-success",
          Transactions: "transactions",
          Deposit: "deposit",
          Withdrawal: "withdrawal",
          Settings: "settings",
          Support: "support",
        },
      },
    },
  },
};

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const AuthStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Landing" component={LandingScreen} />
    <Stack.Screen name="DerivConnect" component={DerivConnectScreen} />
  </Stack.Navigator>
);

const MainTabs = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      headerShown: false,
      tabBarIcon: ({ color, size }) => {
        let iconName;
        if (route.name === "Home") iconName = "home";
        else if (route.name === "Transactions") iconName = "swap-horizontal";
        else if (route.name === "Settings") iconName = "settings";
        else if (route.name === "Support") iconName = "chatbubble-ellipses";
        return <Ionicons name={iconName} size={size} color={color} />;
      },
      tabBarActiveTintColor: "#4361EE",
      tabBarInactiveTintColor: "#4A4E69",
      tabBarStyle: {
        backgroundColor: "#FFFFFF",
        borderTopWidth: 1,
        borderTopColor: "#E9ECEF",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 6,
        paddingTop: 10,
        paddingBottom: 10,
        height: 70, 
      },
      tabBarItemStyle: {
        marginHorizontal: 10, 
        paddingVertical: 5,
        borderRadius: 12,
      },
      tabBarLabelStyle: {
        fontSize: 12,
        fontWeight: "600",
        marginBottom: 5, 
      },
      tabBarActiveBackgroundColor: "#DDE4FF",
      tabBarIconStyle: {
        marginBottom: 2, 
      },
    })}
  >
    <Tab.Screen name="Home" component={HomeScreen} />
    <Tab.Screen name="Transactions" component={TransactionScreen} />
    <Tab.Screen name="Deposit" component={DepositScreen} />
    <Tab.Screen name="Withdrawal" component={WithdrawalScreen} />
    <Tab.Screen name="Settings" component={SettingsScreen} />
    <Tab.Screen name="Support" component={SupportScreen} />
  </Tab.Navigator>
);

const Navigation = () => {
  useEffect(() => {
    const handleDeepLink = async ({ url }) => {
      console.log("🔗 Deep Link Received:", url);
      const { queryParams } = Linking.parse(url);
      console.log("🔍 Parsed Query Params:", queryParams);

      if (queryParams?.access_token && queryParams?.deriv_account) {
        try {
          await AsyncStorage.multiSet([
            ["access_token", queryParams.access_token],
            ["deriv_account", queryParams.deriv_account],
            ["is_logged_in", "true"],
          ]);
          console.log("✅ Deep Link Data Stored!");
        } catch (error) {
          console.error("🚨 Error storing deep link data:", error);
        }
      }
    };

    Linking.addEventListener("url", handleDeepLink);
  }, []);

  return (
    <NavigationContainer linking={linking}>
      <Stack.Navigator initialRouteName="AuthStack" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="AuthStack" component={AuthStack} />
        <Stack.Screen name="MainTabs" component={MainTabs} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default Navigation;
