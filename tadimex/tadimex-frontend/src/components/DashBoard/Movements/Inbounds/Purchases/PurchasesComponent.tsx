import { Box, IconButton, ListItemIcon, ListItemText, Menu, MenuItem, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, Typography } from "@mui/material";
import React, { useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import SearchBar from "../../../../SearchBar";
import { AddPurchasesComponent } from "./AddPurchasesComponent";
import Loader from "../../../../Loader";
import { Edit, GetApp, MoreVert, PictureAsPdf, RemoveRedEye } from "@mui/icons-material";
import dayjs from 'dayjs';
import { PurchasesDetailComponent } from "./PurchasesDetailComponent";
import { usePurchases } from "../../../../../hooks/Movements/Inbounds/Purchases/UsePurchases";
import { useBranch } from "../../../../../context/BranchContext";
import { RenamePDFDialog } from "../../../Quotes/RenamePDFDialog";
import { RenameExcelDialog } from "../../../Quotes/RenameExcelDialog";
import { createPurchasePDF } from "../../../../../utils/pdf_files_export/purchases_export";
import { createPurchaseExcel } from "../../../../../utils/excel_files_export/purchases_export";
import { useProducts } from "../../../../../hooks/Products/useProducts";
import { useEnterprise } from "../../../../../context/EnterpriseContext";

export const PurchasesComponent = () => {

  // Contexto de la empresa
  const {selectedEnterprise, enterprises} =  useEnterprise();

  //Context de la sucursal
  const { selectedBranch, branches } = useBranch();

  const {
    purchases,
    allPurchases,
    filteredPurchases,
    setPurchases,
    selectedPurchase,
    setSelectedPurchase,
    handleGetPurchase,
    handleCreatePurchase,
    handleUpdatePurchase,
    loading,
    page,
    setPage,
    rowsPerPage,
    totalPurchases,
    handleChangePage,
    handleChangeRowsPerPage,
    searchTerm,
    setSearchTerm,
  } = usePurchases(selectedBranch);

  // Hook de productos para obtener detalles
  const { handleGetProduct } = useProducts();

  /* ESTADOS */
  const [open, setOpen] = useState(false);
  const [openDetails, setOpenDetails] = useState(false);
  const [editingPurchase, setEditingPurchase] = useState(null);
  const [idOrder, setIdOrder] = useState("asc");
  const [billDateOrder, setBillDateOrder] = useState("asc");
  const [paymentDateOrder, setPaymentDateOrder] = useState("asc");
  const [paymentMethodOrder, setPaymentMethodOrder] = useState("asc");
  const [employeeOrder, setEmployeeOrder] = useState("asc");
  const [storageOrder, setStorageOrder] = useState("asc");
  const [supplierOrder, setSupplierOrder] = useState("asc");
  const [totalOrder, setTotalOrder] = useState("asc");
  const [purchaseToExport, setPurchaseToExport] = useState(null);
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
      const searchResults = filteredPurchases.filter(
        (purchase) =>
          purchase.id.toString().includes(newSearchTerm) ||
          purchase.fecha_factura
            ?.toLowerCase()
            .includes(newSearchTerm.toLowerCase()) ||
          purchase.fecha_pago
            ?.toLowerCase()
            .includes(newSearchTerm.toLowerCase()) ||
          purchase.metodo_pago
            ?.toLowerCase()
            .includes(newSearchTerm.toLowerCase()) ||
          purchase.empleado_nombre
            ?.toLowerCase()
            .includes(newSearchTerm.toLowerCase()) ||
          purchase.almacen_nombre
            ?.toLowerCase()
            .includes(newSearchTerm.toLowerCase()) ||
          purchase.proveedor_nombre
            ?.toLowerCase()
            .includes(newSearchTerm.toLowerCase()) ||
          purchase.total
            ?.toString()
            .includes(newSearchTerm.toLowerCase())
      );

      if(searchResults.length > 0) {
        //Encontramos la primera compra que coincide
        const firstMatchingPurchase = searchResults[0];
        //Encontramos su indice en la lista completa
        const indexInAllFiltered = filteredPurchases.findIndex(p=> p.id === firstMatchingPurchase.id);
        //Calculamos en que pagina esta
        if(indexInAllFiltered!== -1) {
          const pageOffFirstResult = Math.floor(indexInAllFiltered / rowsPerPage);
          //Actualizamos la pagina
          setPage(pageOffFirstResult);
        }
      }
    }
  }

  //Función para abrir el diálogo de agregar compra
  const handleClickDialogPurchase = () => {
    setEditingPurchase(null);
    setOpen(true);
  };

  //Función para agregar una nueva compra
  const handleAddPurchase = async (newPurchase) => {
    try {
      await handleCreatePurchase(newPurchase);
      toast.success("Compra agregada exitosamente");
    }catch (error) {
      toast.error("Error al agregar la compra");
    }
  };

  // Función para abrir el diálogo de editar compras
  const handleEditPurchase = (purchase) => {
    setEditingPurchase(purchase);
    setOpen(true);
  };

  // Función para editar una compra
  const handleUpdate = async (purchaseData) => {
    try {
      const purchaseId = editingPurchase.id;
      // Asegurarnos que tenemos el ID
      if (!purchaseId) {
        throw new Error("No se encontró el ID de la compra");
      }
      await handleUpdatePurchase(purchaseId, purchaseData);
      toast.success("Compra editada correctamente");
    } catch (error) {
      toast.error(error.message);
    }
  };

  // Función para abrir el diálogo de detalles de compras
  const handleClickDetails = async (purchase) => {
    await handleGetPurchase(purchase.id);
    setOpenDetails(true);
  };

  // Función para exportar pdf de compra
  const handleClickExport = async (purchase) => {
    try {
      const purchaseData = await handleGetPurchase(purchase.id);
      setPurchaseToExport(purchaseData);
      setOpenRenameDialog(true);
      handleMenuClose();
    } catch (error) {
      toast.error("Error al exportar la compra");
    }
  }

  // Función para descargar el pdf de compra
  const handleDownloadPDF = async (filename) => {
    try {
      const pdf = await createPurchasePDF(purchaseToExport, handleGetProduct);
      if (pdf) {
        pdf.save(`${filename}.pdf`);
        setOpenRenameDialog(false);
        setPurchaseToExport(null);
        setPdfName("");
      }
    } catch (error) {
      toast.error("Error al generar el PDF de la compra");
    }
  }

  // Función para abrir el diálogo de renombrar Excel
  const handleClickExportExcel = async (purchase) => {
    try {
      const purchaseData = await handleGetPurchase(purchase.id);
      setPurchaseToExport(purchaseData);
      
      // Generar nombre por defecto
      const today = new Date().toISOString().split('T')[0];
      const defaultName = `Compra_${purchaseData.id}_${purchaseData.fecha_factura ? new Date(purchaseData.fecha_factura).toLocaleDateString('es-ES').replace(/\//g, '-') : today}_descarga_${new Date().toLocaleDateString('es-ES').replace(/\//g, '-')}`;
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
      const success = await createPurchaseExcel(
        purchaseToExport,
        handleGetProduct,
        selectedBranch,
        branches,
        selectedEnterprise,
        enterprises,
        customName
      );
      if (success) {
        setOpenRenameExcelDialog(false);
        setPurchaseToExport(null);
        setExcelName("");
      }
    } catch (error) {
      toast.error("Error al exportar la compra a Excel");
    }
  }

  // Función para ordenar por ID
  const handleSortID = () => {
    const sorted = [...allPurchases].sort((a,b)=> {
      const idA = a.id || 0;
      const idB = b.id || 0;

      if(idOrder === "asc") {
        return idA - idB;
      }else {
        return idB - idA;
      }
    });
    setPurchases(sorted);
    setIdOrder(idOrder === "asc" ? "desc" : "asc");
  }

  // Función para ordenar las compras por fecha de factura
  const handleSortBillDate = () => {
    const sorted = [...allPurchases].sort((a, b) => {
      const dateA = a.fecha_factura || "";
      const dateB = b.fecha_factura || "";

      if (billDateOrder === "asc") {
        return dateA.localeCompare(dateB);
      } else {
        return dateB.localeCompare(dateA);
      }
    });
    setPurchases(sorted);
    setBillDateOrder(billDateOrder === "asc" ? "desc" : "asc");
  };

  // Función para ordenar las compras por fecha de pago
  const handleSortPaymentDate = () => {
    const sorted = [...allPurchases].sort((a, b) => {
      const dateA = a.fecha_pago || "";
      const dateB = b.fecha_pago || "";

      if (paymentDateOrder === "asc") {
        return dateA.localeCompare(dateB);
      } else {
        return dateB.localeCompare(dateA);
      }
    });
    setPurchases(sorted);
    setPaymentDateOrder(paymentDateOrder === "asc" ? "desc" : "asc");
  };

  // Función para ordenar las compras por método de pago
  const handleSortPaymentMethod = () => {
    const sorted = [...allPurchases].sort((a, b) => {
      const methodA = a.metodo_pago || "";
      const methodB = b.metodo_pago || "";

      if (paymentMethodOrder === "asc") {
        return methodA.localeCompare(methodB);
      } else {
        return methodB.localeCompare(methodA);
      }
    });
    setPurchases(sorted);
    setPaymentMethodOrder(paymentMethodOrder === "asc" ? "desc" : "asc");
  }

  // Función para ordenar las compras por empleado
  const handleSortEmployee = () => {
    const sorted = [...allPurchases].sort((a, b) => {
      const employeeA = a.empleado_nombre || "";
      const employeeB = b.empleado_nombre || "";

      if (employeeOrder === "asc") {
        return employeeA.localeCompare(employeeB);
      } else {
        return employeeB.localeCompare(employeeA);
      }
    });
    setPurchases(sorted);
    setEmployeeOrder(employeeOrder === "asc" ? "desc" : "asc");
  }

  // Función para ordenar las compras por almacén
  const handleSortStorage = () => {
    const sorted = [...allPurchases].sort((a, b) => {
      const storageA = a.almacen_nombre || "";
      const storageB = b.almacen_nombre || "";

      if (storageOrder === "asc") {
        return storageA.localeCompare(storageB);
      } else {
        return storageB.localeCompare(storageA);
      }
    });
    setPurchases(sorted);
    setStorageOrder(storageOrder === "asc" ? "desc" : "asc");
  }

  // Función para ordenar las compras por proveedor
  const handleSortSupplier = () => {
    const sorted = [...allPurchases].sort((a, b) => {
      const supplierA = a.proveedor_nombre || "";
      const supplierB = b.proveedor_nombre || "";

      if (supplierOrder === "asc") {
        return supplierA.localeCompare(supplierB);
      } else {
        return supplierB.localeCompare(supplierA);
      }
    });
    setPurchases(sorted);
    setSupplierOrder(supplierOrder === "asc" ? "desc" : "asc");
  }

  // Función para ordenar las compras por costo
  const handleSortTotal = () => {
    const sorted = [...allPurchases].sort((a, b) => {
      const totalA = a.total || 0;
      const totalB = b.total || 0;

      if (totalOrder === "asc") {
        return totalA.localeCompare(totalB);
      } else {
        return totalB.localeCompare(totalA);
      }
    });
    setPurchases(sorted);
    setTotalOrder(totalOrder === "asc" ? "desc" : "asc");
  }

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = dayjs(dateString).startOf("day");
    return date.format("DD/MM/YYYY");
  };

  //Menu de Acciones
  const handleMenuOpen = (event, purchase) => {
    setAnchorEl(event.currentTarget);
    setSelectedPurchase(purchase);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedPurchase(null);
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
          Historial de Compras
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
            onAddContent={handleClickDialogPurchase}
          />
          <AddPurchasesComponent
            open={open}
            setOpen={setOpen}
            onAddPurchases={handleAddPurchase}
            onEditPurchases={handleUpdate}
            initialData={editingPurchase}
            onClose={() => setEditingPurchase(null)}
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
                ID. de Compra
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
                Almacén
              </TableCell>
              <TableCell
                sx={tableCellStyles}
                align="justify"
                onClick={handleSortSupplier}
              >
                Proveedor
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
                >
                  Observaciones
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
            ) : purchases.length === 0 ? (
              <TableRow>
                <TableCell colSpan={11} align="center">
                  No hay Compras
                </TableCell>
              </TableRow>
            ) : (
              purchases.map((purchase) => (
                <TableRow key={purchase.id}>
                  <TableCell align="justify">{purchase?.id}</TableCell>
                  <TableCell align="justify">
                    {formatDate(purchase?.fecha_factura)}
                  </TableCell>
                  <TableCell align="justify">
                    {formatDate(purchase?.fecha_pago)}
                  </TableCell>
                  <TableCell align="justify">{purchase?.metodo_pago}</TableCell>
                  <TableCell align="justify">{purchase?.empleado_nombre}</TableCell>
                  <TableCell align="justify">{purchase?.almacen_nombre}</TableCell>
                  <TableCell align="justify">{purchase?.proveedor_nombre}</TableCell>
                  <TableCell align="justify">{`$${formatPrice(parseFloat(purchase?.total) || 0)}`}</TableCell>
                  <TableCell align="justify">{purchase?.observaciones}</TableCell>
                  <TableCell align="justify">
                    <IconButton
                      size="small"
                      onClick={(event) => handleMenuOpen(event, purchase)}
                    >
                      <MoreVert />
                    </IconButton>
                    <Menu
                      anchorEl={anchorEl}
                      open={Boolean(anchorEl) && selectedPurchase?.id === purchase.id}
                      onClose={handleMenuClose}
                    >
                      <MenuItem
                        onClick={() => {
                          handleClickDetails(purchase);
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
                          handleEditPurchase(selectedPurchase);
                          handleMenuClose();
                        }}
                      >
                        <ListItemIcon>
                          <Edit fontSize="small" />
                        </ListItemIcon>
                        <ListItemText>Editar Compra</ListItemText>
                      </MenuItem>
                      <MenuItem
                        onClick={()=> {
                          handleClickExport(selectedPurchase);
                        }}
                      >
                        <ListItemIcon>
                          <PictureAsPdf fontSize="small" color="error"/>
                        </ListItemIcon>
                        <ListItemText>Exportar PDF</ListItemText>
                      </MenuItem>
                      <MenuItem
                        onClick={()=> {
                          handleClickExportExcel(selectedPurchase);
                        }}
                      >
                        <ListItemIcon>
                          <GetApp fontSize="small" color="success"/>
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
        count={totalPurchases}
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

      {/* Detalles de una compra */}
      <PurchasesDetailComponent
        open={openDetails}
        setOpen={setOpenDetails}
        purchase={selectedPurchase}
      />

      {/* Exportar compra */}
      <RenamePDFDialog
        open={openRenameDialog}
        onClose={() => setOpenRenameDialog(false)}
        onDownload={handleDownloadPDF}
        defaultFileName={
          purchaseToExport ? `Compra_${formatDate(purchaseToExport.created_at)}_${purchaseToExport.id}` : ""
        }
      />

      {/* Exportar compra a Excel */}
      <RenameExcelDialog
        open={openRenameExcelDialog}
        onClose={() => setOpenRenameExcelDialog(false)}
        onDownload={handleDownloadExcel}
        defaultFileName={excelName}
      />

    </>
  );
};
