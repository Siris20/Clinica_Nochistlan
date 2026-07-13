// components/VisitCounter.tsx
import { useState, useEffect } from "react";
import { useVisitCounter } from "../hooks/useVisitCounter";

export const VisitCounter = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { visits: stats, loading, error, initializeVisitTracking } = useVisitCounter();

  useEffect(() => {
    initializeVisitTracking();
  }, []);

const formatDate = (dateString: string) => {
  // Parseamos la fecha manualmente para evitar problemas de timezone
  const [year, month, day] = dateString.split('-');
  const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  
  return date.toLocaleDateString('es-ES', { 
    day: '2-digit', 
    month: '2-digit', 
    year: 'numeric' 
  });
};

  const formatWeek = (weekString: string) => {
    const [year, week] = weekString.split('-W');
    return `Semana ${week}, ${year}`;
  };

  const formatMonth = (monthString: string) => {
    const [year, month] = monthString.split('-');
    const monthNames = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    return `${monthNames[parseInt(month) - 1]} ${year}`;
  };

  const isMobile = window.innerWidth < 768;

  if (loading) {
    return (
      <div className={`${isMobile ? 'mobile-counter-content' : 'desktop-counter-content'}`}>
        <div className="backdrop-blur-md rounded-full border border-white/25 bg-white/15 px-5 py-3">
          <span className="text-white text-sm">Cargando estadísticas...</span>
        </div>
      </div>
    );
  }

  if (error || !stats) return null;

  // 📱 MOBILE: Diseño de bloque sin position absolute
  if (isMobile) {
    return (
      <div className="mobile-counter-content">
        {/* Vista compacta mobile */}
        <div
          className={`backdrop-blur-md rounded-full border transition-all duration-300 hover:scale-105 shadow-lg cursor-pointer mx-auto max-w-xs ${
            isExpanded ? 'rounded-b-none' : ''
          }`}
          style={{
            backgroundColor: "rgba(30, 30, 30, 0.85)",
            borderColor: "rgba(60, 60, 60, 0.4)",
            padding: "12px 20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <span className="text-white text-xs font-light">
            🌐 {stats.total_visits} {stats.total_visits === 1 ? 'visita' : 'visitas'}
            <span className="ml-2 text-xs opacity-75">
              {isExpanded ? '▼' : '▲'}
            </span>
          </span>
        </div>

        {/* Vista expandida mobile */}
        {isExpanded && (
          <div
            className="backdrop-blur-md border-t-0 rounded-b-2xl border shadow-lg mx-auto max-w-xs"
            style={{
              backgroundColor: "rgba(30, 30, 30, 0.85)",
              borderColor: "rgba(60, 60, 60, 0.4)",
              padding: "20px",
              marginTop: "-1px"
            }}
          >
            <div className="text-white space-y-4">
              {/* Estadísticas principales */}
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="space-y-1">
                  <div className="font-medium">📊 Total de visitas</div>
                  <div className="text-lg font-bold">{stats.total_visits}</div>
                </div>
                <div className="space-y-1">
                  <div className="font-medium">📈 Promedio diario</div>
                  <div className="text-lg font-bold">{stats.daily_average.toFixed(2)}</div>
                </div>
              </div>

              {/* Días máximo y mínimo - COMPLETO */}
              <div className="border-t pt-3 space-y-2" style={{borderColor: "rgba(80, 80, 80, 0.3)"}}>
                <div className="text-xs">
                  <div className="font-medium mb-1">🔥 Día con más visitas</div>
                  <div className="text-sm opacity-90">
                    {formatDate(stats.max_day.date)} - {stats.max_day.visits} {stats.max_day.visits === 1 ? 'visita' : 'visitas'}
                  </div>
                </div>
                <div className="text-xs">
                  <div className="font-medium mb-1">📉 Día con menos visitas</div>
                  <div className="text-sm opacity-90">
                    {formatDate(stats.min_day.date)} - {stats.min_day.visits} {stats.min_day.visits === 1 ? 'visita' : 'visitas'}
                  </div>
                </div>
              </div>

              {/* TODOS los períodos - COMPLETO */}
              <div className="border-t pt-3 space-y-3" style={{borderColor: "rgba(80, 80, 80, 0.3)"}}>
                {/* Visitas diarias */}
                {stats.daily_visits.length > 0 && (
                  <div>
                    <div className="font-medium text-xs mb-2">📅 Visitas diarias</div>
                    <div className="space-y-1 max-h-20 overflow-y-auto">
                      {stats.daily_visits.map((day, index) => (
                        <div key={index} className="text-xs opacity-90 flex justify-between">
                          <span>{formatDate(day.date)}</span>
                          <span>{day.visits}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Visitas semanales */}
                {stats.weekly_visits.length > 0 && (
                  <div>
                    <div className="font-medium text-xs mb-2">📊 Visitas semanales</div>
                    <div className="space-y-1">
                      {stats.weekly_visits.map((week, index) => (
                        <div key={index} className="text-xs opacity-90 flex justify-between">
                          <span>{formatWeek(week.date)}</span>
                          <span>{week.visits}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Visitas mensuales */}
                {stats.monthly_visits.length > 0 && (
                  <div>
                    <div className="font-medium text-xs mb-2">🗓️ Visitas mensuales</div>
                    <div className="space-y-1">
                      {stats.monthly_visits.map((month, index) => (
                        <div key={index} className="text-xs opacity-90 flex justify-between">
                          <span>{formatMonth(month.date)}</span>
                          <span>{month.visits}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Período completo */}
              <div className="border-t pt-2 text-xs opacity-75" style={{borderColor: "rgba(80, 80, 80, 0.3)"}}>
                Período: {formatDate(stats.period.start_date)} - {formatDate(stats.period.end_date)}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // 🖥️ DESKTOP: Diseño flotante original
  return (
    <div 
      className="desktop-counter-content"
      style={{
        position: 'absolute',
        bottom: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 20,
        padding: '0 16px',
        width: '350px',
        maxWidth: '90vw'
      }}
    >
      {/* Vista expandida desktop - ARRIBA */}
      {isExpanded && (
        <div
          className="backdrop-blur-md border rounded-t-2xl border shadow-lg mb-1"
          style={{
            backgroundColor: "rgba(255, 255, 255, 0.15)",
            borderColor: "rgba(255, 255, 255, 0.25)",
            padding: "20px"
          }}
        >
          <div className="text-white space-y-4">
            {/* Estadísticas principales */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="space-y-1">
                <div className="font-medium">📊 Total de visitas</div>
                <div className="text-lg font-bold">{stats.total_visits}</div>
              </div>
              <div className="space-y-1">
                <div className="font-medium">📈 Promedio diario</div>
                <div className="text-lg font-bold">{stats.daily_average.toFixed(2)}</div>
              </div>
            </div>

            {/* Días máximo y mínimo */}
            <div className="border-t pt-3 space-y-2" style={{borderColor: "rgba(255, 255, 255, 0.2)"}}>
              <div className="text-sm">
                <div className="font-medium mb-1">🔥 Día con más visitas</div>
                <div className="text-sm opacity-90">
                  {formatDate(stats.max_day.date)} - {stats.max_day.visits} {stats.max_day.visits === 1 ? 'visita' : 'visitas'}
                </div>
              </div>
              <div className="text-sm">
                <div className="font-medium mb-1">📉 Día con menos visitas</div>
                <div className="text-sm opacity-90">
                  {formatDate(stats.min_day.date)} - {stats.min_day.visits} {stats.min_day.visits === 1 ? 'visita' : 'visitas'}
                </div>
              </div>
            </div>

            {/* Todos los datos completos para desktop */}
            <div className="border-t pt-3 space-y-3" style={{borderColor: "rgba(255, 255, 255, 0.2)"}}>
              {/* Visitas diarias */}
              {stats.daily_visits.length > 0 && (
                <div>
                  <div className="font-medium text-sm mb-2">📅 Visitas diarias</div>
                  <div className="space-y-1 max-h-20 overflow-y-auto">
                    {stats.daily_visits.map((day, index) => (
                      <div key={index} className="text-xs opacity-90 flex justify-between">
                        <span>{formatDate(day.date)}</span>
                        <span>{day.visits}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Visitas semanales */}
              {stats.weekly_visits.length > 0 && (
                <div>
                  <div className="font-medium text-sm mb-2">📊 Visitas semanales</div>
                  <div className="space-y-1">
                    {stats.weekly_visits.map((week, index) => (
                      <div key={index} className="text-xs opacity-90 flex justify-between">
                        <span>{formatWeek(week.date)}</span>
                        <span>{week.visits}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Visitas mensuales */}
              {stats.monthly_visits.length > 0 && (
                <div>
                  <div className="font-medium text-sm mb-2">🗓️ Visitas mensuales</div>
                  <div className="space-y-1">
                    {stats.monthly_visits.map((month, index) => (
                      <div key={index} className="text-xs opacity-90 flex justify-between">
                        <span>{formatMonth(month.date)}</span>
                        <span>{month.visits}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Período */}
            <div className="border-t pt-2 text-xs opacity-75" style={{borderColor: "rgba(255, 255, 255, 0.2)"}}>
              Período: {formatDate(stats.period.start_date)} - {formatDate(stats.period.end_date)}
            </div>
          </div>
        </div>
      )}

      {/* Vista compacta desktop */}
      <div
        className={`backdrop-blur-md rounded-full border transition-all duration-300 hover:scale-105 shadow-lg cursor-pointer ${
          isExpanded ? 'rounded-t-none' : ''
        }`}
        style={{
          backgroundColor: "rgba(255, 255, 255, 0.15)",
          borderColor: "rgba(255, 255, 255, 0.25)",
          padding: "12px 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}
        onClick={() => setIsExpanded(!isExpanded)}
        onMouseEnter={(e) => {
          (e.target as HTMLElement).style.backgroundColor = "rgba(255, 255, 255, 0.25)";
        }}
        onMouseLeave={(e) => {
          (e.target as HTMLElement).style.backgroundColor = "rgba(255, 255, 255, 0.15)";
        }}
      >
        <span className="text-white text-sm font-light">
          🌐 {stats.total_visits} {stats.total_visits === 1 ? 'persona ha visitado' : 'personas han visitado'} este sitio
          <span className="ml-2 text-xs opacity-75">
            {isExpanded ? '▼' : '▲'}
          </span>
        </span>
      </div>
    </div>
  );
};