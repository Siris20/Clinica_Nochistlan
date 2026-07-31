import moment from "moment";
import "moment/locale/es";
import React, { useEffect, useState } from "react";
import { momentLocalizer, Calendar } from "react-big-calendar";
import { UseCalendar } from "../../../hooks/UseCalendar";
import Loader from "../../Loader";
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@mui/material";

const localizer = momentLocalizer(moment);

const CustomToolbar = (toolbar) => {
  const goToBack = () => {
    toolbar.onNavigate("PREV");
  };

  const goToNext = () => {
    toolbar.onNavigate("NEXT");
  };

  const goToCurrent = () => {
    toolbar.onNavigate("TODAY");
  };

  return (
    <div className="rbc-toolbar">
      <span className="rbc-btn-group">
        <button type="button" onClick={goToBack}>
          Atras
        </button>
        <button type="button" onClick={goToCurrent}>
          Hoy
        </button>
        <button type="button" onClick={goToNext}>
          Siguiente
        </button>
      </span>
      <span className="rbc-toolbar-label">{toolbar.label}</span>
      <span className="rbc-btn-group">
        <button type="button" onClick={() => toolbar.onView("month")}>
          Mes
        </button>
        <button type="button" onClick={() => toolbar.onView("day")}>
          Dia
        </button>
        <button type="button" onClick={() => toolbar.onView("agenda")}>
          Agenda
        </button>
      </span>
    </div>
  );
};

export const CalendarComponent = () => {
  const { handleGetEvents, myEvents, loadingEvents } = UseCalendar();
  const [currentView, setCurrentView] = useState<"month" | "day" | "agenda">("month");

    const [open, setOpen] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState<{
      title: string;
      message: string;
      image_path: string;
    } | null>(null);
  
    useEffect(() => {
      handleGetEvents();
    }, []);
  
    const handleSelectEvent = (event) => {
      setSelectedEvent(event);
      setOpen(true);
    };
  
    const handleClose = () => {
      setOpen(false);
      setSelectedEvent(null);
    };

  return (
    <>
      {loadingEvents ? (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100%",
          }}
        >
          <Loader />
        </div>
      ) : (
        <Calendar
          localizer={localizer}
          events={myEvents}
          startAccessor="start"
          endAccessor="end"
          view={currentView}
          onView={setCurrentView}
          defaultView="month"
          views={["month", "day", "agenda"]}
          style={{ height: 500 }}
          components={{
            toolbar: CustomToolbar,
          }}
          messages={{
            next: "Sig.",
            previous: "Ant.",
            today: "Hoy",
            month: "Mes",
            week: "Semana",
            day: "Día",
            agenda: "Agenda",
          }}
          onSelectEvent={handleSelectEvent}
        />
      )}
       {/* Modal */}
       <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Detalles del Evento</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {selectedEvent && (
              <>
                <strong>Título:</strong> {selectedEvent.title}
                <br />
                <strong>Mensaje:</strong> {selectedEvent.message}
                <br />
                <strong>Imagen:</strong> {selectedEvent.image_path}
                <br />
              </>
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
