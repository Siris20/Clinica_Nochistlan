import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Typography } from '@mui/material'
import React, { useState } from 'react'
import { useAuth } from "../../context/AuthContext";

interface DeleteDialogConfirmComponentProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
}

export const DeleteDialogConfirmComponent: React.FC<DeleteDialogConfirmComponentProps> = ({
  open,
  onClose,
  onConfirm,
  title = 'Confirmar eliminación',
  message = '¿Estás seguro de eliminar este registro? Esta acción no se puede deshacer.',
}) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { employeeData } = useAuth();

  const handleConfirmDelete = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_SERVER}/api/v1/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          credential: employeeData?.phone_number || employeeData?.email,
          password: password
        }),
      });

      if (response.ok) {
        onConfirm();
        handleClose();
      } else {
        setError('Contraseña incorrecta');
      }
    } catch (error) {
      setError('Error al verificar credenciales');
    }
  };

  const handleClose = () => {
    setPassword('');
    setError('');
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="xs"
      disableAutoFocus
      disableEnforceFocus
      disableRestoreFocus
      PaperProps={{ sx: { zIndex: 1500 } }}
      BackdropProps={{ sx: { zIndex: 1400 } }}
    >
      <form onSubmit={(e) => {
        e.preventDefault();
        handleConfirmDelete();
      }}>
        <DialogTitle>{title}</DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 2 }}>{message}</Typography>
          <Typography sx={{ mb: 1 }}>Ingrese su contraseña para confirmar</Typography>
          <TextField
            fullWidth
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={!!error}
            helperText={error}
            size="small"
            autoComplete="confirm-password"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancelar</Button>
          <Button type="submit" color="error" disabled={!password}>
            Borrar
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};