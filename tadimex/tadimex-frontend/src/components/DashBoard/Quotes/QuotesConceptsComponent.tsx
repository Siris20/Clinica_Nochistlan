import React from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Grid,
  Button,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { createQuotePDF } from "./quotes";

export const QuotesExportComponent = ({ open, setOpen, quote }) => {
  if (!quote) return null;

  const exportButtons = [
    { title: "SYSCAM", color: "#4caf50" },
    { title: "ELECNET", color: "#f50057" },
    { title: "CENTRALGPS", color: "#2196f3" },
    { title: "IZCALTIA", color: "#ff9800" },
  ];

  const handleExport = (letterhead) => {
    const pdf = createQuotePDF(quote, letterhead);
    pdf.save(`cotizacion-${letterhead.toLowerCase()}-${quote.id}.pdf`);
  };

  return (
    <Dialog
      open={open}
      onClose={() => setOpen(false)}
      PaperProps={{
        sx: { width: "500px", borderRadius: 2 },
      }}
    >
      <DialogTitle
        sx={{
          fontSize: 18,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          py: 1,
        }}
      >
        Selecciona el membrete
        <IconButton
          onClick={() => setOpen(false)}
          sx={{
            borderRadius: "50%",
            backgroundColor: "#D01313",
            width: 20,
            height: 20,
            color: "#fff",
            "&:hover": { backgroundColor: "#b81111" },
          }}
        >
          <CloseIcon sx={{ fontSize: 16 }} />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ p: 2 }}>
        <Grid container spacing={2}>
          {exportButtons.map((button) => (
            <Grid item xs={6} key={button.title}>
              <Button
                onClick={() => handleExport(button.title)}
                variant="contained"
                sx={{
                  width: "100%",
                  height: "2.5rem",
                  fontSize: 14,
                  bgcolor: button.color,
                  "&:hover": {
                    bgcolor: button.color,
                    opacity: 0.9,
                  },
                }}
              >
                {button.title}
              </Button>
            </Grid>
          ))}
        </Grid>
      </DialogContent>
    </Dialog>
  );
};
