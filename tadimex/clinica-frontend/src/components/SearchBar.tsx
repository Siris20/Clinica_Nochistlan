import React from 'react';
import { TextField, IconButton, Box } from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';
import AddIcon from '@mui/icons-material/Add';

interface SearchBarProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  showIcons?: boolean;
  onAddContent?: () => void;
  onFilter?: () => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ 
  searchTerm, 
  setSearchTerm, 
  showIcons = true, 
  onAddContent, 
  onFilter 
}) => {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        backgroundColor: '#F8F9FA',
        border: '1px solid #E5E7EB',
        borderRadius: '12px',
        overflow: 'hidden',
        width: '100%',
        maxWidth: 400,
        height: 44,
        '&:focus-within': {
          borderColor: '#3B82F6',
          boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)',
        },
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          paddingLeft: '12px',
          color: '#9CA3AF',
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M21 20l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" 
                stroke="currentColor" 
                strokeWidth="1.5" 
                fill="none" 
                strokeLinecap="round" 
                strokeLinejoin="round"
          />
        </svg>
      </Box>
      
      <TextField
        placeholder="Buscar..."
        variant="standard"
        InputProps={{ 
          disableUnderline: true,
          sx: {
            fontSize: '14px',
            color: '#374151',
            '&::placeholder': {
              color: '#9CA3AF',
              opacity: 1,
            },
          }
        }}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        sx={{
          flexGrow: 1,
          padding: '0 8px',
          '& .MuiInputBase-input': {
            padding: 0,
            fontSize: '14px',
            '&::placeholder': {
              color: '#9CA3AF',
              opacity: 1,
            },
          },
        }}
      />
      
      {showIcons && (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {onFilter && (
            <IconButton 
              onClick={onFilter}
              sx={{ 
                padding: '8px',
                borderRadius: '6px',
                marginRight: '4px',
                color: '#6B7280',
                '&:hover': {
                  backgroundColor: '#E5E7EB',
                  color: '#374151',
                },
              }}
            >
              <FilterListIcon sx={{ fontSize: '18px' }} />
            </IconButton>
          )}
          
          {onAddContent && (
            <IconButton 
              onClick={onAddContent}
              sx={{ 
                padding: '6px 12px',
                borderRadius: '8px',
                marginRight: '8px',
                backgroundColor: '#F3F4F6',
                color: '#374151',
                fontSize: '14px',
                fontWeight: 500,
                minWidth: '32px',
                '&:hover': {
                  backgroundColor: '#E5E7EB',
                },
              }}
            >
              <AddIcon sx={{ fontSize: '16px' }} />
            </IconButton>
          )}
        </Box>
      )}
    </Box>
  );
};

export default SearchBar;