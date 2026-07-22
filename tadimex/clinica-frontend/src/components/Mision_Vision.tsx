import { Card, CardContent, Typography, Box, Grid } from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import TrackChangesIcon from "@mui/icons-material/TrackChanges";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import HealingIcon from "@mui/icons-material/Healing";

export const Mision_Vision = () => {
  const valores = [
    { title: "Compromiso", desc: "Trabajamos con responsabilidad y dedicación para ofrecer la mejor atención médica." },
    { title: "Ética", desc: "Actuamos con honestidad, integridad y respeto en todas nuestras acciones." },
    { title: "Empatía", desc: "Escuchamos, comprendemos y atendemos las necesidades de nuestros pacientes con sensibilidad y calidez." },
    { title: "Respeto", desc: "Valoramos la dignidad, diversidad y derechos de cada persona." },
    { title: "Excelencia", desc: "Buscamos la mejora continua en nuestros procesos, servicios y atención médica." },
    { title: "Trabajo en equipo", desc: "Fomentamos la colaboración entre áreas para brindar una atención integral." },
    { title: "Innovación", desc: "Incorporamos nuevas tecnologías y mejores prácticas médicas de vanguardia." },
    { title: "Seguridad", desc: "Priorizamos la seguridad del paciente mediante estrictos protocolos de calidad." },
    { title: "Confidencialidad", desc: "Protegemos la privacidad y la información médica con estricto apego a la normativa." },
    { title: "Humanismo", desc: "Colocamos al paciente y su familia en el centro de cada decisión." }
  ];

  return (
    <Box 
      sx={{ 
        width: '100%', 
        backgroundColor: '#f4f7f6', // Fondo sutilmente verdoso/clínico muy claro
        py: { xs: 5, md: 8 },
        px: { xs: 2, md: 4 }
      }}
    >
      <Box sx={{ maxWidth: '90%', mx: 'auto' }}>
        {/* Layout de 2 columnas: Misión/Visión izquierda, Valores derecha */}
        <Grid container spacing={4} sx={{ alignItems: 'stretch' }}>
          
          {/* Columna Izquierda - Misión y Visión */}
          <Grid item xs={12} lg={5}>
            <Grid container spacing={4} sx={{ height: '100%', width: '100%', margin: 0 }}>
              
              {/* Tarjeta de Misión */}
              <Grid item xs={12} sx={{ p: '0 !important', mb: 4 }}>
                <Card 
                  elevation={3}
                  sx={{
                    backgroundColor: "#0D3B66", // Azul Clínico Formal
                    borderRadius: "16px",
                    height: '100%',
                    minHeight: { xs: 'auto', md: '280px' },
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 8
                    }
                  }}
                >
                  <CardContent sx={{ p: { xs: 3, md: 4 }, display: 'flex', flexDirection: 'column', height: '100%' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <TrackChangesIcon sx={{ fontSize: { xs: 32, md: 40 }, mr: 2, color: "#00A896" }} />
                      <Typography
                        variant="h4"
                        component="h3"
                        sx={{ 
                          fontWeight: 700,
                          fontSize: { xs: "1.4rem", md: "1.6rem" },
                          color: "white"
                        }}
                      >
                        Misión
                      </Typography>
                    </Box>
                    <Typography
                      variant="body1"
                      sx={{
                        fontSize: { xs: "0.95rem", md: "1.05rem" },
                        lineHeight: 1.7,
                        textAlign: "justify",
                        color: "#E8F1F5",
                        flex: 1
                      }}
                    >
                      Brindar servicios de atención médica integral, oportuna y de alta calidad, mediante un equipo de profesionales altamente capacitados, tecnología moderna y un trato humano, garantizando la seguridad, bienestar y satisfacción de nuestros pacientes y sus familias, contribuyendo al cuidado de la salud de la comunidad.
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              {/* Tarjeta de Visión */}
              <Grid item xs={12} sx={{ p: '0 !important' }}>
                <Card 
                  elevation={3}
                  sx={{
                    backgroundColor: "#00A896", // Verde Menta / Salud Emprendedora
                    borderRadius: "16px",
                    height: '100%',
                    minHeight: { xs: 'auto', md: '280px' },
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 8
                    }
                  }}
                >
                  <CardContent sx={{ p: { xs: 3, md: 4 }, display: 'flex', flexDirection: 'column', height: '100%' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <VisibilityIcon sx={{ fontSize: { xs: 32, md: 40 }, mr: 2, color: "#0D3B66" }} />
                      <Typography
                        variant="h4"
                        component="h3"
                        sx={{ 
                          fontWeight: 700,
                          fontSize: { xs: "1.4rem", md: "1.6rem" },
                          color: "white"
                        }}
                      >
                        Visión
                      </Typography>
                    </Box>
                    <Typography
                      variant="body1"
                      sx={{
                        fontSize: { xs: "0.95rem", md: "1.05rem" },
                        lineHeight: 1.7,
                        textAlign: "justify",
                        color: "#E8F5F1",
                        flex: 1
                      }}
                    >
                      Ser la clínica privada líder en la región, reconocida por la excelencia de nuestros servicios médicos, la innovación tecnológica, la calidez humana y el compromiso con la salud, convirtiéndonos en la primera opción para nuestros pacientes por la confianza y calidad que ofrecemos.
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

            </Grid>
          </Grid>

          {/* Columna Derecha - Valores */}
          <Grid item xs={12} lg={7}>
            <Card 
              elevation={3}
              sx={{
                backgroundColor: "white",
                borderRadius: "16px",
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'all 0.3s ease',
                border: '1px solid #E2E8F0',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 8
                }
              }}
            >
              <CardContent sx={{ p: { xs: 3, md: 4 }, display: 'flex', flexDirection: 'column', height: '100%' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 4, justifyContent: 'center' }}>
                  <LocalHospitalIcon sx={{ fontSize: { xs: 32, md: 40 }, mr: 2, color: "#00A896" }} />
                  <Typography
                    variant="h4"
                    component="h3"
                    sx={{ 
                      fontWeight: 800,
                      fontSize: { xs: "1.5rem", md: "1.8rem" },
                      color: "#0D3B66",
                      textAlign: 'center'
                    }}
                  >
                    Valores de Clínica Nochistlán
                  </Typography>
                </Box>

                {/* Grid Responsivo de Valores */}
                <Box sx={{ flex: 1, display: 'flex', alignItems: 'center' }}>
                  <Grid container spacing={2}>
                    {valores.map((item, index) => (
                      <Grid item xs={12} sm={6} key={index}>
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            p: 2.5,
                            borderRadius: '12px',
                            backgroundColor: "#F8FAFC",
                            border: '1px solid #E2E8F0',
                            height: '100%',
                            transition: 'all 0.25s ease',
                            '&:hover': {
                              backgroundColor: '#EBF8FF',
                              borderColor: '#00A896',
                              transform: 'translateX(4px)'
                            }
                          }}
                        >
                          <HealingIcon 
                            sx={{ 
                              fontSize: 22, 
                              color: "#00A896", 
                              mr: 1.5,
                              mt: 0.3,
                              flexShrink: 0
                            }} 
                          />
                          <Box>
                            <Typography
                              variant="subtitle1"
                              sx={{ 
                                fontWeight: 700,
                                fontSize: "0.95rem",
                                color: "#0D3B66",
                                mb: 0.5
                              }}
                            >
                              {item.title}
                            </Typography>
                            <Typography
                              variant="body2"
                              sx={{ 
                                fontSize: "0.85rem",
                                color: "#475569",
                                lineHeight: 1.5
                              }}
                            >
                              {item.desc}
                            </Typography>
                          </Box>
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