import {
  Box,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  TablePagination,
} from "@mui/material";
import React, { useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import SearchBar from "../../SearchBar";
import { Edit, RemoveRedEye, MoreVert } from "@mui/icons-material";
import DeleteIcon from "@mui/icons-material/Delete";
import { DeleteDialogConfirmComponent } from "../DeleteDialogConfirmComponent";
import { ProductsDetailComponent } from "./ProductsDetailComponent";
import { AddProductsComponent } from "./AddProductsComponent";
import { useProducts } from "../../../hooks/Products/useProducts";
import Loader from "../../Loader";
import { useEnterprise } from "../../../context/EnterpriseContext";

export const ProductsComponent = () => {
  //Contexto de empresa seleccionada
  const { selectedEnterprise } = useEnterprise();

  //Hook de productos - ACTUALIZADO: pasamos null para subcategoría y enterprise para empresa
  // Esto hará que el hook use el método handleGetProductsByEnterprise() que carga productos por empresa
  const {
    filteredProducts,
    allFilteredProducts,
    setProducts,
    selectedProduct,
    setSelectedProduct,
    handleGetProduct,
    handleDeleteProduct: deleteProductAPI,
    handleCreateProduct,
    handleUpdateProduct,
    loadingProducts,
    page,
    setPage,
    rowsPerPage,
    totalProducts,
    handleChangePage,
    handleChangeRowsPerPage,
    searchTerm,
    setSearchTerm,
  } = useProducts(null, selectedEnterprise, false); // false = NO requiere subcategoría (carga por empresa)

  //Estados
  const [open, setOpen] = useState(false);
  const [openDetails, setOpenDetails] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  const [nameOrder, setNameOrder] = useState("asc");
  const [descriptionOrder, setDescriptionOrder] = useState("asc");
  const [brandOrder, setBrandOrder] = useState("asc");
  const [warrantyOrder, setWarrantyOrder] = useState("asc");
  const [salePriceOrder, setSalePriceOrder] = useState("asc");
  const [anchorEl, setAnchorEl] = useState(null);

  // Busqueda de productos - SIMPLIFICADO: solo actualizar el término de búsqueda
  const handleSearchChange = (newSearchTerm) => {
    setSearchTerm(newSearchTerm);
  };

  //Funcion para abrir el dialogo de agregar producto
  const handleClickDialogProduct = () => {
    setEditingProduct(null);
    setOpen(true);
  };

  //Funcion para agregar un nuevo producto
  const handleAddProduct = async (newProduct) => {
    try {
      await handleCreateProduct(newProduct);
      toast.success("Producto agregado correctamente");
    } catch (error) {
      toast.error(error.message);
    }
  };

  //Funcion para abrir el dialogo de eliminación de Productos
  const handleDeleteDialog = (product) => {
    setProductToDelete(product);
    setDeleteDialogOpen(true);
  };

  //Funcion para eliminar una sucursal
  const handleDeleteProduct = async () => {
    try {
      await deleteProductAPI(productToDelete.id);
      setProducts((prevProducts) =>
        prevProducts.filter((product) => product.id !== productToDelete.id)
      );
      setDeleteDialogOpen(false);
      setProductToDelete(null);
      toast.success("Producto eliminado correctamente");
    } catch (error) {
      toast.error("Error al eliminar el producto");
    }
  };

  //Funcion para cerrar el dialogo de eliminación de productos
  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setProductToDelete(null);
  };

  //Funcion para abrir el dialogo de editar producto
  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setOpen(true);
  };

  //Funcion para editar un producto
  const handleUpdate = async (productData) => {
    try {
      await handleUpdateProduct(productData.id, productData);
      toast.success("Producto editado correctamente");
    } catch (error) {
      toast.error(error.message);
    }
  };

  //Funcion para abrir el dialogo de detalles de producto
  const handleClickDetails = async (product) => {
    await handleGetProduct(product.id);
    setOpenDetails(true);
  };

  //Funcion para ordenar los productos por nombre
  const handleSortName = () => {
    const sorted = [...filteredProducts].sort((a, b) => {
      const nameA = a.name || "";
      const nameB = b.name || "";

      if (nameOrder === "asc") {
        return nameA.localeCompare(nameB);
      } else {
        return nameB.localeCompare(nameA);
      }
    });
    setProducts(sorted);
    setNameOrder(nameOrder === "asc" ? "desc" : "asc");
  };

  //Funcion para ordenar los productos por descripcion
  const handleSortDescription = () => {
    const sorted = [...filteredProducts].sort((a, b) => {
      const descriptionA = a.description || "";
      const descriptionB = b.description || "";

      if (descriptionOrder === "asc") {
        return descriptionA.localeCompare(descriptionB);
      } else {
        return descriptionB.localeCompare(descriptionA);
      }
    });
    setProducts(sorted);
    setDescriptionOrder(descriptionOrder === "asc" ? "desc" : "asc");
  };

  //Funcion para ordenar los productos por marca
  const handleSortBrand = () => {
    const sorted = [...filteredProducts].sort((a, b) => {
      const brandA = a.brand || "";
      const brandB = b.brand || "";

      if (brandOrder === "asc") {
        return brandA.localeCompare(brandB);
      } else {
        return brandB.localeCompare(brandA);
      }
    });
    setProducts(sorted);
    setBrandOrder(brandOrder === "asc" ? "desc" : "asc");
  };

  //Funcion para ordenar los productos por warranty
  const handleSortWarranty = () => {
    const sorted = [...filteredProducts].sort((a, b) => {
      const warrantyA = a.warranty || "";
      const warrantyB = b.warranty || "";

      if (warrantyOrder === "asc") {
        return warrantyA.localeCompare(warrantyB);
      } else {
        return warrantyB.localeCompare(warrantyA);
      }
    });
    setProducts(sorted);
    setWarrantyOrder(warrantyOrder === "asc" ? "desc" : "asc");
  };

  //Funcion para ordenar los productos por salePrice
  const handleSortSalePrice = () => {
    const sorted = [...filteredProducts].sort((a, b) => {
      const salePriceA = a.sell_price || "";
      const salePriceB = b.sell_price || "";

      if (salePriceOrder === "asc") {
        return salePriceA.localeCompare(salePriceB);
      } else {
        return salePriceB.localeCompare(salePriceA);
      }
    });
    setProducts(sorted);
    setSalePriceOrder(salePriceOrder === "asc" ? "desc" : "asc");
  };

  //Menu de acciones
  const handleMenuOpen = (event, product) => {
    setAnchorEl(event.currentTarget);
    setSelectedProduct(product);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedProduct(null);
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
          Listado de Productos
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
            onAddContent={handleClickDialogProduct}
          />
          <AddProductsComponent
            open={open}
            setOpen={setOpen}
            onAddProducts={handleAddProduct}
            onEditProducts={handleUpdate}
            initialData={editingProduct}
            onClose={() => {
              setOpen(false);
              setEditingProduct(null);
            }}
          />
        </Box>
      </Box>
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
                sx={{ backgroundColor: "#f1f1f1", cursor: "pointer" }}
                align="justify"
                onClick={handleSortName}
              >
                Nombre
              </TableCell>
              <TableCell
                sx={{ backgroundColor: "#f1f1f1", cursor: "pointer" }}
                align="justify"
                onClick={handleSortDescription}
              >
                Descripción
              </TableCell>
              <TableCell
                sx={{ backgroundColor: "#f1f1f1", cursor: "pointer" }}
                align="justify"
                onClick={handleSortBrand}
              >
                Marca/Modelo
              </TableCell>
              <TableCell
                sx={{ backgroundColor: "#f1f1f1", cursor: "pointer" }}
                align="justify"
                onClick={handleSortWarranty}
              >
                Garantía
              </TableCell>
              <TableCell
                sx={{ backgroundColor: "#f1f1f1", cursor: "pointer" }}
                align="justify"
                onClick={handleSortSalePrice}
              >
                Precio de Venta
              </TableCell>
              <TableCell
                sx={{ backgroundColor: "#f1f1f1", cursor: "pointer" }}
                align="justify"
              >
                Acciones
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loadingProducts ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <Loader />
                </TableCell>
              </TableRow>
            ) : filteredProducts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No hay productos
                </TableCell>
              </TableRow>
            ) : (
              filteredProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell align="justify">{product.name}</TableCell>
                  <TableCell align="justify">{product.description}</TableCell>
                  <TableCell align="justify">{product.brand}</TableCell>
                  <TableCell align="justify">{product.warranty}</TableCell>
                  <TableCell align="justify">{product.sell_price}</TableCell>
                  <TableCell align="justify">
                    <IconButton
                      size="small"
                      onClick={(event) => handleMenuOpen(event, product)}
                    >
                      <MoreVert />
                    </IconButton>
                    <Menu
                      anchorEl={anchorEl}
                      open={
                        Boolean(anchorEl) && selectedProduct?.id === product.id
                      }
                      onClose={handleMenuClose}
                    >
                      <MenuItem
                        onClick={() => {
                          handleClickDetails(product);
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
                          handleEditProduct(selectedProduct);
                          handleMenuClose();
                        }}
                      >
                        <ListItemIcon>
                          <Edit fontSize="small" />
                        </ListItemIcon>
                        <ListItemText>Editar Producto</ListItemText>
                      </MenuItem>
                      <MenuItem
                        onClick={() => {
                          handleDeleteDialog(selectedProduct);
                          handleMenuClose();
                        }}
                      >
                        <ListItemIcon>
                          <DeleteIcon fontSize="small" color="error" />
                        </ListItemIcon>
                        <ListItemText sx={{ color: "error.main" }}>
                          Borrar
                        </ListItemText>
                      </MenuItem>
                    </Menu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Componente de paginación con selector de filas por página */}
      <TablePagination
        component="div"
        count={totalProducts}
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

      {/* Detalles de una Empresa */}
      <ProductsDetailComponent
        open={openDetails}
        setOpen={setOpenDetails}
        product={selectedProduct}
      />

      {/* Borrar Producto */}
      <DeleteDialogConfirmComponent
        title="Eliminar Producto"
        message="¿Estás seguro de que deseas eliminar este producto?"
        deleteDialogOpen={deleteDialogOpen}
        handleCloseDeleteDialog={handleCloseDeleteDialog}
        handleDelete={handleDeleteProduct}
      />
    </>
  );
};