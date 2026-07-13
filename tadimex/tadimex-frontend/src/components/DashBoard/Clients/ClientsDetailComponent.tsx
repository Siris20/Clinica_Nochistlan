import {
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography,
  Grid,
  Box,
  Chip,
} from "@mui/material";
import React from "react";
import CloseIcon from "@mui/icons-material/Close";

export const ClientsDetailComponent = ({ open, setOpen, client }) => {
  const handleCloseDialog = () => {
    setOpen(false);
  };

  if (!client) return null;

  const fullAddress = `${client.calle} ${client.numero_exterior}${
    client.numero_interior ? `, Int. ${client.numero_interior}` : ""
  }, ${client.colonia}, ${client.localidad}, ${client.municipio}, ${client.estado}, CP ${client.codigo_postal}`;


  const getEstadoColor = (estado) => {
    switch (estado?.toLowerCase()) {
      case "prospecto":
        return { color: "#ff9800", bg: "#fff3e0" };
      case "cliente":
        return { color: "#4caf50", bg: "#e8f5e8" };
      default:
        return { color: "#757575", bg: "#f5f5f5" };
    }
  };

  const estadoColors = getEstadoColor(client?.estado || "Sin estado");

  return (
    <Dialog
      open={open}
      onClose={handleCloseDialog}
      PaperProps={{
        sx: {
          width: { xs: "95%", sm: "64rem" },
          maxWidth: "none",
          height: { xs: "auto", sm: "41rem" },
          maxHeight: { xs: "95vh", sm: "none" },
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
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          Detalles de cliente
          <Chip
            label={client.estado?.toUpperCase() || "SIN ESTADO"}
            sx={{
              backgroundColor: estadoColors.bg,
              color: estadoColors.color,
              fontWeight: "bold",
              fontSize: "0.75rem",
            }}
          />
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
                  Información Fiscal
                </Typography>
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
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
                      Nombre Fiscal
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
                      {client.nombre_fiscal}
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
                      RFC
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
                      {client.rfc}
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
                      Tipo de Persona
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
                      {client.tipo_persona}
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
                      Régimen Fiscal
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
                      {client.regimen_fiscal}
                    </Typography>
                  </Box>
                </Box>
              </Box>

              {/* Información de contacto */}
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
                  Información de Contacto
                </Typography>
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
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
                      Nombre de Contacto
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
                      {client.contact_name}
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
                      Alias
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
                      {client.alias}
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
                      Teléfono Fijo
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
                      {client.land_line}
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
                      Teléfono Móvil
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
                      {client.phone_number}
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
                      {client.email}
                    </Typography>
                  </Box>
                </Box>
              </Box>

              {/* Dirección */}
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
                  {fullAddress}
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
                  {client?.observaciones || "Sin observaciones"}
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </DialogContent>
    </Dialog>
  );
};
