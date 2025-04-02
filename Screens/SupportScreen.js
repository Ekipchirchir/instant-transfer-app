import React from 'react';
import { 
  View, Text, TouchableOpacity, StyleSheet, 
  ScrollView, Linking, Dimensions, SafeAreaView 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

const SupportScreen = ({ navigation }) => {
  const contactMethods = [
    {
      icon: 'logo-whatsapp',
      name: 'WhatsApp',
      description: 'Chat with us instantly',
      action: () => Linking.openURL('https://wa.me/254769652512'),
      color: '#25D366'
    },
    {
      icon: 'call',
      name: 'Phone',
      description: '24/7 support line',
      action: () => Linking.openURL('tel:+254769652512'),
      color: '#3A0CA3'
    },
    {
      icon: 'mail',
      name: 'Email',
      description: 'Response within 2 hours',
      action: () => Linking.openURL('mailto:support@instanttransfer.com'),
      color: '#E5383B'
    },
    {
      icon: 'chatbubbles',
      name: 'Live Chat',
      description: 'In-app messaging',
      action: () => navigation.navigate('LiveChat'),
      color: '#4361EE'
    }
  ];

  const faqs = [
    {
      question: 'How long do withdrawals take?',
      answer: 'Most withdrawals are processed within 5-15 minutes.'
    },
    {
      question: 'Is there a minimum deposit amount?',
      answer: 'Yes, the minimum deposit is $10 or equivalent.'
    },
    {
      question: 'How secure is my money?',
      answer: 'All transactions use bank-level 256-bit encryption.'
    }
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Fixed Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#3A0CA3" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Support Center</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Scrollable Content */}
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Contact Methods */}
          <Text style={styles.sectionTitle}>Contact Options</Text>
          <View style={styles.contactMethods}>
            {contactMethods.map((method, index) => (
              <TouchableOpacity 
                key={index}
                style={[styles.contactCard, { backgroundColor: method.color + '20' }]}
                onPress={method.action}
              >
                <View style={[styles.contactIcon, { backgroundColor: method.color }]}>
                  <Ionicons name={method.icon} size={20} color="white" />
                </View>
                <View style={styles.contactText}>
                  <Text style={styles.contactName}>{method.name}</Text>
                  <Text style={styles.contactDesc}>{method.description}</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={method.color} />
              </TouchableOpacity>
            ))}
          </View>

          {/* FAQ Section */}
          <Text style={styles.sectionTitle}>FAQs</Text>
          <View style={styles.faqContainer}>
            {faqs.map((faq, index) => (
              <View key={index} style={styles.faqItem}>
                <Text style={styles.faqQuestion}>{faq.question}</Text>
                <Text style={styles.faqAnswer}>{faq.answer}</Text>
              </View>
            ))}
            <TouchableOpacity style={styles.viewAllFaqs}>
              <Text style={styles.viewAllText}>View all FAQs</Text>
              <Ionicons name="arrow-forward" size={16} color="#3A0CA3" />
            </TouchableOpacity>
          </View>

          {/* Support Resources */}
          <Text style={styles.sectionTitle}>Resources</Text>
          <View style={styles.resourceContainer}>
            <TouchableOpacity style={styles.resourceCard}>
              <Ionicons name="document-text" size={24} color="#3A0CA3" />
              <Text style={styles.resourceText}>Terms of Service</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.resourceCard}>
              <Ionicons name="shield-checkmark" size={24} color="#3A0CA3" />
              <Text style={styles.resourceText}>Security Guide</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'lightgreen',
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 10,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212529',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3A0CA3',
    marginBottom: 15,
    marginTop: 10,
  },
  contactMethods: {
    marginBottom: 25,
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 10,
    marginBottom: 12,
  },
  contactIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  contactText: {
    flex: 1,
  },
  contactName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212529',
  },
  contactDesc: {
    fontSize: 13,
    color: '#6C757D',
    marginTop: 3,
  },
  faqContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  faqItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F3F5',
  },
  faqQuestion: {
    fontSize: 15,
    fontWeight: '500',
    color: '#212529',
    marginBottom: 5,
  },
  faqAnswer: {
    fontSize: 13,
    color: '#6C757D',
    lineHeight: 18,
  },
  viewAllFaqs: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 15,
  },
  viewAllText: {
    color: '#3A0CA3',
    fontSize: 14,
    fontWeight: '500',
    marginRight: 5,
  },
  resourceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  resourceCard: {
    backgroundColor: 'white',
    width: '48%',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  resourceText: {
    fontSize: 14,
    color: '#3A0CA3',
    fontWeight: '500',
    marginTop: 10,
    textAlign: 'center',
  },
});

export default SupportScreen;