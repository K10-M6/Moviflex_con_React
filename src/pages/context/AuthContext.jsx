import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => {
    return localStorage.getItem("app_token") || null
  });
  
  const [usuario, setUsuario] = useState(() => {
    const userSaved = localStorage.getItem("app_usuario");
    return userSaved ? JSON.parse(userSaved) : null;
  });

  useEffect(() => {
    if (token && usuario) {
      localStorage.setItem("app_token", token);
      localStorage.setItem("app_usuario", JSON.stringify(usuario));
    }
  }, [token, usuario]);

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

  const logout = () => {
    setToken(null);
    setUsuario(null);
    localStorage.removeItem("app_token");
    localStorage.removeItem("app_usuario");
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        guardarToken,
        usuario,
        guardarUsuario,
        login,
        logout,
        setUsuario
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};