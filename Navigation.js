import React, { useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import * as Linking from "expo-linking";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

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
          Support: "support",
          Settings: "settings",
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
  <SafeAreaView style={{ flex: 1 }} edges={["bottom"]}>
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: false,
        tabBarIcon: ({ color, focused }) => {
          let iconName;

          switch (route.name) {
            case "Home":
              iconName = focused ? "home" : "home-outline";
              break;
            case "Transactions":
              iconName = focused ? "swap-horizontal" : "swap-horizontal-outline";
              break;
            case "Deposit":
              iconName = focused ? "arrow-down-circle" : "arrow-down-circle-outline";
              break;
            case "Withdrawal":
              iconName = focused ? "arrow-up-circle" : "arrow-up-circle-outline";
              break;
            case "Support":
              iconName = focused ? "chatbox-ellipses" : "chatbox-ellipses-outline";
              break;
            case "Settings":
              iconName = focused ? "settings" : "settings-outline";
              break;
          }

          return <Ionicons name={iconName} size={24} color={color} />;
        },
        tabBarActiveTintColor: "#007AFF",
        tabBarInactiveTintColor: "#8e8e93",
        tabBarStyle: {
          height: 70,
          paddingBottom: 16,
          paddingTop: 10,
          backgroundColor: "#FFFFFF",
          borderTopWidth: 0.3,
          borderTopColor: "#ccc",
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Transactions" component={TransactionScreen} />
      <Tab.Screen name="Deposit" component={DepositScreen} />
      <Tab.Screen name="Withdrawal" component={WithdrawalScreen} />
      <Tab.Screen name="Support" component={SupportScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  </SafeAreaView>
);

const Navigation = () => {
  const navigationRef = React.useRef(null);

  useEffect(() => {
    const handleDeepLink = async ({ url }) => {
      console.log("🔗 Deep Link Received:", url);
      if (!url) {
        console.warn("⚠️ No URL provided in deep link");
        return;
      }

      try {
        const { path, queryParams } = Linking.parse(url);
        console.log("🔍 Parsed Path:", path, "Query Params:", queryParams);

        if (!navigationRef.current) {
          console.warn("⚠️ Navigation ref not ready");
          return;
        }

        if (path === "auth-success" && queryParams?.access_token && queryParams?.deriv_account) {
          try {
            await AsyncStorage.multiSet([
              ["access_token", queryParams.access_token],
              ["deriv_account", queryParams.deriv_account],
              ["is_logged_in", "true"],
            ]);
            console.log("✅ Deep Link Data Stored!");
            navigationRef.current.navigate("MainTabs", { screen: "Home" });
          } catch (error) {
            console.error("🚨 Error storing deep link data:", error);
          }
        }

        if (path === "withdrawal") {
          console.log("🔔 Navigating to Withdrawal screen with params:", queryParams);
          navigationRef.current.navigate("MainTabs", {
            screen: "Withdrawal",
            params: queryParams || {},
          });
        }
      } catch (error) {
        console.error("❌ Deep Link Handling Error:", error.message);
        navigationRef.current.navigate("MainTabs", { screen: "Home" }); 
      }
    };

    Linking.addEventListener("url", handleDeepLink);

    Linking.getInitialURL().then((url) => {
      if (url) handleDeepLink({ url });
    });

    return () => {
    };
  }, []);

  return (
    <NavigationContainer linking={linking} ref={navigationRef}>
      <Stack.Navigator initialRouteName="AuthStack" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="AuthStack" component={AuthStack} />
        <Stack.Screen name="MainTabs" component={MainTabs} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default Navigation;
