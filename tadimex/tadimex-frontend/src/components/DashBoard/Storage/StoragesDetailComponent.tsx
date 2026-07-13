import {
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography,
  Grid,
  Box,
  Divider,
} from "@mui/material";
import React from "react";
import CloseIcon from "@mui/icons-material/Close";
import BusinessIcon from "@mui/icons-material/Business";
import PhoneIcon from "@mui/icons-material/Phone";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import DescriptionIcon from "@mui/icons-material/Description";

export const StoragesDetailComponent = ({ open, setOpen, storage }) => {
  const handleCloseDialog = () => {
    setOpen(false);
  };

  if (!storage) return null;

  return (
    <Dialog
      open={open}
      onClose={handleCloseDialog}
      PaperProps={{
        sx: {
          width: "630px",
          maxWidth: "none",
          height: "auto",
          maxHeight: "80vh",
          borderRadius: 5,
        },
      }}
    >
      <DialogTitle
        sx={{
          fontFamily: "Inter, sans-serif",
          fontWeight: "600",
          fontSize: 24,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          pb: 2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          Detalles de almacén
        </Box>
        <IconButton
          onClick={handleCloseDialog}
          sx={{
            borderRadius: "100%",
            position: "absolute",
            right: 10,
            top: 10,
            backgroundColor: "#D01313",
            width: 24,
            height: 24,
            color: "#fff",
            "&:hover": {
              backgroundColor: "#D01319",
            },
          }}
        >
          <CloseIcon sx={{ fontSize: "20px" }} />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ fontFamily: "Open Sans, sans-serif", p: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 3,
                mb: 3,
              }}
            >
              <Box>
                <Typography
                  sx={{
                    fontFamily: "Inter, sans-serif",
                    fontWeight: "bold",
                    fontSize: "14px",
                    marginBottom: 2,
                  }}
                >
                  Nombre
                </Typography>
                <Typography
                  sx={{
                    fontWeight: 500,
                    fontSize: 14,
                    backgroundColor: "#f5f5f5",
                    p: 1.5,
                    borderRadius: 1,
                  }}
                >
                  {storage.name}
                </Typography>
              </Box>

              <Box>
                <Typography
                  sx={{
                    fontFamily: "Inter, sans-serif",
                    fontWeight: "bold",
                    fontSize: "14px",
                    marginBottom: 2,
                  }}
                >
                  Tipo
                </Typography>
                <Typography
                  sx={{
                    fontWeight: 500,
                    fontSize: 14,
                    backgroundColor: "#f5f5f5",
                    p: 1.5,
                    borderRadius: 1,
                  }}
                >
                  {storage.type}
                </Typography>
              </Box>

              <Box sx={{ gridColumn: "1 / -1" }}>
                <Typography
                  sx={{
                    fontFamily: "Inter, sans-serif",
                    fontWeight: "bold",
                    fontSize: "14px",
                    marginBottom: 2,
                  }}
                >
                  Dirección
                </Typography>
                <Typography
                  sx={{
                    fontWeight: 500,
                    fontSize: 14,
                    backgroundColor: "#f5f5f5",
                    p: 1.5,
                    borderRadius: 1,
                  }}
                >
                  {`${storage.calle} ${storage.numero_exterior}${
                    storage.numero_interior
                      ? ` Int. ${storage.numero_interior}`
                      : ""
                  }, ${storage.colonia}, ${storage.municipio}, ${
                    storage.estado
                  }, CP. ${storage.codigo_postal}`}
                </Typography>
              </Box>
            </Box>

            <Divider sx={{ my: 3 }} />

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 3,
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  fontSize: 16,
                  fontWeight: 600,
                  mb: 2,
                  gridColumn: "1 / -1",
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                <DescriptionIcon /> Información Adicional
              </Typography>

              <Box>
                <Typography
                  sx={{
                    fontFamily: "Inter, sans-serif",
                    fontWeight: "bold",
                    fontSize: "14px",
                    marginBottom: 2,
                  }}
                >
                  ID Sucursal
                </Typography>
                <Typography
                  sx={{
                    fontWeight: 500,
                    fontSize: 14,
                    backgroundColor: "#f5f5f5",
                    p: 1.5,
                    borderRadius: 1,
                  }}
                >
                  {storage.sucursal_id}
                </Typography>
              </Box>

              <Box>
                <Typography
                  sx={{
                    fontFamily: "Inter, sans-serif",
                    fontWeight: "bold",
                    fontSize: "14px",
                    marginBottom: 2,
                  }}
                >
                  ID Encargado
                </Typography>
                <Typography
                  sx={{
                    fontWeight: 500,
                    fontSize: 14,
                    backgroundColor: "#f5f5f5",
                    p: 1.5,
                    borderRadius: 1,
                  }}
                >
                  {storage.encargado_id}
                </Typography>
              </Box>

              <Box>
                <Typography
                  sx={{
                    fontFamily: "Inter, sans-serif",
                    fontWeight: "bold",
                    fontSize: "14px",
                    marginBottom: 2,
                  }}
                >
                  Fecha de creación
                </Typography>
                <Typography
                  sx={{
                    fontWeight: 500,
                    fontSize: 14,
                    backgroundColor: "#f5f5f5",
                    p: 1.5,
                    borderRadius: 1,
                  }}
                >
                  {new Date(storage.created_at).toLocaleString()}
                </Typography>
              </Box>

              <Box>
                <Typography
                  sx={{
                    fontFamily: "Inter, sans-serif",
                    fontWeight: "bold",
                    fontSize: "14px",
                    marginBottom: 2,
                  }}
                >
                  Última actualización
                </Typography>
                <Typography
                  sx={{
                    fontWeight: 500,
                    fontSize: 14,
                    backgroundColor: "#f5f5f5",
                    p: 1.5,
                    borderRadius: 1,
                  }}
                >
                  {new Date(storage.updated_at).toLocaleString()}
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </DialogContent>
    </Dialog>
  );
};
