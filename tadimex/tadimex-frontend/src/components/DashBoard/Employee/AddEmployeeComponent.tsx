import React, { useEffect, useRef, useState } from "react";
import CloseIcon from "@mui/icons-material/Close";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography,
  Box,
  TextField,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
} from "@mui/material";
import { DemoContainer } from "@mui/x-date-pickers/internals/demo";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { useEmployeeForm } from "../../../hooks/Employee/useEmployeeForm";
import {
  FORM_SECTIONS,
  SELECT_OPTIONS,
  updateImmediateBossOptions,
} from "./formSections";
import { useEmployee } from "../../../hooks/Employee/useEmployee";

export const AddEmployeeComponent = ({
  open,
  setOpen,
  onAddEmployee,
  onEditEmployee,
  initialData,
  onClose,
}) => {
  //Hook para el formulario de agregar empleado
  const {
    formData,
    fileInputRef,
    selectedImage,
    handleChange,
    handleImageChange,
    handleSubmit,
    resetForm,
    hasError,
  } = useEmployeeForm(initialData, setOpen, onAddEmployee, onEditEmployee);

  //Hook para obtener la lista de empleados en el select
  const { employees } = useEmployee();

  useEffect(() => {
    if (employees.length > 0) {
      updateImmediateBossOptions(employees);
    }
  }, [employees]);

  //Componente para mostrar la imagen
  const ImageDisplay = ({ mobile = false }) => (
    <Box
      sx={{
        display: mobile
          ? { xs: "flex", sm: "none" }
          : { xs: "none", sm: "flex" },
        flexDirection: "column",
        alignItems: "center",
        gap: 1,
      }}
    >
      <Box
        component="img"
        src={selectedImage || formData.imageUrl}
        alt="Imagen del usuario"
        sx={{
          width: "165px",
          height: "165px",
          borderRadius: "50%",
          objectFit: "cover",
          border: "2px solid #ddd",
          marginBottom: mobile ? "20px" : 0,
        }}
      />
      <Button
        variant="outlined"
        size="small"
        onClick={() => fileInputRef.current && fileInputRef.current.click()}
        sx={{
          borderRadius: 8,
          borderColor: "#CAC4D0",
          fontSize: 12,
          textTransform: "none",
          color: "#49454F",
          marginBottom: { xs: "20px", sm: 0 },
        }}
      >
        Seleccionar imagen
      </Button>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImageChange}
        accept="image/*"
        style={{ display: "none" }}
      />
    </Box>
  );

  //Renderizar las opciones de los campos de texto
  const renderSelectField = (info, index, section) => {
    let options: { value: string; label: string }[] = [];

    switch (info.title) {
      case "Género":
        options = SELECT_OPTIONS.GENDER;
        break;
      case "Estatus":
        options = SELECT_OPTIONS.STATUS;
        break;
      case "Tipo de Sangre":
        options = SELECT_OPTIONS.BLOOD_TYPE;
        break;
      case "Talla de Calzado":
        options = SELECT_OPTIONS.SHOE_SIZE;
        break;
      case "Talla de Uniforme":
        options = SELECT_OPTIONS.UNIFORM_SIZE;
        break;
      case "Tipo de contrato":
        options = SELECT_OPTIONS.CONTRACT_TYPE;
        break;
      case "Periodo de Pago":
        options = SELECT_OPTIONS.PAYMENT_PERIOD;
        break;
      case "Jefe inmediato":
        options = SELECT_OPTIONS.IMMEDIATE_BOSS;
        break;
      default:
        return null;
    }

    return (
      <Box
        key={index}
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "8px",
          gap: 2,
        }}
      >
        <Typography
          sx={{
            fontFamily: "Inter, sans-serif",
            fontWeight: "500",
            fontSize: "14px",
            minWidth: "150px",
          }}
        >
          {info.title}:
        </Typography>
        <FormControl fullWidth size="small">
          <InputLabel>{info.title}</InputLabel>
          <Select
            value={info.value}
            onChange={(e) => {
              handleChange(section, index, e.target.value);
            }}
            error={hasError(section, info.title)}
            label={info.title}
            sx={{
              "& .MuiSelect-select": {
                fontSize: "14px",
              },
            }}
          >
            {options.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
    );
  };

  //Funcion para cerrar el dialogo
  const handleCloseDialog = () => {
    resetForm();
    setOpen(false);
    onClose();
  };

  //Funcion para validar el email
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  //Funcion para renderizar los campos de texto
  const renderTextField = (info, index, section) => {
    // Si el campo tiene show: false, no lo renderizamos
    if (info.hasOwnProperty("show") && !info.show) {
      return null;
    }

    //Funcion para validar el input segun el tipo de campo
    const validateInput = (value, fieldTitle) => {
      switch (fieldTitle) {
        case "Teléfono Celular":
        case "Télefono de Emergencia":
          return value.replace(/\D/g, "").slice(0, 10);
        case "Curp":
          return value
            .replace(/[^A-Za-z0-9]/g, "")
            .toUpperCase()
            .slice(0, 18);
        case "Email":
          return value.slice(0, 50);
        case "Sueldo":
        case "Salario base de cotización":
          return value.replace(/[^\d]/g, "");
        default:
          return value;
      }
    };

    // Función para obtener el mensaje de error
    const getErrorMessage = (value, fieldTitle) => {
      if (!value) return "";
      switch (fieldTitle) {
        case "Teléfono Celular":
        case "Télefono de Emergencia":
          return value.length !== 10 ? "Debe contener 10 dígitos" : "";
        case "Curp":
          return value.length !== 18 ? "Debe contener 18 caracteres" : "";
        case "Email":
          return !validateEmail(value) ? "Correo inválido" : "";
        default:
          return "";
      }
    };

    //Verificar si es un campo de selección
    const selectFields = [
      "Género",
      "Estatus",
      "Tipo de Sangre",
      "Talla de Calzado",
      "Talla de Uniforme",
      "Tipo de contrato",
      "Periodo de Pago",
      "Jefe inmediato",
    ];

    if (selectFields.includes(info.title)) {
      return renderSelectField(info, index, section);
    }

    if (
      info.title === "Teléfono Celular" ||
      info.title === "Télefono de Emergencia" ||
      info.title === "Curp" ||
      info.title === "Email" ||
      info.title === "Sueldo" ||
      info.title === "Salario base de cotización"
    ) {
      return (
        <Box
          key={index}
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "8px",
            gap: 2,
          }}
        >
          <Typography
            sx={{
              fontFamily: "Inter, sans-serif",
              fontWeight: "500",
              fontSize: "14px",
              minWidth: "150px",
            }}
          >
            {info.title}:
          </Typography>
          <TextField
            size="small"
            value={info.value}
            onChange={(e) => {
              const validatedValue = validateInput(e.target.value, info.title);
              handleChange(section, index, validatedValue);
            }}
            required
            label={info.title}
            error={
              hasError(section, info.title) ||
              Boolean(getErrorMessage(info.value, info.title))
            }
            helperText={getErrorMessage(info.value, info.title)}
            fullWidth
            inputProps={{
              maxLength:
                info.title === "Curp"
                  ? 18
                  : info.title === "Email"
                  ? 50
                  : info.title === "Teléfono Celular" ||
                    info.title === "Télefono de Emergencia"
                  ? 10
                  : undefined,
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                fontSize: "14px",
              },
            }}
          />
        </Box>
      );
    }

    if (
      info.title === "Fecha de Nacimiento" ||
      info.title === "Fecha de Ingreso" ||
      info.title === "Fecha de Término"
    ) {
      return (
        <Box
          key={index}
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "8px",
            gap: 2,
          }}
        >
          <Typography
            sx={{
              fontFamily: "Inter, sans-serif",
              fontWeight: "500",
              fontSize: "14px",
              minWidth: "150px",
            }}
          >
            {info.title}:
          </Typography>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DemoContainer
              components={["DatePicker"]}
              sx={{
                width: "100%",
                "& .MuiTextField-root": { width: "100%" },
                "& .MuiStack-root": { width: "100%" },
              }}
            >
              {" "}
              <DatePicker
                value={info.value}
                onChange={(newValue) => handleChange(section, index, newValue)}
                views={["year", "month", "day"]}
                openTo="year"
                slotProps={{
                  textField: {
                    size: "small",
                    error: hasError(section, info.title),
                    sx: {
                      "& .MuiOutlinedInput-root": {
                        fontSize: "14px",
                      },
                    },
                  },
                  desktopPaper: {
                    sx: {
                      "& .MuiPickersCalendarHeader-root": {
                        display: "flex",
                        justifyContent: "space-between",
                      },
                    },
                  },
                }}
                sx={{ width: "100%" }}
              />
            </DemoContainer>
          </LocalizationProvider>
        </Box>
      );
    }

    return (
      <Box
        key={index}
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "8px",
          gap: 2,
        }}
      >
        <Typography
          sx={{
            fontFamily: "Inter, sans-serif",
            fontWeight: "500",
            fontSize: "14px",
            minWidth: "150px",
          }}
        >
          {info.title}:
        </Typography>
        <TextField
          size="small"
          value={info.value}
          onChange={(e) => handleChange(section, index, e.target.value)}
          required
          label={info.title}
          error={hasError(section, info.title)}
          fullWidth
          sx={{
            "& .MuiOutlinedInput-root": {
              fontSize: "14px",
            },
          }}
        />
      </Box>
    );
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={handleCloseDialog}
        PaperProps={{
          sx: {
            width: { xs: "95%", sm: "930px" },
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
          {initialData ? "Editar Personal" : "Agregar Personal"}
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

            <ImageDisplay mobile={true} />

            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", md: "row" },
                gap: 2,
                px: { xs: 1, sm: 3 },
              }}
            >
              <Box sx={{ flex: 1, width: "100%" }}>
                {formData[FORM_SECTIONS.PERSONAL].map((info, index) =>
                  renderTextField(info, index, FORM_SECTIONS.PERSONAL)
                )}
              </Box>
              <ImageDisplay />
            </Box>

            <hr />

            <Box
              sx={{
                display: "flex",
                gap: 3,
                flexDirection: { xs: "column", sm: "row" },
              }}
            >
              <Box sx={{ flex: 1, width: "100%" }}>
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
                {formData[FORM_SECTIONS.CONTACT].map((info, index) =>
                  renderTextField(info, index, FORM_SECTIONS.CONTACT)
                )}

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
                {formData[FORM_SECTIONS.ADDITIONAL].map((info, index) =>
                  renderTextField(info, index, FORM_SECTIONS.ADDITIONAL)
                )}
              </Box>

              <Divider
                orientation="vertical"
                flexItem
                sx={{ display: { xs: "none", md: "block" } }}
              />

              <Box sx={{ flex: 1, width: "100%" }}>
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
                {formData[FORM_SECTIONS.JOB].map((info, index) =>
                  renderTextField(info, index, FORM_SECTIONS.JOB)
                )}
              </Box>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            variant="contained"
            sx={{
              borderRadius: 100,
              backgroundColor: "#000",
              color: "#fff",
              fontFamily: "Inter, sans-serif",
              fontSize: 12,
              textTransform: "none",
            }}
            onClick={handleSubmit}
          >
            {initialData ? "Editar empleado" : "Guardar empleado"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
