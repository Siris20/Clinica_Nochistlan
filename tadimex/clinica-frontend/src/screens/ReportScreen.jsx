import React, {useState, useEffect} from 'react';
import { useLocation } from 'react-router-dom';
import { Header } from "../partials/Header";
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, CircularProgress, Alert, Link, Button } from '@mui/material';
import { UseScrapping } from '../hooks/UseScrapping';
import { UseQuery } from '../hooks/UseQuery';
import { NavLink } from 'react-router-dom';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import { useAuth } from '../context/AuthContext';
import { Page, Text, View, Document, StyleSheet, PDFDownloadLink, Image } from '@react-pdf/renderer';

function ReportScreen() {
  const location = useLocation();
  const { query_text, urls } = location.state || {};
  const {token} = useAuth();
  

  const { data: queryData, error: queryError } = query_text ? UseQuery(query_text, token) : { data: [], error: null };
  const { data: scrapData, error: scrapError } = urls ? UseScrapping(urls, token) : { data: [], error: null };

  const data = query_text ? queryData : scrapData;
  const error = query_text ? queryError : scrapError;

  const isQueryData = Boolean(query_text); // Verifica si los datos son de query_text
  
  //Estado para el texto de carga
  const [loadingText, setLoadingText] = useState(true);

  useEffect(() => {
    const texts = ["Cargando...", "Por favor espera...", "Extrayendo datos..."];
    let index = 0;

    const interval = setInterval(() => {
      index = (index + 1) % texts.length;
      setLoadingText(texts[index]);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

    // Componente PDF
    const MyDocument = ({ item }) => (
      <Document>
    <Page size="A4" style={styles.page}>
      <Image
        style={styles.headerImage}
        src="images/ClinicaNochistlan_Logo.png"
      />
      <View style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.title}>{item.title || "No disponible"}</Text>
          <Text style={styles.text}>{`URL:  ${item.url}` || 'URL No disponible'}</Text>
          <Text style={styles.text}>{"Palabras clave: "+item.keywords+" " || 'No disponible'}</Text>
          <Text style={styles.text}>{`Texto completo: ${item.copy_text}` || 'Texto completo No disponible'}</Text>
        </View>
      </View>
    </Page>
  </Document>
    );

  return (
    <>
      <Header showNavBarContent={false} />
      <Box sx={{ padding: 4 }}>
        <Typography
          variant="h3"
          gutterBottom
          sx={{ color: "#000", fontWeight: "bold", textAlign: "left", marginBottom: 4 }}
        >
          Reportes generados
        </Typography>
        {error ? (
          <Alert severity="error">{error}</Alert>
        ) : data.length > 0 ? (
          <TableContainer component={Paper} sx={{ boxShadow: 3 }}>
            <Table>
              <TableHead sx={{ backgroundColor: "#e3e3e3" }}>
                <TableRow>
                  {isQueryData && (
                    <TableCell align="center" sx={{ fontWeight: "bold" }}>Posición</TableCell>
                  )}
                  <TableCell align="center" sx={{ fontWeight: "bold" }}>Sitio</TableCell>
                  <TableCell align="center" sx={{ fontWeight: "bold" }}>URL</TableCell>
                  <TableCell align="center" sx={{ fontWeight: "bold" }}>Palabras Clave</TableCell>
                  <TableCell align="center" sx={{ fontWeight: "bold" }}>Reporte</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.map((item, index) => (
                  <TableRow
                    key={index}
                    sx={{ '&:nth-of-type(odd)': { backgroundColor: "#f9f9f9" } }}
                  >
                    {isQueryData && (
                      <TableCell align="center">{index + 1}</TableCell>
                    )}
                    <TableCell align="center">
                      {item.title || "No disponible"}
                    </TableCell>
                    <TableCell align="center">
                      {item.url ? (
                        <Link
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          sx={{ color: "#1976d2" }}
                        >
                          {item.url}
                        </Link>
                      ) : 'No disponible'}
                    </TableCell>
                    <TableCell align="center">
                      {" "+item.keywords+" " || 'No disponible'}
                    </TableCell>
                    <TableCell align="center">
                    {item.copy_text ? (
                        <PDFDownloadLink
                          document={<MyDocument item={item} />}
                          fileName={`reporte_${item.title}.pdf`}
                        >
                          {({ loadingText }) => (
                            <PictureAsPdfIcon
                              style={{ color: "red", cursor: "pointer" }}
                            />
                          )}
                        </PDFDownloadLink>
                      ) : 'No disponible'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '100vh'
            }}
          >
            <Typography variant="h6" gutterBottom>
              {loadingText}
            </Typography>
            <CircularProgress />
          </Box>
        )}
      </Box>
      <NavLink to="/tell-us-about-you">
        <Button variant="contained" sx={{ backgroundColor: "#f44ecf" }}>
          Volver al inicio
        </Button>
      </NavLink>
    </>
  );
}

  // Estilos para el PDF
  const styles = StyleSheet.create({
    page: {
      flexDirection: 'column',
      backgroundColor: '#FFFFFF',
      padding: 20,
    },
    headerImage: {
      maxHeight: 60,
      marginRight: 10,
      width: '70%',
      marginBottom: 20,
    },
    content: {
      flexGrow: 1,
    },
    section: {
      marginBottom: 20,
    },
    title: {
      fontSize: 24,
      marginBottom: 10,
      fontWeight: 'bold',
      color: '#333333',
    },
    text: {
      fontSize: 14,
      marginBottom: 5,
      lineHeight: 1.5,
      color: '#666666',
    },
  });

export default ReportScreen;
