import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Box,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

export const LogoViewerModal = ({ open, handleClose, logo }) => {
  if (!logo) return null;

  const getImageUrl = (imagePath) => {
    if (!imagePath) return "https://avatar.iran.liara.run/public/28";

    if (imagePath.startsWith("data:")) {
      return imagePath;
    }

    const normalizedPath = imagePath.replace(/\\/g, "/");
    return `${import.meta.env.VITE_API_SERVER}/${normalizedPath}`;
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      PaperProps={{
        component: "form",
        sx: {
          width: { xs: "95%", sm: "730px" },
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
        {logo.name}
        <IconButton
          onClick={handleClose}
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
      <DialogContent>
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "60vh",
            p: 2,
          }}
        >
          <img
            src={getImageUrl(logo.image_url) || "/api/placeholder/200/200"}
            alt={logo.name}
            style={{
              maxHeight: "100%",
              maxWidth: "100%",
              objectFit: "contain",
            }}
          />
        </Box>
      </DialogContent>
    </Dialog>
  );
};
