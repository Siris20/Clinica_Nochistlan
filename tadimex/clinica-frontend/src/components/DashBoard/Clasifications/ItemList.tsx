// ItemList.jsx
import React, { useState } from "react";
import { Box, Typography, Paper, IconButton, Stack } from "@mui/material";
import { MoreVert, NavigateBefore, NavigateNext } from "@mui/icons-material";
import SearchBar from "../../SearchBar";
import { ItemMenu } from "./ItemMenu";

export const ItemList = ({
  title,
  items,
  searchTerm,
  onSearchChange,
  onEdit,
  onDelete,
  selectedItemId, 
  onItemSelect,
  onAddItem,
  borderColor = "#FF5A5A",
  // Props para paginación
  page,
  totalItems,
  handleChangePage,
}) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  
  // Constante para filas por página (siempre 10)
  const rowsPerPage = 10;

  const handleMenuOpen = (event, item) => {
    event.stopPropagation(); 
    setAnchorEl(event.currentTarget);
    setSelectedItem(item);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedItem(null);
  };
  
  // Funciones para navegar entre páginas
  const handlePrevPage = () => {
    if (page > 0) {
      handleChangePage(null, page - 1);
    }
  };
  
  const handleNextPage = () => {
    const lastPage = Math.ceil(totalItems / rowsPerPage) - 1;
    if (page < lastPage) {
      handleChangePage(null, page + 1);
    }
  };

  const panelStyle = {
    height: "calc(100vh - 100px)",
    display: "flex",
    borderTop: `3px solid ${borderColor}`,
    flexDirection: "column",
    p: { xs: 1, sm: 2 },
    width: "100%",
  };

  const headerStyle = {
    display: "flex",
    textAlign: "left",
    flexDirection: "column",
    gap: 2,
    mb: 2,
  };

  const titleContainerStyle = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  };

  const paginationControlStyle = {
    display: "flex",
    alignItems: "center",
  };

  const contentStyle = {
    flex: 1,
    overflowY: "auto",
    border: "1px solid #e0e0e0",
    borderRadius: "4px",
  };

  const itemStyle = {
    p: 2,
    textAlign: "left",
    borderBottom: "1px solid #e0e0e0",
    "&:hover": {
      backgroundColor: "#e0e0e0",
    },
    cursor: "pointer",
  };
  
  // Calcular si las flechas deben estar deshabilitadas
  const isFirstPage = page === 0;
  const isLastPage = page >= Math.ceil(totalItems / rowsPerPage) - 1;

  return (
    <Paper elevation={2} sx={panelStyle}>
      <Box sx={headerStyle}>
        <Box sx={titleContainerStyle}>
          <Typography variant="h6">{title}</Typography>
          {totalItems > 0 && (
            <Box sx={paginationControlStyle}>
              <IconButton 
                size="small" 
                onClick={handlePrevPage} 
                disabled={isFirstPage}
                sx={{ color: isFirstPage ? 'rgba(0, 0, 0, 0.26)' : 'inherit' }}
              >
                <NavigateBefore />
              </IconButton>
              <Typography variant="body2" sx={{ mx: 1 }}>
                {`${page + 1} / ${Math.max(1, Math.ceil(totalItems / rowsPerPage))}`}
              </Typography>
              <IconButton 
                size="small" 
                onClick={handleNextPage} 
                disabled={isLastPage}
                sx={{ color: isLastPage ? 'rgba(0, 0, 0, 0.26)' : 'inherit' }}
              >
                <NavigateNext />
              </IconButton>
            </Box>
          )}
        </Box>
        <SearchBar
          searchTerm={searchTerm}
          setSearchTerm={onSearchChange}
          onAddContent={onAddItem}
        />
      </Box>
      <Box sx={contentStyle}>
        {items.length === 0 ? (
          <Box
            sx={{
              p: 3,
              textAlign: "center",
              color: "text.secondary",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "column",
              gap: 1,
            }}
          >
            <Typography variant="body1">
              No se encontraron resultados
            </Typography>
          </Box>
        ) : (
          items.map((item) => (
            <Box 
              key={item.id} 
              sx={{
                ...itemStyle,
                backgroundColor: selectedItemId === item.id ? "#e0e0e0" : "inherit",
                cursor: "pointer",
              }}
              onClick={() => onItemSelect(item)}
            >
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                }}
              >
                <Box>
                  <Typography>
                    {item.name}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ pl: 4 }}
                  >
                    {item.description}
                  </Typography>
                </Box>
                <IconButton
                  size="small"
                  onClick={(event) => handleMenuOpen(event, item)}
                >
                  <MoreVert />
                </IconButton>
                <ItemMenu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl) && selectedItem?.id === item.id}
                  onClose={handleMenuClose}
                  onEdit={() => {
                    onEdit(item);
                    handleMenuClose();
                  }}
                  onDelete={onDelete}
                  item={item}
                />
              </Box>
            </Box>
          ))
        )}
      </Box>
    </Paper>
  );
};