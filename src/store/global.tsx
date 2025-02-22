import React, {
  createContext,
  useContext,
  ReactNode,
  useState,
  useEffect,
} from 'react';
import localStorage from '@react-native-async-storage/async-storage';

interface GlobalContextType {
  isLogged: boolean;
  setReceipient: (value: IContact) => void;
  setCurrTransaction: (value: ITransaction) => void;
  receipient: IContact | null;
  resetReceipient: () => void;
  handleSaveTrx: () => void;
  currTransaction: ITransaction|null;
  reason: string;
  setReason: (value: string | ((rsn: string) => string)) => void;
}

const GlobalContext = createContext<GlobalContextType | undefined>(undefined);

interface GlobalProviderProps {
  children: ReactNode;
}

export const GlobalProvider: React.FC<GlobalProviderProps> = ({ children }) => {
  const initialReceipient = {phone: '', amount: '', name: 'unkown'};

  const [receipient, setReceipient] = useState<IContact | null>(initialReceipient);
  const [currTransaction, setCurrTransaction] = useState<ITransaction | null>(null);
  const [reason, setReason] = useState("");
  
  const handleSaveTrx = async () => {
    const saved = JSON.parse(
      (await localStorage.getItem('maL_transactions')) ?? '[]'
    );
    saved.push({
      ...currTransaction,
      reason
    });
    await localStorage.setItem('maL_transactions', JSON.stringify(saved));
    setCurrTransaction(null);
    // if (isNew && receipient.name !== 'unkown') {
    //   const savedContacts = JSON.parse(
    //     (await localStorage.getItem('maL_contacts')) ?? '[]'
    //   );
    //   savedContacts.push(receipient);
    //   localStorage.setItem('maL_contacts', JSON.stringify(savedContacts));
    // }
  }

  const resetReceipient:() => void = () => setReceipient(initialReceipient);

  return (
    <GlobalContext.Provider value={{ 
        isLogged: true,
        setReceipient,
        receipient,
        resetReceipient,
        currTransaction,
        setCurrTransaction,
        reason,
        setReason,
        handleSaveTrx,
      }}>
      {children}
    </GlobalContext.Provider>
  );
};

export const useGlobalContext = (): GlobalContextType => {
  const context = useContext(GlobalContext);
  if (!context)
    throw new Error('useGlobalContext must be used within a GlobalProvider');

  return context;
};

export default GlobalProvider;
