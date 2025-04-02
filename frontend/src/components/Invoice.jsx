import React from 'react';
import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';

// Tailwind-inspired styles for react-pdf
const styles = StyleSheet.create({
  page: {
    padding: 32, // Equivalent to Tailwind p-8
    backgroundColor: '#f7fafc', // Tailwind bg-gray-100
    fontFamily: 'Helvetica',
  },
  header: {
    fontSize: 24, // Tailwind text-2xl
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16, // Tailwind mb-4
    color: '#2d3748', // Tailwind text-gray-800
  },
  section: {
    backgroundColor: '#ffffff', // Tailwind bg-white
    padding: 16, // Tailwind p-4
    marginBottom: 16, // Tailwind mb-4
    borderRadius: 8, // Tailwind rounded
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  sectionHeader: {
    fontSize: 18, // Tailwind text-xl
    fontWeight: '600', // Tailwind semibold
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0', // Tailwind border-gray-200
    paddingBottom: 4,
    color: '#4a5568', // Tailwind text-gray-700
  },
  text: {
    fontSize: 12, // Tailwind text-base
    marginBottom: 4,
    color: '#4a5568', // Tailwind text-gray-700
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0', // Tailwind border-gray-200
  },
  total: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'right',
    marginTop: 8,
    color: '#2d3748', // Tailwind text-gray-800
  },
});

const Invoice = ({ order }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <Text style={styles.header}>Invoice</Text>
      
      <View style={styles.section}>
        <Text style={styles.sectionHeader}>Order Details</Text>
        <Text style={styles.text}>Order ID: {order.id}</Text>
        <Text style={styles.text}>Date: {new Date(order.date).toDateString()}</Text>
        <Text style={styles.text}>Payment Method: {order.paymentMethod}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionHeader}>Items</Text>
        {order.items.map((item, index) => (
          <View key={index} style={styles.itemRow}>
            <Text style={styles.text}>
              {item.name} (x{item.quantity})
            </Text>
            <Text style={styles.text}>
              {order.currency}{item.price}
            </Text>
          </View>
        ))}
      </View>

      <Text style={styles.total}>
        Total: {order.currency}
        {order.items.reduce((total, item) => total + item.quantity * item.price, 0)}
      </Text>
    </Page>
  </Document>
);

export default Invoice;
