import { useEffect, useRef, useState } from 'react';
import { Text } from '@react-navigation/elements';
import { useNavigation } from '@react-navigation/native';
import ImmediatePhoneCall from 'react-native-immediate-phone-call';
import localStorage from '@react-native-async-storage/async-storage';
import { TouchableOpacity, StyleSheet, View, TextInput, Alert, Platform } from 'react-native';
import { PERMISSIONS, request, RESULTS } from 'react-native-permissions';
import { useGlobalContext } from '../../store/global';

export function Home() {
  const amountRef = useRef(null);
  const router = useNavigation();
  const {receipient: initialReceipient, resetReceipient} = useGlobalContext();

  useEffect(() => {
    const requestPhonePermission = async () => {
      try {
        const result = await request(
          Platform.select({
            android: PERMISSIONS.ANDROID.CALL_PHONE,
            ios: PERMISSIONS.IOS.CONTACTS,
          })
        );

        if (result !== RESULTS.GRANTED) {
          console.log('Phone call permission denied');
        }
      } catch (error) {
        console.error('Error requesting phone call permission:', error);
      }
    };

    requestPhonePermission();
  }, []);

  const maxPage = 3;
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [isNew, setIsNew] = useState(false);
  const [recentContacts, setRecentContacts] = useState<IContact[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<IContact[]>(recentContacts);

  useEffect(() => {
    setFilteredContacts(
      recentContacts.filter(
        (contact) =>
          contact.name.toLowerCase().includes(search.toLowerCase()) ||
          contact.phone.includes(search)
      )
    );
  }, [recentContacts, search]);

  useEffect(() => {
    (async() => {const stored = JSON.parse((await localStorage.getItem('maL_contacts')) ?? '[]');
    setRecentContacts((prev) => (stored.length > 0 ? stored : prev));})()
  }, []);

  const [receipient, setReceipient] = useState(initialReceipient);

  const handleCheckBalance = async () => {
    if (!receipient) return;
    if (receipient.phone.length < 4) return Alert.alert("Invalid Phone or MomoPay Code");
    if (!receipient.amount || +receipient.amount < 90) return Alert.alert("Amount should atleast be 90Rwf");
    ImmediatePhoneCall
      .immediatePhoneCall(`*182*${receipient.phone.length == 10 ? '1': '8'}*1*${receipient.phone}*${receipient.amount}#`);

    const saved = JSON.parse(
      (await localStorage.getItem('maL_transactions')) ?? '[]'
    );
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
    saved.push({
      date: new Date().toISOString(),
      receipient,
      amount: money,
      charges,
    });
    await localStorage.setItem('maL_transactions', JSON.stringify(saved));

    if (isNew && receipient.name !== 'unkown') {
      const savedContacts = JSON.parse(
        (await localStorage.getItem('maL_contacts')) ?? '[]'
      );
      savedContacts.push(receipient);
      localStorage.setItem('maL_contacts', JSON.stringify(savedContacts));
    }

    resetReceipient();
    setReceipient(initialReceipient);

    router.navigate('Reasons');
  }
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
          autoFocus={!initialReceipient}
          style={styles.input}
          keyboardType='numeric'
          placeholder='Receipient'
          onChangeText={(phone)=> setReceipient(prev => ({...prev, phone}))}
          onSubmitEditing={() => amountRef.current.focus()}
          value={receipient.phone}
          maxLength={10}
          />
      </View>
      <View>
        <Text>Amount</Text>
        <TextInput
          autoFocus={initialReceipient != null}
          ref={amountRef}
          style={styles.input}
          keyboardType='numeric'
          placeholder='Amount'
          onChangeText={(amount)=> setReceipient(prev => ({...prev, amount}))}
          onSubmitEditing={handleCheckBalance}
          value={receipient.amount}
        />
      </View>
      <TouchableOpacity style={styles.button} onPress={handleCheckBalance}>
        <Text style={styles.buttonText}>Send Cash</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    gap: 10,
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
