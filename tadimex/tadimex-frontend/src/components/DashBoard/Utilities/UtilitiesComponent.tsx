import React, { useState, useMemo, useEffect } from "react";
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
  TablePagination,
  FormControl,
  Select,
  InputLabel,
  MenuItem,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
} from "@mui/material";
import {
  TrendingUp,
  TrendingDown,
  DateRange,
  Close,
  GetApp,
} from "@mui/icons-material";
import Chart from "react-apexcharts";
import { toast, ToastContainer } from "react-toastify";
import { useStorage } from "../../../hooks/Storage/useStorage";
import { useBranch } from "../../../context/BranchContext";
import Loader from "../../Loader";
import { useUtilities } from "../../../hooks/Utilities/useUtilities";
import { useClients } from "../../../hooks/Clients/useClients";
import { useEnterprise } from "../../../context/EnterpriseContext";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";
import CloseIcon from "@mui/icons-material/Close";
import { createUtilitiesExcel } from "../../../utils/excel_files_export/utilities_export";
import { createUtilitiesReportPDF } from "../../../utils/pdf_files_export/utilities_export";


export const UtilitiesComponent = () => {
  /*CONTEXTOS*/

  // Contexto de empresa seleccionada
  const { selectedEnterprise, enterprises } = useEnterprise();

  // Contexto de sucursal seleccionada
  const { selectedBranch, branches } = useBranch();

  /*HOOKS*/

  // Hook de utilidades
  const {
    utilities,
    topProductos,
    loading,
    loadingTop,
    handleGetUtilities,
    handleGetTopProductos,
  } = useUtilities(selectedBranch);

  //Hook de almacenes
  const { allFilteredStorage: filteredStorage } = useStorage(selectedBranch);

  //Hook de clientes
  const { allFilteredClients: clients } = useClients(selectedEnterprise);

  /*ESTADOS*/
  const [selectedStorage, setSelectedStorage] = useState("todos");
  const [selectedClient, setSelectedClient] = useState("todos");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [openExportFile, setOpenExportFile] = useState(false);

  // Estados para el top de productos
  const [tipoTop, setTipoTop] = useState("mas_rentables");
  const [cantidadTop, setCantidadTop] = useState(5);

  // Estados para el filtro de fechas
  const [showDatePickers, setShowDatePickers] = useState(false);
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);

  //Función para abrir el dialogo de exportar archivo PDF o Excel
  const handleOpenExportFile  = () => {
    setOpenExportFile(true);
  };

  // Función para aplicar el filtro de fechas
  const applyDateFilter = (start_date, end_date) => {
    const storageId =
      selectedStorage !== "todos" ? parseInt(selectedStorage) : null;
    const clientId =
      selectedClient !== "todos" ? parseInt(selectedClient) : null;

    // Formatear fechas
    const formattedStartDate = start_date
      ? dayjs(start_date).format("YYYY-MM-DD")
      : null;
    const formattedEndDate = end_date
      ? dayjs(end_date).format("YYYY-MM-DD")
      : null;

    handleGetUtilities(
      formattedStartDate,
      formattedEndDate,
      storageId,
      clientId
    );
    fetchTopProductos(tipoTop, cantidadTop, storageId, clientId);
  };

  // Funciones para manejar el modal de fechas
  const handleOpenDatePicker = () => {
    setShowDatePickers(true);
  };

  const handleCloseDatePicker = () => {
    setShowDatePickers(false);
  };

  const handleDatePickerSave = () => {
    // Aplicar filtro si ambas fechas están seleccionadas
    if (startDate && endDate) {
      applyDateFilter(startDate, endDate);
    }
    setShowDatePickers(false);
  };

  const handleClearDates = () => {
    setStartDate(null);
    setEndDate(null);
    // Recargar datos sin filtro de fecha
    const storageId =
      selectedStorage !== "todos" ? parseInt(selectedStorage) : null;
    const clientId =
      selectedClient !== "todos" ? parseInt(selectedClient) : null;
    handleGetUtilities(null, null, storageId, clientId);
    fetchTopProductos(tipoTop, cantidadTop, storageId, clientId);
    setShowDatePickers(false);
  };

  // Funciones para manejar el modal de exportación
  const handleOpenExportModal = () => {
    setOpenExportFile(true);
  };

  const handleCloseExportModal = () => {
    setOpenExportFile(false);
  };

  const handleExportExcel = () => {

    if (!utilities || !utilities.productos || utilities.productos.length === 0) {
      toast.error("No hay datos de utilidades para exportar a Excel");
      return;
    }


    createUtilitiesExcel(
      utilities,
      selectedStorage,
      selectedClient,
      filteredStorage,
      clients,
      startDate,
      endDate,
      selectedBranch,
      branches,
      selectedEnterprise,  
      enterprises       
    );

    setOpenExportFile(false);
  };

  const handleExportPDF = () => {
    if (!utilities || !utilities.productos || utilities.productos.length === 0) {
      toast.error("No hay datos de utilidades para exportar a PDF");
      return;
    }

    createUtilitiesReportPDF(
      utilities,
      selectedStorage,
      selectedClient,
      filteredStorage,
      clients,
      startDate,
      endDate,
      selectedBranch,
      branches,
      selectedEnterprise, 
      enterprises        
    );

    setOpenExportFile(false);
  };

  // Funciones de paginación
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleStorageChange = (event: any) => {
    const selectedValue = event.target.value;
    setSelectedStorage(selectedValue);

    // Obtener utilidades con filtros
    const storageId =
      selectedValue !== "todos" ? parseInt(selectedValue) : null;
    const clientId =
      selectedClient !== "todos" ? parseInt(selectedClient) : null;
    handleGetUtilities(null, null, storageId as any, clientId as any);

    // También actualizar top productos
    fetchTopProductos(tipoTop, cantidadTop, storageId, clientId);
  };

  const handleClientChange = (event: any) => {
    const selectedValue = event.target.value;
    setSelectedClient(selectedValue);

    // Obtener utilidades con filtros por cliente
    const clientId = selectedValue !== "todos" ? parseInt(selectedValue) : null;
    const storageId =
      selectedStorage !== "todos" ? parseInt(selectedStorage) : null;

    handleGetUtilities(null, null, storageId as any, clientId as any);

    // También actualizar top productos
    fetchTopProductos(tipoTop, cantidadTop, storageId, clientId);
  };

  // Función para obtener top productos
  const fetchTopProductos = async (
    tipo: string,
    cantidad: number,
    almacenId: number | null = null,
    clienteId: number | null = null
  ) => {
    try {
      const storageId =
        almacenId ||
        (selectedStorage !== "todos" ? parseInt(selectedStorage) : null);
      const clientId =
        clienteId ||
        (selectedClient !== "todos" ? parseInt(selectedClient) : null);
      await handleGetTopProductos(
        tipo,
        cantidad,
        null,
        null,
        storageId as any,
        clientId as any
      );
    } catch (error) {
      console.error("Error al obtener top productos:", error);
    }
  };

  // Manejadores para los selects
  const handleTipoTopChange = (event: any) => {
    const nuevoTipo = event.target.value;
    setTipoTop(nuevoTipo);
    const storageId =
      selectedStorage !== "todos" ? parseInt(selectedStorage) : null;
    const clientId =
      selectedClient !== "todos" ? parseInt(selectedClient) : null;
    fetchTopProductos(nuevoTipo, cantidadTop, storageId, clientId);
  };

  const handleCantidadTopChange = (event: any) => {
    const nuevaCantidad = parseInt(event.target.value);
    setCantidadTop(nuevaCantidad);
    const storageId =
      selectedStorage !== "todos" ? parseInt(selectedStorage) : null;
    const clientId =
      selectedClient !== "todos" ? parseInt(selectedClient) : null;
    fetchTopProductos(tipoTop, nuevaCantidad, storageId, clientId);
  };

  // Efecto para cargar utilidades al cargar el componente
  useEffect(() => {
    if (selectedBranch && (selectedBranch as any)?.id) {
      handleGetUtilities();
      const storageId =
        selectedStorage !== "todos" ? parseInt(selectedStorage) : null;
      const clientId =
        selectedClient !== "todos" ? parseInt(selectedClient) : null;
      fetchTopProductos(tipoTop, cantidadTop, storageId, clientId);
    }
  }, [selectedBranch]);

  // Datos de la tabla de productos con utilidades
  const utilitiesTableData = useMemo(() => {
    if (!utilities || typeof utilities !== "object") return [];

    // utilities es directamente el objeto ResumenTotalVentas
    const utilitiesData = utilities as any;
    if (!utilitiesData?.productos) return [];

    return utilitiesData.productos;
  }, [utilities]);

  // Aplicar paginación a los datos de utilidades
  const paginatedUtilitiesData = useMemo(() => {
    const startIndex = page * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    return utilitiesTableData.slice(startIndex, endIndex);
  }, [utilitiesTableData, page, rowsPerPage]);

  // Total de registros para la paginación
  const totalUtilitiesRecords = useMemo(() => {
    return utilitiesTableData.length;
  }, [utilitiesTableData]);

  // Obtener métricas del resumen de utilidades
  const utilitiesMetrics = useMemo(() => {
    if (!utilities || typeof utilities !== "object") {
      return {
        totalVentas: 0,
        utilidadBruta: 0,
        margenPromedio: 0,
        numeroVentasTotal: 0,
        numeroProductosVendidos: 0,
      };
    }

    const utilitiesData = utilities as any;
    const resumen = utilitiesData?.resumen;

    if (!resumen) {
      return {
        totalVentas: 0,
        utilidadBruta: 0,
        margenPromedio: 0,
        numeroVentasTotal: 0,
        numeroProductosVendidos: 0,
      };
    }

    return {
      totalVentas: parseFloat(resumen.total_ventas || "0"),
      utilidadBruta: parseFloat(resumen.total_utilidades || "0"),
      margenPromedio: parseFloat(resumen.margen_promedio_general || "0"),
      numeroVentasTotal: parseFloat(resumen.numero_ventas_total || "0"),
      numeroProductosVendidos: parseFloat(
        resumen.numero_productos_vendidos || "0"
      ),
      clienteNombre: resumen.cliente_nombre || "Desconocido",
    };
  }, [utilities]);

  const utilitiesData = [
    {
      title: "Número de Ventas totales",
      value: `${utilitiesMetrics.numeroVentasTotal}`,
    },
    {
      title: "Productos Vendidos",
      value: `${utilitiesMetrics.numeroProductosVendidos}`,
    },
    {
      title: "Valor de las ventas",
      value: `$${utilitiesMetrics.totalVentas.toLocaleString("es-MX", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`,
    },
    {
      title: "Utilidad Bruta",
      value: `$${utilitiesMetrics.utilidadBruta.toLocaleString("es-MX", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`,
    },
    {
      title: "Margen Promedio",
      value: `${utilitiesMetrics.margenPromedio.toFixed(2)}%`,
    },
  ];

  // Datos dinámicos para gráfica de barras - Top productos por utilidad
  const chartData = useMemo(() => {
    const categories: string[] = [];
    const utilitiesDataChart: number[] = [];

    if (topProductos && Array.isArray(topProductos)) {
      (topProductos as any[]).forEach((producto: any) => {
        const descripcion = producto.producto_nombre || "Sin descripción";
        categories.push(descripcion.substring(0, 20) + "...");
        utilitiesDataChart.push(parseFloat(producto.utilidad_total || "0"));
      });
    }

    return { categories, utilitiesDataChart };
  }, [topProductos]);

  // Datos para gráfica de barras - Top productos por utilidad
  const barChartOptions = {
    chart: {
      type: "bar" as const,
      height: 350,
      toolbar: {
        show: false,
      },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "55%",
        borderRadius: 4,
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      show: true,
      width: 2,
      colors: ["#757575"],
    },
    xaxis: {
      categories: chartData.categories,
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
    },
    yaxis: {
      title: {
        text: "Utilidad ($)",
      },
    },
    fill: {
      opacity: 1,
      colors: ["#4caf50", "#ff9800", "#f44336", "#9c27b0", "#2196f3"],
    },
    tooltip: {
      y: {
        formatter: function (val) {
          return (
            "$" +
            val.toLocaleString("es-MX", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })
          );
        },
      },
    },
    grid: {
      borderColor: "#f1f1f1",
    },
  };

  const barChartSeries = [
    {
      name: "Utilidad",
      data: chartData.utilitiesDataChart,
    },
  ];

  // Datos para gráfica de línea - Margen por producto (top 10)
  const lineChartOptions = {
    chart: {
      type: "line",
      height: 350,
      toolbar: {
        show: false,
      },
      zoom: {
        enabled: false,
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      curve: "smooth",
      width: 3,
      colors: ["#637387"],
    },
    xaxis: {
      categories:
        topProductos && Array.isArray(topProductos)
          ? (topProductos as any[]).map(
              (p: any) => p.producto_id?.toString() || "N/A"
            )
          : [],
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
    },
    yaxis: {
      title: {
        text: "Margen %",
      },
    },
    colors: ["#2196f3"],
    grid: {
      borderColor: "#f1f1f1",
    },
    tooltip: {
      y: {
        formatter: function (val) {
          return val.toFixed(2) + "%";
        },
      },
    },
  };

  //Formato de Precio
  const formatPrice = (price) => {
    return price.toLocaleString("es-MX", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
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
            Utilidades
          </Typography>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2, // Espacio entre elementos
              minWidth: { xs: "100%", sm: "300px", md: "700px" },
              justifyContent: { xs: "center", sm: "flex-end" },
              flexWrap: "wrap",
            }}
          >
            {/* Botón para abrir modal de filtro de fechas */}
            <Button
              variant="outlined"
              startIcon={<DateRange />}
              onClick={handleOpenDatePicker}
              sx={{
                marginBottom: { xs: 2, sm: 0 },
                marginRight: { sm: 2 },
                minWidth: { xs: "100%", sm: "200px", md: "250px" },
                height: "56px",
                justifyContent: "center",
                textTransform: "none",
                color: "rgba(0, 0, 0, 0.6)",
                borderColor: "rgba(0, 0, 0, 0.23)",
                backgroundColor: "transparent",
                "&:hover": {
                  borderColor: "rgba(0, 0, 0, 0.87)",
                  backgroundColor: "rgba(0, 0, 0, 0.04)",
                },
                "& .MuiButton-startIcon": {
                  color: "rgba(0, 0, 0, 0.54)",
                },
              }}
            >
              {startDate && endDate
                ? `${dayjs(startDate).format("DD/MM/YYYY")} - ${dayjs(
                    endDate
                  ).format("DD/MM/YYYY")}`
                : "Filtrar por Fechas"}
            </Button>
            <FormControl
              sx={{
                minWidth: { xs: "100%", sm: "200px", md: "250px" },
                marginBottom: { xs: 2, sm: 0 },
              }}
            >
              <InputLabel>Almacén</InputLabel>
              <Select
                label="Almacén"
                name="storage_id"
                value={selectedStorage}
                onChange={handleStorageChange}
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
                <MenuItem value="todos">Todos</MenuItem>
                {(filteredStorage as any[])?.map((storage: any) => (
                  <MenuItem key={storage.id} value={storage.id}>
                    {storage?.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl
              sx={{
                minWidth: { xs: "100%", sm: "200px", md: "250px" },
                marginBottom: { xs: 2, sm: 0 },
              }}
            >
              <InputLabel>Cliente</InputLabel>
              <Select
                label="Cliente"
                name="client_id"
                value={selectedClient}
                onChange={handleClientChange}
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
                <MenuItem value="todos">Todos los Clientes</MenuItem>
                {clients?.map((client: any) => (
                  <MenuItem key={client.id} value={client.id}>
                    {client.nombre_fiscal}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            {/* Botón de Descarga */}
            <Button
              variant="outlined"
              onClick={handleOpenExportModal}
              sx={{
                marginBottom: { xs: 2, sm: 0 },
                marginRight: { sm: 2 },
                minWidth: "56px",
                width: "56px",
                height: "56px",
                color: "rgba(0, 0, 0, 0.6)",
                borderColor: "rgba(0, 0, 0, 0.23)",
                backgroundColor: "transparent",
                "&:hover": {
                  borderColor: "rgba(0, 0, 0, 0.87)",
                  backgroundColor: "rgba(0, 0, 0, 0.04)",
                },
              }}
            >
              <GetApp />
            </Button>
            
          </Box>
        </Box>
        <Box>
          <TableContainer
            sx={{
              height: "auto",
              maxHeight: "calc(100vh - 250px)",
              overflow: "auto",
              "@media (max-width: 600px)": {
                maxHeight: "calc(100vh - 300px)",
              },
            }}
          >
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell
                    sx={{
                      backgroundColor: "#f1f1f1",
                      cursor: "pointer",
                      fontSize: "0.8rem",
                      fontWeight: "bold",
                    }}
                    align="justify"
                  >
                    ID
                  </TableCell>
                  <TableCell
                    sx={{
                      backgroundColor: "#f1f1f1",
                      cursor: "pointer",
                      fontSize: "0.8rem",
                      fontWeight: "bold",
                    }}
                    align="justify"
                  >
                    Producto
                  </TableCell>
                  <TableCell
                    sx={{
                      backgroundColor: "#f1f1f1",
                      cursor: "pointer",
                      fontSize: "0.8rem",
                      fontWeight: "bold",
                    }}
                    align="justify"
                  >
                    P. Compra Promedio
                  </TableCell>
                  <TableCell
                    sx={{
                      backgroundColor: "#f1f1f1",
                      cursor: "pointer",
                      fontSize: "0.8rem",
                      fontWeight: "bold",
                    }}
                    align="justify"
                  >
                    P. Venta Promedio
                  </TableCell>
                  <TableCell
                    sx={{
                      backgroundColor: "#f1f1f1",
                      cursor: "pointer",
                      fontSize: "0.8rem",
                      fontWeight: "bold",
                    }}
                    align="justify"
                  >
                    Cantidad Comprada
                  </TableCell>
                  <TableCell
                    sx={{
                      backgroundColor: "#f1f1f1",
                      cursor: "pointer",
                      fontSize: "0.8rem",
                      fontWeight: "bold",
                    }}
                    align="justify"
                  >
                    Importe
                  </TableCell>
                  <TableCell
                    sx={{
                      backgroundColor: "#f1f1f1",
                      cursor: "pointer",
                      fontSize: "0.8rem",
                      fontWeight: "bold",
                    }}
                    align="justify"
                  >
                    Utilidad Total
                  </TableCell>
                  <TableCell
                    sx={{
                      backgroundColor: "#f1f1f1",
                      cursor: "pointer",
                      fontSize: "0.8rem",
                      fontWeight: "bold",
                    }}
                    align="justify"
                  >
                    Margen Promedio %
                  </TableCell>
                  <TableCell
                    sx={{
                      backgroundColor: "#f1f1f1",
                      cursor: "pointer",
                      fontSize: "0.8rem",
                      fontWeight: "bold",
                    }}
                    align="justify"
                  >
                    Cliente
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedUtilitiesData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} align="center">
                      {loading ? <Loader /> : "No hay datos disponibles"}
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedUtilitiesData.map((utilidad, index) => (
                    <TableRow
                      key={index}
                      sx={{
                        "&:hover": {
                          backgroundColor: "rgba(0, 0, 0, 0.04)",
                        },
                      }}
                    >
                      <TableCell
                        component="td"
                        scope="row"
                        align="justify"
                        sx={{
                          fontWeight: 500,
                          color: "text.primary",
                        }}
                      >
                        {utilidad.producto_id}
                      </TableCell>
                      <TableCell
                        component="td"
                        scope="row"
                        align="justify"
                        sx={{
                          fontWeight: 500,
                          color: "text.primary",
                        }}
                      >
                        {utilidad.producto_nombre}
                      </TableCell>
                      <TableCell
                        component="td"
                        scope="row"
                        align="justify"
                        sx={{
                          fontWeight: 500,
                          color: "text.primary",
                        }}
                      >
                        $
                        {formatPrice(
                          parseFloat(
                            utilidad.precio_compra_promedio?.toString() || "0"
                          )
                        )}
                      </TableCell>
                      <TableCell
                        component="td"
                        scope="row"
                        align="justify"
                        sx={{
                          fontWeight: 500,
                          color: "text.primary",
                        }}
                      >
                        $
                        {formatPrice(
                          parseFloat(
                            utilidad.precio_venta_promedio?.toString() || "0"
                          )
                        )}
                      </TableCell>
                      <TableCell
                        component="td"
                        scope="row"
                        align="justify"
                        sx={{
                          fontWeight: 500,
                          color: "text.primary",
                        }}
                      >
                        {/* Mostrar cantidad total comprada por todos los clientes */}
                        {utilidad?.clientes
                          ?.reduce(
                            (total: number, cliente: any) =>
                              total + (cliente.cantidad_comprada || 0),
                            0
                          )
                          ?.toLocaleString() ||
                          parseInt(
                            utilidad.cantidad_vendida_total?.toString() || "0"
                          ).toLocaleString()}
                      </TableCell>
                      <TableCell
                        component="td"
                        scope="row"
                        align="justify"
                        sx={{
                          fontWeight: 500,
                          color: "text.primary",
                        }}
                      >
                        $
                        {formatPrice(
                          parseFloat(
                            (
                              utilidad.precio_venta_promedio *
                              utilidad.cantidad_vendida_total
                            )?.toString() || "0"
                          )
                        )}
                      </TableCell>
                      <TableCell
                        component="td"
                        scope="row"
                        align="justify"
                        sx={{
                          fontWeight: 500,
                          color:
                            parseFloat(
                              utilidad.utilidad_total?.toString() || "0"
                            ) >= 0
                              ? "#4caf50"
                              : "#f44336",
                        }}
                      >
                        $
                        {formatPrice(
                          parseFloat(utilidad.utilidad_total?.toString() || "0")
                        )}
                      </TableCell>
                      <TableCell
                        component="td"
                        scope="row"
                        align="justify"
                        sx={{
                          fontWeight: 500,
                          color:
                            parseFloat(
                              utilidad.margen_promedio?.toString() || "0"
                            ) >= 0
                              ? "#4caf50"
                              : "#f44336",
                        }}
                      >
                        {parseFloat(
                          utilidad.margen_promedio?.toString() || "0"
                        ).toFixed(2)}
                        %
                      </TableCell>
                      <TableCell
                        component="td"
                        scope="row"
                        align="justify"
                        sx={{
                          fontWeight: 500,
                          color: "text.primary",
                        }}
                      >
                        {/* Mostrar todos los clientes con sus cantidades */}
                        {utilidad?.clientes && utilidad.clientes.length > 0 ? (
                          <Box>
                            {utilidad.clientes.map(
                              (cliente: any, clienteIndex: number) => (
                                <Box key={clienteIndex} sx={{ mb: 0.5 }}>
                                  <Typography
                                    variant="body2"
                                    sx={{ fontSize: "0.75rem" }}
                                  >
                                    <strong>{cliente.cliente_nombre}</strong>
                                    <br />
                                    <span style={{ color: "#666" }}>
                                      Cantidad: {cliente.cantidad_comprada}
                                    </span>
                                  </Typography>
                                </Box>
                              )
                            )}
                          </Box>
                        ) : (
                          "Sin clientes"
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

        {/* Componente de paginación */}
        <TablePagination
          component="div"
          count={totalUtilitiesRecords}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 25, 50]}
          labelRowsPerPage="Filas por página:"
          labelDisplayedRows={({ from, to, count }) =>
            `${from}-${to} de ${count !== -1 ? count : `más de ${to}`}`
          }
          sx={{
            ".MuiTablePagination-toolbar": {
              flexWrap: "wrap",
              paddingLeft: 2,
            },
            ".MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows":
              {
                margin: 1,
              },
            ".MuiTablePagination-actions": { marginLeft: 2 },
          }}
        />

        <Grid container spacing={3} sx={{ mt: 4 }}>
          {utilitiesData.map((item, index) => (
            <Grid item xs={12} sm={12} md={2.4} key={index}>
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
                    variant="h5"
                    sx={{
                      fontWeight: "bold",
                      mb: 1,
                      color: "text.primary",
                      textAlign: "left",
                    }}
                  >
                    {item.value}
                  </Typography>
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
              flexDirection: { xs: "column", sm: "row" },
              justifyContent: "space-between",
              alignItems: { xs: "stretch", sm: "center" },
              mb: 3,
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
              Análisis de Utilidades
            </Typography>

            {/* Controles para las gráficas */}
            <Box
              sx={{
                display: "flex",
                gap: 2,
                flexDirection: { xs: "column", sm: "row" },
                alignItems: { xs: "stretch", sm: "center" },
              }}
            >
              <FormControl sx={{ minWidth: 180 }}>
                <InputLabel>Tipo de Ranking</InputLabel>
                <Select
                  value={tipoTop}
                  label="Tipo de Ranking"
                  onChange={handleTipoTopChange}
                >
                  <MenuItem value="mas_rentables">Más Rentables</MenuItem>
                  <MenuItem value="menos_rentables">Menos Rentables</MenuItem>
                </Select>
              </FormControl>

              <FormControl sx={{ minWidth: 120 }}>
                <InputLabel>Cantidad</InputLabel>
                <Select
                  value={cantidadTop}
                  label="Cantidad"
                  onChange={handleCantidadTopChange}
                >
                  <MenuItem value={3}>3</MenuItem>
                  <MenuItem value={5}>5</MenuItem>
                  <MenuItem value={10}>10</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Box>

          <Grid container spacing={3}>
            {/* Gráfica de Barras - Top Productos por Utilidad */}
            <Grid item xs={12}>
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
                    Top {cantidadTop} Productos{" "}
                    {tipoTop === "mas_rentables"
                      ? "Más Rentables"
                      : "Menos Rentables"}
                    {loadingTop && " (Cargando...)"}
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: "bold", mb: 1 }}>
                    $
                    {utilitiesMetrics.utilidadBruta.toLocaleString("es-MX", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
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
                    Utilidad total
                  </Typography>
                  <Chart
                    options={barChartOptions}
                    series={barChartSeries}
                    type="bar"
                    height={280}
                  />
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      </Box>

      {/* Modal para seleccionar rango de fechas */}
      <Dialog
        open={showDatePickers}
        onClose={handleCloseDatePicker}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography variant="h6">Filtrar por Rango de Fechas</Typography>
            <IconButton
              onClick={handleCloseDatePicker}
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
          </Box>
        </DialogTitle>

        <DialogContent>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 3,
                paddingTop: 2,
              }}
            >
              <DatePicker
                label="Fecha Inicio"
                value={startDate}
                onChange={(newValue) => setStartDate(newValue)}
                sx={{ width: "100%" }}
              />
              <DatePicker
                label="Fecha Fin"
                value={endDate}
                onChange={(newValue) => setEndDate(newValue)}
                sx={{ width: "100%" }}
              />

              {startDate && endDate && (
                <Box
                  sx={{
                    padding: 2,
                    backgroundColor: "#f5f5f5",
                    borderRadius: 1,
                    textAlign: "center",
                  }}
                >
                  <Typography variant="body2" color="textSecondary">
                    Período seleccionado:{" "}
                    {dayjs(startDate).format("DD/MM/YYYY")} -{" "}
                    {dayjs(endDate).format("DD/MM/YYYY")}
                  </Typography>
                </Box>
              )}
            </Box>
          </LocalizationProvider>
        </DialogContent>

        <DialogActions>
          <Button
            onClick={handleClearDates}
            variant="contained"
            sx={{
              borderRadius: 100,
              backgroundColor: "#ff5a5a",
              color: "#fff",
              fontFamily: "Inter, sans-serif",
              fontSize: 12,
              textTransform: "none",
            }}
          >
            Limpiar Fechas
          </Button>
          <Button
            onClick={handleDatePickerSave}
            variant="contained"
            disabled={!startDate || !endDate}
            sx={{
              borderRadius: 100,
              backgroundColor: "#000",
              color: "#fff",
              fontFamily: "Inter, sans-serif",
              fontSize: 12,
              textTransform: "none",
            }}
          >
            Aplicar Filtro
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal para seleccionar formato de exportación */}
      <Dialog
        open={openExportFile}
        onClose={handleCloseExportModal}
      PaperProps={{
        component: "form",
        sx: {
          width: { xs: "95%", sm: "24rem" },
          maxWidth: "none",
          height: { xs: "auto", sm: "auto" },
          maxHeight: { xs: "95vh", sm: "none" },
          borderRadius: 5,
          m: { xs: 1, sm: 2 },
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
          Seleccionar Formato
          <IconButton
            aria-label="close"
            onClick={handleCloseExportModal}
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

        <DialogContent sx={{ textAlign: "center", py: 3 }}>
          <Typography variant="body1" sx={{ mb: 3 }}>
            ¿En qué formato deseas exportar el reporte?
          </Typography>
          
          <Box sx={{ display: "flex", justifyContent: "center", gap: 2 }}>
            {/* Botón Excel */}
            <Button
              variant="contained"
              onClick={handleExportExcel}
              sx={{
                backgroundColor: "#217346",
                color: "#fff",
                fontFamily: "Inter, sans-serif",
                fontSize: 14,
                textTransform: "none",
                minWidth: "120px",
                py: 1.5,
                "&:hover": {
                  backgroundColor: "#1a5a37",
                },
              }}
              startIcon={<GetApp />}
            >
              Excel
            </Button>

            {/* Botón PDF */}
            <Button
              variant="contained"
              onClick={handleExportPDF}
              sx={{
                backgroundColor: "#dc3545",
                color: "#fff",
                fontFamily: "Inter, sans-serif",
                fontSize: 14,
                textTransform: "none",
                minWidth: "120px",
                py: 1.5,
                "&:hover": {
                  backgroundColor: "#b02a37",
                },
              }}
              startIcon={<GetApp />}
            >
              PDF
            </Button>
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
};
