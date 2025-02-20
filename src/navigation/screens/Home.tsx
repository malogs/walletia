import { Text } from '@react-navigation/elements';
import { useNavigation } from '@react-navigation/native';
import localStorage from '@react-native-async-storage/async-storage';
import ImmediatePhoneCall from 'react-native-immediate-phone-call';
import { TouchableOpacity, StyleSheet, View, TextInput, Alert } from 'react-native';
import { useEffect, useRef, useState } from 'react';

const initialReceipient = {phone: '', amount: '', name: 'unkown'};
export function Home() {
  const amountRef = useRef(null);
  const router = useNavigation();

  const maxPage = 3;
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [isNew, setIsNew] = useState(false);
  const [receipientObj, setReceipientObj] = useState<IContact>();
  const [recentContacts, setRecentContacts] = useState<IContact[]>([]);
  const [filteredRecentContacts, setFilteredRecentContacts] =
    useState<IContact[]>(recentContacts);

  useEffect(() => {
    setFilteredRecentContacts(
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
    if (receipient.phone.length < 4) return Alert.alert("Invalid Phone or MomoPay Code");
    if (+receipient.amount < 90) return Alert.alert("Amount should atleast be 90Rwf");
    ImmediatePhoneCall
      .immediatePhoneCall(`*182*${receipient.phone.length == 10 ? '1': '8'}*1*${receipient.phone}*${receipient.amount}#`);
    setReceipient(initialReceipient);

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
      savedContacts.navigate(receipientObj);
      localStorage.setItem('maL_contacts', JSON.stringify(savedContacts));
    }

    router.navigate('Reasons');
  }
  return (
    <View style={styles.container}>
      <View>
        <Text>Receipient</Text>
        <TextInput
          autoFocus
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
    borderRadius: 10
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 15
  }
});
