import { StyleSheet, ScrollView } from 'react-native';

import { Text, View } from '@/components/Themed';

export default function TabTwoScreen() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>YouTube Player Info</Text>
        <View style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />
        
        <Text style={styles.sectionTitle}>Features:</Text>
        <Text style={styles.text}>• Custom video controls with play/pause/rewind/fast-forward</Text>
        <Text style={styles.text}>• Progress bar with current time display</Text>
        <Text style={styles.text}>• Responsive design for portrait and landscape modes</Text>
        <Text style={styles.text}>• Tap to show/hide controls</Text>
        <Text style={styles.text}>• Fullscreen toggle button</Text>
        
        <Text style={styles.sectionTitle}>Controls:</Text>
        <Text style={styles.text}>• Tap the video to toggle control visibility</Text>
        <Text style={styles.text}>• Use rewind/fast-forward buttons to skip ±10 seconds</Text>
        <Text style={styles.text}>• Rotate device or use fullscreen button to toggle orientation</Text>
        
        <Text style={styles.sectionTitle}>Technical Implementation:</Text>
        <Text style={styles.text}>• Built with react-native-youtube-iframe</Text>
        <Text style={styles.text}>• Custom SVG icons using react-native-svg</Text>
        <Text style={styles.text}>• Responsive scaling with device-specific calculations</Text>
        <Text style={styles.text}>• Expo Router for navigation</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 20,
    marginBottom: 10,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 14,
    lineHeight: 20,
    alignSelf: 'flex-start',
    marginBottom: 5,
  },
  separator: {
    marginVertical: 20,
    height: 1,
    width: '80%',
  },
});
