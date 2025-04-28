import { createContext } from "react";

export interface User {
  $id: string;
  email: string;
  name?: string;
  [key: string]: any;
}

interface AuthContextType {
  authStatus: boolean;
  setAuthStatus: (status: boolean) => void;
  user: User | null;
  setUser: (user: User | null) => void;
}

export const AuthContext = createContext<AuthContextType>({
  authStatus: false,
  setAuthStatus: () => {
    console.warn("setAuthStatus called without provider");
  },
  user: null,
  setUser: () => {
    console.warn("setUser called without provider");
  },
});

export const AuthProvider = AuthContext.Provider;

export default AuthContext;
