import {React,useEffect,useState,RefreshIcon,Calendar,momentLocalizer,DownloadIcon,EditIcon,DeleteIcon,moment,CheckCircleIcon,DeleteForeverIcon,
CancelIcon,SaveIcon,WhatsAppIcon,FaFileExcel,Header,CustomNavBarContent,CustomOffCanvasContent,Grid,Table,TableBody,TableCell,TableContainer,
TableHead,TableRow,Paper,Button,IconButton,Dialog,DialogActions,DialogContent,DialogContentText,DialogTitle,XLSX,UseSaveMessages,UseSendMessages,
} from "./index";
import "../styles/Header.css";
import { UseCalendar } from "../hooks/UseCalendar";

const localizer = momentLocalizer(moment);

// Función para crear datos
const createData = (phone_number,message,image_path,status,status_message) => {
  return { phone_number, message, image_path, status, status_message };
};

export const MessagesHandlerScreen = () => {
  //Estados
  const [rows, setRows] = useState([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [imagePath, setImagePath] = useState("");
  const [editAllMessagesButtonEnabled, setEditAllMessagesButtonEnabled] =
    useState(false);
  const [eventImported, setEventImported] = useState(false);

  // Hook useSaveMessages
  const {handleSendData,formData,handleGetData,handleGetDataReport,isSaved,isImported,setIsImported,whatsappButtonState,setWhatsappButtonState,
    timer,setTimer} = UseSaveMessages();

  // Hook useSendMessages
  const { handleSendMessages } = UseSendMessages();

  //Inserta y recupera eventos en mongo
  const { handleAddEvent, isSavedEvent,setIsSavedEvent } = UseCalendar();

  //Lista de eventos
  const [myEvents, setMyEvents] = useState([]);

  // Maneja la subida de archivos excel a la tabla de mensajes
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
      setIsImported(true);
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
      const parsedData = worksheet.map((row) =>
        createData(row.phone_number,row.message,row.image_path,row.status,row.status_message)
      );
      setRows(parsedData);
    };
    reader.readAsArrayBuffer(file);
  };

  //Maneja la subida de archivos para los eventos del calendario
  const handleFileEventUpload = async (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = (e) => {
      setEventImported(true);
      setIsSavedEvent(true);
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const json = XLSX.utils.sheet_to_json(worksheet);

      const events = json
        .map((row) => {
          const { title, month, day, message, image_path } = row;
          return generateYearlyEvents(title, month, day, message, image_path);
        })
        .flat();

      setMyEvents(events);
    };

    reader.readAsArrayBuffer(file);
  };

  // Función para generar eventos anuales
  const generateYearlyEvents = (title, month, day, message, image_path) => {
    const events = [];
    const currentYear = new Date().getFullYear();
    const endYear = currentYear + 10;

    for (let year = currentYear; year <= endYear; year++) {
      const start = new Date(year, month - 1, day, 0, 0, 0);
      const end = new Date(year, month - 1, day, 23, 59, 59);
      events.push({ title, start, end, message, image_path });
    }

    return events;
  };

  //Obtiene los eventos del calendario
  const handleGetEvents = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_SERVER}/get_events`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
  
      if (response.ok) {
        const result = await response.json();
        setMyEvents(result)
      }
    } catch (error) {
      throw new Error("Error al recuperar los eventos");
    }
  }

  // Actualiza el estado de las filas
  const handleInputChange = (index, field, value) => {
    const updatedRows = [...rows];
    updatedRows[index][field] = value;
    setRows(updatedRows);
  };

  // Maneja la edición de las celdas
  const handleCellEdit = (index, field, event) => {
    handleInputChange(index, field, event.target.innerText);
  };

  // Maneja la edición de mensajes
  const handleEditMessage = async (index) => {
    const messageId = rows[index]._id;
    const updatedMessage = rows[index];

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_SERVER}/edit_message/${messageId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedMessage),
        }
      );

      if (response.ok) {
        alert("Mensaje editado correctamente");
      } else {
        const errorData = await response.json().catch(() => null);
        if (errorData) {
          alert(`Error al editar el mensaje: ${errorData.error}`);
        } else {
          alert(`Error al editar el mensaje: Respuesta no válida del servidor`);
        }
      }
    } catch (error) {
      throw new Error("Error al editar el mensaje");
    }
  };

  //Maneja la edición de todos los mensajes
  const handleEditAllMessages = async () => {
    try {
      const updateData = {
        message,
        image_path: imagePath,
      };

      const response = await fetch(`${import.meta.env.VITE_API_SERVER}/edit_all_messages`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      if (response.ok) {
        alert("Todos los mensajes han sido editados correctamente");
        setEditDialogOpen(false);
      } else {
        const errorData = await response.json().catch(() => null);
        if (errorData) {
          alert(`Error al editar todos los mensajes: ${errorData.error}`);
        } else {
          alert(
            "Error al editar todos los mensajes: Respuesta no válida del servidor"
          );
        }
      }
    } catch (error) {
      throw new Error("Error al editar todos los mensajes");
    }
  };

  // Maneja la eliminación de mensajes
  const handleDelete = async (index) => {
    const messageId = rows[index]._id;
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_SERVER}/delete_message/${messageId}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        const newRows = [...rows];
        newRows.splice(index, 1);
        alert("Mensaje eliminado correctamente");
        setRows(newRows);
      } else {
        const errorData = await response.json().catch(() => null);
        if (errorData) {
          alert(`Error al eliminar el mensaje`);
        } else {
          alert(
            `Error al eliminar el mensaje: Respuesta no válida del servidor`
          );
        }
      }
    } catch (error) {
      throw new Error("Error al eliminar el mensaje");
    }
  };

  //Maneja la eliminación de todos los mensajes
  const handleDeleteAll = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_SERVER}/delete_all_messages`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        alert(
          "Todos los mensajes han sido eliminados correctamente, te recomendamos refrescar la página"
        );
        setRows([]);
        setDeleteDialogOpen(false);
      } else {
        const errorData = await response.json().catch(() => null);
        if (errorData) {
          alert(`Error al eliminar todos los mensajes: ${errorData.error}`);
        } else {
          alert(
            `Error al eliminar todos los mensajes: Respuesta no válida del servidor`
          );
        }
      }
    } catch (error) {
      throw new Error("Error al eliminar todos los mensajes");
    }
  };


  //Eliminar todos los eventos del calendario

  const handleDeleteAllEvents = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_SERVER}/delete_all_events`, {
        method: "DELETE",
      });

      if (response.ok) {
        alert("Todos los eventos han sido eliminados correctamente, te recomdamos refrescar la página");
        setMyEvents([]);
      } else {
        const errorData = await response.json().catch(() => null);
        if (errorData) {
          alert(`Error al eliminar todos los eventos: ${errorData.error}`);
        } else {
          alert(
            `Error al eliminar todos los eventos: Respuesta no válida del servidor`
          );
        }
      }
    } catch (error) {
      throw new Error("Error al eliminar todos los eventos");
    }
  };


  //Apertura y cierre del modal de borrar
  const handleDeleteDialogOpen = () => {
    setDeleteDialogOpen(true);
  };

  const handleDeleteDialogClose = () => {
    setDeleteDialogOpen(false);
  };

  //Abrir y cerrar modal de editar
  const handleEditDialogOpen = () => {
    setEditDialogOpen(true);
  };

  const handleEditDialogClose = () => {
    setEditDialogOpen(false);
  };

  //Abrir detalles del evento
  const handleSelectEvent = (event) => {
    setSelectedEvent(event);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedEvent(null);
  };

  //Actualizar mensajes desde el calendario
  const handleFillValues = () => {
    const updatedRows = rows.map((row) => ({
      ...row,
      message: selectedEvent.message,
      image_path: selectedEvent.image_path,
    }));
    setRows(updatedRows);

    setMessage(selectedEvent.message);
    setImagePath(selectedEvent.image_path);
    handleClose();
    setEditAllMessagesButtonEnabled(true);
  };

  const handleSendingMessages = () => {
    handleSendMessages();
    setWhatsappButtonState("pending");
    setTimer(10);

    // Temporizador
    setTimeout(() => {
      setWhatsappButtonState("active");
    }, 10000);
  };

  // Actualiza el estado de las filas cuando se obtienen los datos
  useEffect(() => {
    if (formData.length > 0) {
      setRows(formData);
    }
  }, [formData]);

  useEffect(() => {
    handleGetData();
    handleGetEvents();
  }, []);

  return (
    <>
      <Header
        customNavBarContent={<CustomNavBarContent />}
        customOffCanvasContent={<CustomOffCanvasContent />}
      />
      <Grid container spacing={2} style={{ margin: "20px" }}>
        <Grid item xs={12} md={4}>
          <input
            type="file"
            accept=".xlsx, .xls"
            style={{ display: "none" }}
            id="excelFileInput"
            onChange={handleFileUpload}
            disabled={isImported}
          />
          <label htmlFor="excelFileInput">
            <Button
              variant="contained"
              color="success"
              component="span"
              style={{ marginRight: "10px" }}
              disabled={isImported}
            >
              <FaFileExcel style={{ fontSize: "24px", marginRight: "8px" }} />
              Importar Excel
            </Button>
          </label>
          <Button
            variant="contained"
            color="primary"
            component="span"
            onClick={() => handleSendData(rows)}
            style={{ marginRight: "10px" }}
            disabled={isSaved}
          >
            <SaveIcon style={{ fontSize: "24px" }} />
          </Button>
          <Button
            variant="contained"
            style={{
              backgroundColor: "grey",
              color: "#fff",
              marginRight: "10px",
            }}
            component="span"
            onClick={handleGetData}
          >
            <RefreshIcon style={{ fontSize: "24px" }} />
          </Button>
          <Button
            variant="contained"
            color="warning"
            component="span"
            style={{ marginRight: "10px" }}
            onClick={handleEditDialogOpen}
            disabled={!editAllMessagesButtonEnabled}
          >
            <EditIcon style={{ fontSize: "24px" }} />
          </Button>
          <Dialog
            open={editDialogOpen}
            onClose={handleEditDialogClose}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
          >
            <DialogTitle id="alert-dialog-title">
              {"Editar todos los mensajes"}
            </DialogTitle>
            <DialogContent>
              <DialogContentText id="alert-dialog-description">
                ¿Estás seguro de que deseas editar todos los mensajes?
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleEditDialogClose} color="primary">
                Cancelar
              </Button>
              <Button onClick={handleEditAllMessages} color="primary" autoFocus>
                Editar
              </Button>
            </DialogActions>
          </Dialog>
          <Button
            variant="contained"
            color="error"
            component="span"
            onClick={handleDeleteDialogOpen}
          >
            <DeleteForeverIcon style={{ fontSize: "24px" }} />
          </Button>
          <Dialog
            open={deleteDialogOpen}
            onClose={handleDeleteDialogOpen}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
          >
            <DialogTitle id="alert-dialog-title">
              {"Eliminar todos los mensajes"}
            </DialogTitle>
            <DialogContent>
              <DialogContentText id="alert-dialog-description">
                ¿Estás seguro de que deseas eliminar todos los mensajes? Esta es
                una acción irreversible.
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleDeleteDialogClose} color="primary">
                Cancelar
              </Button>
              <Button onClick={handleDeleteAll} color="primary" autoFocus>
                Eliminar
              </Button>
            </DialogActions>
          </Dialog>
          <TableContainer
            component={Paper}
            style={{ maxHeight: 500, marginTop: "10px" }}
          >
            <Table aria-label="simple table">
              <TableHead sx={{ backgroundColor: "#EEEEEE" }}>
                <TableRow>
                  <TableCell>Teléfono</TableCell>
                  <TableCell>Mensaje</TableCell>
                  <TableCell>Imagen</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Informacion</TableCell>
                  <TableCell>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row, index) => (
                  <TableRow key={index}>
                    <TableCell
                      contentEditable
                      suppressContentEditableWarning
                      onBlur={(e) => handleCellEdit(index, "phone_number", e)}
                    >
                      {row.phone_number}
                    </TableCell>
                    <TableCell
                      contentEditable
                      suppressContentEditableWarning
                      onBlur={(e) => handleCellEdit(index, "message", e)}
                    >
                      {row.message}
                    </TableCell>
                    <TableCell
                      contentEditable
                      suppressContentEditableWarning
                      onBlur={(e) => handleCellEdit(index, "image_path", e)}
                    >
                      {row.image_path}
                    </TableCell>
                    <TableCell>
                      {row.status === 1 ? (
                        <CheckCircleIcon style={{ color: "green" }} />
                      ) : row.status === 0 ? (
                        <CancelIcon style={{ color: "red" }} />
                      ) : null}
                    </TableCell>
                    <TableCell>{row.status_message}</TableCell>
                    <TableCell>
                      <IconButton
                        onClick={() => handleEditMessage(index)}
                        sx={{ color: "#201E43" }}
                        disabled={!isSaved}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        onClick={() => handleDelete(index)}
                        sx={{ color: "#A91D3A" }}
                        disabled={!isSaved}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          {formData.length === 0 ? (
            <p style={{ color: "red", fontWeight: "bolder" }}>
              Recarga para ver los datos, si no existen, por favor carga un
              archivo excel y da clic en guardar
            </p>
          ) : (
            <p style={{ color: "green", fontWeight: "bolder" }}>
              Datos cargados correctamente
            </p>
          )}
          <Button
            variant="contained"
            color={
              whatsappButtonState === "blocked"
                ? "error"
                : whatsappButtonState === "pending"
                ? "warning"
                : "success"
            }
            style={{
              marginTop: "10px",
              marginRight: "10px",
            }}
            onClick={handleSendingMessages}
            disabled={whatsappButtonState !== "active"}
          >
            <WhatsAppIcon style={{ fontSize: "24px", marginRight: "8px" }} />
            {whatsappButtonState === "blocked"
              ? "Bloqueado"
              : whatsappButtonState === "pending"
              ? `Esperando... ${timer}`
              : "Enviar WhatsApp"}
          </Button>
          <Button
            variant="contained"
            component="span"
            style={{
              marginTop: "10px",
              backgroundColor: "#E4E0E1",
              color: "#000",
            }}
            onClick={handleGetDataReport}
          >
            <DownloadIcon style={{ fontSize: "24px", marginRight: "8px" }} />
            Reporte
          </Button>
        </Grid>
        <Grid item xs={12} md={8}>
          <div
            style={{
              height: "500px",
            }}
          >
            <input
              type="file"
              accept=".xlsx, .xls"
              style={{ display: "none" }}
              id="excelEventInput"
              onChange={handleFileEventUpload}
              disabled={eventImported}
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
                }}
                disabled={eventImported}
              >
                <FaFileExcel style={{ fontSize: "24px", marginRight: "8px" }} />
                Importar Excel
              </Button>
            </label>
            <Button
              variant="contained"
              color="primary"
              component="span"
              style={{ marginBottom: "10px", marginRight:"8px", justifyContent: "center" }}
              onClick={() => handleAddEvent(myEvents)}
              disabled={!isSavedEvent}
            >
              <SaveIcon style={{ fontSize: "24px" }} />
            </Button>
            <Button
              variant="contained"
              color="error"
              component="span"
              style={{ marginBottom: "10px", justifyContent: "center" }}
              onClick={handleDeleteAllEvents}
            >
              <DeleteForeverIcon style={{ fontSize: "24px" }} />
            </Button>
            <Calendar
              localizer={localizer}
              events={myEvents}
              startAccessor="start"
              endAccessor="end"
              style={{ height: 500, width: "80%" }}
              onSelectEvent={handleSelectEvent}
            />
            <Dialog open={open} onClose={handleClose}>
              <DialogTitle>{selectedEvent?.title}</DialogTitle>
              <DialogContent>
                <DialogContentText>
                  <strong>Mensaje:</strong> {selectedEvent?.message}
                </DialogContentText>
                <DialogContentText>
                  <strong>Imagen:</strong> {selectedEvent?.image_path}
                </DialogContentText>
              </DialogContent>
              <DialogActions>
                <Button onClick={handleFillValues} color="primary">
                  Llenar Valores
                </Button>
                <Button onClick={handleClose} color="primary">
                  Cerrar
                </Button>
              </DialogActions>
            </Dialog>
          </div>
        </Grid>
      </Grid>
    </>
  );
};
