import { Card, CardContent, Typography, Box, Grid } from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import TrackChangesIcon from "@mui/icons-material/TrackChanges";
import FavoriteIcon from "@mui/icons-material/Favorite";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

export const Mision_Vision = () => {
  const valores = [
    "Trabajo en equipo",
    "Lealtad", 
    "Honestidad",
    "Humildad",
    "Persistencia",
    "Actitud Abierta",
    "Rapidez",
    "Innovación"
  ];

  return (
    <Box 
      sx={{ 
        width: '100%', 
        backgroundColor: '#f8f9fa',
        py: { xs: 4, md: 6 },
        px: { xs: 2, md: 4 }
      }}
    >
      <Box sx={{ maxWidth: '90%', mx: 'auto' }}>
        {/* Layout de 2 columnas: Misión/Visión izquierda, Valores derecha */}
        <Grid container spacing={3} sx={{ alignItems: 'stretch' }}>
          {/* Columna Izquierda - Misión y Visión apiladas */}
          <Grid item xs={12} md={6} sx={{ px: 0 }}>
            <Grid container spacing={3} sx={{ height: '100%', margin: 0, width: '100%' }}>
              {/* Tarjeta de Misión */}
              <Grid item xs={12} sx={{ px: 0, width: '100%' }}>
                <Card 
                  elevation={3}
                  sx={{
                    backgroundColor: "#0B1426",
                    borderRadius: "12px",
                    height: { xs: 'auto', md: '240px' },
                    minHeight: { xs: '200px', md: '240px' },
                    width: '100%',
                    margin: 0,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 6
                    }
                  }}
                >
                  <CardContent sx={{ p: { xs: 3, md: 4 }, height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                      <TrackChangesIcon sx={{ fontSize: { xs: 32, md: 40 }, mr: 2, color: "#E53E3E" }} />
                      <Typography
                        variant="h4"
                        component="h3"
                        sx={{ 
                          fontWeight: 700,
                          fontSize: { xs: "1.3rem", md: "1.5rem" },
                          color: "white"
                        }}
                      >
                        Misión
                      </Typography>
                    </Box>
                    <Typography
                      variant="body1"
                      sx={{
                        fontSize: { xs: "0.95rem", md: "1.1rem" },
                        lineHeight: 1.7,
                        textAlign: "justify",
                        color: "#F9FAFB",
                        flex: 1
                      }}
                    >
                    Ser el canal de comunicación de nuestros clientes para que
                    sea accesible y útil con los resultados esperados.
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              {/* Tarjeta de Visión */}
              <Grid item xs={12} sx={{ px: 0, width: '100%' }}>
                <Card 
                  elevation={3}
                  sx={{
                    backgroundColor: "#6B7280",
                    borderRadius: "12px",
                    height: { xs: 'auto', md: '240px' },
                    minHeight: { xs: '200px', md: '240px' },
                    width: '100%',
                    margin: 0,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 6
                    }
                  }}
                >
                  <CardContent sx={{ p: { xs: 3, md: 4 }, height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                      <VisibilityIcon sx={{ fontSize: { xs: 32, md: 40 }, mr: 2, color: "#E53E3E" }} />
                      <Typography
                        variant="h4"
                        component="h3"
                        sx={{ 
                          fontWeight: 700,
                          fontSize: { xs: "1.3rem", md: "1.5rem" },
                          color: "white"
                        }}
                      >
                        Visión
                      </Typography>
                    </Box>
                    <Typography
                      variant="body1"
                      sx={{
                        fontSize: { xs: "0.95rem", md: "1.1rem" },
                        lineHeight: 1.7,
                        textAlign: "justify",
                        color: "#F9FAFB",
                        flex: 1
                      }}
                    >
                    Consolidando nuestra presencia en territorio mexicano como
                    empresa líder en mercadotecnia, así como ampliar las marcas
                    y gama productos de nuestros clientes en todo el mundo.
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Grid>

          {/* Columna Derecha - Valores */}
          <Grid item xs={12} md={6} sx={{ px: 0 }}>
            <Card 
              elevation={3}
              sx={{
                backgroundColor: "white",
                borderRadius: "12px",
                height: { xs: 'auto', md: '504px' }, // 240px + 240px + 24px (spacing)
                width: '100%',
                margin: 0,
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 6
                }
              }}
            >
              <CardContent sx={{ p: { xs: 3, md: 4 }, height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 4, justifyContent: 'center' }}>
                  <FavoriteIcon sx={{ fontSize: { xs: 32, md: 40 }, mr: 2, color: "#E53E3E" }} />
                  <Typography
                    variant="h4"
                    component="h3"
                    sx={{ 
                      fontWeight: 700,
                      fontSize: { xs: "1.3rem", md: "1.5rem" },
                      color: "#092A40"
                    }}
                  >
                    Nuestros Valores
                  </Typography>
                </Box>

                {/* Lista de valores con palomitas */}
                <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <Grid container spacing={{ xs: 1, md: 2 }}>
                    {valores.map((valor, index) => (
                      <Grid item xs={12} sm={6} key={index}>
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            p: { xs: 1.5, md: 2 },
                            borderRadius: '8px',
                            backgroundColor: "#FAFAFA",
                            border: '1px solid #e5e7eb',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              backgroundColor: '#f0f9ff',
                              borderColor: '#E53E3E',
                              transform: 'translateX(4px)'
                            }
                          }}
                        >
                          <CheckCircleIcon 
                            sx={{ 
                              fontSize: { xs: 20, md: 24 }, 
                              color: "#E53E3E", 
                              mr: { xs: 1.5, md: 2 },
                              flexShrink: 0
                            }} 
                          />
                          <Typography
                            variant="body1"
                            sx={{ 
                              fontWeight: 600,
                              fontSize: { xs: "0.85rem", md: "1rem" },
                              color: "#092A40"
                            }}
                          >
                            {valor}
                          </Typography>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};