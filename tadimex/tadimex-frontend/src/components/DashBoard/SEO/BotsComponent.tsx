import { PlayArrow, Edit } from "@mui/icons-material";
import {
  Button,
  Box,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
  TextField,
} from "@mui/material";
import React, { useState } from "react";
import StopIcon from "@mui/icons-material/Stop";
import DeleteIcon from "@mui/icons-material/Delete";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { DialogBotComponent } from "./DialogBotComponent";
import { DeleteDialogComponent } from "../DeleteDialogComponent";

export const BotsComponent = () => {
  const [rows, setRows] = useState([
    {
      id: 1,
      name: "Bot 1",
      website: "www.example1.com",
      keywords: "keyword1, keyword2",
      views: 120,
    },
    {
      id: 2,
      name: "Bot 2",
      website: "www.example2.com",
      keywords: "keyword3, keyword4",
      views: 150,
    },
    {
      id: 3,
      name: "Bot 3",
      website: "www.example3.com",
      keywords: "keyword5, keyword6",
      views: 200,
    },
  ]);

  const [playing, setPlaying] = useState<{ [key: string]: boolean }>({});
  const [open, setOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [botToDelete, setBotToDelete] = useState(null);
  const [editingField, setEditingField] = useState({ id: null, field: null });

  //Estado para iniciar o detener los bots
  const handlePlayPauseClick = (botName: string) => {
    setPlaying((prevState) => {
      const isPlaying = !prevState[botName];
      toast(isPlaying ? `Corriendo ${botName}` : `${botName} se ha detenido`);
      return {
        ...prevState,
        [botName]: isPlaying,
      };
    });
  };

  //Estado para abrir el dialogo de creacion de bots
  const handleClickDialogBot = () => {
    setOpen(true);
  };

  //Estado para crear un nuevo bot
  const handleAddBot = (newBot) => {
    setRows((prevRows) => [...prevRows, newBot]);
  };

  // Estado para abrir el dialogo de eliminacion de bots
  const handleDeleteDialog = (bot) => {
    setBotToDelete(bot);
    setDeleteDialogOpen(true);
  };

  //Estado para borrar los bots
  const handleDeleteBot = () => {
    setRows((prevRows) => prevRows.filter((row) => row.id !== botToDelete.id));
    setDeleteDialogOpen(false);
    setBotToDelete(null);
    toast(`${botToDelete.id} ha sido eliminado`);
  };

  //Estado para cerrar el dialogo de eliminacion de bots
  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setBotToDelete(null);
  };

  //Estado para editar los campos de los bots
  const handleEditField = (id, field) => {
    setEditingField({ id, field });
  };

  //Estado para guardar los cambios en los campos de los bots
  const handleFieldChange = (id, field, value) => {
    setRows((prevRows) =>
      prevRows.map((row) => (row.id === id ? { ...row, [field]: value } : row))
    );
  };

  const handleFieldBlur = () => {
    setEditingField({ id: null, field: null });
  };

  return (
    <>
      <ToastContainer position="top-right" autoClose={4000} />
      <Box sx={{ display: "flex", justifyContent: "flex-start" }}>
        <Button
          variant="contained"
          sx={{ margin: 2, backgroundColor: "#000", height: 30, textTransform: "none" }}
          onClick={handleClickDialogBot}
        >
          Crear Bot
        </Button>
      </Box>
      <DialogBotComponent
        open={open}
        setOpen={setOpen}
        onAddBot={handleAddBot}
      />
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 2,
        }}
      ></Box>
      <TableContainer sx={{ maxHeight: 550, overflow: "auto" }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell>Nombre</TableCell>
              <TableCell>Destino</TableCell>
              <TableCell>Keywords</TableCell>
              <TableCell>Visitas</TableCell>
              <TableCell align="center">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.id}>
                <TableCell>
                  {editingField.id === row.id &&
                  editingField.field === "name" ? (
                    <TextField
                      value={row.name}
                      onChange={(e) =>
                        handleFieldChange(row.id, "name", e.target.value)
                      }
                      onBlur={handleFieldBlur}
                      autoFocus
                    />
                  ) : (
                    <Box
                      sx={{
                        position: "relative",
                        "&:hover .edit-icon": { opacity: 1 },
                      }}
                    >
                      {row.name}
                      {!playing[row.name] && (
                        <IconButton
                          className="edit-icon"
                          sx={{
                            position: "absolute",
                            top: 0,
                            right: 0,
                            opacity: 0,
                            transition: "opacity 0.3s",
                          }}
                          onClick={() => handleEditField(row.id, "name")}
                        >
                          <Edit fontSize="small" />
                        </IconButton>
                      )}
                    </Box>
                  )}
                </TableCell>
                <TableCell>
                  {editingField.id === row.id &&
                  editingField.field === "website" ? (
                    <TextField
                      value={row.website}
                      onChange={(e) =>
                        handleFieldChange(row.id, "website", e.target.value)
                      }
                      onBlur={handleFieldBlur}
                      autoFocus
                    />
                  ) : (
                    <Box
                      sx={{
                        position: "relative",
                        "&:hover .edit-icon": { opacity: 1 },
                      }}
                    >
                      {row.website}
                      {!playing[row.name] && (
                        <IconButton
                          className="edit-icon"
                          sx={{
                            position: "absolute",
                            top: 0,
                            right: 0,
                            opacity: 0,
                            transition: "opacity 0.3s",
                          }}
                          onClick={() => handleEditField(row.id, "website")}
                        >
                          <Edit fontSize="small" />
                        </IconButton>
                      )}
                    </Box>
                  )}
                </TableCell>
                <TableCell>
                  {editingField.id === row.id &&
                  editingField.field === "keywords" ? (
                    <TextField
                      value={row.keywords}
                      onChange={(e) =>
                        handleFieldChange(row.id, "keywords", e.target.value)
                      }
                      onBlur={handleFieldBlur}
                      autoFocus
                    />
                  ) : (
                    <Box
                      sx={{
                        position: "relative",
                        "&:hover .edit-icon": { opacity: 1 },
                      }}
                    >
                      {row.keywords}
                      {!playing[row.name] && (
                        <IconButton
                          className="edit-icon"
                          sx={{
                            position: "absolute",
                            top: 0,
                            right: 0,
                            opacity: 0,
                            transition: "opacity 0.3s",
                          }}
                          onClick={() => handleEditField(row.id, "keywords")}
                        >
                          <Edit fontSize="small" />
                        </IconButton>
                      )}
                    </Box>
                  )}
                </TableCell>
                <TableCell
                  sx={{
                    color: row.views > 100 ? "green" : "red",
                    fontWeight: "bold",
                  }}
                >
                  {row.views}
                </TableCell>
                <TableCell>
                  <IconButton onClick={() => handlePlayPauseClick(row.name)}>
                    {playing[row.name] ? <StopIcon /> : <PlayArrow />}
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
        title="Eliminar Bot"
        message="¿Estás seguro de que quieres eliminar este bot?"
        deleteDialogOpen={deleteDialogOpen}
        handleCloseDeleteDialog={handleCloseDeleteDialog}
        handleDelete={handleDeleteBot}
      />
    </>
  );
};
