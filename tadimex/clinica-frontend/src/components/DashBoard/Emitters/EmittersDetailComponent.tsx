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
import PersonIcon from "@mui/icons-material/Person";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import ReceiptIcon from "@mui/icons-material/Receipt";
import BadgeIcon from "@mui/icons-material/Badge";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import VpnKeyIcon from "@mui/icons-material/VpnKey";
import KeyIcon from "@mui/icons-material/Key";

export const EmittersDetailComponent = ({ open, setOpen, emitter }) => {
  const handleCloseDialog = () => {
    setOpen(false);
  };

  if (!emitter) return null;

  const fullAddress = `${emitter.calle} ${emitter.numero_exterior}${
    emitter.numero_interior ? `, Int. ${emitter.numero_interior}` : ""
  }, ${emitter.colonia}, ${emitter.localidad}, ${emitter.municipio}, ${emitter.estado}, CP ${emitter.codigo_postal}`;

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
          Detalles de Emisor
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
                      Razón Social
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
                      {emitter.razon_social}
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
                      {emitter.rfc}
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
                      {emitter.tipo_persona}
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
                      {emitter.regimen_fiscal}
                    </Typography>
                  </Box>
                </Box>
              </Box>

              {/* Certificado Digital */}
              <Box sx={{ gridColumn: "1 / -1" }}>
                <Typography
                  sx={{
                    fontFamily: "Inter, sans-serif",
                    fontWeight: "bold",
                    fontSize: "14px",
                    marginBottom: 2,
                  }}
                >
                  Certificado Digital
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
                      Número de Certificado
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
                      {emitter.numero_certificado}
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
                      Certificado (.cer)
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
                      {emitter.certificado_path}
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
                      Clave Privada (.key)
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
                      {emitter.clave_privada_path}
                    </Typography>
                  </Box>
                </Box>
              </Box>

              {/* Información Bancaria */}
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
                  Información Bancaria
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
                      Banco
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
                      {emitter.banco}
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
                      Cuenta Bancaria
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
                      {emitter.numero_cuenta}
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
                      Clabe Interbancaria
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
                      {emitter.clabe}
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
                      Número de Tarjeta
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
                      {emitter.numero_tarjeta}
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
            </Box>
          </Grid>
        </Grid>
      </DialogContent>
    </Dialog>
  );
};
