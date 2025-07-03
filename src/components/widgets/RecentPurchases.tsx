// components/widgets/RecentPurchases.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

type Props = {
  purchases: { purchaser: string; date: string }[];
  textColor: string;
};

const RecentPurchases: React.FC<Props> = ({ purchases, textColor }) => {
  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: textColor }]}>Recent Purchases</Text>
      {purchases.length === 0 ? (
        <Text style={{ color: textColor, fontSize: 14 }}>No purchases yet.</Text>
      ) : (
        purchases.map((item, idx) => (
          <View key={idx} style={styles.ticketItem}>
            <Text style={[styles.ticketText, { color: textColor }]}>
              {item.purchaser} – {item.date}
            </Text>
          </View>
        ))
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 18, fontWeight: '600', marginBottom: 8 },
  ticketItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderColor: '#555',
  },
  ticketText: { fontSize: 16 },
});

export default RecentPurchases;
