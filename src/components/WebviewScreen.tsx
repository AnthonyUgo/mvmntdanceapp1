import React from 'react';
import { View, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import { RouteProp, useRoute } from '@react-navigation/native';
import type { RootStackParamList } from '../../App';

type Props = RouteProp<RootStackParamList, 'WebviewScreen'>;

const WebviewScreen: React.FC = () => {
  const { url } = useRoute<Props>().params;
  return (
    <View style={styles.container}>
      <WebView source={{ uri: url }} style={styles.webview} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  webview: { flex: 1 },
});

export default WebviewScreen;
