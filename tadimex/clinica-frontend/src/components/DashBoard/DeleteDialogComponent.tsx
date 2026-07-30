import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material'
import React from 'react'

export const DeleteDialogComponent = ({title, message, deleteDialogOpen, handleCloseDeleteDialog, handleDelete}) => {
  
  return (
    <>
      <Dialog open={deleteDialogOpen} onClose={handleCloseDeleteDialog}>
        <DialogTitle>{title}</DialogTitle>
        <DialogContent>
          {message}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Cancelar</Button>
          <Button onClick={handleDelete} color="error">
            Borrar
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
