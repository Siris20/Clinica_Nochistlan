// ItemMenu.jsx
import React from 'react';
import { Menu, MenuItem, ListItemIcon, ListItemText } from "@mui/material";
import { Edit } from "@mui/icons-material";
import DeleteIcon from "@mui/icons-material/Delete";

export const ItemMenu = ({ anchorEl, open, onClose, onEdit, onDelete, item }) => {
  return (
    <Menu
      anchorEl={anchorEl}
      open={open}
      onClose={onClose}
    >
      <MenuItem onClick={()=> {
        onEdit(item);
        onClose();
      }}>
        <ListItemIcon>
          <Edit fontSize="small" />
        </ListItemIcon>
        <ListItemText>Editar</ListItemText>
      </MenuItem>
      <MenuItem onClick={()=> {
        onDelete(item);
        onClose();
      }}>
        <ListItemIcon>
          <DeleteIcon fontSize="small" color="error" />
        </ListItemIcon>
        <ListItemText sx={{ color: "error.main" }}>
          Eliminar
        </ListItemText>
      </MenuItem>
    </Menu>
  );
};