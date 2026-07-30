import { Edit } from "@mui/icons-material";
import {
  Autocomplete,
  Button,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import DeleteIcon from "@mui/icons-material/Delete";
import { toast, ToastContainer } from "react-toastify";
import { DeleteDialogComponent } from "../DeleteDialogComponent";
import * as XLSX from "xlsx";
import { v4 as uuidv4 } from "uuid";

export const AddListContactComponent = ({ setListContacts, listContacts }) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [contactToDelete, setContactToDelete] = useState(null);
  const [selectedList, setSelectedList] = useState("");
  
  //Estado para los contactos
  const [rows, setRows] = useState<
    { id: string; name: string; phone_number: string; list: string }[]
  >([]);

  //Lista de opciones
  const listOptions = [
    "Clientes de CentralGPS",
    "Clientes Potenciales",
    "Proveedores",
  ];

  // Función para manejar cambios en la lista seleccionada
  const handleListChange = (newValue) => {
    setSelectedList(newValue || "");
    // Actualizar todos los contactos con la nueva lista
    const updatedRows = rows.map(row => ({
      ...row,
      list: newValue || "Sin Lista"
    }));
    setRows(updatedRows);
  };

  //Actualizar los contactos padre
  useEffect(() => {
    setListContacts(rows);
  }, [rows, setListContacts]);

  //Funcion para abrir el dialogo de eliminacion de contactos uno por uno
  const handleDeleteDialog = (contact) => {
    setContactToDelete(contact);
    setDeleteDialogOpen(true);
  };

  //Funcion para eliminar un contacto
  const handleDeleteContact = () => {
    setRows((prevRows) =>
      prevRows.filter((row) => row.id !== contactToDelete.id)
    );
    setDeleteDialogOpen(false);
    setContactToDelete(null);
    toast(`Contacto: ${contactToDelete.id}, eliminado`);
  };

  //Funcion para cerrar el dialogo de eliminacion de contactos
  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setContactToDelete(null);
  };

  //Funcion para importar el archivo excel y que los datos se muestren en la tabla
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      //Agregar el id y la lista a cada contacto
      const enrichedData = jsonData.map((row) => ({
        ...row,
        id: uuidv4(),
        list: selectedList || "Sin Lista"
      }));

      setRows(enrichedData);
    };
    reader.readAsArrayBuffer(file);
  };

  //Funcion para que los campos sean editables
  const handleEditCellChange = (id, field, value) => {
    setRows((prevRows) =>
      prevRows.map((row) => (row.id === id ? { ...row, [field]: value } : row))
    );
  };

  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} />
      <h5 style={{ margin: 16 }}>Añadir a la lista</h5>
      <Autocomplete
        freeSolo
        options={listOptions}
        value={selectedList}
        onChange={(_, newValue) => handleListChange(newValue)}
        renderInput={(params) => (
          <TextField {...params} variant="outlined" label="Lista" />
        )}
      />

      <h5 style={{ margin: 16 }}>Importar Archivo Excel</h5>
      <input
        type="file"
        accept=".xlsx, .xls"
        style={{ display: "none" }}
        id="excelEventInput"
        onChange={handleFileUpload}
      />
      <label htmlFor="excelEventInput">
        <Button
          variant="contained"
          color="success"
          component="span"
          style={{
            marginBottom: "10px",
            marginRight: "8px",
            justifyContent: "center",
            textTransform: "none",
            borderRadius: "16px",
          }}
        >
          Importar Excel
        </Button>
      </label>
      <TableContainer sx={{ maxHeight: "460px", overflow: "auto" }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell sx={{ backgroundColor: "#f1f1f1" }} align="center">
                Nombre de contacto
              </TableCell>
              <TableCell sx={{ backgroundColor: "#f1f1f1" }} align="center">
                Número de contacto
              </TableCell>
              <TableCell sx={{ backgroundColor: "#f1f1f1" }} align="center">
                Lista
              </TableCell>
              <TableCell sx={{ backgroundColor: "#f1f1f1" }} align="center">
                Acciones
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.id}>
                <TableCell align="justify">
                  <TextField
                    value={row.name || ""}
                    onChange={(e) =>
                      handleEditCellChange(row.id, "name", e.target.value)
                    }
                    variant="outlined"
                    size="small"
                  />
                </TableCell>
                <TableCell align="justify">
                  <TextField
                    value={row.phone_number || ""}
                    onChange={(e) =>
                      handleEditCellChange(row.id, "phone_number", e.target.value)
                    }
                    variant="outlined"
                    size="small"
                  />
                </TableCell>
                <TableCell align="center">
                  {row.list}
                </TableCell>
                <TableCell align="center">
                  <IconButton
                    sx={{
                      "&:hover": {
                        color: "red",
                      },
                    }}
                    onClick={() => handleDeleteDialog(row)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <DeleteDialogComponent
        title="Eliminar contacto"
        message="¿Estás seguro de que deseas eliminar este contacto?"
        deleteDialogOpen={deleteDialogOpen}
        handleCloseDeleteDialog={handleCloseDeleteDialog}
        handleDelete={handleDeleteContact}
      />
    </>
  );
};