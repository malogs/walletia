declare module '*.png' {
  const value: import('react-native').ImageSourcePropType;
  export default value;
}

declare module '*.jpg' {
  const value: import('react-native').ImageSourcePropType;
  export default value;
}

interface Navigator {
  contacts?: {
    select: (properties: string[], options?: { multiple: boolean }) => Promise<any>;
  };
}

declare module "next-pwa" {
  import { NextConfig } from "next";
  export default function withPWA(config: NextConfig): NextConfig;
}

declare module "react-native-immediate-phone-call" {
  import { immediatePhoneCall } from "react-native-immediate-phone-call";
  export default { immediatePhoneCall } ;
}

interface IContact {
  name: string;
  phone: string;
  name: string;
  amount?: string;
}

interface ITransaction {
  date: string;
  reason?: string;
  receipient: IContact;
  charges: number;
  amount: number;
  group?: string;
  time?: string;
}
