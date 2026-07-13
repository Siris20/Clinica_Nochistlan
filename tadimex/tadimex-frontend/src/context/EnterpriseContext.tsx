import React,{ createContext, useContext, useState, useEffect } from 'react';
import { useEnterprises } from '../hooks/Enterprises/useEnterprises';

const EnterpriseContext = createContext({
  selectedEnterprise: null,
  setSelectedEnterprise: () => {},
  enterprises: [],
  refreshEnterprises : () => {}
});

export const EnterpriseProvider = ({ children }) => {
  const { enterprises, handleGetEnterprises } = useEnterprises();
  const [selectedEnterprise, setSelectedEnterprise] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const refreshEnterprises = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  useEffect(()=> {
    handleGetEnterprises();
  }, [refreshTrigger]);

  useEffect(() => {
    // Only set initial selection if there's no selection AND enterprises exist
    if (!selectedEnterprise && enterprises?.length > 0) {
      setSelectedEnterprise(enterprises[0].id);
    }
    // Verify selected enterprise still exists after updates
    else if (selectedEnterprise && enterprises?.length > 0) {
      const enterpriseExists = enterprises.some(e => e.id === selectedEnterprise);
      if (!enterpriseExists) {
        setSelectedEnterprise(enterprises[0].id);
      }
    }
  }, [enterprises, selectedEnterprise]);

  return (
    <EnterpriseContext.Provider value={{ selectedEnterprise, setSelectedEnterprise, enterprises, refreshEnterprises }}>
      {children}
    </EnterpriseContext.Provider>
  );
};

export const useEnterprise = () => useContext(EnterpriseContext);