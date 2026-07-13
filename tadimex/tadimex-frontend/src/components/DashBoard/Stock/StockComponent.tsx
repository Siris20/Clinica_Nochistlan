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
  Button,
  Chip,
  FormControl,
  Select,
  InputLabel,
  MenuItem,
} from "@mui/material";
import { TrendingUp, TrendingDown, Visibility } from "@mui/icons-material";
import Chart from "react-apexcharts";
import { ToastContainer } from "react-toastify";
import { useStorage } from '../../../hooks/Storage/useStorage';
import { useBranch } from "../../../context/BranchContext";
import SearchBar from "../../SearchBar";
import { useStock } from "../../../hooks/Stock/useStock";
import Loader from "../../Loader";

export const StockComponent = () => {

  /*CONTEXTOS*/

  // Contexto de sucursal seleccionada
  const {selectedBranch} = useBranch();

  /*HOOKS*/

  //Hook de stock con paginación
  const {
    stocks, 
    allStocks,
    filteredStocks,
    selectedStorageStock,
    loadingStorageStock,
    handleGetStockProductsByStorage,
    setStocks,
    selectedStock,
    setSelectedStock,
    loading,
    page,
    rowsPerPage,
    totalStocks,
    handleChangePage,
    handleChangeRowsPerPage,
    searchTerm,
    setSearchTerm,
    setPage
  } = useStock(selectedBranch);

  //Hook de almacenes
  const {allFilteredStorage: filteredStorage} = useStorage(selectedBranch);

  /*ESTADOS*/
  const [selectedStorage, setSelectedStorage] = useState("todos");

  const handleSearchChange = (term: string) => {
    setSearchTerm(term);

    if (term) {
      const searchResults = filteredTableData.filter(
        (stock) =>
          stock.codigo?.toString().toLowerCase().includes(term.toLowerCase()) ||
          stock.descripcion?.toString().toLowerCase().includes(term.toLowerCase()) ||
          stock.almacen?.toString().toLowerCase().includes(term.toLowerCase())
      );

      if (searchResults.length > 0) {
        // Encontramos el primer stock que coincide
        const firstMatchingStock = searchResults[0];
        // Encontramos su índice en la lista completa
        const indexInAllFiltered = filteredTableData.findIndex(s => 
          s.codigo === firstMatchingStock.codigo && 
          s.descripcion === firstMatchingStock.descripcion
        );
        // Calculamos en qué página está
        if (indexInAllFiltered !== -1) {
          const pageOfFirstResult = Math.floor(indexInAllFiltered / rowsPerPage);
          // Actualizamos la página
          setPage(pageOfFirstResult);
        }
      }
    }
  };

  const handleStorageChange = (event: any) => {
    const selectedValue = event.target.value;
    setSelectedStorage(selectedValue);
    
    // Si se selecciona un almacén específico (no "todos"), obtener su stock
    if (selectedValue !== "todos") {
      const storageId = parseInt(selectedValue);
      handleGetStockProductsByStorage(storageId);
    }
  };

  // useEffect para manejar la búsqueda
  useEffect(() => {
    if (searchTerm) {
      setPage(0); // Reiniciar a la primera página al buscar
    }
  }, [searchTerm]);

  // Función para transformar los datos del API a formato de tabla
  const transformStockDataForTable = useMemo(() => {
    const tableData: any[] = [];
    
    // Si se selecciona "todos", mostrar todos los productos de todos los almacenes
    if (selectedStorage === "todos" && allStocks.length) {
      allStocks.forEach((sucursal) => {
        sucursal.almacenes.forEach((almacen) => {
          almacen.productos.forEach((producto) => {
            tableData.push({
              codigo: producto.producto_codigo,
              descripcion: producto.producto_descripcion,
              existencia: producto.cantidad,
              costo_promedio: producto.costo_promedio.toFixed(2),
              importe: producto.importe.toFixed(2),
              almacen: almacen.almacen_nombre,
            });
          });
        });
      });
    }
    
    // Si se selecciona un almacén específico, mostrar solo los productos de ese almacén
    if (selectedStorage !== "todos" && selectedStorageStock) {
      selectedStorageStock.productos.forEach((producto) => {
        tableData.push({
          codigo: producto.producto_codigo,
          descripcion: producto.producto_descripcion,
          existencia: producto.cantidad,
          costo_promedio: producto.costo_promedio.toFixed(2),
          importe: producto.importe.toFixed(2),
          almacen: selectedStorageStock.almacen_nombre,
        });
      });
    }

    return tableData;
  }, [allStocks, selectedStorage, selectedStorageStock]);

  // Filtrar datos de la tabla según el término de búsqueda
  const filteredTableData = useMemo(() => {
    if (!searchTerm.trim()) return transformStockDataForTable;

    const searchLower = searchTerm.toLowerCase();
    return transformStockDataForTable.filter((row) =>
      row.codigo?.toString().toLowerCase().includes(searchLower) ||
      row.descripcion?.toString().toLowerCase().includes(searchLower) ||
      row.almacen?.toString().toLowerCase().includes(searchLower)
    );
  }, [searchTerm, transformStockDataForTable]);

  // Aplicar paginación a los datos filtrados
  const paginatedStockData = useMemo(() => {
    const startIndex = page * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    return filteredTableData.slice(startIndex, endIndex);
  }, [filteredTableData, page, rowsPerPage]);

  // Total de registros para la paginación
  const totalStockRecords = useMemo(() => {
    return filteredTableData.length;
  }, [filteredTableData]);

  // Obtener métricas directamente del API
  const dynamicStockMetrics = useMemo(() => {
    let totalStock = 0;
    let totalValue = 0;
    let recentMovements = 0;
    let lowStockAlerts = 0;

    if (selectedStorage === "todos" && allStocks.length > 0) {
      // Usar valores directos del API para "todos"
      const firstSucursal = allStocks[0];
      totalStock = firstSucursal.stock_total || 0;
      totalValue = firstSucursal.valor_total || 0;
      recentMovements = firstSucursal.movimientos_recientes || 0;

      // Calcular alertas de stock bajo (productos con cantidad < 10)
      firstSucursal.almacenes.forEach((almacen) => {
        almacen.productos.forEach((producto) => {
          if (producto.cantidad < 10) {
            lowStockAlerts++;
          }
        });
      });
    } else if (selectedStorage !== "todos" && selectedStorageStock) {
      // Usar valores directos del API para almacén específico
      totalStock = selectedStorageStock.stock_total || 0;
      totalValue = selectedStorageStock.valor_total || 0;
      recentMovements = selectedStorageStock.movimientos_recientes || 0;

      // Calcular alertas de stock bajo para almacén específico
      selectedStorageStock.productos.forEach((producto) => {
        if (producto.cantidad < 10) {
          lowStockAlerts++;
        }
      });
    }

    return {
      totalStock,
      totalValue,
      recentMovements,
      lowStockAlerts
    };
  }, [allStocks, selectedStorage, selectedStorageStock]);

  const stockData = [
    {
      title: "Stock total",
      value: dynamicStockMetrics.totalStock.toLocaleString(),
      change: "+5%",
      trend: "up",
      color: "#4caf50",
    },
    {
      title: "Valor de stock",
      value: `$${dynamicStockMetrics.totalValue.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      change: "+2%",
      trend: "up",
      color: "#2196f3",
    },
    {
      title: "Alertas de stock bajo",
      value: dynamicStockMetrics.lowStockAlerts.toString(),
      change: "-10%",
      trend: "down",
      color: "#f44336",
    },
    {
      title: "Movimientos recientes",
      value: dynamicStockMetrics.recentMovements.toString(),
      change: "+8%",
      trend: "up",
      color: "#ff9800",
    },
  ];

  const getTrendIcon = (trend: string) => {
    return trend === "up" ? <TrendingUp /> : <TrendingDown />;
  };
  const getTrendColor = (trend: string) => {
    return trend === "up" ? "#4caf50" : "#f44336";
  };

  // Datos dinámicos para gráfica de barras por almacén
  const chartData = useMemo(() => {
    const categories: string[] = [];
    const stockData: number[] = [];

    if (selectedStorage === "todos" && allStocks.length > 0) {
      // Mostrar stock por almacén cuando está seleccionado "todos"
      allStocks[0].almacenes.forEach((almacen) => {
        categories.push(almacen.almacen_nombre);
        stockData.push(almacen.stock_total);
      });
    } else if (selectedStorage !== "todos" && selectedStorageStock) {
      // Mostrar productos individuales cuando hay un almacén específico
      categories.push(selectedStorageStock.almacen_nombre);
      stockData.push(selectedStorageStock.stock_total);
    }

    return { categories, stockData };
  }, [allStocks, selectedStorage, selectedStorageStock]);

  // Datos para gráfica de barras - Stock por almacén
  const barChartOptions = {
    chart: {
      type: "bar",
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
        text: "Unidades en Stock",
      },
    },
    fill: {
      opacity: 1,
      colors: ["#4caf50", "#ff9800", "#f44336", "#9c27b0", "#2196f3"],
    },
    tooltip: {
      y: {
        formatter: function (val) {
          return val + " unidades";
        },
      },
    },
    grid: {
      borderColor: "#f1f1f1",
    },
  };

  const barChartSeries = [
    {
      name: "Unidades en Stock",
      data: chartData.stockData,
    },
  ];

  // Datos para gráfica de línea - Movimientos en el tiempo
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
      categories: ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"],
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
    },
    yaxis: {
      title: {
        text: "Movements",
      },
    },
    colors: ["#2196f3"],
    grid: {
      borderColor: "#f1f1f1",
    },
    tooltip: {
      x: {
        format: "dd/MM/yy HH:mm",
      },
    },
  };

  const lineChartSeries = [
    {
      name: "Movimientos",
      data: [45, 52, 38, 45, 19, 23, 54],
    },
  ];

  //Formato de Precio
  const formatPrice = (price) => {
    return price.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

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
            Inventario General
          </Typography>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2, // Espacio entre elementos
              minWidth: { xs: "100%", sm: "300px", md: "500px" },
              justifyContent: { xs: "center", sm: "flex-end" },
            }}
          >
            <SearchBar
              searchTerm={searchTerm}
              setSearchTerm={handleSearchChange}
            />
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
                <MenuItem value="todos">
                  Todos
                </MenuItem> 
                {filteredStorage.map((storage)=> (
                  <MenuItem key={storage.id} value={storage.id}>
                    {storage?.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
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
                    Código
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
                    Descripción
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
                    Existencia
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
                    Costo Promedio
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
                    Almacén
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedStockData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      {searchTerm.trim() 
                        ? "No se encontraron resultados" 
                        : selectedStorage !== "todos" && !selectedStorageStock
                          ? "Selecciona 'Todos' en almacenes para ver el inventario" 
                          : loading || loadingStorageStock
                            ? <Loader /> 
                            : "No hay datos disponibles"
                      }
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedStockData.map((stock, index) => (
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
                      {stock.codigo}
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
                      {stock.descripcion}
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
                      {stock.existencia}
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
                      ${formatPrice(parseFloat(stock.costo_promedio))}
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
                      ${formatPrice(parseFloat(stock.importe))}
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
                      {stock.almacen}
                    </TableCell>
                  </TableRow>
                )))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

        {/* Componente de paginación */}
        <TablePagination
          component="div"
          count={totalStockRecords}
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

                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "flex-start",
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        color: getTrendColor(item.trend),
                        fontSize: "0.875rem",
                        fontWeight: 600,
                      }}
                    >
                      {getTrendIcon(item.trend)}
                      <Typography
                        variant="body2"
                        sx={{
                          ml: 0.5,
                          color: getTrendColor(item.trend),
                          fontWeight: 600,
                        }}
                      >
                        {item.change}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Sección de Gráficas */}
        <Box sx={{ mt: 4 }}>
          <Typography
            variant="h5"
            component="h2"
            sx={{
              textAlign: { xs: "center", sm: "left" },
              marginBottom: { xs: 1, sm: 2 },
            }}
          >
            Niveles de Stock y Movimientos
          </Typography>

          <Grid container spacing={3}>
            {/* Gráfica de Barras - Stock por Categoría */}
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
                    Niveles de Stock por Almacén
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: "bold", mb: 1 }}>
                    {dynamicStockMetrics.totalStock.toLocaleString()}
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
                    Últimos 30 días +5%
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

            {/* Gráfica de Línea - Movimientos en el Tiempo */}
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
                    Movimientos de Stock en el Tiempo
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: "bold", mb: 1 }}>
                    {dynamicStockMetrics.recentMovements}
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
                    Últimos 7 días +8%
                  </Typography>
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
      </Box>
    </>
  );
};
