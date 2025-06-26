import React, { useContext } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ThemeContext } from '../contexts/ThemedContext';

const SavedScreen: React.FC = () => {
  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark';

  return (
    <View style={[s.container, { backgroundColor: isDark?'#121212':'#fff' }]}>
      <Text style={[s.header, { color: isDark?'#fff':'#000' }]}>
        Saved
      </Text>
      <Text style={{ color: isDark?'#ccc':'#666' }}>
        You haven’t saved any events yet.
      </Text>
    </View>
  );
};

const s = StyleSheet.create({
  container: { flex:1, alignItems:'center', justifyContent:'center' },
  header:    { fontSize:22, fontWeight:'bold', marginBottom:8 }
});

export default SavedScreen;
