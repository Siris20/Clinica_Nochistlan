import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material'
import React from 'react'

export const FilterSortDialog = ({open, onClose, title, options, onSelect}) => {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <Box display="flex" flexDirection="column" gap={2}>
          {options.map((option, index)=> (
            <Button
              key={index}
              variant="outlined"
              onClick={() => onSelect(option.value)}
              >
              {option.label}
              </Button>
          ))}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="error">Cerrar</Button>
      </DialogActions>
    </Dialog>
  )
}
