import React, { useState } from "react";
import {
  Box,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import SearchBar from "../../SearchBar";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import { ArrowDropDown, ArrowDropUp, Delete, Edit } from "@mui/icons-material";
import DeleteIcon from "@mui/icons-material/Delete";
import { DialogContactsComponent } from "./DialogContactsCompontent";
import { toast, ToastContainer } from "react-toastify";
import { DeleteDialogComponent } from "../DeleteDialogComponent";
import { DialogFilterComponent } from "../DialogFilterComponent";

export const ContactsComponent = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [open, setOpen] = useState(false);
  const [openFilter, setOpenFilter] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [contactToDelete, setContactToDelete] = useState(null);
  const [editingContact, setEditingContact] = useState(null);
  const [selectedLists, setSelectedLists] = useState([]);
  const [contactNameOrder, setContactNameOrder] = useState("asc");
  const [listOrder, setListOrder] = useState("asc");

  //Estado para los contactos
  interface Contact {
    id: number;
    name: string;
    phone_number: string;
    list: string;
  }

  const [rows, setRows] = useState<Contact[]>([]);

  //Estado para abrir el dialogo de creacion de contactos
  const handleClickDialogContact = () => {
    setOpen(true);
  };

  //Funcion para agregar un nuevo contacto
  const handleAddContacts = (newContact) => {
    const contactsToAdd = Array.isArray(newContact) ? newContact : [newContact];
    setRows((prevRows) => [...prevRows, ...contactsToAdd]);
    toast(
      Array.isArray(newContact) ? "Contactos agregados" : "Contacto agregado"
    );
  };

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

  //Funcion para editar los mensajes
  const handleEditContact = (contact) => {
    setEditingContact(contact);
    setOpen(true);
  };

  const handleUpdateContact = (updatedContact) => {
    setRows((prevRows) =>
      prevRows.map((row) =>
        row.id === updatedContact.id ? updatedContact : row
      )
    );
  };

  //Estado para abrir el dialogo de filtro
  const handleClickFilter = () => {
    setOpenFilter(true);
  };

  //Funcion para filtrar los contactos
  const handleFilter = (lists) => {
    setSelectedLists(lists);
  }

  //Filtrar los contactos
  const filteredData = rows.filter((row) => {
    const matchesSearch = row?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(row?.phone_number || "").toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesList = selectedLists.length === 0 || selectedLists.includes(row.list);
    
    return matchesSearch && matchesList;
  });

  //Ordenar por nombre de contacto
  const handleSortByName = () => {
    const sortedRows = rows.sort((a, b) => {
      if (contactNameOrder === "asc") {
        return a.name.localeCompare(b.name);
      } else {
        return b.name.localeCompare(a.name);
      }
    });
    setRows([...sortedRows]);
    setContactNameOrder(contactNameOrder === "asc" ? "desc" : "asc");
  };

  //Ordenar por lista
  const handleSortByList = () => {
    const sortedRows = rows.sort((a, b) => {
      if (listOrder === "asc") {
        return a.list.localeCompare(b.list);
      } else {
        return b.list.localeCompare(a.list);
      }
    });
    setRows([...sortedRows]);
    setListOrder(listOrder === "asc" ? "desc" : "asc");
  };

  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} />
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-between",
          alignItems: "center",
          margin: 2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", flex: 1, justifyContent: "flex-end" }}>
          <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} onAddContent={handleClickDialogContact} onFilter={handleClickFilter} />
          {/* Dialogo de contactos */}
          <DialogContactsComponent
            open={open}
            setOpen={setOpen}
            onAddContacts={handleAddContacts}
            onEditMessage={handleUpdateContact}
            initialData={editingContact}
          />
          {/* Dialogo de filtro */}
          <DialogFilterComponent
            open={openFilter}
            setOpen={setOpenFilter}
            onFilter={handleFilter}
          />

        </Box>
      </Box>
      <TableContainer sx={{ maxHeight: "460px", overflow: "auto" }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell sx={{ backgroundColor: "#f1f1f1" }} align="justify">
                  Nombre de contacto
                <IconButton onClick={handleSortByName} size="small">
                  {contactNameOrder === "asc" ? (
                    <ArrowDropUp fontSize="small"/>
                  ) : (
                    <ArrowDropDown fontSize="small"/>
                  )}
                </IconButton>
              </TableCell>
              <TableCell sx={{ backgroundColor: "#f1f1f1" }} align="center">
                Número de contacto
              </TableCell>
              <TableCell sx={{ backgroundColor: "#f1f1f1" }} align="center">
                Lista
                <IconButton onClick={handleSortByList} size="small">
                  {listOrder === "asc" ? (
                    <ArrowDropUp fontSize="small"/>
                  ) : (
                    <ArrowDropDown fontSize="small"/>
                  )}
                </IconButton>
              </TableCell>
              <TableCell sx={{ backgroundColor: "#f1f1f1" }} align="center">
                Acciones
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  No hay contactos
                </TableCell>
              </TableRow>
            )}
            {filteredData.map((row, index) => (
              <TableRow key={index}>
                <TableCell align="justify">{row.name}</TableCell>
                <TableCell align="justify">
                  <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                  >
                      {row.phone_number}
                    <IconButton
                      sx={{
                        "&:hover": {
                          color: "#25D366",
                        },
                      }}
                    >
                      <WhatsAppIcon />
                    </IconButton>
                  </Box>
                </TableCell>
                <TableCell align="justify">
                  <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                  >
                      {row.list}
                    <IconButton
                      sx={{
                        "&:hover": {
                          color: "#25D366",
                        },
                      }}
                    >
                      <WhatsAppIcon />
                    </IconButton>
                  </Box>
                </TableCell>
                <TableCell align="center">
                  <IconButton
                   onClick={() => handleEditContact(row)}
                  >
                    <Edit />
                  </IconButton>
                  <IconButton onClick={() => handleDeleteDialog(row)}>
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
