import { createContext, useContext, ReactNode } from "react";
import { useGetMe, getGetMeQueryKey } from "@workspace/api-client-react";
import type { AuthUser } from "@workspace/api-client-react";

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  refetch: () => void;
  setToken: (token: string) => void;
  clearToken: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  refetch: () => {},
  setToken: () => {},
  clearToken: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: user, isLoading, refetch } = useGetMe({
    query: {
      queryKey: getGetMeQueryKey(),
      retry: false,
      enabled: !!localStorage.getItem("auth_token"),
    },
  });

  function setToken(token: string) {
    localStorage.setItem("auth_token", token);
  }

  function clearToken() {
    localStorage.removeItem("auth_token");
  }

  return (
    <AuthContext.Provider
      value={{
        user: user ?? null,
        isLoading: !!localStorage.getItem("auth_token") && isLoading,
        refetch,
        setToken,
        clearToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
