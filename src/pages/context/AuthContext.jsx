import { createContext, useContext, useState } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [usuario, setUsuario] = useState(null);

  const guardarToken = (tk) => {
    setToken(tk);
  };

  const guardarUsuario = (datosUsuario) => {
    setUsuario(datosUsuario);
  };

  const login = (tk, datosUsuario) => {
    guardarToken(tk);
    guardarUsuario(datosUsuario);
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        guardarToken,
        usuario,
        guardarUsuario,
        login,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};