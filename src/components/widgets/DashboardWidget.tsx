// components/widgets/DashboardWidget.tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';

const DashboardWidget: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <View style={styles.widget}>{children}</View>;
};

const styles = StyleSheet.create({
  widget: {
    marginBottom: 24,
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#f9f9f9',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 2,
  },
});

export default DashboardWidget;
