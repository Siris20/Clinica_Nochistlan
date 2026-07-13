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

export const SuppliersDetailComponent = ({ open, setOpen, supplier }) => {
  const handleCloseDialog = () => {
    setOpen(false);
  };

  if (!supplier) return null;

  const fullAddress = `${supplier.calle} ${supplier.numero_exterior}${
    supplier.numero_interior ? `, Int. ${supplier.numero_interior}` : ""
  }, ${supplier.colonia}, ${supplier.localidad}, ${supplier.municipio}, ${supplier.estado}, CP ${supplier.codigo_postal}`;

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
          Detalles de Proveedor
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
              {/* Información fiscal */}
              <Box sx={{ gridColumn: "1 / -1" }}>
                <Typography
                  variant="h6"
                  sx={{
                    fontSize: 16,
                    fontWeight: 600,
                    mb: 2,
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  Información Principal
                </Typography>
                <Box
                  sx={{
                    display: "grid",
                    gap: 2,
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
                      {supplier.nombre}
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
                      Correo Electrónico
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
                      {supplier.email}
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
                      Telefono
                    </Typography>
                    <Typography
                      sx={{
                        fontWeight: 500,
                        fontSize: 14,
                        backgroundColor: "#f5f5f5",
                        p: 1.5,
                        borderRadius: 1,
                        textTransform: "capitalize",
                      }}
                    >
                      {supplier.telefono || "No disponible"}
                    </Typography>
                  </Box>
                </Box>
              </Box>
              {/* Dirección */}
              <Box sx={{ gridColumn: "1 / -1" }}>
                <Typography
                  variant="h6"
                  sx={{
                    fontSize: 16,
                    fontWeight: 600,
                    mb: 2,
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
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
                  {fullAddress}
                </Typography>
              </Box>

              {/* Observaciones */}
              <Box sx={{ gridColumn: "1 / -1" }}>
                <Typography
                  variant="h6"
                  sx={{
                    fontSize: 16,
                    fontWeight: 600,
                    mb: 2,
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  Observaciones
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
                  {supplier.observaciones || "No hay observaciones"}
                </Typography>
              </Box>

            </Box>
          </Grid>
        </Grid>
      </DialogContent>
    </Dialog>
  );
};
