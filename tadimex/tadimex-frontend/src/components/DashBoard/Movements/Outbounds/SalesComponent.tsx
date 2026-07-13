import { Box, IconButton, ListItemIcon, ListItemText, Menu, MenuItem, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, Typography } from "@mui/material";
import React, { useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import { AddSalesComponent } from "./AddSalesComponent";
import { Edit, MoreVert, RemoveRedEye, Download, PictureAsPdf, GetApp } from "@mui/icons-material";
import dayjs from 'dayjs';
import { SalesDetailComponent } from "./SalesDetailComponent";
import { useBranch } from "../../../../context/BranchContext";
import { useEnterprise } from "../../../../context/EnterpriseContext";
import SearchBar from "../../../SearchBar";
import Loader from "../../../Loader";
import { useSales } from '../../../../hooks/Movements/Outbounds/Sales/useSales';
import { useProducts } from "../../../../hooks/Products/useProducts";
import { RenamePDFDialog } from "../../Quotes/RenamePDFDialog";
import { RenameExcelDialog } from "../../Quotes/RenameExcelDialog";
import { createSalePDF } from "../../../../utils/pdf_files_export/sales_export";
import { createSaleExcel } from "../../../../utils/excel_files_export/sales_export";
export const SalesComponent = () => {

  // Contexto de la empresa
  const {selectedEnterprise, enterprises} =  useEnterprise();

  //Context de la sucursal
  const { selectedBranch, branches } = useBranch();

  const {
    sales,
    allSales,
    filteredSales,
    setSales,
    selectedSale,
    setSelectedSale,
    handleGetSale,
    handleCreateSale,
    handleUpdateSale,
    loading,
    page,
    setPage,
    rowsPerPage,
    totalSales,
    handleChangePage,
    handleChangeRowsPerPage,
    searchTerm,
    setSearchTerm,
  } = useSales(selectedBranch);

  // Hook de productos para obtener detalles
  const { handleGetProduct } = useProducts();

  /* ESTADOS */
  const [open, setOpen] = useState(false);
  const [openDetails, setOpenDetails] = useState(false);
  const [editingSale, setEditingSale] = useState(null);
  const [idOrder, setIdOrder] = useState("asc");
  const [billDateOrder, setBillDateOrder] = useState("asc");
  const [paymentDateOrder, setPaymentDateOrder] = useState("asc");
  const [paymentMethodOrder, setPaymentMethodOrder] = useState("asc");
  const [employeeOrder, setEmployeeOrder] = useState("asc");
  const [storageOrder, setStorageOrder] = useState("asc");
  const [clientOrder, setClientOrder] = useState("asc");
  const [totalOrder, setTotalOrder] = useState("asc");
  const [saleToExport, setSaleToExport] = useState(null);
  const [openRenameDialog, setOpenRenameDialog] = useState(false);
  const [openRenameExcelDialog, setOpenRenameExcelDialog] = useState(false);
  const [pdfName, setPdfName] = useState("");
  const [excelName, setExcelName] = useState("");
  const [anchorEl, setAnchorEl] = useState(null);

  /* FUNCIONES */

  //Función inteligente para manejar la busqueda
  const handleSearchChange = (newSearchTerm) => {
    setSearchTerm(newSearchTerm);

    if(newSearchTerm) {
      const searchResults = filteredSales.filter(
        (sale) =>
          sale.id.toString().includes(newSearchTerm) ||
          sale.fecha_factura
            ?.toLowerCase()
            .includes(newSearchTerm.toLowerCase()) ||
          sale.fecha_pago
            ?.toLowerCase()
            .includes(newSearchTerm.toLowerCase()) ||
          sale.metodo_pago
            ?.toLowerCase()
            .includes(newSearchTerm.toLowerCase()) ||
          sale.empleado_nombre
            ?.toLowerCase()
            .includes(newSearchTerm.toLowerCase()) ||
          sale.almacen_nombre
            ?.toLowerCase()
            .includes(newSearchTerm.toLowerCase()) ||
          sale.cliente_nombre
            ?.toLowerCase()
            .includes(newSearchTerm.toLowerCase()) ||
          sale.total
            ?.toString()
            .includes(newSearchTerm.toLowerCase()) ||
          sale.estado
            ?.toLowerCase()
            .includes(newSearchTerm.toLowerCase()) ||
          sale.costo_envio
            ?.toString()
            .includes(newSearchTerm.toLowerCase())
      );

      if(searchResults.length > 0) {
        //Encontramos la primera venta que coincide
        const firstMatchingSale = searchResults[0];
        //Encontramos su indice en la lista completa
        const indexInAllFiltered = filteredSales.findIndex(p=> p.id === firstMatchingSale.id);
        //Calculamos en que pagina esta
        if(indexInAllFiltered!== -1) {
          const pageOffFirstResult = Math.floor(indexInAllFiltered / rowsPerPage);
          //Actualizamos la pagina
          setPage(pageOffFirstResult);
        }
      }
    }
  }

  //Función para abrir el diálogo de agregar venta
  const handleClickDialogSale = () => {
    setEditingSale(null);
    setOpen(true);
  };

  //Función para agregar una nueva venta
  const handleAddSale = async(newSale) => {
    try {
      await handleCreateSale(newSale);
      toast.success("Venta registrada exitosamente");
    }catch (error) {
      toast.error("Error al agregar la venta");
    }
  };

  // Función para abrir el diálogo de editar ventas
  const handleEditSale = (sale) => {
    setEditingSale(sale);
    setOpen(true);
  };

  // Función para editar una venta
  const handleUpdate = async (saleData) => {
    try {
      const saleId = editingSale.id;
      // Asegurarnos que tenemos el ID
      if (!saleId) {
        throw new Error("No se encontró el ID de la venta");
      }
      await handleUpdateSale(saleId, saleData);
      toast.success("Venta editada correctamente");
    } catch (error) {
      console.error("Error completo:", error);
      toast.error(error.message);
    }
  };

  // Función para abrir el diálogo de detalles de ventas
  const handleClickDetails = async (sale) => {
    await handleGetSale(sale.id);
    setOpenDetails(true);
  };

  // Función para exportar pdf de venta
  const handleClickExport = async (sale) => {
    try {
      const saleData = await handleGetSale(sale.id);
      setSaleToExport(saleData);
      setOpenRenameDialog(true);
      handleMenuClose();
    } catch (error) {
      toast.error("Error al exportar la venta");
    }
  }

  // Función para descargar el pdf de venta
  const handleDownloadPDF = async (filename) => {
    try {
      const pdf = await createSalePDF(saleToExport, handleGetProduct);
      if (pdf) {
        pdf.save(`${filename}.pdf`);
        setOpenRenameDialog(false);
        setSaleToExport(null);
        setPdfName("");
      }
    } catch (error) {
      toast.error("Error al generar el PDF de la venta");
    }
  }

  // Función para abrir el diálogo de renombrar Excel
  const handleClickExportExcel = async (sale) => {
    try {
      const saleData = await handleGetSale(sale.id);
      setSaleToExport(saleData);
      
      // Generar nombre por defecto
      const today = new Date().toISOString().split('T')[0];
      const defaultName = `Venta_${saleData.id}_${saleData.fecha_factura ? new Date(saleData.fecha_factura).toLocaleDateString('es-ES').replace(/\//g, '-') : today}_descarga_${new Date().toLocaleDateString('es-ES').replace(/\//g, '-')}`;
      setExcelName(defaultName);
      
      setOpenRenameExcelDialog(true);
      handleMenuClose();
    } catch (error) {
      toast.error("Error al preparar la exportación Excel");
    }
  }

  // Función para descargar Excel con nombre personalizado
  const handleDownloadExcel = async (customName) => {
    try {
      const success = await createSaleExcel(
        saleToExport,
        handleGetProduct,
        selectedBranch,
        branches,
        selectedEnterprise,
        enterprises,
        customName
      );
      if (success) {
        setOpenRenameExcelDialog(false);
        setSaleToExport(null);
        setExcelName("");
      }
    } catch (error) {
      toast.error("Error al exportar la venta a Excel");
    }
  }

  // Función para ordenar por ID
  const handleSortID = () => {
    const sorted = [...allSales].sort((a,b)=> {
      const idA = a.id || 0;
      const idB = b.id || 0;

      if(idOrder === "asc") {
        return idA - idB;
      }else {
        return idB - idA;
      }
    });
    setSales(sorted);
    setIdOrder(idOrder === "asc" ? "desc" : "asc");
  }

  // Función para ordenar las ventas por fecha de factura
  const handleSortBillDate = () => {
    const sorted = [...allSales].sort((a, b) => {
      const dateA = a.fecha_factura || "";
      const dateB = b.fecha_factura || "";

      if (billDateOrder === "asc") {
        return dateA.localeCompare(dateB);
      } else {
        return dateB.localeCompare(dateA);
      }
    });
    setSales(sorted);
    setBillDateOrder(billDateOrder === "asc" ? "desc" : "asc");
  };

  // Función para ordenar las ventas por fecha de pago
  const handleSortPaymentDate = () => {
    const sorted = [...allSales].sort((a, b) => {
      const dateA = a.fecha_pago || "";
      const dateB = b.fecha_pago || "";

      if (paymentDateOrder === "asc") {
        return dateA.localeCompare(dateB);
      } else {
        return dateB.localeCompare(dateA);
      }
    });
    setSales(sorted);
    setPaymentDateOrder(paymentDateOrder === "asc" ? "desc" : "asc");
  };

  // Función para ordenar las ventas por método de pago
  const handleSortPaymentMethod = () => {
    const sorted = [...allSales].sort((a, b) => {
      const methodA = a.metodo_pago || "";
      const methodB = b.metodo_pago || "";

      if (paymentMethodOrder === "asc") {
        return methodA.localeCompare(methodB);
      } else {
        return methodB.localeCompare(methodA);
      }
    });
    setSales(sorted);
    setPaymentMethodOrder(paymentMethodOrder === "asc" ? "desc" : "asc");
  }

  // Función para ordenar las ventas por empleado
  const handleSortEmployee = () => {
    const sorted = [...allSales].sort((a, b) => {
      const employeeA = a.empleado_nombre || "";
      const employeeB = b.empleado_nombre || "";

      if (employeeOrder === "asc") {
        return employeeA.localeCompare(employeeB);
      } else {
        return employeeB.localeCompare(employeeA);
      }
    });
    setSales(sorted);
    setEmployeeOrder(employeeOrder === "asc" ? "desc" : "asc");
  }

  // Función para ordenar las ventas por almacén
  const handleSortStorage = () => {
    const sorted = [...allSales].sort((a, b) => {
      const storageA = a.almacen_nombre || "";
      const storageB = b.almacen_nombre || "";

      if (storageOrder === "asc") {
        return storageA.localeCompare(storageB);
      } else {
        return storageB.localeCompare(storageA);
      }
    });
    setSales(sorted);
    setStorageOrder(storageOrder === "asc" ? "desc" : "asc");
  }

  // Función para ordenar las ventas por cliente
  const handleSortClient = () => {
    const sorted = [...allSales].sort((a, b) => {
      const clientA = a.cliente_nombre || "";
      const clientB = b.cliente_nombre || "";

      if (clientOrder === "asc") {
        return clientA.localeCompare(clientB);
      } else {
        return clientB.localeCompare(clientA);
      }
    });
    setSales(sorted);
    setClientOrder(clientOrder === "asc" ? "desc" : "asc");
  }

  // Función para ordenar las ventas por costo
  const handleSortTotal = () => {
    const sorted = [...allSales].sort((a, b) => {
      const totalA = a.total || 0;
      const totalB = b.total || 0;

      if (totalOrder === "asc") {
        return totalA.localeCompare(totalB);
      } else {
        return totalB.localeCompare(totalA);
      }
    });
    setSales(sorted);
    setTotalOrder(totalOrder === "asc" ? "desc" : "asc");
  }

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = dayjs(dateString).startOf("day");
    return date.format("DD/MM/YYYY");
  };

  //Menu de Acciones
  const handleMenuOpen = (event, sale) => {
    setAnchorEl(event.currentTarget);
    setSelectedSale(sale);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedSale(null);
  }; 

  const formatPrice = (price) => {
    return price.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  /* ESTILOS*/
  const tableCellStyles = {
    backgroundColor: "#f1f1f1",
    cursor: "pointer",
    fontSize: "0.8rem",
    fontWeight: "bold",
  };

  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} />
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
          Historial de Ventas
        </Typography>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            width: { xs: "100%", sm: "auto" },
            justifyContent: { xs: "center", sm: "flex-end" },
          }}
        >
          <SearchBar
            searchTerm={searchTerm}
            setSearchTerm={handleSearchChange}
            onAddContent={handleClickDialogSale}
          />
          <AddSalesComponent
            open={open}
            setOpen={setOpen}
            onAddSales={handleAddSale}
            onEditSales={handleUpdate}
            initialData={editingSale}
            onClose={() => setEditingSale(null)}
          />
        </Box>
      </Box>
      <TableContainer
        sx={{
          height: "auto",
          maxHeight: "calc(100vh - 250px)", // Reducimos para dar espacio a la paginación
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
                sx={tableCellStyles}
                align="justify"
                onClick={handleSortID}
              >
                ID. de Venta
              </TableCell>
              <TableCell
                sx={tableCellStyles}
                align="justify"
                onClick={handleSortBillDate}
              >
                Fecha Factura
              </TableCell>
              <TableCell
                sx={tableCellStyles}
                align="justify"
                onClick={handleSortPaymentDate}
              >
                Fecha Pago
              </TableCell>
              <TableCell
                sx={tableCellStyles}
                align="justify"
                onClick={handleSortPaymentMethod}
              >
                Método de Pago
              </TableCell>
              <TableCell
                sx={tableCellStyles}
                align="justify"
                onClick={handleSortEmployee}
              >
                Empleado
              </TableCell>
              <TableCell
                sx={tableCellStyles}
                align="justify"
                onClick={handleSortStorage}
              >
                Cliente
              </TableCell>
              <TableCell
                sx={tableCellStyles}
                align="justify"
                onClick={handleSortClient}
              >
                Costo Envío
              </TableCell>
              <TableCell
                sx={tableCellStyles}
                align="justify"
                onClick={handleSortTotal}
              >
                Costo Total
              </TableCell>
              <TableCell
                sx={tableCellStyles}
                align="justify"
                onClick={handleSortTotal}
              >
                Estado
              </TableCell>
              <TableCell sx={tableCellStyles} align="justify">
                Acciones
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={11} align="center">
                  <Loader />
                </TableCell>
              </TableRow>
            ) : sales.length === 0 ? (
              <TableRow>
                <TableCell colSpan={11} align="center">
                  No hay Ventas
                </TableCell>
              </TableRow>
            ) : (
              sales.map((sale) => (
                <TableRow key={sale.id}>
                  <TableCell align="justify">{sale?.id}</TableCell>
                  <TableCell align="justify">
                    {formatDate(sale?.fecha_factura)}
                  </TableCell>
                  <TableCell align="justify">
                    {formatDate(sale?.fecha_pago)}
                  </TableCell>
                  <TableCell align="justify">{sale?.metodo_pago}</TableCell>
                  <TableCell align="justify">{sale?.empleado_nombre}</TableCell>
                  <TableCell align="justify">{sale?.cliente_nombre || "Cliente no encontrado"}</TableCell>
                  <TableCell align="justify">{sale?.costo_envio || "0.00"}</TableCell>
                  <TableCell align="justify">{`$${formatPrice(parseFloat(sale?.total) || 0)}`}</TableCell>
                  <TableCell align="justify">{sale?.estado || "Estado no encontrado"}</TableCell>
                  <TableCell align="justify">
                    <IconButton
                      size="small"
                      onClick={(event) => handleMenuOpen(event, sale)}
                    >
                      <MoreVert />
                    </IconButton>
                    <Menu
                      anchorEl={anchorEl}
                      open={Boolean(anchorEl) && selectedSale?.id === sale.id}
                      onClose={handleMenuClose}
                    >
                      <MenuItem
                        onClick={() => {
                          handleClickDetails(sale);
                          handleMenuClose();
                        }}
                      >
                        <ListItemIcon>
                          <RemoveRedEye fontSize="small" />
                        </ListItemIcon>
                        <ListItemText>Ver detalles</ListItemText>
                      </MenuItem>
                      <MenuItem
                        onClick={() => {
                          handleEditSale(selectedSale);
                          handleMenuClose();
                        }}
                      >
                        <ListItemIcon>
                          <Edit fontSize="small" />
                        </ListItemIcon>
                        <ListItemText>Editar Venta</ListItemText>
                      </MenuItem>
                      <MenuItem
                        onClick={() => {
                          handleClickExport(selectedSale);
                          handleMenuClose();
                        }}
                      >
                        <ListItemIcon>
                          <PictureAsPdf fontSize="small" color="error" />
                        </ListItemIcon>
                        <ListItemText>Exportar PDF</ListItemText>
                      </MenuItem>
                      <MenuItem
                        onClick={() => {
                          handleClickExportExcel(selectedSale);
                        }}
                      >
                        <ListItemIcon>
                          <GetApp fontSize="small" color="success" />
                        </ListItemIcon>
                        <ListItemText>Exportar Excel</ListItemText>
                      </MenuItem>
                    </Menu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Componente de paginación */}
      <TablePagination
        component="div"
        count={totalSales}
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

      {/* Detalles de una venta */}
      <SalesDetailComponent
        open={openDetails}
        setOpen={setOpenDetails}
        sale={selectedSale}
      />

      {/* Exportar venta */}
      <RenamePDFDialog
        open={openRenameDialog}
        onClose={() => setOpenRenameDialog(false)}
        onDownload={handleDownloadPDF}
        defaultFileName={
          saleToExport ? `Venta_${formatDate(saleToExport.created_at)}_${saleToExport.id}` : ""
        }
      />

      {/* Exportar venta a Excel */}
      <RenameExcelDialog
        open={openRenameExcelDialog}
        onClose={() => setOpenRenameExcelDialog(false)}
        onDownload={handleDownloadExcel}
        defaultFileName={excelName}
      />

    </>
  );
};
