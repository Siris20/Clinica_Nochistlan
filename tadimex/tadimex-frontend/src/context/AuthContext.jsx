import { createContext, useContext, useState } from "react";
import { useEffect } from "react";
import Loader from "../components/Loader";

const AuthContext = createContext({
  isLoggedIn: false, 
  token: '', 
  user: null, 
  employeeData: null,
  login: () => {},
  logout: () => {},
  checkAuthStatus: () => {},
  refreshEmployeeData: () => {}
}); 

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({children})=> {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [token, setToken] = useState('');
  const [user, setUser] = useState(null);
  const [employeeData, setEmployeeData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchEmployeeData = async (empleado_id) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_SERVER}/api/v1/empleado/${empleado_id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setEmployeeData(data);
      }
    } catch (error) {
      throw new Error('Failed to fetch employee data');
    }
  };

  //Funcion para obtener el usuario actual
  const fetchCurrentUser = async (authToken) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_SERVER}/api/v1/auth/current-user`, {
        headers: {
          "Content-Type": "application/json",
          'Authorization': `Bearer ${authToken}`
        }
      });
      
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);

        //Si el usuario es un empleado, obtener sus datos
        if(userData.empleado_id) {
          await fetchEmployeeData(userData.empleado_id);
        }

      } else {
        throw new Error('Failed to fetch user');
      }
    } catch (error) {
      logout();
    }
  };

  //Verificar el estado de autenticación
  const checkAuthStatus = async () => {
    setIsLoading(true);
    const storedToken = localStorage.getItem('token');
    
    if (storedToken) {
      try {
        // Verificar si el token es válido usando la ruta protegida
        const response = await fetch(`${import.meta.env.VITE_API_SERVER}/api/v1/auth/protected`, {
          headers: {
            'Authorization': `Bearer ${storedToken}`
          }
        });

        if (response.ok) {
          setIsLoggedIn(true);
          setToken(storedToken);
          await fetchCurrentUser(storedToken);
        } else {
          logout();
        }
      } catch (error) {
        logout();
      }
    }
    setIsLoading(false);
  };

  const refreshEmployeeData = async () => {
    if (user?.empleado_id) {
      await fetchEmployeeData(user.empleado_id);
    }
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);



  const login = async (newToken, credential) => {
    setToken(newToken);
    setIsLoggedIn(true);
    localStorage.setItem('token', newToken);
    await fetchCurrentUser(newToken);
  }

  const logout = () => {
    setIsLoggedIn(false);
    setToken('');
    setUser(null);
    setEmployeeData(null);
    localStorage.removeItem('token');
  }

  if (isLoading) {
    return <Loader />
  }

  return (
    <AuthContext.Provider value={{isLoggedIn, token, user, employeeData, login, logout, checkAuthStatus, refreshEmployeeData}}>
      {children}
    </AuthContext.Provider>
  )
}

export default AuthContext;