// import { StaticScreenProps } from '@react-navigation/native';
import { Text } from '@react-navigation/elements';
import * as Contacts from 'expo-contacts';
import { Fragment, useEffect, useState } from 'react';
import { FlatList, Image, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { useGlobalContext } from '../../store/global';
import { useNavigation } from '@react-navigation/native';

// type Props = StaticScreenProps<{
//   user: string;
// }>;

export function Profile() {
  const [contacts, setContacts] = useState<IContact[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<IContact[]>([]);
  const [search, setSearch] = useState("");
  const {setReceipient} = useGlobalContext();
  const navigation = useNavigation();

  useEffect(() => {
    const loadContacts = async () => {
      const { status } = await Contacts.requestPermissionsAsync();
      if (status !== 'granted') {
        alert('Permission to access contacts was denied');
        return;
      }

      const { data } = await Contacts.getContactsAsync({
        fields: [Contacts.Fields.PhoneNumbers],
      });
      
      
      if (data.length > 0) {
        const cts: IContact[] = data
          .filter(ct => ct.phoneNumbers && ct.phoneNumbers[0] && (ct.phoneNumbers[0].number.replace(/.*?(07.*)/, '$1').startsWith('078') || ct.phoneNumbers[0].number.replace(/.*?(07.*)/, '$1').startsWith('079')))
          .map(ct => ({
            name: ct.name, 
            phone: ct.phoneNumbers && ct.phoneNumbers[0]?.number?.replaceAll('-', '').replaceAll(' ', '').replace(/.*?(07.*)/, '$1')
          }));
          
        setContacts(cts);
        setFilteredContacts(cts);
      }
    };

    loadContacts();
  }, []);

  const handleSendTo = (contact: IContact) => {
    setReceipient(contact);
    navigation.navigate('HomeTabs');
  }

  const handleSearch = (text: string) => {
    setSearch(text);
    setFilteredContacts(() => contacts.filter(ct => 
      ct.name.toLowerCase().includes(text.trim().toLowerCase())
      || ct.phone.includes(text.trim())
    ))
  }

  const renderItem = ({ item }: {item: IContact}) => {
    return(
    <TouchableOpacity style={styles.contact} onPress={() => handleSendTo(item)}>
      <Image source={{uri: `https://ui-avatars.com/api/?size=50&background=random&uppercase=false&name=${item.name.replaceAll(' ', '+')}`, width: 50, height: 50}} />
      <View>
        <Text style={styles.contactName}>{item.name}</Text>
        <Text>{item.phone}</Text>
      </View>
    </TouchableOpacity>
  );}

  return (
    <Fragment>
      <View>
        <TextInput style={styles.input} onChangeText={handleSearch} value={search} placeholder='Search for a contact' />
      </View>
      <FlatList
        data={filteredContacts}
        keyExtractor={(item, i) => item.name + i}
        renderItem={renderItem}
        maxToRenderPerBatch={15} 
      />
    </Fragment>
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
