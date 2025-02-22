// import { StaticScreenProps } from '@react-navigation/native';
import { Text } from '@react-navigation/elements';
import { Fragment, useEffect, useState } from 'react';
import localStorage from '@react-native-async-storage/async-storage';
import { Image, StyleSheet, TextInput, TouchableOpacity, View, SectionList } from 'react-native';
import moment from 'moment';

export const formatMoney = (money:number) => <Fragment>{money.toLocaleString()} <Text style={{fontSize: 12}}>RWF</Text></Fragment>;
const groupTransactionsByDate = (transactions: ITransaction[]): {
  title: string;
  data: ITransaction[];
}[]  => {
  const grouped = transactions.reduce((acc: {[title: string]: ITransaction[]}, transaction) => {
    const date = moment(transaction.date);
    let sectionTitle = '';

    if (date.isSame(moment(), 'day')) {
      sectionTitle = 'Today';
    } else if (date.isSame(moment().subtract(1, 'day'), 'day')) {
      sectionTitle = 'Yesterday';
    } else if (date.isAfter(moment().subtract(7, 'days'))) {
      sectionTitle = 'Last 7 Days';
    } else {
      sectionTitle = date.format('MMMM YYYY');
    }

    if (!acc[sectionTitle]) {
      acc[sectionTitle] = [];
    }
    acc[sectionTitle].push(transaction);
    return acc;
  }, {});

  const sectionOrder = ['Today', 'Yesterday', 'Last 7 Days'];

  const sortedSections = Object.keys(grouped)
    .sort((a, b) => {
      const aIndex = sectionOrder.indexOf(a);
      const bIndex = sectionOrder.indexOf(b);

      if (aIndex === -1 && bIndex === -1) {
        return moment(b[0].date).diff(moment(a[0].date));
      }
      if (aIndex === -1) return 1;
      if (bIndex === -1) return -1;
      return aIndex - bIndex;
    })
    .map((title) => ({
      title,
      data: grouped[title].sort((a, b) => moment(b.date).diff(moment(a.date))),
    }));

  return sortedSections;
};

const TransactionList = ({ sections }: {
    sections:{
      title: string;
      data: ITransaction[];
    }[]
  }) => (
  <SectionList
    sections={sections}
    keyExtractor={(item) => item.receipient.name + item.date}
    renderItem={({ item }) => (
      <TouchableOpacity style={styles.contact}>
        <Image source={{uri: `https://ui-avatars.com/api/?size=30&uppercase=false&name=${(item.receipient.name ? item.receipient.name: 'unkown').replaceAll(' ', '+')}`, width: 30, height: 30}} />
        <View style={{flex: 1}}>
          <Text>{item.receipient.name !== 'unkown' ? item.receipient.name: (item.receipient.phone.length > 0? item.receipient.phone : 'unkown')}</Text>
          <Text style={{color: 'gray'}}>{moment(item.date).format('HH:mm')}{item.reason ? ` - ${item.reason}` : ''}</Text>
        </View>
        <View>
          <Text style={styles.contactName}>{formatMoney(item.amount)}</Text>
          <Text style={styles.charges}>charges: {item.charges}</Text>
        </View>
      </TouchableOpacity>
    )}
    renderSectionHeader={({ section: { title } }) => (
      <View style={styles.header}>
        <Text style={styles.headerText}>{title}</Text>
      </View>
    )}
  />
);

// type Props = StaticScreenProps<{
//   user: string;
// }>;

export function Settings() {
  const [contacts, setContacts] = useState<ITransaction[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<ITransaction[]>([]);
  const [sections, setSections] = useState<{
    title: string;
    data: ITransaction[];
}[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const loadContacts = async () => {
      const data = JSON.parse(
        (await localStorage.getItem('maL_transactions')) ?? '[]'
      );
      
      if (data.length > 0) {
        data.sort((a, b) => a.date - b.date);
        setContacts(data.reverse());
        setFilteredContacts(data.reverse());
      }
    };

    loadContacts();
  }, []);

  const handleSearch = (text: string) => {
    setSearch(text);
    setFilteredContacts(() => contacts.filter(ct => 
      ct.receipient.name?.toLowerCase().includes(text.trim().toLowerCase())
      || ct.receipient.phone.includes(text.trim())
      || ct.amount.toString().includes(text.trim())
      || ct.charges.toString().includes(text.trim())
    ))
  }

  useEffect(() => {
    setSections(groupTransactionsByDate(filteredContacts));
  }, [filteredContacts]);

  return (
    <Fragment>
      <View>
        <TextInput style={styles.input} onChangeText={handleSearch} value={search} placeholder='Search for a transaction' />
      </View>
      <TransactionList sections={sections} />
    </Fragment>
  );
}

const styles = StyleSheet.create({
  header: {
    padding: 10,
    backgroundColor: '#f4f4f4',
  },
  headerText: {
    fontWeight: 'bold',
  },
  item: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
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
  charges: {
    fontSize: 10
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
