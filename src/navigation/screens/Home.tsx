import { useEffect, useRef, useState } from 'react';
import { Text } from '@react-navigation/elements';
import { useNavigation } from '@react-navigation/native';
import ImmediatePhoneCall from 'react-native-immediate-phone-call';
import localStorage from '@react-native-async-storage/async-storage';
import { TouchableOpacity, StyleSheet, View, TextInput, Alert, Platform, PermissionsAndroid, FlatList, Image } from 'react-native';
import { useGlobalContext } from '../../store/global';
import moment from 'moment';
import { formatMoney } from './Settings';

export function Home() {
  const { PERMISSIONS, request, RESULTS } = PermissionsAndroid;
  const amountRef = useRef(null);
  const router = useNavigation();
  const [recentTrx, setTrx] = useState<ITransaction[]>([]);
  const {receipient: initialReceipient, resetReceipient, setCurrTransaction} = useGlobalContext();

  useEffect(() => {
    const loadLast5Trx = async () => {
      const data: ITransaction[] = JSON.parse(
        (await localStorage.getItem('maL_transactions')) ?? '[]'
      );
      
      if (data.length > 0) {
        setTrx(data.reverse().slice(0, 5));
      }
    };

    const requestPhonePermission = async () => {
      try {
        if (Platform.OS !== "android") return;
        const result = await request(PERMISSIONS.CALL_PHONE);

        if (result !== RESULTS.GRANTED) {
          console.log('Phone call permission denied');
        }
      } catch (error) {
        console.error('Error requesting phone call permission:', error);
      }
    };

    loadLast5Trx();
    requestPhonePermission();
  }, []);

  const [receipient, setReceipient] = useState(initialReceipient);

  const handleCheckBalance = async () => {
    if (!receipient) return;
    if (receipient.phone.length < 4) return Alert.alert("Invalid Phone or MomoPay Code");
    if (!receipient.amount || +receipient.amount < 90) return Alert.alert("Amount should atleast be 90Rwf");
    const ussd = `*182*${receipient.phone.length == 10 ? '1': '8'}*1*${receipient.phone}*${receipient.amount}#`;
    try {
      console.log("==========", ImmediatePhoneCall);
      ImmediatePhoneCall.immediatePhoneCall(ussd);
    } catch (error) {
      console.log(error);
      return;
    }

    const money = +receipient.amount;
    const charges = money <= 1000 ? 20 
      : money <= 5000? 100 
      : money <= 15000? 200 
      : money <= 30000? 300 
      : money <= 45000? 400 
      : money <= 60000? 500
      : money <= 75000? 600
      : money <= 100000? 700
      : money <= 150000? 800
      : money <= 300000? 1000
      : money <= 500000? 1500
      : money <= 1000000? 2000
      : money <= 2000000? 3000
      : 0;
    const trx:ITransaction = {
      date: new Date().toISOString(),
      receipient,
      amount: money,
      charges,
    };

    resetReceipient();
    setReceipient(initialReceipient);
    setCurrTransaction(trx);

    router.navigate('Reasons');
  }

  const renderItem = ({ item }: {item: ITransaction}) => {
    return(
      <TouchableOpacity style={styles.contact}>
        <Image source={{uri: `https://ui-avatars.com/api/?size=30&uppercase=false&name=${(item.receipient.name ? item.receipient.name: 'unkown').replaceAll(' ', '+')}`, width: 30, height: 30}} />
        <View style={{flex: 1}}>
          <Text>{item.receipient.name !== 'unkown' ? item.receipient.name: (item.receipient.phone.length > 0? item.receipient.phone : 'unkown')}</Text>
          <Text style={{color: 'gray'}}>{moment(item.date).format(item.group !== 'Last 7 Days' ? 'HH:mm': 'ddd, MMM Do HH:mm')}{item.reason ? ` - ${item.reason}` : ''}</Text>
        </View>
        <View>
          <Text style={styles.contactName}>{formatMoney(item.amount)}</Text>
        </View>
      </TouchableOpacity>
  );}
  return (
    <View style={styles.container}>
      <View>
        <TouchableOpacity style={styles.buttonSecondary} onPress={() => router.navigate('Profile')}>
          <Text style={styles.buttonText2}>Send to contact</Text>
        </TouchableOpacity>
      </View>
      
      <View>
        <Text>Receipient</Text>
        <TextInput
          autoFocus={receipient === null || receipient.phone.length === 0}
          style={styles.input}
          keyboardType='numeric'
          placeholder='Receipient'
          onChangeText={(phone)=> setReceipient(prev => ({...prev, phone}))}
          onSubmitEditing={() => amountRef.current!.focus()}
          value={receipient!.phone}
          maxLength={10}
          />
      </View>
      <View>
        <Text>Amount</Text>
        <TextInput
          autoFocus={initialReceipient != null && initialReceipient.phone.length > 0}
          ref={amountRef}
          style={styles.input}
          keyboardType='numeric'
          placeholder='Amount'
          onChangeText={(amount)=> setReceipient(prev => ({...prev, amount}))}
          onSubmitEditing={handleCheckBalance}
          value={receipient!.amount}
        />
      </View>
      <TouchableOpacity style={styles.button} onPress={handleCheckBalance}>
        <Text style={styles.buttonText}>Send Cash</Text>
      </TouchableOpacity>
      <View style={{}}>
        <View style={{flexDirection: 'row', justifyContent: 'space-between', width: '99%', marginVertical: 10, marginTop: 40}}>
          <Text style={{fontWeight: 'bold'}}>Recent Transactions</Text>
          <TouchableOpacity onPress={() => router.navigate('Settings')}>
            <Text>See All</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={recentTrx}
          keyExtractor={(item, i) => item.date + i}
          renderItem={renderItem}
          maxToRenderPerBatch={15} 
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
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
    width: '100%',
    paddingHorizontal: 10,
    height: 50,
    borderColor: '#000',
    borderWidth: .3,
    backgroundColor: 'white',
    borderRadius: 10
  },
  button: {
    width: '100%',
    height: 50,
    backgroundColor: '#6B00FE',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 5
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    textTransform: 'uppercase'
  },
  buttonText2: {
    color: 'white',
    textTransform: 'uppercase'
  },
  buttonSecondary: {
    backgroundColor: "#222",
    paddingVertical: 5,
    paddingHorizontal: 10,
    height: 50,
    borderRadius: 5,
    width: 'auto',
    alignItems: 'center',
    justifyContent: 'center',
  }
});
