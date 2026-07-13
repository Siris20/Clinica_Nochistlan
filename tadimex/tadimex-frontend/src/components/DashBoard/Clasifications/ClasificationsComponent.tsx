import { Box, Typography, Grid } from "@mui/material";
import React, { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import { ItemList } from "./ItemList";
import { DeleteDialogConfirmComponent } from "../DeleteDialogConfirmComponent";
import { AddItem } from "./AddItem";
import { useDepartments } from "../../../hooks/Departments/useDepartments";
import { useEnterprises } from "../../../hooks/Enterprises/useEnterprises";
import { useCategories } from "../../../hooks/Categories/useCategories";
import { useSubCategories } from "../../../hooks/Subcategories/useSubCategories";
import Loader from "../../Loader";
import { useProducts } from "../../../hooks/Products/useProducts";
import { useEnterprise } from "../../../context/EnterpriseContext";

export const ClasificationsComponent = () => {

  //Estados de seleccion
  const [selectedDepartmentId, setSelectedDepartmentId] = useState(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState(null);
  const [selectedProductId, setSelectedProductId] = useState(null);

  //Contexto de empresa seleccionada
  const {selectedEnterprise} = useEnterprise();

  //Hook de empresas
  const { enterprises } = useEnterprises();

  //Hook de departamentos
  const {
    filteredDepartments,
    allFilteredDepartments,
    setDepartments,
    handleDeleteDepartment: deleteDepartmentAPI,
    handleCreateDepartment,
    handleGetDepartment,
    handleUpdateDepartment,
    loadingDepartments,
    page: pageDep,
    setPage: setPageDep,
    totalDepartments,
    handleChangePage: handleChangePageDep,
    searchTerm: searchTermDep,
    setSearchTerm: setSearchTermDep,
  } = useDepartments(selectedEnterprise);

  //Hooks de categorias - ACTUALIZADOS para usar selectedDepartmentId
  const {
    filteredCategories: paginatedCategories,
    allFilteredCategories: allCategories,
    setCategories,
    handleDeleteCategory: deleteCategoryAPI,
    handleCreateCategory,
    handleGetCategory,
    handleUpdateCategory,
    loadingCategories,
    page: pageCat,
    setPage: setPageCat,
    totalCategories,
    handleChangePage: handleChangePageCat,
    searchTerm: searchTermCat,
    setSearchTerm: setSearchTermCat,
    handleGetCategoriesByDepartment,
  } = useCategories(selectedDepartmentId?.id, selectedEnterprise);

  //Hooks de subcategorias - ACTUALIZADOS para usar selectedCategoryId
  const {
    filteredSubcategories: paginatedSubcategories,
    allFilteredSubcategories: allSubcategories,
    setSubcategories,
    handleDeleteSubcategory: deleteSubcategoryAPI,
    handleCreateSubcategory,
    handleGetSubcategory,
    handleUpdateSubcategory,
    loadingSubcategories,
    page: pageSub,
    setPage: setPageSub,
    totalSubcategories,
    handleChangePage: handleChangePageSub,
    searchTerm: searchTermSub,
    setSearchTerm: setSearchTermSub,
    handleGetSubcategoriesByCategory,
  } = useSubCategories(selectedCategoryId?.id, selectedEnterprise);

  //Hooks de productos - ACTUALIZADOS para usar selectedSubcategoryId
  const {
    filteredProducts: paginatedProducts,
    allFilteredProducts: allProducts,
    setProducts,
    handleDeleteProduct: deleteProductAPI,
    handleCreateProduct,
    handleGetProduct,
    handleUpdateProduct,
    loadingProducts,
    page: pageProd,
    setPage: setPageProd,
    totalProducts,
    handleChangePage: handleChangePageProd,
    searchTerm: searchTermProd,
    setSearchTerm: setSearchTermProd,
    handleGetProductsBySubcategory,
  } = useProducts(selectedSubcategoryId?.id, selectedEnterprise, true); // true = requiere subcategoría

  //Estados CRUD
  const [open, setOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [itemTypeToAdd, setItemTypeToAdd] = useState(null);
  const [itemTypeToDelete, setItemTypeToDelete] = useState(null);

  useEffect(() => {
    // Resetear todos los estados de selección cuando cambia la empresa
    setSelectedDepartmentId(null);
    setSelectedCategoryId(null);
    setSelectedSubcategoryId(null);
    setSelectedProductId(null);
  }, [selectedEnterprise]);

  // Efecto para limpiar en cascada cuando cambia el departamento seleccionado
  useEffect(() => {
    // Cuando cambia el departamento, limpiar categoría, subcategoría y producto
    setSelectedCategoryId(null);
    setSelectedSubcategoryId(null);
    setSelectedProductId(null);
  }, [selectedDepartmentId]);

  // Efecto para limpiar en cascada cuando cambia la categoría seleccionada
  useEffect(() => {
    // Cuando cambia la categoría, limpiar subcategoría y producto
    setSelectedSubcategoryId(null);
    setSelectedProductId(null);
  }, [selectedCategoryId]);

  // Efecto para limpiar en cascada cuando cambia la subcategoría seleccionada
  useEffect(() => {
    // Cuando cambia la subcategoría, limpiar producto
    setSelectedProductId(null);
  }, [selectedSubcategoryId]);

  // Aplicar filtros de búsqueda a las categorías
  const filteredCategoriesWithSearch = allCategories.filter(cat => 
    cat.name.toLowerCase().includes(searchTermCat.toLowerCase())
  );

  // Aplicar paginación manual a las categorías filtradas por búsqueda
  const finalPaginatedCategories = React.useMemo(() => {
    const startIndex = pageCat * 10;
    const endIndex = startIndex + 10;
    return filteredCategoriesWithSearch.slice(startIndex, endIndex);
  }, [filteredCategoriesWithSearch, pageCat]);

  // Aplicar filtros de búsqueda a las subcategorías
  const filteredSubcategoriesWithSearch = allSubcategories.filter(sub =>
    sub.name.toLowerCase().includes(searchTermSub.toLowerCase())
  );

  // Aplicar paginación manual a las subcategorías filtradas por búsqueda
  const finalPaginatedSubcategories = React.useMemo(() => {
    const startIndex = pageSub * 10;
    const endIndex = startIndex + 10;
    return filteredSubcategoriesWithSearch.slice(startIndex, endIndex);
  }, [filteredSubcategoriesWithSearch, pageSub]);

  // Aplicar filtros de búsqueda a los productos
  const filteredProductsWithSearch = allProducts.filter(prod =>
    prod.name.toLowerCase().includes(searchTermProd.toLowerCase())
  );

  // Aplicar paginación manual a los productos filtrados por búsqueda
  const finalPaginatedProducts = React.useMemo(() => {
    const startIndex = pageProd * 10;
    const endIndex = startIndex + 10;
    return filteredProductsWithSearch.slice(startIndex, endIndex);
  }, [filteredProductsWithSearch, pageProd]);

  // Efectos para resetear la página cuando cambia la búsqueda
  useEffect(() => {
    if (searchTermCat) {
      setPageCat(0);
    }
  }, [searchTermCat]);

  useEffect(() => {
    if (searchTermSub) {
      setPageSub(0);
    }
  }, [searchTermSub]);

  useEffect(() => {
    if (searchTermProd) {
      setPageProd(0);
    }
  }, [searchTermProd]);

  //Funciones

  //Abrir el dialogo de agregar item
  const handleClickDialogItem = (type) => {
    //Validar que exista una seleccion valida
    if (type === "categoria" && !selectedDepartmentId) {
      toast.error("Selecciona un departamento primero");
      return;
    }
    if (type === "subcategoria" && !selectedCategoryId) {
      toast.error("Selecciona una categoría primero");
      return;
    }
    if (type === "producto" && !selectedSubcategoryId) {
      toast.error("Selecciona una subcategoría primero");
      return;
    }

    setEditingItem(null);
    setItemTypeToAdd(type);
    setOpen(true);
  };

  //Agregar un nuevo item
  const handleAddItem = async (newItem) => {
    try {
      const formattedItem = {
        id: newItem.id,
        name: newItem.name,
        description: newItem.description,
        parentId: newItem.parentId,
        // Campos adicionales si es un producto
        ...(itemTypeToAdd === "producto" && {
          model: newItem.model,
          brand: newItem.brand,
          unidad_medida: newItem.unidad_medida,
          SAT_code: newItem.SAT_code,
          warranty: newItem.warranty,
          images: newItem.images,
          sell_price: newItem.sell_price,
          rent_price: newItem.rent_price,
        }),
      };

      switch (itemTypeToAdd) {
        case "departamento":
          await handleCreateDepartment(newItem);
          break;
        case "categoria":
          const categoryData = {
            name: newItem.name,
            description: newItem.description,
            departamento_id: newItem.parentId,
          };
          await handleCreateCategory(categoryData);
          break;
        case "subcategoria":
          const subCategoryData = {
            name: newItem.name,
            description: newItem.description,
            categoria_id: newItem.parentId,
          };
          await handleCreateSubcategory(subCategoryData);
          break;
        case "producto":
          const productData = {
            name: newItem.name,
            description: newItem.description,
            subcategoria_id: newItem.parentId,
            model: newItem.model,
            brand: newItem.brand,
            SAT_code: newItem.SAT_code,
            unidad_medida: newItem.unidad_medida,
            warranty: newItem.warranty,
            images: newItem.images,
            sell_price: newItem.sell_price,
            rent_price: newItem.rent_price,
          };
          await handleCreateProduct(productData);
          break;
      }
      toast.success(`${itemTypeToAdd} agregado correctamente`);
      setOpen(false);
    } catch (error) {
      toast.error(`Error al agregar el ${itemTypeToAdd}: ${error.message}`);
    }
  };

  //Editar un item
  const handleEdit = async (item, type) => {
    try {
      let itemDetails;
      
      switch(type) {
        case "categoria":
          itemDetails = await handleGetCategory(item.id);
          break;
        case "subcategoria":
          itemDetails = await handleGetSubcategory(item.id);
          const parentCategory = await handleGetCategory(itemDetails.categoria_id);
          itemDetails = {
            ...itemDetails,
            departamento_id: parentCategory.departamento_id
          };
          break;
        case "producto":
          itemDetails = await handleGetProduct(item.id);
          // Obtener los detalles de la subcategoría padre
          const parentSubcategory = await handleGetSubcategory(itemDetails.subcategoria_id);
          // Obtener los detalles de la categoría abuelo
          const grandParentCategory = await handleGetCategory(parentSubcategory.categoria_id);
          itemDetails = {
            ...itemDetails,
            categoria_id: parentSubcategory.categoria_id,
            departamento_id: grandParentCategory.departamento_id
          };
          break;
        default:
          itemDetails = item;
      }
  
      let formattedItem = {
        id: itemDetails.id,
        name: itemDetails.name,
        description: itemDetails.description || "",
      };
  
      switch(type) {
        case "departamento":
          formattedItem = {
            ...formattedItem,
            empresa_id: itemDetails.empresa_id || "",
          };
          break;
        
        case "categoria":
          formattedItem = {
            ...formattedItem,
            departamento_id: itemDetails.departamento_id,
            parentId: itemDetails.departamento_id,
          };
          break;
        
        case "subcategoria":
          formattedItem = {
            ...formattedItem,
            categoria_id: itemDetails.categoria_id,
            parentId: itemDetails.categoria_id,
            departamento_id: itemDetails.departamento_id
          };
          break;
        
        case "producto":
          formattedItem = {
            ...formattedItem,
            parentId: itemDetails.subcategoria_id,
            categoria_id: itemDetails.categoria_id,
            departamento_id: itemDetails.departamento_id,
            model: itemDetails.model || "",
            brand: itemDetails.brand || "",
            SAT_code: itemDetails.SAT_code || "",
            unidad_medida: itemDetails.unidad_medida || "",
            warranty: itemDetails.warranty || "",
            images: itemDetails.images || [],
            sell_price: itemDetails.sell_price || "",
            rent_price: itemDetails.rent_price || "",
          };
          break;
      }
  
      setEditingItem(formattedItem);
      setItemTypeToAdd(type);
      setOpen(true);
    } catch (error) {
      toast.error(`Error al obtener los detalles del ${type}: ${error.message}`);
    }
  };

  //Actualizar un item
  const handleUpdate = async (updatedItem) => {
    try {
      const formattedItem = {
        id: updatedItem.id,
        name: updatedItem.name,
        description: updatedItem.description,
        parentId: updatedItem.parentId,
        // Campos adicionales si es un producto
        ...(itemTypeToAdd === "producto" && {
          model: updatedItem.model,
          brand: updatedItem.brand,
          SAT_code: updatedItem.SAT_code,
          unidad_medida: updatedItem.unidad_medida,
          warranty: updatedItem.warranty,
          images: updatedItem.images,
          sell_price: updatedItem.sell_price,
          rent_price: updatedItem.rent_price,
        }),
      };
      
      switch (itemTypeToAdd) {
        case "departamento":
          await handleUpdateDepartment(updatedItem.id, updatedItem);
          setDepartments(prev => 
            prev.map(dep => dep.id === updatedItem.id ? {...dep, ...updatedItem} : dep)
          );
          break;
        case "categoria":
          const updatedCategoryData = {
            name: updatedItem.name,
            description: updatedItem.description,
            departamento_id: updatedItem.parentId,
          };
          await handleUpdateCategory(updatedItem.id, updatedCategoryData);
          break;
        case "subcategoria":
          const updatedSubCategoryData = {
            name: updatedItem.name,
            description: updatedItem.description,
            categoria_id: updatedItem.parentId,
          };
          await handleUpdateSubcategory(updatedItem.id, updatedSubCategoryData);
          break;
        case "producto":
          await handleUpdateProduct(updatedItem.id, {
            ...formattedItem, 
            subcategoria_id: formattedItem.parentId,
          });
          break;
      }
      toast.success(`${itemTypeToAdd} actualizado correctamente`);
      setOpen(false);
      setEditingItem(null);
      setItemTypeToAdd(null);
    } catch (error) {
      toast.error(`Error al actualizar el ${itemTypeToAdd}: ${error.message}`);
    }
  };

  //Abrir el dialogo de eliminación
  const handleDeleteDialog = (item, type) => {
    setItemToDelete(item);
    setItemTypeToDelete(type);
    setDeleteDialogOpen(true);
  };

  //Eliminar el item seleccionado
  const handleDelete = async () => {
    if (!itemToDelete || !itemTypeToDelete) return;

    try {
      switch (itemTypeToDelete) {
        case "departamento":
          await deleteDepartmentAPI(itemToDelete.id);
          // Actualizar estados locales
          setDepartments(prev => prev.filter(dep => dep.id !== itemToDelete.id));
          // Resetear selecciones
          setSelectedDepartmentId(null);
          setSelectedCategoryId(null);
          setSelectedSubcategoryId(null);
          setSelectedProductId(null);
          break;
        case "categoria":
          await deleteCategoryAPI(itemToDelete.id);
          // Resetear selecciones
          setSelectedCategoryId(null);
          setSelectedSubcategoryId(null);
          setSelectedProductId(null);
          break;
        case "subcategoria":
          await deleteSubcategoryAPI(itemToDelete.id);
          // Resetear selecciones
          setSelectedSubcategoryId(null);
          setSelectedProductId(null);
          break;
        case "producto":
          await deleteProductAPI(itemToDelete.id);
          setSelectedProductId(null);
          break;
      }
      setDeleteDialogOpen(false);
      setItemToDelete(null);
      setItemTypeToDelete(null);
      toast.success(`${itemTypeToDelete} eliminado correctamente`);
    } catch (error) {
      toast.error(`Error al eliminar el ${itemTypeToDelete}`);
    }
  };

  //Cerrar el dialogo de eliminación
  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setItemToDelete(null);
    setItemTypeToDelete(null);
  };

  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} />
      <Typography
        variant="h5"
        component="h2"
        sx={{
          textAlign: { xs: "center", sm: "left" },
          marginBottom: { xs: 1, sm: 0 },
        }}
      >
        Clasificación de Productos
      </Typography>
      <Box sx={{ p: { xs: 1, sm: 2, md: 3 }, width: "100%" }}>
        <Grid container spacing={{ xs: 1, sm: 2 }} sx={{ height: "100%" }}>
          {/* Panel de Departamentos */}
          <Grid item xs={12} md={3}>
            {loadingDepartments ? (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  height: "100%",
                }}
              >
                <Loader />
              </Box>
            ) : (
              <ItemList
                title="Departamentos"
                items={filteredDepartments}
                searchTerm={searchTermDep}
                onSearchChange={setSearchTermDep}
                onEdit={(item) => handleEdit(item, "departamento")}
                onDelete={(item) => handleDeleteDialog(item, "departamento")}
                selectedItemId={selectedDepartmentId?.id}
                onItemSelect={setSelectedDepartmentId}
                onAddItem={() => handleClickDialogItem("departamento")}
                page={pageDep}
                totalItems={totalDepartments}
                handleChangePage={handleChangePageDep}
              />
            )}
          </Grid>

          {/* Panel de Categorías */}
          <Grid item xs={12} md={3}>
            {loadingCategories ? (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  height: "100%",
                }}
              >
                <Loader />
              </Box>
            ) : (
              <ItemList
                title="Categorías"
                items={finalPaginatedCategories}
                searchTerm={searchTermCat}
                onSearchChange={setSearchTermCat}
                onEdit={(item) => handleEdit(item, "categoria")}
                onDelete={(item) => handleDeleteDialog(item, "categoria")}
                selectedItemId={selectedCategoryId?.id}
                onItemSelect={setSelectedCategoryId}
                onAddItem={() => handleClickDialogItem("categoria")}
                page={pageCat}
                totalItems={filteredCategoriesWithSearch.length}
                handleChangePage={handleChangePageCat}
              />
            )}
          </Grid>

          {/* Panel de Subcategorías */}
          <Grid item xs={12} md={3}>
            {loadingSubcategories ? (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  height: "100%",
                }}
              >
                <Loader />
              </Box>
            ) : (
              <ItemList
                title="Subcategorías"
                items={finalPaginatedSubcategories}
                searchTerm={searchTermSub}
                onSearchChange={setSearchTermSub}
                onEdit={(item) => handleEdit(item, "subcategoria")}
                onDelete={(item) => handleDeleteDialog(item, "subcategoria")}
                selectedItemId={selectedSubcategoryId?.id}
                onItemSelect={setSelectedSubcategoryId}
                onAddItem={() => handleClickDialogItem("subcategoria")}
                page={pageSub}
                totalItems={filteredSubcategoriesWithSearch.length}
                handleChangePage={handleChangePageSub}
              />
            )}
          </Grid>

          {/* Panel de Productos */}
          <Grid item xs={12} md={3}>
            <ItemList
              title="Productos"
              items={finalPaginatedProducts}
              searchTerm={searchTermProd}
              onSearchChange={setSearchTermProd}
              onEdit={(item) => handleEdit(item, "producto")}
              onDelete={(item) => handleDeleteDialog(item, "producto")}
              selectedItemId={selectedProductId?.id}
              onItemSelect={setSelectedProductId}
              onAddItem={() => handleClickDialogItem("producto")}
              page={pageProd}
              totalItems={filteredProductsWithSearch.length}
              handleChangePage={handleChangePageProd}
            />
          </Grid>
        </Grid>
      </Box>

      {/* Dialogo de agregar item */}
      <AddItem
        open={open}
        setOpen={setOpen}
        onAddItem={handleAddItem}
        onEditItem={handleUpdate}
        initialData={editingItem}
        itemType={itemTypeToAdd}
        departamentos={filteredDepartments}
        categorias={allCategories}
        subcategorias={allSubcategories}
        productos={allProducts}
        selectedDepartmentId={selectedDepartmentId?.id}
        selectedCategoryId={selectedCategoryId?.id}
        selectedSubcategoryId={selectedSubcategoryId?.id}
        enterprises={enterprises}
        onClose={() => {
          setOpen(false);
          setItemTypeToAdd(null);
          setEditingItem(null);
        }}
      />

      {/* Dialogo de eliminación */}
      <DeleteDialogConfirmComponent
        title={`Eliminar ${itemTypeToDelete}`}
        message={`¿Estás seguro de que deseas eliminar "${itemToDelete?.name}"?`}
        deleteDialogOpen={deleteDialogOpen}
        handleCloseDeleteDialog={handleCloseDeleteDialog}
        handleDelete={handleDelete}
      />
    </>
  );
};