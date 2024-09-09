import { createContext } from "react";

interface AuthContextType {
    authStatus: boolean;
    setAuthStatus: (status: boolean) => void;
}

// Create AuthContext with default values
export const AuthContext = createContext<AuthContextType>({
    authStatus: false,
    setAuthStatus: (status: boolean) => {
        console.warn("setAuthStatus called without provider");
    },
});

export const AuthProvider = AuthContext.Provider;

export default AuthContext;
