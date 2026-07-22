import React, { createContext, useContext, useState, useEffect } from 'react';
import { useBranches } from '../hooks/Branches/useBranches';
import { useEnterprise } from './EnterpriseContext';

const BranchContext = createContext({
  selectedBranch: null,
  setSelectedBranch: () => {},
  branches: [], 
  refreshBranches: () => {}
});

export const BranchProvider = ({ children }) => {
  const { selectedEnterprise } = useEnterprise();
  const { filteredBranches, handleGetBranches } = useBranches(selectedEnterprise);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const refreshBranches = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  useEffect(()=> {
    handleGetBranches();
  }, [refreshTrigger]);

  useEffect(() => {
    if (!selectedBranch && filteredBranches?.length > 0) {
      setSelectedBranch(filteredBranches[0].id);
    }
    else if (selectedBranch && filteredBranches?.length > 0) {
      const branchExists = filteredBranches.some(b => b.id === selectedBranch);
      if (!branchExists) {
        setSelectedBranch(filteredBranches[0].id);
      }
    }
    // Si no hay sucursales disponibles, limpiar la selección
    else if (filteredBranches?.length === 0) {
      setSelectedBranch(null);
    }
  }, [filteredBranches, selectedBranch]);

  return (
    <BranchContext.Provider value={{ 
      selectedBranch, 
      setSelectedBranch, 
      branches: filteredBranches, 
      refreshBranches
    }}>
      {children}
    </BranchContext.Provider>
  );
};

export const useBranch = () => useContext(BranchContext);