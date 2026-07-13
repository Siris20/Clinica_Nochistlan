import React, { useEffect, useState } from "react";
import CloseIcon from "@mui/icons-material/Close";
import {
  Autocomplete,
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import { DemoContainer } from "@mui/x-date-pickers/internals/demo";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import dayjs, { Dayjs } from "dayjs";
import { v4 as uuidv4 } from "uuid";
import { WhatsApp } from "@mui/icons-material";

export const DialogMessageComponent = ({
  open,
  setOpen,
  onAddMessage,
  onEditMessage,
  initialData,
}) => {
  const [message, setMessage] = useState(initialData?.message || "");
  const [image, setImage] = useState(initialData?.image || null);
  const [sentTo, setSentTo] = useState(initialData?.sent_to?.split(", ") || []);
  const [status, setStatus] = useState(initialData?.status || "Pendiente");
  const [sendingDate, setSendingDate] = useState(
    initialData?.sending_date ? dayjs(initialData.sending_date) : dayjs()
  );
  const [sendType, setSendType] = useState("immediate");

  const handleCloseDialog = () => {
    setOpen(false);
    if (!initialData) {
      setMessage("");
      setImage(null);
      setSentTo([]);
    }
  };

  const handleSubmit = () => {
    const newMessage = {
      id: initialData?.id || uuidv4(),
      message,
      image: image ? URL.createObjectURL(image) : null,
      sent_to: sentTo.join(", "),
      status: status,
      sending_date: sendingDate
        ? sendingDate.format("YYYY-MM-DDTHH:mm:ss")
        : null,
    };

    if (initialData) {
      onEditMessage(newMessage);
    } else {
      onAddMessage(newMessage);
    }
    handleCloseDialog();

    //Limpiar campos
    setMessage("");
    setImage(null);
    setSentTo([]);
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setImage(event.target.files[0]);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (event.dataTransfer.files && event.dataTransfer.files[0]) {
      setImage(event.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  //Cargar los datos del mensaje a editar
  useEffect(() => {
    if (initialData) {
      setMessage(initialData.message);
      setSentTo(initialData.sent_to.split(", "));
      setStatus(initialData.status);
      setSendingDate(dayjs(initialData.sending_date));
    }
  }, [initialData]);

  //Seleccionar el tipo de envio
  const handleSendTypeChange = (event, newSendType) => {
    if (newSendType !== null) {
      setSendType(newSendType);
    }
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={handleCloseDialog}
        PaperProps={{
          sx: {
            width: "730px",
            height: "90%",
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
          }}
        >
          {initialData ? "Editar Mensaje" : "Crear nuevo Mensaje"}

          {/* Si no hay datos iniciales, ponemos un toggleButton que seleccione envio inmediato o programar envio */}
          {!initialData && (
            <ToggleButtonGroup
              value={sendType}
              exclusive
              onChange={handleSendTypeChange}
              aria-label="send type"
              sx={{ marginRight: 2, borderRadius: 5, height: 40 }}
            >
              <ToggleButton
                value="immediate"
                aria-label="envio inmediato"
                sx={{ textTransform: "none" }}
              >
                Envio Inmediato
              </ToggleButton>
              <ToggleButton
                value="scheduled"
                aria-label="programar envio"
                sx={{ textTransform: "none" }}
              >
                Programar Envio
              </ToggleButton>
            </ToggleButtonGroup>
          )}
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
          <h5 style={{ margin: 16 }}>
            {initialData ? "Actualizar mensaje" : "Nuevo mensaje"}
          </h5>
          <TextField
            variant="outlined"
            label="Mensaje"
            fullWidth
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <h5 style={{ margin: 16 }}>Imagen</h5>
          <Box
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            sx={{
              border: "3px dashed rgb(218, 218, 218)",
              borderRadius: 4,
              padding: 2,
              textAlign: "center",
              cursor: "pointer",
            }}
          >
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              style={{ display: "none" }}
              id="image-upload"
            />
            <label htmlFor="image-upload">
              {image ? (
                <>
                  <img
                    src={URL.createObjectURL(image)}
                    alt="preview"
                    style={{ width: 100, height: 100 }}
                  />
                  <p>{image.name}</p>
                </>
              ) : (
                <>
                  <FileUploadIcon sx={{ fontSize: 40 }} />
                  <p>
                    Arrastra y suelta una imagen aquí o haz clic para
                    seleccionar
                  </p>
                </>
              )}
            </label>
          </Box>

          <h5 style={{ margin: 16 }}>Destinatarios</h5>
          <Autocomplete
            multiple
            options={["4495166589", "4495166590", "4495166588", "4495166587"]}
            value={sentTo}
            onChange={(event, newValue) => setSentTo(newValue)}
            disableCloseOnSelect
            renderOption={(props, option, { selected }) => {
              const { key, ...rest } = props;
              return (
                <li key={key} {...rest}>
                  <Checkbox style={{ marginRight: 8 }} checked={selected} />
                  {option}
                </li>
              );
            }}
            renderInput={(params) => (
              <TextField {...params} variant="outlined" label="Enviar a ..." />
            )}
            slotProps={{
              listbox: {
                style: { maxHeight: "160px", overflow: "auto" },
              },
            }}
          />
          {sendType === "scheduled" && (
            <>
              <h5 style={{ margin: 16 }}>Fecha y hora de envío</h5>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DemoContainer components={["DateTimePicker"]}>
                  <DateTimePicker
                    label="Fecha y hora de envío"
                    value={sendingDate}
                    onChange={(newValue) => setSendingDate(newValue)}
                    minDate={dayjs()}
                    sx={{ width: "100%" }}
                  />
                </DemoContainer>
              </LocalizationProvider>
            </>
          )}
        </DialogContent>
        <DialogActions>
          {sendType === "scheduled" ? (
            <Button
              onClick={handleSubmit}
              variant="contained"
              sx={{
                borderRadius: 100,
                backgroundColor: "#000",
                color: "#fff",
                fontFamily: "Inter, sans-serif",
                fontSize: 12,
              }}
            >
              {initialData ? "Actualizar Mensaje" : "Programar Mensaje"}
            </Button>
          ) : (
            //Este boton enviara los mensajes inmediatamente
            <Button
              variant="contained"
              sx={{
                borderRadius: 100,
                backgroundColor: "#000",
                color: "#fff",
                fontFamily: "Inter, sans-serif",
                fontSize: 12,
              }}
            >
              <WhatsApp sx={{ marginRight: 1 }} />
              Enviar mensaje
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </>
  );
};
