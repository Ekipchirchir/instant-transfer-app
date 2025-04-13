import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Linking,
  Dimensions,
  SafeAreaView,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const SupportScreen = ({ navigation }) => {
  const fadeAnim = React.useRef(new Animated.Value(0)).current; 
  const [showAllFaqs, setShowAllFaqs] = useState(false);

  const contactMethods = [
    {
      icon: 'logo-whatsapp',
      name: 'WhatsApp',
      description: 'Chat with us instantly',
      action: () => Linking.openURL('https://wa.me/254711589162'),
      color: '#25D366',
    },
    {
      icon: 'call',
      name: 'Phone',
      description: '24/7 support line',
      action: () => Linking.openURL('tel:+254711589162'),
      color: '#3A0CA3',
    },
    {
      icon: 'mail',
      name: 'Email',
      description: 'Response within 2 hours',
      action: () => Linking.openURL('mailto:help.instanttransfer@gmail.com'),
      color: '#E5383B',
    },
    {
      icon: 'chatbubbles',
      name: 'Live Chat',
      description: 'In-app messaging',
      action: () => navigation.navigate('LiveChat'),
      color: '#4361EE',
    },
  ];

  const faqs = [
    {
      question: 'How long do withdrawals take?',
      answer: 'Most withdrawals are processed within 5-15 minutes.',
    },
    {
      question: 'Is there a minimum deposit amount?',
      answer: 'Yes, the minimum deposit is $2 or equivalent.',
    },
    {
      question: 'How secure is my money?',
      answer: 'All transactions use bank-level 256-bit encryption.',
    },
    {
      question: 'Can I cancel a withdrawal?',
      answer: 'No, once initiated, withdrawals cannot be canceled.',
    },
    {
      question: 'What payment methods are supported?',
      answer: 'We support M-Pesa, bank cards, and Deriv accounts.',
    },
    {
      question: 'Are there any fees for withdrawals?',
      answer: 'No, we do not charge withdrawal fees.',
    },
    {
      question: 'How do I verify my account?',
      answer: 'Submit your ID and proof of address via the app.',
    },
    {
      question: 'What is the maximum withdrawal limit?',
      answer: 'The maximum limit is $10,000 per transaction.',
    },
    {
      question: 'Can I use multiple currencies?',
      answer: 'Yes, we support USD and KES conversions.',
    },
    {
      question: 'What happens if my payment fails?',
      answer: 'Failed payments are refunded within 24 hours.',
    },
    {
      question: 'How do I contact support outside the app?',
      answer: 'Use WhatsApp, phone, or email listed above.',
    },
    {
      question: 'Is there a referral program?',
      answer: 'Yes, earn $5 per successful referral.',
    },
    {
      question: 'How often are exchange rates updated?',
      answer: 'Rates are updated daily at midnight GMT.',
    },
  ];

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const handleViewAllFaqs = () => {
    setShowAllFaqs(true);
  };

  const visibleFaqs = showAllFaqs ? faqs : faqs.slice(0, 8);

  return (
    <SafeAreaView style={styles.safeArea}>
      <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
        {/* Header (Larger Height) */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#3A0CA3" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Support Center</Text>
          <View style={{ width: 24 }} /> {/* Placeholder for symmetry */}
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Get in Touch</Text>
            <View style={styles.contactContainer}>
              {contactMethods.map((method, index) => (
                <TouchableOpacity
                  key={index}
                  style={[styles.contactCard, { borderLeftColor: method.color }]}
                  onPress={method.action}
                  activeOpacity={0.8}
                >
                  <View style={styles.contactIconContainer}>
                    <Ionicons name={method.icon} size={24} color={method.color} />
                  </View>
                  <View style={styles.contactDetails}>
                    <Text style={styles.contactName}>{method.name}</Text>
                    <Text style={styles.contactDesc}>{method.description}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#6C757D" />
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* FAQs */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
            <View style={styles.faqContainer}>
              {visibleFaqs.map((faq, index) => (
                <View key={index} style={styles.faqItem}>
                  <Text style={styles.faqQuestion}>{faq.question}</Text>
                  <Text style={styles.faqAnswer}>{faq.answer}</Text>
                </View>
              ))}
              {!showAllFaqs && (
                <TouchableOpacity
                  style={styles.viewAllButton}
                  onPress={handleViewAllFaqs}
                >
                  <Text style={styles.viewAllText}>View More FAQs</Text>
                  <Ionicons name="arrow-forward" size={18} color="#4361EE" />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Resources */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Helpful Resources</Text>
            <View style={styles.resourceContainer}>
              <TouchableOpacity
                style={styles.resourceCard}
                onPress={() => navigation.navigate('TermsScreen')}
              >
                <Ionicons name="document-text-outline" size={28} color="#4361EE" />
                <Text style={styles.resourceText}>Terms of Service</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.resourceCard}
                onPress={() => navigation.navigate('SecurityGuideScreen')}
              >
                <Ionicons name="shield-checkmark-outline" size={28} color="#4361EE" />
                <Text style={styles.resourceText}>Security Guide</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Footer Spacer */}
          <View style={styles.footerSpacer} />
        </ScrollView>
      </Animated.View>
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
    flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 20,
        paddingTop: 50,
        backgroundColor: "#FFFFFF",
        borderBottomWidth: 1,
        borderBottomColor: "#E9ECEF",
  },
  headerTitle: {
    fontSize: 18, 
    fontWeight: '600', 
    color: '#212529', 
    fontFamily: 'System',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 80, 
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 12,
    fontFamily: 'System',
  },
  contactContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderLeftWidth: 4,
    backgroundColor: '#FFFFFF',
  },
  contactIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    marginRight: 12,
  },
  contactDetails: {
    flex: 1,
  },
  contactName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212529',
    fontFamily: 'System',
  },
  contactDesc: {
    fontSize: 12,
    color: '#6C757D',
    marginTop: 2,
    fontFamily: 'System',
  },
  faqContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  faqItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  faqQuestion: {
    fontSize: 15,
    fontWeight: '500',
    color: '#212529',
    marginBottom: 4,
    fontFamily: 'System',
  },
  faqAnswer: {
    fontSize: 13,
    color: '#6C757D',
    lineHeight: 18,
    fontFamily: 'System',
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 12,
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4361EE',
    marginRight: 6,
    fontFamily: 'System',
  },
  resourceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  resourceCard: {
    backgroundColor: '#FFFFFF',
    width: (width - 48) / 2, 
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  resourceText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4361EE',
    marginTop: 8,
    textAlign: 'center',
    fontFamily: 'System',
  },
  footerSpacer: {
    height: 40, 
  },
});

export default SupportScreen;
