import { HeaderButton, Text } from '@react-navigation/elements';
import newspaper from '../../assets/logo-white.png';
import { Image, StyleSheet, View } from 'react-native';
import { useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';

export function Updates() {
  const navigation = useNavigation();
  useEffect(() => {setTimeout(() => navigation.navigate('HomeTabs'), 10000)},[])
  return (
    <View style={styles.container}>
      <Text style={{fontSize: 20}}>Thank you for using</Text>
      <View style={{width: '100%', alignItems: 'center'}}>
        <Image
          source={newspaper}
          style={{
            width: 300,
            height: 100,
          }}
        />
      </View>

      <HeaderButton onPress={()=>navigation.navigate('HomeTabs')}>
        <Text style={{fontSize: 15, fontWeight: 'bold', color: '#fff', borderRadius: 5, paddingHorizontal: 20, paddingVertical: 10, backgroundColor: '#6B00FE'}}>Go Back</Text>
      </HeaderButton>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'white'
  },
});
