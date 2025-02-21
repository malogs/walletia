import React, {
  createContext,
  useContext,
  ReactNode,
  useState,
  useEffect,
} from 'react';

interface GlobalContextType {
  isLogged: boolean;
  setReceipient: (value: IContact) => void;
  receipient: IContact | null;
  resetReceipient: () => void
}

const GlobalContext = createContext<GlobalContextType | undefined>(undefined);

interface GlobalProviderProps {
  children: ReactNode;
}

export const GlobalProvider: React.FC<GlobalProviderProps> = ({ children }) => {
  const initialReceipient = {phone: '', amount: '', name: 'unkown'};

  const [receipient, setReceipient] = useState<IContact | null>(initialReceipient);

  const resetReceipient:() => void = () => setReceipient(initialReceipient);

  return (
    <GlobalContext.Provider value={{ isLogged: true, setReceipient, receipient, resetReceipient }}>
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
