import {
  Box,
  Typography,
  Grid,
  Card,
  CardMedia,
  CardContent,
  IconButton,
  Menu,
  MenuItem,
  ListItemText,
  ListItemIcon,
} from "@mui/material";
import React, { useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import SearchBar from "../../SearchBar";
import { DeleteDialogConfirmComponent } from "../DeleteDialogConfirmComponent";
import { useEnterprise } from "../../../context/EnterpriseContext";
import { Edit, MoreVert, RemoveRedEye } from "@mui/icons-material";
import DeleteIcon from "@mui/icons-material/Delete";
import DescriptionIcon from "@mui/icons-material/Description";
import { AddLogosComponent } from "./AddLogosComponent";
import { useLogos } from "../../../hooks/Logos/useLogos";
import { LogosSkeletonLoader } from '../../LogosSkeletonLoader';
import { LogoViewerModal } from "./LogoViewerModal";
import { LogoQuotesModal } from "./LogoQuotesModal";

const LogoCards = ({
  logos,
  onEditLogo,
  handleMenuOpen,
  handleMenuClose,
  handleDeleteDialog,
  handleViewLogo,
  handleViewQuotes,
  anchorEl,
  selectedLogo,
}) => {

  
  const getImageUrl = (imagePath) => {
    if (!imagePath) return "https://avatar.iran.liara.run/public/28";
  
    if (imagePath.startsWith("data:")) {
      return imagePath;
    }
  
    // Asegúrate de que las rutas usen forward slashes
    const normalizedPath = imagePath.replace(/\\/g, '/');
    return `${import.meta.env.VITE_API_SERVER}/${normalizedPath}`;
  };
  return (
    <Grid
      container
      spacing={2}
      sx={{
        padding: 2,
        "& .MuiGrid-item": {
          minWidth: {
            xs: "100%",
            sm: "50%",
            md: "33.33%",
            lg: "20%",
          },
        },
      }}
    >
      {logos.map((logo, index) => (
        <Grid item key={index}>
          <Card
            sx={{
              width: "100%",
              height: 200,
              display: "flex",
              flexDirection: "column",
              "&:hover": {
                boxShadow: 6,
                transform: "translateY(-4px)",
                transition: "all 0.3s ease-in-out",
              },
            }}
          >
            <Box
              sx={{
                position: "relative",
                height: 100,
                "&:hover .overlay": {
                  opacity: 1,
                },
              }}
            >
              <CardMedia
                component="img"
                image={getImageUrl(logo.image_url) || "/api/placeholder/200/200"}
                alt={logo.name}
                sx={{
                  height: "100%",
                  objectFit: "contain",
                  p: 2,
                }}
              />
              <Box
                className="overlay"
                sx={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: "rgba(0, 0, 0, 0.5)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  opacity: 0,
                  transition: "opacity 0.3s ease",
                  cursor: "pointer",
                }}
                onClick={() => onEditLogo(logo)}
              >
                <IconButton
                  sx={{
                    color: "white",
                    "&:hover": {
                      backgroundColor: "rgba(255, 255, 255, 0.1)",
                    },
                  }}
                >
                  <Edit />
                </IconButton>
              </Box>
            </Box>
            <CardContent
              sx={{
                flexGrow: 1,
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                py: 1,
                px: 2,
                "&:last-child": {
                  pb: 1,
                },
              }}
            >
              <Typography
                variant="body1"
                component="div"
                sx={{
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  maxWidth: "60%",
                }}
              >
                {logo.name}
              </Typography>
              <IconButton size="small" onClick={(e) => handleMenuOpen(e, logo)}>
                <MoreVert />
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl) && selectedLogo?.id === logo.id}
                onClose={handleMenuClose}
              >
                <MenuItem
                  onClick={() => {
                    handleViewLogo(logo);
                    handleMenuClose();
                  }}
                >
                  <ListItemIcon>
                    <RemoveRedEye />
                  </ListItemIcon>
                  <ListItemText>Ver</ListItemText>
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    handleViewQuotes(logo);
                    handleMenuClose();
                  }}
                >
                  <ListItemIcon>
                    <DescriptionIcon />
                  </ListItemIcon>
                  <ListItemText>Cotizaciones</ListItemText>
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    handleDeleteDialog(selectedLogo);
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
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

export const LogosComponent = () => {
  const { selectedEnterprise } = useEnterprise();

  //Hook de logos
  const {
    filteredLogos,
    setLogos,
    selectedLogo,
    setSelectedLogo,
    handleDeleteLogo: deleteLogoAPI,
    handleCreateLogo,
    handleUpdateLogo,
    loading,
  } = useLogos(selectedEnterprise);

  //Estados
  const [searchTerm, setSearchTerm] = useState("");
  const [open, setOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [logoToDelete, setLogoToDelete] = useState(null);
  const [editingLogo, setEditingLogo] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [logoToView, setLogoToView] = useState(null);
  const [quotesModalOpen, setQuotesModalOpen] = useState(false);
  const [logoToViewQuotes, setLogoToViewQuotes] = useState(null);
  

  //Filtrar logos
  const filteredData = filteredLogos.filter((logo) =>
    logo.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  //Funcion para abrir el dialogo de agregar logo
  const handleClickDialogLogo = () => {
    setEditingLogo(null);
    setOpen(true);
  };

  //Funcion para agregar un nuevo logo
  const handleAddLogo = async (newLogo) => {
    try {
      await handleCreateLogo(newLogo);
      toast.success("Logo agregado correctamente");
    } catch (error) {
      toast.error(error.message);
    }
  };

  //Funcion para abrir el dialogo de eliminación de logo
  const handleDeleteDialog = (logo) => {
    setLogoToDelete(logo);
    setDeleteDialogOpen(true);
  };

  //Funcion para eliminar un logo
  const handleDeleteBranch = async () => {
    try {
      await deleteLogoAPI(logoToDelete.id);
      setLogos((prevLogos) =>
        prevLogos.filter((logo) => logo.id !== logoToDelete.id)
      );
      setDeleteDialogOpen(false);
      setLogoToDelete(null);
      toast.success("Logo eliminado correctamente");
    } catch (error) {
      toast.error(error.message);
    }
  };

  //Funcion para cerrar el dialogo de eliminación de logo
  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setLogoToDelete(null);
  };

  //Funcion para abrir el dialogo de editar logo
  const handleEditLogo = (logo) => {
    setEditingLogo(logo);
    setOpen(true);
  };

  //Funcion para editar un logo
  const handleUpdate = async (logoData) => {
    try {
      await handleUpdateLogo(logoData.id, logoData);
      toast.success("Logo editado correctamente");
    } catch (error) {
      toast.error(error.message);
    }
  };

  //Funcion para ver un logo
  const handleViewLogo = (logo) => {
    setLogoToView(logo);
    setViewModalOpen(true);
  }; 

  //Funcion para cerrar el modal de vista de logo
  const handleCloseViewModal = () => {
    setViewModalOpen(false);
    setLogoToView(null);
  };

   //Funcion para ver cotizaciones de un logo
   const handleViewQuotes = (logo) => {
    setLogoToViewQuotes(logo);
    setQuotesModalOpen(true);
  };

  //Funcion para cerrar el modal de cotizaciones
  const handleCloseQuotesModal = () => {
    setQuotesModalOpen(false);
    setLogoToViewQuotes(null);
  };

  //Menu de acciones
  const handleMenuOpen = (event, logo) => {
    setAnchorEl(event.currentTarget);
    setSelectedLogo(logo);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedLogo(null);
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
          Logos
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
            setSearchTerm={setSearchTerm}
            onAddContent={handleClickDialogLogo}
          />
          <AddLogosComponent
            open={open}
            setOpen={setOpen}
            onAddLogo={handleAddLogo}
            onEditLogo={handleUpdate}
            initialData={editingLogo}
            onClose={() => setEditingLogo(null)}
          />
        </Box>
      </Box>

      <Box sx={{ flexGrow: 1 }}>
      {loading ? (
        <LogosSkeletonLoader />
      ) : filteredData.length === 0 ? (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "50vh",
          }}
        >
          <Typography variant="h6" component="p">
            No se encontraron logos
          </Typography>
        </Box>
      ) : (
        <LogoCards
          logos={filteredData}
          onEditLogo={handleEditLogo}
          handleMenuOpen={handleMenuOpen}
          handleMenuClose={handleMenuClose}
          handleDeleteDialog={handleDeleteDialog}
          handleViewLogo={handleViewLogo}
          handleViewQuotes={handleViewQuotes}
          anchorEl={anchorEl}
          selectedLogo={selectedLogo}
        />
      )}
      </Box>

      {/* Ver logo */}
      <LogoViewerModal
        open={viewModalOpen}
        handleClose={handleCloseViewModal}
        logo={logoToView}
      />

      <LogoQuotesModal
        open={quotesModalOpen}
        handleClose={handleCloseQuotesModal}
        logo={logoToViewQuotes}
      />

      {/* Borrar sucursal */}
      <DeleteDialogConfirmComponent
        title="Eliminar Logo"
        message="¿Estás seguro de que deseas eliminar este logo?"
        deleteDialogOpen={deleteDialogOpen}
        handleCloseDeleteDialog={handleCloseDeleteDialog}
        handleDelete={handleDeleteBranch}
      />
    </>
  );
};
