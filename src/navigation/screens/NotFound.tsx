import { Text, Button } from '@react-navigation/elements';
import { StyleSheet, View } from 'react-native';

export function NotFound() {
  return (
    <View style={styles.container}>
      <Text>404</Text>
      <Button screen="HomeTabs">Go to Home</Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  contact: {
    padding: 10,
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center'
  },
  contactName: {
    fontWeight: 'bold',
  },
  input: {
    width: '95%',
    paddingHorizontal: 10,
    height: 50,
    borderColor: '#000',
    borderWidth: .3,
    backgroundColor: 'white',
    borderRadius: 10,
    marginHorizontal: 10,
    marginTop: 10,
  },
});
