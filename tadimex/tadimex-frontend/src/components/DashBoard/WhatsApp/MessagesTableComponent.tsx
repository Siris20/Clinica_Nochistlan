import {
  Box,
  Chip,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import React, { useState } from "react";
import { ArrowDropDown, ArrowDropUp, Edit } from "@mui/icons-material";
import DeleteIcon from "@mui/icons-material/Delete";
import { toast, ToastContainer } from "react-toastify";
import { DeleteDialogComponent } from "../DeleteDialogComponent";
import { DialogMessageComponent } from "./DialogMessageCompontent";
import dayjs from "dayjs";
import SearchBar from "../../SearchBar";
import { DialogFilterComponent } from "../DialogFilterComponent";

export const MessagesTableComponent = () => {
  const [open, setOpen] = useState(false);
  const [openFilter, setOpenFilter] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingMessage, setEditingMessage] = useState(null);
  const [messageToDelete, setMessageToDelete] = useState(null);
  const [dateOrder, setDateOrder] = useState("asc");
  const [statusOrder, setStatusOrder] = useState("asc");
  const [searchTerm, setSearchTerm] = useState("");

  //Estado para los mensajes
  const [rows, setRows] = useState([
    {
      id: 1,
      message: "Hola, ¿cómo estás?",
      sent_to: "Juan Pérez, María López",
      image: "https://via.placeholder.com/150",
      status: "Enviado",
      sending_date: "2021-10-25",
    },
  ]);

  const filteredData = rows.filter(
    (row) =>
      row.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      row.sent_to.toLowerCase().includes(searchTerm.toLowerCase())
  );

  //Estado para abrir el dialogo de creacion de mensajes
  const handleClickDialogMessage = () => {
    setEditingMessage(null);
    setOpen(true);
  };

  const handleAddMessage = (newMessage) => {
    setRows((prevRows) => [...prevRows, newMessage]);
  };

  // Estado para abrir el dialogo de eliminacion de mensajes
  const handleDeleteDialog = (message) => {
    setMessageToDelete(message);
    setDeleteDialogOpen(true);
  };

  //Estado para borrar los mensajes
  const handleDeleteMessage = () => {
    if (messageToDelete.image) {
      URL.revokeObjectURL(messageToDelete.image);
    }
    setRows((prevRows) =>
      prevRows.filter((row) => row.id !== messageToDelete.id)
    );
    setDeleteDialogOpen(false);
    setMessageToDelete(null);
    toast(`Mensaje con id: ${messageToDelete.id}, ha sido eliminado`);
  };

  //Estado para cerrar el dialogo de eliminacion de bots
  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setMessageToDelete(null);
  };

  //Estado para editar los mensajes
  const handleEditMessage = (message) => {
    setEditingMessage(message);
    setOpen(true);
  };

  const handleUpdateMessage = (updatedMessage) => {
    setRows((prevRows) =>
      prevRows.map((row) =>
        row.id === updatedMessage.id ? updatedMessage : row
      )
    );
  };

  // Ordenar por fecha de envío
  const handleSortByDate = () => {
    const order = dateOrder === "asc" ? "desc" : "asc";
    setDateOrder(order);
    const sortedData = [...rows].sort((a, b) =>
      order === "asc"
        ? dayjs(a.sending_date).isAfter(dayjs(b.sending_date))
          ? 1
          : -1
        : dayjs(a.sending_date).isBefore(dayjs(b.sending_date))
        ? 1
        : -1
    );
    setRows(sortedData);
  };

  // Ordenar por estatus
  const handleSortByStatus = () => {
    const order = statusOrder === "asc" ? "desc" : "asc";
    setStatusOrder(order);
    const sortedData = [...rows].sort((a, b) => {
      if (order === "asc") {
        return a.status.localeCompare(b.status);
      } else {
        return b.status.localeCompare(a.status);
      }
    });
    setRows(sortedData);
  };

  //Estado para filtrar los mensajes
  const handleFilter = () => {
    setOpenFilter(true);
  };

  return (
    <>
      <ToastContainer position="top-right" autoClose={4000} />
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          flex: 1,
          justifyContent: "flex-end",
          marginBottom: 2,
        }}
      >
        <SearchBar
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          onAddContent={handleClickDialogMessage}
        />
        {/* Dialogo para anadir o editar contenido */}
        <DialogMessageComponent
          open={open}
          setOpen={setOpen}
          onAddMessage={handleAddMessage}
          onEditMessage={handleUpdateMessage}
          initialData={editingMessage}
        />
      </Box>
      <TableContainer sx={{ maxHeight: "460px", overflow: "auto" }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell sx={{ backgroundColor: "#f1f1f1" }} align="justify">
                Mensaje
              </TableCell>
              <TableCell sx={{ backgroundColor: "#f1f1f1" }} align="right">
                Destinatarios
              </TableCell>
              <TableCell sx={{ backgroundColor: "#f1f1f1" }} align="right">
                Imagen
              </TableCell>
              <TableCell sx={{ backgroundColor: "#f1f1f1" }} align="right">
                Estatus
                <IconButton onClick={handleSortByStatus} size="small">
                  {statusOrder === "asc" ? (
                    <ArrowDropDown fontSize="small" />
                  ) : (
                    <ArrowDropUp fontSize="small" />
                  )}
                </IconButton>
              </TableCell>
              <TableCell sx={{ backgroundColor: "#f1f1f1" }} align="right">
                Fecha de envío
                <IconButton onClick={handleSortByDate} size="small">
                  {dateOrder === "asc" ? (
                    <ArrowDropUp fontSize="small" />
                  ) : (
                    <ArrowDropDown fontSize="small" />
                  )}
                </IconButton>
              </TableCell>
              <TableCell sx={{ backgroundColor: "#f1f1f1" }} align="right">
                Acciones
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredData.map((row, index) => (
              <TableRow key={index}>
                <TableCell align="justify">{row.message}</TableCell>
                <TableCell align="right">
                  {row.sent_to.split(", ").map((recipient, idx) => (
                    <Chip
                      key={idx}
                      label={recipient}
                      sx={{ margin: 0.5, borderRadius: 16 }}
                    />
                  ))}
                </TableCell>
                <TableCell align="right">
                  {row.image ? (
                    <img
                      src={row.image}
                      alt="Mensaje Imagen"
                      style={{
                        width: 50,
                        height: 50,
                        objectFit: "cover",
                        borderRadius: 4,
                      }}
                    />
                  ) : (
                    "No image"
                  )}
                </TableCell>{" "}
                <TableCell align="right">{row.status}</TableCell>
                <TableCell align="right">
                  {dayjs(row.sending_date).format("YYYY-MM-DD HH:mm:ss")}
                </TableCell>
                <TableCell align="right">
                  <IconButton onClick={() => handleEditMessage(row)}>
                    <Edit />
                  </IconButton>
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
        title="Eliminar mensaje"
        message="¿Estás seguro de que deseas eliminar este mensaje?"
        deleteDialogOpen={deleteDialogOpen}
        handleCloseDeleteDialog={handleCloseDeleteDialog}
        handleDelete={handleDeleteMessage}
      />
    </>
  );
};
