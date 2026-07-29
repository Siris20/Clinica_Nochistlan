import React from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "moment/locale/es";
import "react-big-calendar/lib/css/react-big-calendar.css";

moment.locale("es");
const localizer = momentLocalizer(moment);

const COLORES_ESTADO: Record<string, { bg: string; text: string }> = {
  PENDIENTE: { bg: "#FFF3E0", text: "#E65100" },
  CONFIRMADA: { bg: "#E3F2FD", text: "#0D47A1" },
  PROGRAMADA: { bg: "#E1F5FE", text: "#0288D1" },
  COMPLETADA: { bg: "#E8F5E9", text: "#1B5E20" },
  CANCELADA: { bg: "#FFEBEE", text: "#C62828" },
  NO_ASISTIO: { bg: "#EDE7F6", text: "#512DA8" },
};

const CustomToolbar = (toolbar: any) => (
  <div className="rbc-toolbar" style={{ marginBottom: "15px" }}>
    <span className="rbc-btn-group">
      <button type="button" onClick={() => toolbar.onNavigate("PREV")}>Atrás</button>
      <button type="button" onClick={() => toolbar.onNavigate("TODAY")}>Hoy</button>
      <button type="button" onClick={() => toolbar.onNavigate("NEXT")}>Siguiente</button>
    </span>
    <span className="rbc-toolbar-label" style={{ fontWeight: "bold", fontSize: "1.1rem" }}>
      {toolbar.label}
    </span>
    <span className="rbc-btn-group">
      <button type="button" onClick={() => toolbar.onView("month")}>Mes</button>
      <button type="button" onClick={() => toolbar.onView("day")}>Día</button>
      <button type="button" onClick={() => toolbar.onView("agenda")}>Agenda</button>
    </span>
  </div>
);

interface CustomCalendarProps {
  events: any[];
  onSelectSlot: (slotInfo: any) => void;
  onSelectEvent: (event: any) => void;
}

export const CustomCalendar: React.FC<CustomCalendarProps> = ({
  events,
  onSelectSlot,
  onSelectEvent,
}) => {
  const eventStyleGetter = (event: any) => {
    const estado = event.estado || "PENDIENTE";
    const colores = COLORES_ESTADO[estado] || { bg: "#3174ad", text: "#ffffff" };

    return {
      style: {
        backgroundColor: colores.bg,
        color: colores.text,
        borderRadius: "5px",
        opacity: 0.9,
        border: `1px solid ${colores.text}`,
        display: "block",
        fontWeight: "500",
      },
    };
  };

  return (
    <Calendar
      localizer={localizer}
      events={events}
      startAccessor="start"
      endAccessor="end"
      style={{ height: 600 }}
      selectable
      onSelectSlot={onSelectSlot}
      onSelectEvent={onSelectEvent}
      components={{ toolbar: CustomToolbar }}
      eventPropGetter={eventStyleGetter}
      messages={{
        next: "Sig.",
        previous: "Ant.",
        today: "Hoy",
        month: "Mes",
        week: "Semana",
        day: "Día",
        agenda: "Agenda",
      }}
    />
  );
};