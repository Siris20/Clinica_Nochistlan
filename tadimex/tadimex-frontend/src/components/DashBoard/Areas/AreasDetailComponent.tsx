import {
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography,
  Grid,
  Box,
  Divider,
  List,
  ListItem,
  ListItemText,
  Avatar,
  Chip,
} from "@mui/material";
import React from "react";
import CloseIcon from "@mui/icons-material/Close";
import PersonIcon from "@mui/icons-material/Person";
import GroupsIcon from "@mui/icons-material/Groups";

export const AreasDetailComponent = ({ open, setOpen, area }) => {
  const handleCloseDialog = () => {
    setOpen(false);
  };

  if (!area) return null;

  return (
    <>
      <Dialog
        open={open}
        onClose={handleCloseDialog}
        PaperProps={{
          sx: {
            width: "630px",
            maxWidth: "none",
            height: "auto",
            maxHeight: "80vh",
            borderRadius: 5,
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
            pb: 2,
          }}
        >
          Detalles de área
          <IconButton
            onClick={handleCloseDialog}
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
        <DialogContent sx={{ fontFamily: "Open Sans, sans-serif", p: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 3,
                  mb: 3,
                }}
              >
                <Box>
                  <Typography
                    sx={{
                      fontFamily: "Inter, sans-serif",
                      fontWeight: "bold",
                      fontSize: "14px",
                      marginBottom: 2,
                    }}
                  >
                    Nombre
                  </Typography>
                  <Typography
                    sx={{
                      fontWeight: 500,
                      fontSize: 14,
                      backgroundColor: "#f5f5f5",
                      p: 1.5,
                      borderRadius: 1,
                    }}
                  >
                    {area.name}
                  </Typography>
                </Box>

                <Box>
                  <Typography
                    sx={{
                      fontFamily: "Inter, sans-serif",
                      fontWeight: "bold",
                      fontSize: "14px",
                      marginBottom: 2,
                    }}
                  >
                    Empresa
                  </Typography>
                  <Typography
                    sx={{
                      fontWeight: 500,
                      fontSize: 14,
                      backgroundColor: "#f5f5f5",
                      p: 1.5,
                      borderRadius: 1,
                    }}
                  >
                    {area.empresa.name}
                  </Typography>
                </Box>

                <Box sx={{ gridColumn: "1 / -1" }}>
                  <Typography
                    sx={{
                      fontFamily: "Inter, sans-serif",
                      fontWeight: "bold",
                      fontSize: "14px",
                      marginBottom: 2,
                    }}
                  >
                    Descripción
                  </Typography>
                  <Typography
                    sx={{
                      fontWeight: 500,
                      fontSize: 14,
                      backgroundColor: "#f5f5f5",
                      p: 1.5,
                      borderRadius: 1,
                    }}
                  >
                    {area.description}
                  </Typography>
                </Box>
              </Box>

              <Divider sx={{ my: 3 }} />

              <Box>
                <Typography
                  variant="h6"
                  sx={{
                    fontSize: 16,
                    fontWeight: 600,
                    mb: 2,
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  <GroupsIcon /> Empleados asignados
                </Typography>

                {area.empleados && area.empleados.length > 0 ? (
                  <List
                    sx={{
                      bgcolor: "#f5f5f5",
                      borderRadius: 1,
                      p: 0,
                    }}
                  >
                    {area.empleados.map((empleado, index) => (
                      <ListItem
                        key={empleado.id}
                        sx={{
                          borderBottom:
                            index !== area.empleados.length - 1
                              ? "1px solid rgba(0,0,0,0.12)"
                              : "none",
                          py: 1,
                        }}
                      >
                        <ListItemText
                          primary={`${empleado.name} ${
                            empleado.last_name || ""
                          }`}
                          secondary={empleado.position || "No especificado"}
                          primaryTypographyProps={{
                            fontSize: 14,
                            fontWeight: 500,
                          }}
                          secondaryTypographyProps={{
                            fontSize: 12,
                          }}
                        />
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Box
                    sx={{
                      bgcolor: "#f5f5f5",
                      p: 3,
                      borderRadius: 1,
                      textAlign: "center",
                    }}
                  >
                    <Typography
                      sx={{
                        color: "text.secondary",
                        fontSize: 14,
                      }}
                    >
                      No hay empleados asignados a esta área
                    </Typography>
                  </Box>
                )}
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
      </Dialog>
    </>
  );
};
