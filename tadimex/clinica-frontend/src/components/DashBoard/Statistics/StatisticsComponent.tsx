import React, { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  ButtonGroup,
  Tooltip,
  ToggleButton,
  ToggleButtonGroup,
  IconButton,
} from "@mui/material";
import {
  TrendingUp,
  TrendingDown,
  Visibility,
  ZoomIn,
  ZoomOut,
  RestartAlt,
  ChevronLeft,
  ChevronRight,
  CalendarToday,
  DateRange,
  Schedule,
  OpenInNew,
  Add,
} from "@mui/icons-material";
import Chart from "react-apexcharts";
import { useVisitCounter } from "../../../hooks/useVisitCounter";
import dayjs from "dayjs";
import { toast, ToastContainer } from "react-toastify";
import { RegisterWebsiteModal } from "./RegisterWebsiteModal";

interface Website {
  id: number;
  name: string;
  domain: string;
}

export const StatisticsComponent = () => {
  const {
    allWebsites,
    handleGetAllWebsites,
    handleGetVisits,
    handleRegisterWebsite,
    visits,
    loading,
  } = useVisitCounter();
  const [selectedWebsite, setSelectedWebsite] = useState("");
  const [viewMode, setViewMode] = useState("daily"); // daily, weekly, monthly
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);

  useEffect(() => {
    handleGetAllWebsites();
  }, []);

  const handleWebsiteChange = (event: SelectChangeEvent<string>) => {
    const websiteId = Number(event.target.value);
    setSelectedWebsite(event.target.value);

    const selectedSite = (allWebsites as Website[]).find(
      (website) => website.id === websiteId
    );
    if (selectedSite && selectedSite.domain) {
      handleGetVisits(selectedSite.domain);
    }
  };

  const handleViewModeChange = (
    event: React.MouseEvent<HTMLElement>,
    newViewMode: string
  ) => {
    if (newViewMode !== null) {
      setViewMode(newViewMode);
    }
  };

  const handleVisitWebsite = (domain: string, event: React.MouseEvent) => {
    event.stopPropagation();
    const url = domain.startsWith("http") ? domain : `https://${domain}`;
    window.open(url, "_blank");
  };

  //Funcion para registrar un nuevo sitio web
  const handleAddWebsite = async (newWebsite) => {
    try {
      await handleRegisterWebsite(newWebsite);
      toast.success("Sitio web agregado correctamente");
    } catch (error) {
      toast.error("Error al agregar sitio web");
    }
  };

  const formatNumber = (num: number) => {
    return num.toLocaleString("es-MX");
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = dayjs(dateString).startOf("day");
    return date.format("DD/MM/YYYY");
  };

  const formatWeekDate = (weekString) => {
    if (!weekString) return "";
    const [year, week] = weekString.split("-W");
    return `Semana ${week}, ${year}`;
  };

  const formatMonthDate = (monthString) => {
    if (!monthString) return "";
    const [year, month] = monthString.split("-");
    const monthNames = [
      "Enero",
      "Febrero",
      "Marzo",
      "Abril",
      "Mayo",
      "Junio",
      "Julio",
      "Agosto",
      "Septiembre",
      "Octubre",
      "Noviembre",
      "Diciembre",
    ];
    return `${monthNames[parseInt(month) - 1]} ${year}`;
  };

  // Función para obtener estadísticas según el modo de vista
  const getVisitStats = () => {
    if (!visits) {
      return [
        {
          title: "Total de Visitas",
          value: "0",
          trend: "up",
          color: "#4caf50",
        },
        {
          title: "Promedio Diario",
          value: "0",
          trend: "up",
          color: "#2196f3",
        },
        {
          title: "Día con Más Visitas",
          value: "0",
          trend: "up",
          color: "#ff9800",
        },
        {
          title: "Día con Menos Visitas",
          value: "0",
          trend: "up",
          color: "#9c27b0",
        },
      ];
    }

    const baseStats = [
      {
        title: "Total de Visitas",
        value: formatNumber(visits.total_visits),
        trend: "up",
        color: "#4caf50",
        subtitle: `Período: ${formatDate(
          visits.period.start_date
        )} - ${formatDate(visits.period.end_date)}`,
      },
      {
        title: "Promedio Diario",
        value: visits.daily_average.toFixed(2),
        trend: "up",
        color: "#2196f3",
        subtitle: "Visitas por día",
      },
    ];

    // Estadísticas específicas según el modo de vista
    if (viewMode === "weekly" && visits.weekly_visits?.length) {
      const maxWeek = visits.weekly_visits.reduce((max, week) =>
        week.visits > max.visits ? week : max
      );
      const minWeek = visits.weekly_visits.reduce((min, week) =>
        week.visits < min.visits ? week : min
      );

      baseStats.push(
        {
          title: "Semana con Más Visitas",
          value: formatNumber(maxWeek.visits),
          trend: "up",
          color: "#ff9800",
          subtitle: formatWeekDate(maxWeek.date),
        },
        {
          title: "Semana con Menos Visitas",
          value: formatNumber(minWeek.visits),
          trend: "down",
          color: "#9c27b0",
          subtitle: formatWeekDate(minWeek.date),
        }
      );
    } else if (viewMode === "monthly" && visits.monthly_visits?.length) {
      const maxMonth = visits.monthly_visits.reduce((max, month) =>
        month.visits > max.visits ? month : max
      );
      const minMonth = visits.monthly_visits.reduce((min, month) =>
        month.visits < min.visits ? month : min
      );

      baseStats.push(
        {
          title: "Mes con Más Visitas",
          value: formatNumber(maxMonth.visits),
          trend: "up",
          color: "#ff9800",
          subtitle: formatMonthDate(maxMonth.date),
        },
        {
          title: "Mes con Menos Visitas",
          value: formatNumber(minMonth.visits),
          trend: "down",
          color: "#9c27b0",
          subtitle: formatMonthDate(minMonth.date),
        }
      );
    } else {
      baseStats.push(
        {
          title: "Día con Más Visitas",
          value: formatNumber(visits.max_day.visits),
          trend: "up",
          color: "#ff9800",
          subtitle: formatDate(visits.max_day.date),
        },
        {
          title: "Día con Menos Visitas",
          value: formatNumber(visits.min_day.visits),
          trend: "down",
          color: "#9c27b0",
          subtitle: formatDate(visits.min_day.date),
        }
      );
    }

    return baseStats;
  };

  const stockData = getVisitStats();

  // Función para obtener datos de tabla según el modo de vista
  const getTopVisitPeriods = () => {
    if (!visits) return [];

    let data = [];
    let totalVisits = visits.total_visits;

    if (viewMode === "weekly" && visits.weekly_visits?.length) {
      data = visits.weekly_visits
        .filter((week) => week.visits > 0)
        .sort((a, b) => b.visits - a.visits)
        .slice(0, 5)
        .map((week) => ({
          period: formatWeekDate(week.date),
          fullPeriod: formatWeekDate(week.date),
          visits: week.visits,
          percentage: ((week.visits / totalVisits) * 100).toFixed(1),
          status:
            week.visits >=
            Math.max(...visits.weekly_visits.map((w) => w.visits)) * 0.8
              ? "high"
              : week.visits >=
                Math.max(...visits.weekly_visits.map((w) => w.visits)) * 0.5
              ? "medium"
              : "low",
        }));
    } else if (viewMode === "monthly" && visits.monthly_visits?.length) {
      data = visits.monthly_visits
        .filter((month) => month.visits > 0)
        .sort((a, b) => b.visits - a.visits)
        .slice(0, 5)
        .map((month) => ({
          period: formatMonthDate(month.date),
          fullPeriod: month.date,
          visits: month.visits,
          percentage: ((month.visits / totalVisits) * 100).toFixed(1),
          status:
            month.visits >=
            Math.max(...visits.monthly_visits.map((m) => m.visits)) * 0.8
              ? "high"
              : month.visits >=
                Math.max(...visits.monthly_visits.map((m) => m.visits)) * 0.5
              ? "medium"
              : "low",
        }));
    } else if (visits.daily_visits?.length) {
      data = visits.daily_visits
        .filter((day) => day.visits > 0)
        .sort((a, b) => b.visits - a.visits)
        .slice(0, 5)
        .map((day) => ({
          period: formatDate(day.date),
          fullPeriod: day.date,
          visits: day.visits,
          percentage: ((day.visits / totalVisits) * 100).toFixed(1),
          status:
            day.visits >= visits.max_day.visits * 0.8
              ? "high"
              : day.visits >= visits.max_day.visits * 0.5
              ? "medium"
              : "low",
        }));
    }

    return data;
  };

  const tableData = getTopVisitPeriods();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "high":
        return "#4caf50";
      case "medium":
        return "#ff9800";
      case "low":
        return "#2196f3";
      default:
        return "#757575";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "high":
        return "Alto";
      case "medium":
        return "Medio";
      case "low":
        return "Bajo";
      default:
        return "Normal";
    }
  };

  // Función para obtener datos de gráfica según el modo de vista
const getChartData = (chartType = "bar") => {
  if (!visits) {
    return {
      options: {
        chart: {
          type: chartType,
          height: 350,
          toolbar: {
            show: true,
            tools: {
              download: false,
              selection: true,
              zoom: true,
              zoomin: true,
              zoomout: true,
              pan: true,
              reset: true,
            },
          },
          zoom: {
            enabled: true,
            type: "x",
            autoScaleYaxis: true,
          },
          selection: {
            enabled: true,
          },
        },
        plotOptions: chartType === "bar" ? {
          bar: {
            horizontal: false,
            columnWidth: "55%",
            borderRadius: 4,
          },
        } : {},
        dataLabels: { 
          enabled: false 
        },
        xaxis: {
          categories: ["No hay datos"],
          tickPlacement: "on",
        },
        yaxis: { 
          title: { 
            text: "Visitas" 
          } 
        },
        colors: [chartType === "bar" ? "#4caf50" : "#2196f3"],
        grid: { 
          borderColor: "#f1f1f1" 
        },
        stroke: chartType === "line" ? {
          curve: "smooth",
          width: 3,
        } : {
          show: true,
          width: 2,
        },
      },
      series: [{ name: "Visitas", data: [0] }],
    };
  }

  let chartData = [];
  let categories = [];
  let seriesName = "";
  let yAxisTitle = "Número de Visitas";

  if (viewMode === "weekly" && visits.weekly_visits?.length) {
    const sortedWeeks = [...visits.weekly_visits].sort((a, b) =>
      a.date.localeCompare(b.date)
    );
    chartData = sortedWeeks.map((week) => week.visits);
    categories = sortedWeeks.map((week) => formatWeekDate(week.date));
    seriesName = "Visitas Semanales";
    yAxisTitle = "Visitas por Semana";
  } else if (viewMode === "monthly" && visits.monthly_visits?.length) {
    const sortedMonths = [...visits.monthly_visits].sort((a, b) =>
      a.date.localeCompare(b.date)
    );
    chartData = sortedMonths.map((month) => month.visits);
    categories = sortedMonths.map((month) => formatMonthDate(month.date));
    seriesName = "Visitas Mensuales";
    yAxisTitle = "Visitas por Mes";
  } else if (visits.daily_visits?.length) {
    const sortedVisits = [...visits.daily_visits].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    chartData = sortedVisits.map((day) => day.visits);
    categories = sortedVisits.map((day) => formatDate(day.date));
    seriesName = viewMode === "daily" ? "Visitas Diarias" : "Tendencia de Visitas";
    yAxisTitle = "Número de Visitas";
  }

  const baseOptions = {
    chart: {
      type: chartType,
      height: 350,
      toolbar: {
        show: true,
        tools: {
          download: false,
          selection: true,
          zoom: true,
          zoomin: true,
          zoomout: true,
          pan: true,
          reset: true,
        },
      },
      zoom: {
        enabled: true,
        type: "x",
        autoScaleYaxis: true,
      },
      selection: {
        enabled: true,
        xaxis: {
          min: chartData.length > 7 ? chartData.length - 7 : 0,
          max: chartData.length - 1,
        },
      },
    },
    plotOptions: chartType === "bar" ? {
      bar: { 
        horizontal: false, 
        columnWidth: "55%", 
        borderRadius: 4 
      }
    } : {},
    dataLabels: { 
      enabled: false 
    },
    xaxis: {
      categories: categories,
      axisBorder: { 
        show: false 
      },
      axisTicks: { 
        show: false 
      },
      tickPlacement: "on",
      labels: {
        rotate: -45,
        rotateAlways: false,
        hideOverlappingLabels: true,
        showDuplicates: false,
        trim: false,
        maxHeight: 120,
      },
    },
    yaxis: { 
      title: { 
        text: yAxisTitle 
      } 
    },
    colors: [chartType === "bar" ? "#4caf50" : "#2196f3"],
    grid: { 
      borderColor: "#f1f1f1" 
    },
    tooltip: {
      y: {
        formatter: function (val) {
          return val + " visitas";
        },
      },
    },
    responsive: [
      {
        breakpoint: 768,
        options: {
          chart: {
            height: 300,
          },
          xaxis: {
            labels: {
              rotate: -90,
            },
          },
        },
      },
    ],
  };

  // Configuración específica para gráficos de línea
  if (chartType === "line") {
    baseOptions.stroke = {
      curve: "smooth",
      width: 3,
    };
    baseOptions.markers = {
      size: 4,
      strokeColors: "#fff",
      strokeWidth: 2,
      hover: {
        size: 7,
      },
    };
  } else {
    // Configuración específica para gráficos de barras
    baseOptions.stroke = { 
      show: true, 
      width: 2, 
      colors: ["transparent"] 
    };
    baseOptions.fill = { 
      opacity: 1 
    };
  }

  return {
    options: baseOptions,
    series: [{ name: seriesName, data: chartData }],
  };
};

  const { options: barChartOptions, series: barChartSeries } =
    getChartData("bar");
  const { options: lineChartOptions, series: lineChartSeries } =
    getChartData("line");

  const getViewModeTitle = () => {
    switch (viewMode) {
      case "weekly":
        return "Análisis Semanal de Visitas";
      case "monthly":
        return "Análisis Mensual de Visitas";
      default:
        return "Análisis de Visitas";
    }
  };

  const getTableTitle = () => {
    switch (viewMode) {
      case "weekly":
        return "Top Semanas con Más Visitas";
      case "monthly":
        return "Top Meses con Más Visitas";
      default:
        return "Top Días con Más Visitas";
    }
  };

  const getPeriodLabel = () => {
    switch (viewMode) {
      case "weekly":
        return "Semana";
      case "monthly":
        return "Mes";
      default:
        return "Día";
    }
  };

  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} />
      <Box sx={{ p: 3 }}>
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
              width: { xs: "100%", sm: "auto" },
            },
          }}
        >
          <Typography
            variant="h5"
            component="h2"
            sx={{
              textAlign: { xs: "center", sm: "left" },
              marginBottom: { xs: 1, sm: 0 },
            }}
          >
            {visits
              ? `Estadísticas de ${visits.site_name}`
              : "Estadísticas de Visitas"}
          </Typography>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              minWidth: { xs: "100%", sm: "300px", md: "350px" },
              justifyContent: { xs: "center", sm: "flex-end" },
            }}
          >
            <FormControl
              fullWidth
              sx={{
                minWidth: { xs: "100%", sm: "200px", md: "250px" },
                marginBottom: { xs: 2, sm: 0 },
              }}
            >
              <InputLabel>Selecciona un sitio web</InputLabel>
              <Select
                label="Sitio web"
                name="website_id"
                value={selectedWebsite}
                onChange={handleWebsiteChange}
                MenuProps={{
                  PaperProps: {
                    sx: {
                      "& .MuiMenuItem-root": {
                        position: "relative",
                        "&:hover .website-link-icon": {
                          opacity: 1,
                          visibility: "visible",
                        },
                      },
                    },
                  },
                }}
              >
                {/* Opción para registrar sitio web */}
                <MenuItem
                  sx={{
                    borderBottom: "1px solid #e0e0e0",
                    color: "primary.main",
                    fontWeight: "bold",
                    "&:hover": {
                      backgroundColor: "rgba(25, 118, 210, 0.04)",
                    },
                  }}
                  onClick={() => setIsRegisterModalOpen(true)}
                >
                  <Box
                    sx={{
                      py: 0.5,
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                    }}
                  >
                    <Add fontSize="small" />
                    <Typography variant="body2" sx={{ fontSize: "13px" }}>
                      Registrar sitio web
                    </Typography>
                  </Box>
                </MenuItem>

                {/* Opciones de sitios web existentes */}
                {(allWebsites as Website[]).map((website) => (
                  <MenuItem
                    key={website?.id}
                    value={website?.id}
                    sx={{
                      position: "relative",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      pr: 6,
                      "&:hover": {
                        backgroundColor: "rgba(25, 118, 210, 0.08)",
                      },
                    }}
                  >
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {website?.name}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{ color: "text.secondary", fontSize: "0.75rem" }}
                      >
                        {website?.domain}
                      </Typography>
                    </Box>

                    <IconButton
                      className="website-link-icon"
                      size="small"
                      onClick={(e) => handleVisitWebsite(website?.domain, e)}
                      sx={{
                        position: "absolute",
                        right: 8,
                        opacity: 0,
                        visibility: "hidden",
                        transition: "all 0.2s ease-in-out",
                        color: "primary.main",
                        "&:hover": {
                          backgroundColor: "rgba(25, 118, 210, 0.1)",
                          color: "primary.dark",
                        },
                      }}
                    >
                      <OpenInNew fontSize="small" />
                    </IconButton>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </Box>

        {/* Toggle para seleccionar vista */}
        {visits && (
          <Box sx={{ display: "flex", justifyContent: "center", mb: 3 }}>
            <ToggleButtonGroup
              value={viewMode}
              exclusive
              onChange={handleViewModeChange}
              size="small"
              sx={{
                "& .MuiToggleButton-root": {
                  borderRadius: 2,
                  px: 3,
                  py: 1,
                  fontWeight: 500,
                  "&.Mui-selected": {
                    backgroundColor: "#2196f3",
                    color: "white",
                    "&:hover": {
                      backgroundColor: "#1976d2",
                    },
                  },
                },
              }}
            >
              <ToggleButton value="daily">
                <CalendarToday sx={{ mr: 1, fontSize: 18 }} />
                Diario
              </ToggleButton>
              <ToggleButton
                value="weekly"
                disabled={!visits.weekly_visits?.length}
              >
                <Schedule sx={{ mr: 1, fontSize: 18 }} />
                Semanal
              </ToggleButton>
              <ToggleButton
                value="monthly"
                disabled={!visits.monthly_visits?.length}
              >
                <DateRange sx={{ mr: 1, fontSize: 18 }} />
                Mensual
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>
        )}

        <Grid container spacing={3}>
          {stockData.map((item, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card
                sx={{
                  borderRadius: 2,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
                  transition: "transform 0.2s, box-shadow 0.2s",
                  "&:hover": {
                    transform: "translateY(-2px)",
                    boxShadow: "0 4px 16px rgba(0,0,0,0.3)",
                    cursor: "pointer",
                  },
                }}
              >
                <CardContent sx={{ p: 2.5, textAlign: "left" }}>
                  <Typography
                    variant="body2"
                    sx={{
                      color: "text.secondary",
                      fontSize: "0.875rem",
                      mb: 1,
                      fontWeight: 500,
                      textAlign: "left",
                    }}
                  >
                    {item.title}
                  </Typography>

                  <Typography
                    variant="h4"
                    sx={{
                      fontWeight: "bold",
                      mb: 1,
                      color: "text.primary",
                      textAlign: "left",
                    }}
                  >
                    {item.value}
                  </Typography>

                  {item.subtitle && (
                    <Typography
                      variant="caption"
                      sx={{
                        color: "text.secondary",
                        fontSize: "0.75rem",
                        mb: 1,
                        display: "block",
                      }}
                    >
                      {item.subtitle}
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Sección de Gráficas */}
        <Box sx={{ mt: 4 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
              flexDirection: { xs: "column", sm: "row" },
              gap: 2,
            }}
          >
            <Typography
              variant="h5"
              component="h2"
              sx={{
                textAlign: { xs: "center", sm: "left" },
              }}
            >
              {getViewModeTitle()}
            </Typography>
          </Box>

          <Grid container spacing={3}>
            {/* Gráfica de Barras */}
            <Grid item xs={12} md={6}>
              <Card
                sx={{
                  borderRadius: 2,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
                  transition: "transform 0.2s, box-shadow 0.2s",
                  "&:hover": {
                    transform: "translateY(-2px)",
                    boxShadow: "0 4px 16px rgba(0,0,0,0.3)",
                    cursor: "pointer",
                  },
                }}
              >
                <CardContent sx={{ p: 2.5, textAlign: "left" }}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      mb: 2,
                    }}
                  >
                    <Box>
                      <Typography
                        variant="body2"
                        sx={{
                          color: "text.secondary",
                          fontSize: "0.875rem",
                          mb: 1,
                          fontWeight: 500,
                          textAlign: "left",
                        }}
                      >
                        Visitas por {getPeriodLabel()}
                      </Typography>
                      <Typography
                        variant="h4"
                        sx={{ fontWeight: "bold", mb: 1 }}
                      >
                        {visits ? formatNumber(visits.total_visits) : "0"}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          color: "#4caf50",
                          fontWeight: 600,
                          mb: 2,
                          display: "flex",
                          alignItems: "center",
                        }}
                      >
                        {visits
                          ? `Período: ${formatDate(
                              visits.period.start_date
                            )} - ${formatDate(visits.period.end_date)}`
                          : "Sin datos"}
                      </Typography>
                    </Box>

                    {visits && (
                      <Chip
                        label={`Vista ${
                          viewMode === "daily"
                            ? "diaria"
                            : viewMode === "weekly"
                            ? "semanal"
                            : "mensual"
                        }`}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    )}
                  </Box>
                  <Chart
                    options={barChartOptions}
                    series={barChartSeries}
                    type="bar"
                    height={280}
                  />
                </CardContent>
              </Card>
            </Grid>

            {/* Gráfica de Línea */}
            <Grid item xs={12} md={6}>
              <Card
                sx={{
                  borderRadius: 2,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
                  transition: "transform 0.2s, box-shadow 0.2s",
                  "&:hover": {
                    transform: "translateY(-2px)",
                    boxShadow: "0 4px 16px rgba(0,0,0,0.3)",
                    cursor: "pointer",
                  },
                }}
              >
                <CardContent sx={{ p: 2.5, textAlign: "left" }}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      mb: 2,
                    }}
                  >
                    <Box>
                      <Typography
                        variant="body2"
                        sx={{
                          color: "text.secondary",
                          fontSize: "0.875rem",
                          mb: 1,
                          fontWeight: 500,
                          textAlign: "left",
                        }}
                      >
                        Tendencia de Visitas
                      </Typography>
                      <Typography
                        variant="h4"
                        sx={{ fontWeight: "bold", mb: 1 }}
                      >
                        {visits ? visits.daily_average.toFixed(2) : "0"}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          color: "#4caf50",
                          fontWeight: 600,
                          mb: 2,
                          display: "flex",
                          alignItems: "center",
                        }}
                      >
                        {visits ? "Promedio diario de visitas" : "Sin datos"}
                      </Typography>
                    </Box>

                    {visits && (
                      <Tooltip title="Gráfica interactiva - Usa los controles para navegar">
                        <Chip
                          label="Interactiva"
                          size="small"
                          color="secondary"
                          variant="outlined"
                          icon={<ZoomIn fontSize="small" />}
                        />
                      </Tooltip>
                    )}
                  </Box>
                  <Chart
                    options={lineChartOptions}
                    series={lineChartSeries}
                    type="line"
                    height={280}
                  />
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>

        {/* Sección de Tabla */}
        <Box sx={{ mt: 4 }}>
          <Typography
            variant="h5"
            component="h2"
            sx={{
              textAlign: { xs: "center", sm: "left" },
              marginBottom: { xs: 1, sm: 2 },
            }}
          >
            {getTableTitle()}
          </Typography>

          <Card
            sx={{
              borderRadius: 2,
              boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
              transition: "transform 0.2s, box-shadow 0.2s",
              "&:hover": {
                transform: "translateY(-2px)",
                boxShadow: "0 4px 16px rgba(0,0,0,0.3)",
              },
            }}
          >
            <CardContent sx={{ p: 2.5 }}>
              <TableContainer>
                <Table sx={{ minWidth: 650 }}>
                  <TableHead>
                    <TableRow>
                      <TableCell
                        sx={{
                          fontWeight: 600,
                          color: "text.secondary",
                          fontSize: "0.875rem",
                          borderBottom: "2px solid #f1f1f1",
                        }}
                      >
                        {getPeriodLabel()}
                      </TableCell>
                      <TableCell
                        align="center"
                        sx={{
                          fontWeight: 600,
                          color: "text.secondary",
                          fontSize: "0.875rem",
                          borderBottom: "2px solid #f1f1f1",
                        }}
                      >
                        % del Total
                      </TableCell>
                      <TableCell
                        align="center"
                        sx={{
                          fontWeight: 600,
                          color: "text.secondary",
                          fontSize: "0.875rem",
                          borderBottom: "2px solid #f1f1f1",
                        }}
                      >
                        Nivel
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {tableData.length > 0 ? (
                      tableData.map((row, index) => (
                        <TableRow
                          key={index}
                          sx={{
                            "&:hover": {
                              backgroundColor: "rgba(0, 0, 0, 0.04)",
                            },
                            borderBottom: "1px solid #f1f1f1",
                          }}
                        >
                          <TableCell sx={{ color: "text.secondary" }}>
                            <Chip
                              label={row.fullPeriod}
                              size="small"
                              sx={{
                                backgroundColor: "rgba(33, 150, 243, 0.1)",
                                color: "#2196f3",
                                fontWeight: 500,
                                fontSize: "0.75rem",
                              }}
                            />
                          </TableCell>
                          <TableCell align="center">
                            <Typography
                              variant="body2"
                              sx={{
                                fontWeight: 600,
                                color: "text.primary",
                                fontSize: "1.1rem",
                              }}
                            >
                              {row.visits}
                            </Typography>
                          </TableCell>
                          <TableCell
                            align="center"
                            sx={{ color: "text.secondary", fontWeight: 500 }}
                          >
                            {row.percentage}%
                          </TableCell>
                          <TableCell align="center">
                            <Chip
                              label={getStatusLabel(row.status)}
                              size="small"
                              sx={{
                                backgroundColor: `${getStatusColor(
                                  row.status
                                )}15`,
                                color: getStatusColor(row.status),
                                fontWeight: 500,
                                fontSize: "0.7rem",
                              }}
                            />
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} align="center" sx={{ py: 3 }}>
                          <Typography variant="body2" color="text.secondary">
                            {loading
                              ? "Cargando datos..."
                              : "No hay datos de visitas disponibles"}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Box>
      </Box>
      <RegisterWebsiteModal
        open={isRegisterModalOpen}
        setOpen={setIsRegisterModalOpen}
        onAddWebsite={handleAddWebsite}
      />
    </>
  );
};
