import React, { useState } from "react";
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const HomeScreen = ({ navigation }) => {
  const [menuVisible, setMenuVisible] = useState(false);

  const transactions = [
    { id: "1", type: "Withdraw", amount: "$5.00", date: "17 Feb, 2025" },
    { id: "2", type: "Deposit", amount: "$50.00", date: "15 Feb, 2025" },
    { id: "3", type: "Withdraw", amount: "$20.00", date: "13 Feb, 2025" },
    { id: "4", type: "Deposit", amount: "$49.00", date: "10 Feb, 2025" },
  ];

  return (
    <View style={styles.container}>

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
           <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.appTitle}>Instant Transfer</Text>
        <TouchableOpacity onPress={() => setMenuVisible(!menuVisible)}>
          <Ionicons name="menu" size={24} color="black" />
        </TouchableOpacity>
      </View>

      {menuVisible && (
        <View style={styles.dropdownMenu}>
          <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate("Settings")}>
            <Ionicons name="settings-outline" size={20} color="black" />
            <Text style={styles.menuText}>Settings</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem} onPress={() => navigation.replace("Login")}>
            <Ionicons name="log-out-outline" size={20} color="red" />
            <Text style={[styles.menuText, { color: "red" }]}>Logout</Text>
          </TouchableOpacity>
        </View>
      )}

     
      <View style={styles.userCard}>
        <Text style={styles.userName}>John Doe</Text>
        <Text style={styles.userId}>CR9292992</Text>
        <Text style={styles.balance}>Deriv balance: $290</Text>
      </View>

     
      <View style={styles.buttonsContainer}>
        <TouchableOpacity style={styles.depositButton} onPress={() => navigation.navigate("Deposit")}>
          <Ionicons name="add" size={24} color="black" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.withdrawButton} onPress={() => navigation.navigate("Withdraw")}>
          <Ionicons name="remove" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <View style={styles.buttonLabels}>
        <Text style={styles.label}>DEPOSIT</Text>
        <Text style={styles.label}>WITHDRAW</Text>
      </View>

      {/* Transactions */}
      <View style={styles.transactionContainer}>
        <View style={styles.transactionHeader}>
          <Text style={styles.transactionTitle}>TRANSACTIONS</Text>
          <TouchableOpacity onPress={() => navigation.navigate("Transaction")}>
            <Text style={styles.moreText}>MORE</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={transactions}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.transactionItem}>
              <Text style={styles.transactionType}>{item.type}</Text>
              <Text style={styles.transactionAmount}>{item.amount}</Text>
              <Text style={styles.transactionDate}>{item.date}</Text>
            </View>
          )}
        />
      </View>
      <TouchableOpacity style={styles.chatIcon}>
                      <Ionicons name="chatbubble-ellipses-outline" size={24} color="black" />
                  </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "smokewhite",
    padding: 15,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "lightgreen",
    padding: 15,
    borderRadius: 10,
    zIndex: 5, 
  },
  appTitle: {
    fontSize: 18,
    fontWeight: "bold",
    right:70,
  },
  dropdownMenu: {
    position: "absolute",
    top: 60,
    right: 15,
    backgroundColor: "white",
    padding: 10,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 10,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
  },
  menuText: {
    marginLeft: 10,
    fontSize: 16,
    fontWeight: "bold",
  },
  userCard: {
    backgroundColor: "#FFF8DC",
    padding: 15,
    borderRadius: 10,
    marginVertical: 40, 
  },
  userName: {
    fontSize: 18,
    fontWeight: "bold",
  },
  userId: {
    fontSize: 14,
    color: "#555",
  },
  balance: {
    fontSize: 16,
    marginTop: 5,
    fontWeight: "bold",
  },
  buttonsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginVertical: 10,
  },
  depositButton: {
    backgroundColor: "lightgreen",
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 30,
  },
  withdrawButton: {
    backgroundColor: "black",
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonLabels: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 10,
  },
  label: {
    fontSize: 14,
    fontWeight: "bold",
    marginHorizontal: 40,
  },
  transactionContainer: {
    backgroundColor: "#FFF",
    padding: 15,
    borderRadius: 10,
  },
  transactionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  transactionTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },
  moreText: {
    color: "#007AFF",
    fontSize: 14,
  },
  transactionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  transactionType: {
    fontSize: 14,
    fontWeight: "bold",
  },
  transactionAmount: {
    fontSize: 14,
    fontWeight: "bold",
  },
  transactionDate: {
    fontSize: 12,
    color: "#555",
  },
  chatIcon: {
    position: 'absolute',
    bottom: 200,
    left:40,
    paddingBottom:10,
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 25,
    elevation: 5,
}
});

export default HomeScreen;
