import {
  Box,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import React, { useState } from "react";
import SearchBar from "../../SearchBar";
import {
  Edit,
  MoreVert,
  RemoveRedEye,
} from "@mui/icons-material";
import DeleteIcon from "@mui/icons-material/Delete";
import { toast, ToastContainer } from "react-toastify";
import { DeleteDialogComponent } from "../DeleteDialogComponent";
import { EmployeeDetails } from "./EmployeeDetails";
import { AddEmployeeComponent } from "./AddEmployeeComponent";
import { useEmployee } from "../../../hooks/Employee/useEmployee";
import Loader from "../../Loader";
import { useAuth } from "../../../context/AuthContext";

export const EmployeeComponent = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [open, setOpen] = useState(false);
  const [openDetails, setOpenDetails] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState(null);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [nameOrder, setNameOrder] = useState("asc");
  const [lastNameOrder, setLastNameOrder] = useState("asc");
  const [dateOrder, setDateOrder] = useState("asc");
  const [positionOrder, setPositionOrder] = useState("asc");
  const [salaryOrder, setSalaryOrder] = useState("asc");
  const [phoneOrder, setPhoneOrder] = useState("asc");
  const [emailOrder, setEmailOrder] = useState("asc");
  const [statusOrder, setStatusOrder] = useState("asc");
  const [anchorEl, setAnchorEl] = useState(null);

  //Hook CRUD de empleados
  const {
    employees,
    setEmployees,
    selectedEmployee,
    setSelectedEmployee,
    handleGetEmployee,
    loading,
    handleDeleteEmployee: deleteEmployeeAPI,
    handleCreateEmployee,
    handleUpdateEmployee,
  } = useEmployee();

  //Funcion para refrescar los datos del empleado
  const {user,refreshEmployeeData} = useAuth();

  //Función para abrir el dialogo de creacion de empleados
  const handleClickDialogEmployee = () => {
    setEditingEmployee(null);
    setOpen(true);
  };

  //Funcion para agregar un nuevo usuario del sistema
  const handleAddEmployee = async (newEmployee) => {
    try {
      await handleCreateEmployee(newEmployee);
      toast.success("Empleado agregado con éxito");
    } catch (error) {
      toast.error("Error al agregar el empleado");
    }
  };

  //Funcion para abrir el dialogo de eliminacion de usuarios del sistema.
  const handleDeleteDialog = (employee) => {
    setEmployeeToDelete(employee);
    setDeleteDialogOpen(true);
  };

  //Funcion para eliminar un usuario del sistema
  const handleDeleteEmployee = async () => {
    try {
      await deleteEmployeeAPI(employeeToDelete.id);
      setEmployees((prevEmployees) =>
        prevEmployees.filter((emp) => emp.id !== employeeToDelete.id)
      );
      setDeleteDialogOpen(false);
      setEmployeeToDelete(null);
      toast.success(`Empleado ${employeeToDelete.id} eliminado con éxito`);
    } catch (error) {
      toast.error("Error al eliminar el empleado");
    }
  };

  //Funcion para cerrar el dialogo de eliminacion de empleados
  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setEmployeeToDelete(null);
  };

  //Funcion para abrir el dialogo de detalles de los empleados
  const handleClickDetails = async (employee) => {
    await handleGetEmployee(employee.id);
    setOpenDetails(true);
  };

  //Funcion para filtrar los empleados
  const filteredData = employees.filter(
    (row) =>
      row.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      row.last_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  //Funcion para abrir el dialogo de edicion de empleados
  const handleEditEmployee = (employee) => {
    setEditingEmployee(employee);
    setOpen(true);
  };

  //Funcion para actualizar un empleado
  const handleUpdate = async (employeeId, employeeData) => {
    try {
      await handleUpdateEmployee(employeeId, employeeData);
      if(user?.empleado_id === employeeId) {
        await refreshEmployeeData();
      }
      toast.success("Empleado actualizado exitosamente");
    } catch (error) {
      toast.error(error.message);
    }
  };

  //Funcion para ordenar los empleados por nombre
  const handleSortName = () => {
    const sorted = [...employees].sort((a, b) => {
      if (nameOrder === "asc") {
        return a.name.localeCompare(b.name);
      } else {
        return b.name.localeCompare(a.name);
      }
    });
    setEmployees(sorted);
    setNameOrder(nameOrder === "asc" ? "desc" : "asc");
  };

  //Funcion para ordenar los empleados por apellido
  const handleSortLastName = () => {
    const sorted = [...employees].sort((a, b) => {
      if (lastNameOrder === "asc") {
        return a.last_name.localeCompare(b.last_name);
      } else {
        return b.last_name.localeCompare(a.last_name);
      }
    });
    setEmployees(sorted);
    setLastNameOrder(lastNameOrder === "asc" ? "desc" : "asc");
  };

  //Funcion para ordenar los empleados por fecha de ingreso
  const handleSortDate = () => {
    const sorted = [...employees].sort((a, b) => {
      const dateA = a.entry_date || "";
      const dateB = b.entry_date || "";

      if (dateOrder === "asc") {
        return dateA.localeCompare(dateB);
      } else {
        return dateB.localeCompare(dateA);
      }
    });
    setEmployees(sorted);
    setDateOrder(dateOrder === "asc" ? "desc" : "asc");
  };

  //Funcion para ordenar los empleados por puesto
  const handleSortPosition = () => {
    const sorted = [...employees].sort((a, b) => {
      const positionA = a.position || "";
      const positionB = b.position || "";

      if (positionOrder === "asc") {
        return positionA.localeCompare(positionB);
      } else {
        return positionB.localeCompare(positionA);
      }
    });
    setEmployees(sorted);
    setPositionOrder(positionOrder === "asc" ? "desc" : "asc");
  };

  //Funcion para ordenar los empleados por salario
  const handleSortSalary = () => {
    const sorted = [...employees].sort((a, b) => {
      if (salaryOrder === "asc") {
        return a.salary - b.salary;
      } else {
        return b.salary - a.salary;
      }
    });
    setEmployees(sorted);
    setSalaryOrder(salaryOrder === "asc" ? "desc" : "asc");
  };

  //Funcion para ordenar los empleados por telefono
  const handleSortPhone = () => {
    const sorted = [...employees].sort((a, b) => {
      const phoneA = a.phone_number || "";
      const phoneB = b.phone_number || "";

      if (phoneOrder === "asc") {
        return phoneA.localeCompare(phoneB);
      } else {
        return phoneB.localeCompare(phoneA);
      }
    });
    setEmployees(sorted);
    setPhoneOrder(phoneOrder === "asc" ? "desc" : "asc");
  };

  //Funcion para ordenar los empleados por email
  const handleSortEmail = () => {
    const sorted = [...employees].sort((a, b) => {
      const emailA = a.email || "";
      const emailB = b.email || "";

      if (emailOrder === "asc") {
        return emailA.localeCompare(emailB);
      } else {
        return emailB.localeCompare(emailA);
      }
    });
    setEmployees(sorted);
    setEmailOrder(emailOrder === "asc" ? "desc" : "asc");
  };

  //Funcion para ordenar los empleados por estatus
  const handleSortStatus = () => {
    const sorted = [...employees].sort((a, b) => {
      if (statusOrder === "asc") {
        return a.status.localeCompare(b.status);
      } else {
        return b.status.localeCompare(a.status);
      }
    });
    setEmployees(sorted);
    setStatusOrder(statusOrder === "asc" ? "desc" : "asc");
  };

  //Menu de acciones
  const handleMenuOpen = (event, employee) => {
    setAnchorEl(event.currentTarget);
    setSelectedEmployee(employee);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedEmployee(null);
  }

  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} />
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" }, 
          flexWrap: "wrap",
          justifyContent: "space-between",
          alignItems: { xs: "stretch", sm: "center" },
          gap: { xs: 2, sm: 1 }, 
          margin: 2,
          "& > *": { 
            width: { xs: "100%", sm: "auto" }
          }
        }}
      >
        <Typography 
          variant="h5" 
          component="h2"
          sx={{
            textAlign: { xs: "center", sm: "left" }, 
            marginBottom: { xs: 1, sm: 0 }
          }}
        >
          Lista del Personal
        </Typography>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            width: { xs: "100%", sm: "auto" },
            justifyContent: { xs: "center", sm: "flex-end" }, 
          }}
        >
          <SearchBar
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            onAddContent={handleClickDialogEmployee}
          />
          <AddEmployeeComponent
            open={open}
            setOpen={setOpen}
            onAddEmployee={handleAddEmployee}
            onEditEmployee={handleUpdate}
            initialData={editingEmployee}
            onClose={() => setEditingEmployee(null)}
          />
        </Box>
      </Box>
      <TableContainer
        sx={{
          height: "auto",
          maxHeight: "calc(100vh - 200px)",
          overflow: "auto",
          "@media (max-width: 600px)": {
            maxHeight: "calc(100vh - 250px)",
          },
        }}
      >
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell sx={{ backgroundColor: "#f1f1f1", cursor:"pointer" }} align="justify" onClick={handleSortName}>
                Nombre
              </TableCell>
              <TableCell sx={{ backgroundColor: "#f1f1f1", cursor:"pointer" }} align="justify" onClick={handleSortLastName}>
                Apellidos
              </TableCell>
              <TableCell sx={{ backgroundColor: "#f1f1f1", cursor:"pointer" }} align="justify" onClick={handleSortDate}>
                Fecha de Ingreso
              </TableCell>
              <TableCell sx={{ backgroundColor: "#f1f1f1", cursor:"pointer" }} align="justify" onClick={handleSortPosition}>
                Puesto
              </TableCell>
              <TableCell sx={{ backgroundColor: "#f1f1f1", cursor:"pointer" }} align="justify" onClick={handleSortSalary}>
                Salario
              </TableCell>
              <TableCell sx={{ backgroundColor: "#f1f1f1", cursor:"pointer" }} align="justify" onClick={handleSortPhone}>
                Telefono
              </TableCell>
              <TableCell sx={{ backgroundColor: "#f1f1f1", cursor:"pointer" }} align="justify" onClick={handleSortEmail}>
                Email
              </TableCell>
              <TableCell sx={{ backgroundColor: "#f1f1f1", cursor:"pointer" }} align="justify" onClick={handleSortStatus}>
                Estatus
              </TableCell>
              <TableCell sx={{ backgroundColor: "#f1f1f1", cursor:"pointer" }} align="justify">
                Acciones
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={9} align="center">
                  <Loader />
                </TableCell>
              </TableRow>
            ) : employees.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} align="center">
                  No hay usuarios registrados
                </TableCell>
              </TableRow>
            ) : (
              filteredData.map((employee) => (
                <TableRow key={employee.id}>
                  <TableCell align="justify">{employee.name}</TableCell>
                  <TableCell align="justify">{employee.last_name}</TableCell>
                  <TableCell align="justify">{employee.entry_date}</TableCell>
                  <TableCell align="justify">{employee.position}</TableCell>
                  <TableCell align="justify">{employee.salary}</TableCell>
                  <TableCell align="justify">{employee.phone_number}</TableCell>
                  <TableCell align="justify">{employee.email}</TableCell>
                  <TableCell align="justify">{employee.status}</TableCell>
                  <TableCell align="center">
                    <IconButton
                      size="small"
                      onClick={(event) => handleMenuOpen(event, employee)}
                    >
                      <MoreVert />
                    </IconButton>
                    <Menu
                      anchorEl={anchorEl}
                      open={
                        Boolean(anchorEl) && selectedEmployee.id === employee.id
                      }
                      onClose={handleMenuClose}
                      >
                        <MenuItem
                          onClick={() => {
                            handleClickDetails(employee);
                            handleMenuClose();
                          }}
                        >
                          <ListItemIcon>
                            <RemoveRedEye fontSize="small" />
                          </ListItemIcon>
                          <ListItemText>Ver detalles</ListItemText>
                        </MenuItem>
                        <MenuItem
                          onClick={() => {
                            handleEditEmployee(employee);
                            handleMenuClose();
                          }}
                          >
                          <ListItemIcon>
                            <Edit fontSize="small" />
                          </ListItemIcon>
                          <ListItemText>Editar empleado</ListItemText>
                        </MenuItem>
                        <MenuItem
                          onClick={() => {
                            handleDeleteDialog(employee);
                            handleMenuClose();
                          }}
                        >
                          <ListItemIcon>
                            <DeleteIcon fontSize="small" color="error" />
                          </ListItemIcon>
                          <ListItemText sx={{ color: "error.main" }}>
                            Eliminar empleado
                          </ListItemText>
                        </MenuItem>
                      </Menu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Detalles del empleado */}
      <EmployeeDetails
        open={openDetails}
        setOpen={setOpenDetails}
        user={selectedEmployee}
        employees={employees}
      />

      {/* Borrar empleado */}
      <DeleteDialogComponent
        title="Eliminar empleado"
        message="¿Estás seguro de que deseas eliminar este empleado?"
        deleteDialogOpen={deleteDialogOpen}
        handleCloseDeleteDialog={handleCloseDeleteDialog}
        handleDelete={handleDeleteEmployee}
      />
    </>
  );
};
