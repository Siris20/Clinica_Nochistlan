import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Container,
  Chip
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import BusinessIcon from '@mui/icons-material/Business';
import CorporateFareIcon from '@mui/icons-material/CorporateFare';

export const PricePlans = () => {
  const plans = [
    {
      id: 1,
      icon: <span style={{ fontSize: 40 }}>🚀</span>,
      title: "STARTER",
      description: "Perfecto para empresas pequeñas que inician su digitalización",
      price: "$960 pesos",
      period: "/mes/empresa",
      features: [
        "1 sucursal por empresa",
        "1 almacén por sucursal",
        "Registro de hasta 50 productos",
        "Gestión básica de clientes",
        "Control de ventas básico",
        "Reportes esenciales",
        "Soporte por email",
        "1 usuario administrador"
      ],
      color: "#E91E63",
      bgColor: "#fff"
    },
    {
      id: 2,
      icon: <span style={{ fontSize: 40 }}>💼</span>,
      title: "BUSINESS",
      description: "Ideal para empresas medianas con múltiples operaciones.",
      price: "$2490 pesos",
      period: "/mes/empresa",
      features: [
        "Hasta 5 sucursales por empresa",
        "3 almacenes por sucursal",
        "Catálogo ilimitado de productos",
        "CRM completo",
        "Gestión de proveedores y emisores",
        "Control de compras y ventas avanzado",
        "Reportes avanzados y dashboards",
        "Soporte prioritario",
        "Hasta 5 usuarios"
      ],
      color: "#2196F3",
      bgColor: "#fff"
    },
    {
      id: 3,
      icon: <span style={{ fontSize: 40 }}>🏢</span>,
      title: "ENTERPRISE",
      description: "Solución completa para grandes empresas con necesidades específicas.",
      price: "$4490 pesos",
      period: "/mes/empresa",
      features: [
        "Sucursales ilimitadas",
        "Almacenes ilimitados por sucursal",
        "Todo lo incluido en Business",
        "Personalización completa del sistema",
        "API para integraciones",
        "Reportes personalizados",
        "Análisis predictivo de inventario",
        "Automatización de procesos",
        "Soporte 24/7 dedicado",
        "Implementación y capacitación",
        "Usuarios ilimitados",
        "Respaldo y seguridad avanzada",
        "Consultoría mensual incluida"
      ],
      color: "#9C27B0",
      bgColor: "#fff"
    }
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Typography
          variant="h3"
          component="h2"
          sx={{
            fontWeight: 700,
            color: '#092A40',
            mb: 2
          }}
        >
          Planes de Precios
        </Typography>
        <Typography
          variant="h6"
          sx={{
            color: '#6B7280',
            maxWidth: '600px',
            mx: 'auto'
          }}
        >
          Elige el plan perfecto para tu empresa y comienza a optimizar tus procesos
        </Typography>
      </Box>

      <Grid container spacing={4} justifyContent="center">
        {plans.map((plan) => (
          <Grid item xs={12} md={4} key={plan.id}>
            <Card
              elevation={4}
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                borderRadius: '16px',
                border: `2px solid ${plan.color}`,
                backgroundColor: plan.bgColor,
                transition: 'all 0.3s ease',
                position: 'relative',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: 8
                }
              }}
            >
              {/* Badge "Próximamente" para Business y Enterprise */}
              {(plan.id === 2 || plan.id === 3) && (
                <Chip
                  label="Próximamente"
                  sx={{
                    position: 'absolute',
                    top: 16,
                    right: 16,
                    backgroundColor: plan.id === 2 ? '#2196F3' : '#9C27B0',
                    color: 'white',
                    fontWeight: 600,
                    fontSize: '0.75rem',
                    zIndex: 1
                  }}
                />
              )}
              
              <CardContent sx={{ p: 4, flexGrow: 1 }}>
                {/* Header con icono y título */}
                <Box sx={{ textAlign: 'center', mb: 3 }}>
                  <Box sx={{ mb: 2 }}>
                    {plan.icon}
                  </Box>
                  <Typography
                    variant="h4"
                    component="h3"
                    sx={{
                      fontWeight: 700,
                      color: plan.color,
                      mb: 2
                    }}
                  >
                    {plan.title}
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      color: '#374151',
                      mb: 3,
                      lineHeight: 1.6
                    }}
                  >
                    {plan.description}
                  </Typography>
                  
                  {/* Precio */}
                  <Box sx={{ mb: 3 }}>
                    <Typography
                      variant="h5"
                      component="span"
                      sx={{
                        fontWeight: 700,
                        color: '#092A40'
                      }}
                    >
                      {plan.price}
                    </Typography>
                    <Typography
                      variant="body2"
                      component="span"
                      sx={{
                        color: '#6B7280',
                        ml: 1
                      }}
                    >
                      {plan.period}
                    </Typography>
                  </Box>
                </Box>

                {/* Lista de características */}
                <List sx={{ p: 0 }}>
                  {plan.features.map((feature, index) => (
                    <ListItem key={index} sx={{ py: 0.5, px: 0 }}>
                      <ListItemIcon sx={{ minWidth: 30 }}>
                        <CheckCircleIcon sx={{ fontSize: 20, color: '#10B981' }} />
                      </ListItemIcon>
                      <ListItemText
                        primary={feature}
                        primaryTypographyProps={{
                          variant: 'body2',
                          sx: { color: '#374151', fontSize: '0.9rem' }
                        }}
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};
