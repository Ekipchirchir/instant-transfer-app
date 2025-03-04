import React from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const transactions = [
    { id: '1', type: 'Withdraw', amount: 12.00, date: '17 Feb, 2025', transactionId: '#TBH5GTYK', isDeposit: false },
    { id: '2', type: 'Deposit', amount: 7.00, date: '15 Feb, 2025', transactionId: '#TBH5GTYK', isDeposit: true },
    { id: '3', type: 'Deposit', amount: 30.00, date: '10 Feb, 2025', transactionId: '#TJSDDMC', isDeposit: true },
    { id: '4', type: 'Withdraw', amount: 10.00, date: '7 Feb, 2025', transactionId: '#DNCJDNC', isDeposit: false },
];

const TransactionScreen = ({ navigation }) => {
    return (
        <View style={styles.container}>
            
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color="black" />
                </TouchableOpacity>
                <Text style={styles.title}>Instant Transfer</Text>
                <View style={styles.icons}>
                    <TouchableOpacity onPress={() => navigation.navigate("Transaction")}><Ionicons name="refresh" size={20} color="black" style={styles.icon} /></TouchableOpacity>
                    <TouchableOpacity onPress={() => navigation.navigate("")}><Ionicons name="list" size={20} color="black" style={styles.icon} /></TouchableOpacity>
                    <TouchableOpacity onPress={() => navigation.navigate("Settings")}> <Ionicons name="settings" size={20} color="black" style={styles.icon} /></TouchableOpacity>
                </View>
            </View>

           
            <Text style={styles.sectionTitle}>TRANSACTIONS</Text>
            <FlatList
                data={transactions}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <View style={styles.transactionItem}>
                        <Text style={[styles.transactionType, { color: item.isDeposit ? 'green' : 'red' }]}>
                            {item.isDeposit ? '+ ' : '- '}
                            {item.type}
                        </Text>
                        <Text style={styles.amount}>${item.amount.toFixed(2)}</Text>
                        <Text style={styles.transactionId}>{item.transactionId}</Text>
                        <Text style={styles.date}>{item.date}</Text>
                    </View>
                )}
            />

           
            <TouchableOpacity style={styles.chatIcon}>
                <Ionicons name="chatbubble-ellipses-outline" size={24} color="black" />
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        padding: 16,
    },
    header: {
        flexDirection: 'row',
        
        justifyContent: 'space-between',
        backgroundColor: 'lightgreen',
        paddingVertical: 15,
        paddingHorizontal: 16,
        borderRadius:5,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: 'black',
        right:35,
       
    },
    icons: {
        flexDirection: 'row',
    },
    icon: {
        marginLeft: 10,
    },
    sectionTitle: {
        fontSize: 15,
        fontWeight: 'bold',
        marginVertical: 10,
    },
    transactionItem: {
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
        paddingVertical: 8,
    },
    transactionType: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    amount: {
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'right',
    },
    transactionId: {
        fontSize: 12,
        color: 'gray',
    },
    date: {
        fontSize: 12,
        color: 'gray',
        textAlign: 'right',
    },
    chatIcon: {
        position: 'absolute',
        bottom: 200,
        left:40,
        backgroundColor: '#fff',
        padding: 10,
        borderRadius: 25,
        elevation: 5,
    },
});

export default TransactionScreen;
