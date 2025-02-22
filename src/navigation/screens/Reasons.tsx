import { HeaderButton, Text } from '@react-navigation/elements';
import { FlatList, Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Fragment, useEffect, useLayoutEffect, useState } from 'react';
import localStorage from '@react-native-async-storage/async-storage';
import { useGlobalContext } from '../../store/global';
import { useNavigation } from '@react-navigation/native';

export function Reasons() {
  const navigation = useNavigation();
  const {handleSaveTrx, reason, setReason} = useGlobalContext();
  const [filteredContacts, setFilteredContacts] = useState<{name:string,selected:boolean}[]>([]);

  const save = () => {handleSaveTrx(); setReason(""); navigation.navigate('Thanks');}

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <HeaderButton onPress={save}>
          <Text>Skip</Text>
        </HeaderButton>
      ),
    });
  }, [navigation, handleSaveTrx]);

  useEffect(() => {
    const loadContacts = async () => {
      const data: {name:string,selected:boolean}[] = [
        {name:"Home & Family", selected:false},
        {name:"Hotels & Rent", selected:false},
        // {name:"Media & telecom", selected:false},
        // {name:"Paychecks", selected:false},
        // {name:"Pets", selected:false},
        {name:"Pubs & bars", selected:false},
        {name:"Shopping", selected:false},
        // {name:"Top-ups", selected:false},
        {name:"Transactions & payments", selected:false},
        {name:"Transport", selected:false},
        {name:"Travels & holidays", selected:false},
        {name:"Other", selected:false},
      ] 
      
      if (data.length > 0) {
        setFilteredContacts(data);
      }
    };

    loadContacts();
  }, []);

  const renderItem = ({ item }: {item: {name:string,selected:boolean}}) => (
    <TouchableOpacity style={{...styles.contact, backgroundColor: item.name === reason ? '#fff' : 'none'}} onPress={() => {setReason(rsn => rsn === item.name? '' : item.name); setFilteredContacts(prev => prev.map(p=> ({...p, selected: p.name=== item.name})))}}>
      <Image source={{uri: `https://ui-avatars.com/api/?size=30&background=random&uppercase=false&name=${item.name.replaceAll(' ', '+')}`, width: 30, height: 30}} />
      <View>
        <Text>{item.name}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <Fragment>
      <FlatList
        data={filteredContacts}
        keyExtractor={(item) => item.name}
        renderItem={renderItem}
        extraData={reason}
      />
      <TouchableOpacity style={styles.button} onPress={save}>
        <Text style={styles.buttonText}>Save</Text>
      </TouchableOpacity>
    </Fragment>
  );
}

const styles = StyleSheet.create({
  button: {
    width: '100%',
    height: 50,
    backgroundColor: '#6B00FE',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 5,
    marginBottom: 20,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    textTransform: 'uppercase'
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
