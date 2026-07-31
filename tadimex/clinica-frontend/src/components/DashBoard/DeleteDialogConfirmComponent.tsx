import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Typography, Box, Alert } from '@mui/material';
import React, { useState } from 'react';
import { useAuth } from "../../context/AuthContext";
import { Link } from "react-router-dom"; // O tu router habitual

interface DeleteDialogConfirmComponentProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
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
  const [hasAppointmentsError, setHasAppointmentsError] = useState(false);
  const { employeeData } = useAuth();

  const handleConfirmDelete = async () => {
    setError('');
    setHasAppointmentsError(false);

    try {
      // 1. Validar la contraseña
      const response = await fetch(`${import.meta.env.VITE_API_SERVER}/api/v1/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          credential: employeeData?.phone_number || employeeData?.email,
          password: password,
        }),
      });

      if (!response.ok) {
        setError('Contraseña incorrecta');
        return;
      }

      // 2. Intentar ejecutar la eliminación
      await onConfirm();
      handleClose();
    } catch (err: any) {
      // Capturamos la excepción si el backend rechaza el borrado por tener citas
      setHasAppointmentsError(true);
    }
  };

  const handleClose = () => {
    setPassword('');
    setError('');
    setHasAppointmentsError(false);
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
        if (!hasAppointmentsError) handleConfirmDelete();
      }}>
        <DialogTitle>{title}</DialogTitle>
        <DialogContent>
          {hasAppointmentsError ? (
            <Alert severity="warning" sx={{ mt: 1 }}>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>No se puede eliminar este especialista</strong> porque tiene citas registradas en el historial.
              </Typography>
              <Typography variant="body2">
                Si ya no atiende en esta clínica, puedes cambiar su estado a <strong>Inactivo</strong> desde el módulo de{' '}
                <Typography
                  component={Link}
                  to="/dashboard/employees" // Ajusta la ruta a tu módulo de Personal/Horarios
                  onClick={handleClose}
                  sx={{ color: 'primary.main', fontWeight: 'bold', textDecoration: 'underline' }}
                >
                  Personal
                </Typography>.
              </Typography>
            </Alert>
          ) : (
            <>
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
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>
            {hasAppointmentsError ? 'Entendido / Cerrar' : 'Cancelar'}
          </Button>
          {!hasAppointmentsError && (
            <Button type="submit" color="error" disabled={!password}>
              Borrar
            </Button>
          )}
        </DialogActions>
      </form>
    </Dialog>
  );
};