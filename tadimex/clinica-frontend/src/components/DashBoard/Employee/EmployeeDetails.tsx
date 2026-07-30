import React from "react";
import CloseIcon from "@mui/icons-material/Close";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography,
  Box,
  Chip,
} from "@mui/material";

export const EmployeeDetails = ({ open, setOpen, user, employees }) => {
  const handleCloseDialog = () => {
    setOpen(false);
  };

  const getImmediateBossName = (id) => {
    if (!id) return "Sin jefe asignado";
    const boss = employees.find((employee) => employee.id === id);
    return boss ? `${boss.name} ${boss.last_name}` : "Sin jefe asignado";
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return "https://avatar.iran.liara.run/public/28";
  
    if (imagePath.startsWith("data:")) {
      return imagePath;
    }
  
    // Asegúrate de que las rutas usen forward slashes
    const normalizedPath = imagePath.replace(/\\/g, '/');
    return `${import.meta.env.VITE_API_SERVER}/${normalizedPath}`;
  };

  if (!user) return null;

  const userDetails = {
    personalInfo: [
      { title: "Nombre", value: user.name },
      { title: "Apellidos", value: user.last_name },
      { title: "Fecha de Nacimiento", value: user.birth_date },
      { title: "Curp", value: user.curp },
      { title: "Género", value: user.gender },
    ],
    contactInfo: [
      { title: "Teléfono Celular", value: user.phone_number },
      { title: "Télefono de Emergencia", value: user.emergency_phone },
      { title: "Nombre de Emergencia", value: user.emergency_phone_name },
      { title: "Relación", value: user.emergency_phone_relationship },
      { title: "Calle", value: user.calle },
      { title:"Número Exterior", value: user.numero_exterior },
      { title: "Número Interior", value: user.numero_interior },
      { title: "Colonia", value: user.colonia },
      { title: "Código Postal", value: user.codigo_postal },
      { title: "Localidad", value: user.localidad },
      { title: "Municipio", value: user.municipio },
      { title: "Estado", value: user.estado },
      { title: "Email", value: user.email },
    ],
    additionalInfo: [
      { title: "Tipo de Sangre", value: user.blood_type },
      { title: "Alergias", value: user.allergies },
      { title: "Talla de Calzado", value: user.shoe_size },
      { title: "Talla de Uniforme", value: user.uniform_size },
    ],
    jobInfo: [
      { title: "Nivel de Estudios", value: user.education_level },
      { title: "Licencia de Conducir", value: user.drivers_license },
      { title: "Tipo de Contrato", value: user.contract_term },
      { title: "Fecha de Ingreso", value: user.entry_date },
      { title: "Fecha de Término", value: user.contract_end_date },
      { title: "Sueldo", value: `$${user.salary}` },
      { title: "Salario base de cotización", value: `$${user.base_salary}` },
      { title: "Periodo de Pago", value: user.payment_period },
      { title: "NSS", value: user.nss },
      { title: "RFC", value: user.rfc },
      { title: "Crédito Infonavit", value: user.infonavit_credit },
      { title: "Puesto", value: user.position },
      { title: "Código de Empleado", value: user.employee_code },
      { title: "Departamento", value: user.department },
      {
        title: "Jefe Inmediato",
        value: getImmediateBossName(user.immediate_boss_id),
      },
    ],
    imageUrl: getImageUrl(user.image),
    status: user.status,
  };

  // Función para obtener el color del Chip de estatus
  const getStatusColor = (status) => {
    switch (status) {
      case "ACTIVO":
        return "success";
      case "INACTIVO":
        return "error";
      case "VACACIONES":
        return "info";
      case "INCAPACIDAD":
        return "warning";
      default:
        return "default";
    }
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={handleCloseDialog}
        PaperProps={{
          sx: {
            width: { xs: "95%", sm: "730px" },
            maxWidth: "none",
            height: { xs: "95%", sm: "95%" },
            maxHeight: "none",
            borderRadius: { xs: 5, sm: 5 },
            m: { xs: 0, sm: 2 },
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
          }}
        >
          Detalles del personal
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
        <DialogContent>
          <Box sx={{ width: "100%" }}>
            <Typography
              sx={{
                fontFamily: "Inter, sans-serif",
                fontWeight: "bold",
                fontSize: "14px",
                marginBottom: 2,
              }}
            >
              Información Personal
            </Typography>

            {/* Mobile Image */}
            <Box
              sx={{
                display: { xs: "flex", md: "none" },
                justifyContent: "center",
                alignItems: "center",
                mb: 3,
                position: "relative",
                width: "100%",
              }}
            >
              <Box sx={{ position: "relative" }}>
                <Chip
                  label={userDetails.status}
                  color={getStatusColor(userDetails.status)}
                  sx={{
                    position: "absolute",
                    top: -10,
                    left: "50%",
                    transform: "translateX(-50%)",
                    zIndex: 1,
                    fontWeight: "bold",
                  }}
                />
                <Box
                  component="img"
                  src={userDetails.imageUrl}
                  alt="Imagen del usuario"
                  sx={{
                    width: "165px",
                    height: "165px",
                    borderRadius: "50%",
                    objectFit: "cover",
                    border: "2px solid #ddd",
                  }}
                />
              </Box>
            </Box>

            <Box
              sx={{
                display: { xs: "none", md: "flex" },
                justifyContent: "space-between",
                alignItems: "flex-start",
                gap: 2,
                mx: "28px",
              }}
            >
              {/* Información a la izquierda */}
              <Box>
                {userDetails.personalInfo.map((info, index) => (
                  <Box
                    key={index}
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: "8px",
                    }}
                  >
                    <Typography
                      sx={{
                        fontFamily: "Inter, sans-serif",
                        fontWeight: "500",
                        fontSize: "14px",
                      }}
                    >
                      {info.title}:
                    </Typography>
                    <Typography
                      sx={{
                        fontFamily: "Inter, sans-serif",
                        fontWeight: "500",
                        fontSize: "14px",
                        color: "#555",
                        marginLeft: "8px",
                      }}
                    >
                      {info.value || "N/A"}{" "}
                    </Typography>
                  </Box>
                ))}
              </Box>

              {/* Imagen con Chip de estatus */}
              <Box
                sx={{
                  position: "relative",
                }}
              >
                <Chip
                  label={userDetails.status}
                  color={getStatusColor(userDetails.status)}
                  sx={{
                    position: "absolute",
                    top: "-10px",
                    zIndex: 1,
                    fontWeight: "bold",
                  }}
                />
                <Box
                  component="img"
                  src={userDetails.imageUrl}
                  alt="Imagen del usuario"
                  sx={{
                    width: "165px",
                    height: "165px",
                    borderRadius: "50%",
                    objectFit: "cover",
                    border: "2px solid #ddd",
                  }}
                />
              </Box>
            </Box>

            {/* Mobile Personal Info */}
            <Box
              sx={{
                display: { xs: "block", md: "none" },
                px: 2,
              }}
            >
              {userDetails.personalInfo.map((info, index) => (
                <Box
                  key={index}
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: "8px",
                  }}
                >
                  <Typography sx={{ fontWeight: "500", fontSize: "14px" }}>
                    {info.title}:
                  </Typography>
                  <Typography
                    sx={{
                      fontWeight: "500",
                      fontSize: "14px",
                      color: "#555",
                      ml: "8px",
                    }}
                  >
                    {info.value || "N/A"}
                  </Typography>
                </Box>
              ))}
            </Box>

            <hr />
            <Box
              sx={{
                display: "flex",
                alignItems: "stretch",
                gap: 3,
                flexDirection: { xs: "column", sm: "row" },
              }}
            >
              {/* Sección izquierda */}
              <Box sx={{ flex: 1 }}>
                <Typography
                  sx={{
                    fontFamily: "Inter, sans-serif",
                    fontWeight: "bold",
                    fontSize: "14px",
                    marginBottom: 2,
                  }}
                >
                  Información de Contacto
                </Typography>
                {userDetails.contactInfo.map((info, index) => (
                  <Box
                    key={index}
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: "8px",
                    }}
                  >
                    <Typography
                      sx={{
                        fontFamily: "Inter, sans-serif",
                        fontWeight: "500",
                        fontSize: "14px",
                      }}
                    >
                      {info.title}:
                    </Typography>
                    <Typography
                      sx={{
                        fontFamily: "Inter, sans-serif",
                        fontWeight: "500",
                        fontSize: "14px",
                        color: "#555",
                        marginLeft: "8px",
                      }}
                    >
                      {info.value || "N/A"}
                    </Typography>
                  </Box>
                ))}
                <hr />
                <Typography
                  sx={{
                    fontFamily: "Inter, sans-serif",
                    fontWeight: "bold",
                    fontSize: "14px",
                    marginBottom: 2,
                  }}
                >
                  Información Adicional
                </Typography>
                {userDetails.additionalInfo.map((info, index) => (
                  <Box
                    key={index}
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: "8px",
                    }}
                  >
                    <Typography
                      sx={{
                        fontFamily: "Inter, sans-serif",
                        fontWeight: "500",
                        fontSize: "14px",
                      }}
                    >
                      {info.title}:
                    </Typography>
                    <Typography
                      sx={{
                        fontFamily: "Inter, sans-serif",
                        fontWeight: "500",
                        fontSize: "14px",
                        color: "#555",
                        marginLeft: "8px",
                      }}
                    >
                      {info.value || "N/A"}
                    </Typography>
                  </Box>
                ))}
              </Box>

              {/* Linea vertical */}
              <Box
                sx={{
                  borderLeft: "1px solid #ddd",
                  height: "auto",
                }}
              />

              {/* Sección derecha */}
              <Box sx={{ flex: 1 }}>
                <Typography
                  sx={{
                    fontFamily: "Inter, sans-serif",
                    fontWeight: "bold",
                    fontSize: "14px",
                    marginBottom: 2,
                  }}
                >
                  Información Laboral
                </Typography>
                {userDetails.jobInfo.map((info, index) => (
                  <Box
                    key={index}
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: "8px",
                    }}
                  >
                    <Typography
                      sx={{
                        fontFamily: "Inter, sans-serif",
                        fontWeight: "500",
                        fontSize: "14px",
                      }}
                    >
                      {info.title}:
                    </Typography>
                    <Typography
                      sx={{
                        fontFamily: "Inter, sans-serif",
                        fontWeight: "500",
                        fontSize: "14px",
                        color: "#555",
                        marginLeft: "8px",
                      }}
                    >
                      {info.value || "N/A"}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
};
