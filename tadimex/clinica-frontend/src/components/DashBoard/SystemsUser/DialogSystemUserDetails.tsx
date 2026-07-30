import React from "react";
import CloseIcon from "@mui/icons-material/Close";
import { useEmployee } from "../../../hooks/Employee/useEmployee";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography,
  Box,
  Chip,
} from "@mui/material";

export const DialogSystemUserDetails = ({
  open,
  setOpen,
  user,
  systemsUser,
}) => {
  const handleCloseDialog = () => {
    setOpen(false);
  };

  const { employees } = useEmployee();

  // Si no hay usuario seleccionado, mostrar valores por defecto
  if (!user || !user.employeeData) {
    return null;
  }

  const getImageUrl = (imagePath) => {
    if (!imagePath) return "https://avatar.iran.liara.run/public/28";
  
    if (imagePath.startsWith("data:")) {
      return imagePath;
    }
  
    // Asegúrate de que las rutas usen forward slashes
    const normalizedPath = imagePath.replace(/\\/g, '/');
    return `${import.meta.env.VITE_API_SERVER}/${normalizedPath}`;
  };

  const getImmediateBossName = (id) => {
    if (!id) return "Sin jefe asignado";
    const boss = employees.find((employee) => employee.id === id);
    return boss ? `${boss.name} ${boss.last_name}` : "Sin jefe asignado";
  };

  const userDetails = {
    personalInfo: [
      { title: "Nombre", value: user.employeeData.name },
      { title: "Apellidos", value: user.employeeData.last_name },
      { title: "Fecha de Nacimiento", value: user.employeeData.birth_date },
      { title: "Curp", value: user.employeeData.curp },
      { title: "Género", value: user.employeeData.gender },
    ],
    contactInfo: [
      { title: "Teléfono Celular", value: user.employeeData.phone_number },
      {
        title: "Télefono de Emergencia",
        value: user.employeeData.emergency_phone,
      },
      {
        title: "Nombre de Emergencia",
        value: user.employeeData.emergency_phone_name,
      },
      {
        title: "Relación",
        value: user.employeeData.emergency_phone_relationship,
      },
      { title: "Calle", value: user.employeeData.calle },
      { title: "Número Exterior", value: user.employeeData.numero_exterior },
      { title: "Número Interior", value: user.employeeData.numero_interior },
      { title: "Código Postal", value: user.employeeData.codigo_postal },
      { title: "Colonia", value: user.employeeData.colonia },
      { title: "Localidad", value: user.employeeData.localidad },
      { title: "Municipio", value: user.employeeData.municipio },
      { title: "Estado", value: user.employeeData.estado },
      { title: "Email", value: user.employeeData.email },
    ],
    additionalInfo: [
      { title: "Tipo de Sangre", value: user.employeeData.blood_type },
      { title: "Alergias", value: user.employeeData.allergies },
      { title: "Talla de Calzado", value: user.employeeData.shoe_size },
      { title: "Talla de Uniforme", value: user.employeeData.uniform_size },
    ],
    jobInfo: [
      { title: "Nivel de Estudios", value: user.employeeData.education_level },
      {
        title: "Licencia de Conducir",
        value: user.employeeData.drivers_license,
      },
      { title: "Tipo de Contrato", value: user.employeeData.contract_term },
      { title: "Fecha de Ingreso", value: user.employeeData.entry_date },
      { title: "Fecha de Término", value: user.employeeData.contract_end_date },
      { title: "Sueldo", value: `$${user.employeeData.salary}` },
      {
        title: "Salario base de cotización",
        value: `$${user.employeeData.base_salary}`,
      },
      { title: "Periodo de Pago", value: user.employeeData.payment_period },
      { title: "NSS", value: user.employeeData.nss },
      { title: "RFC", value: user.employeeData.rfc },
      { title: "Crédito Infonavit", value: user.employeeData.infonavit_credit },
      { title: "Puesto", value: user.employeeData.position },
      { title: "Código de Empleado", value: user.employeeData.employee_code },
      { title: "Departamento", value: user.employeeData.department },
      {
        title: "Jefe Inmediato",
        value: getImmediateBossName(user.employeeData.immediate_boss_id),
      },
    ],
    imageUrl: getImageUrl(user.employeeData.image),
    status: user.employeeData.status,
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
          Detalles del usuario
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
            <hr />

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
