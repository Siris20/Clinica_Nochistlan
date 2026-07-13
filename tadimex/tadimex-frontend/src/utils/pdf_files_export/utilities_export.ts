import { jsPDF } from "jspdf";
import "jspdf-autotable";
import dayjs from "dayjs";
import { toast } from "react-toastify";

// Crear PDF de utilidades - VERSIÓN PROFESIONAL CON ESTILOS DE COTIZACIÓN
export const createUtilitiesReportPDF = (
  utilities: any,
  selectedStorage: string,
  selectedClient: string,
  filteredStorage: any[],
  clients: any[],
  startDate?: string | null,
  endDate?: string | null,
  selectedBranch?: any,
  branches?: any[],
  selectedEnterprise?: any,  
  enterprises?: any[]      
) => {

  try {
    if (!utilities || !utilities.productos || utilities.productos.length === 0) {
      return;
    }

    // Filtrar productos por sucursal
    let productosParaExportar = utilities.productos;
    
    if (selectedBranch && (selectedBranch.id || selectedBranch)) {
      const sucursalId = selectedBranch.id || selectedBranch;
      
      productosParaExportar = utilities.productos.filter((producto: any) => {
        if (producto.sucursal_id) {
          return producto.sucursal_id === sucursalId;
        }
        
        if (producto.clientes && producto.clientes.length > 0) {
          return producto.clientes.some((cliente: any) => 
            cliente.sucursal_id === sucursalId || 
            !cliente.sucursal_id
          );
        }
        
        return true;
      });
    }

    const utilitiesFiltradas = {
      ...utilities,
      productos: productosParaExportar
    };

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    
    // Constantes para controlar espacios y límites (similar a cotización)
    const TABLE_MARGIN_BOTTOM = 10;
    const FOOTER_HEIGHT = 15;
    const HEADER_HEIGHT = 40;
    const TOTALS_SECTION_HEIGHT = 120;
    const SAFE_ITEMS_PER_PAGE = 15; // Productos seguros por página

    // Obtener nombres dinámicos
    let nombreEmpresa = "Impulsora Izcaltia, S.A. de C.V.";
    if (selectedEnterprise && enterprises) {
      const empresaData = enterprises.find(empresa => empresa.id === selectedEnterprise);
      if (empresaData) {
        nombreEmpresa = empresaData.name;
      }
    }

    let nombreSucursal = "Todas las Sucursales";
    if (selectedBranch && (selectedBranch.id || selectedBranch) && branches) {
      const sucursalId = selectedBranch.id || selectedBranch;
      const sucursalData = branches.find(branch => branch.id === sucursalId);
      if (sucursalData) {
        nombreSucursal = sucursalData.name;
      } else {
        nombreSucursal = `Sucursal ID: ${sucursalId}`;
      }
    }

    const formatDate = (dateString) => {
      if (!dateString) return "";
      const date = dayjs(dateString).startOf("day");
      return date.format("DD/MM/YYYY");
    };

    // Función para agregar el encabezado en cada página (estilo cotización)
    const addHeader = (y = 10) => {
      // Información de fechas en la esquina superior derecha
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.text(`Fecha de descarga:`, pageWidth - 35, y + 15, {
        align: "right",
      });
      doc.setFont("helvetica", "normal");
      doc.text(`${new Date().toLocaleDateString('es-ES')}`, pageWidth - 10, y + 15, {
        align: "right",
      });

      // Fecha de consulta (solo si hay fechas)
      if (startDate && endDate) {
        const fechaInicioFormato = new Date(startDate).toLocaleDateString('es-ES');
        const fechaFinFormato = new Date(endDate).toLocaleDateString('es-ES');
        
        doc.setFont("helvetica", "bold");
        doc.text(`Fecha de consulta:`, pageWidth - 50, y + 20, {
          align: "right",
        });
        doc.setFont("helvetica", "normal");
        doc.text(`${fechaInicioFormato} - ${fechaFinFormato}`, pageWidth - 10, y + 20, {
          align: "right",
        });
      }

      // Título principal centrado
      doc.setFontSize(16.5);
      doc.setFont("helvetica", "bold");
      doc.text("Reporte de Utilidades", pageWidth / 2, y + 30, { align: "center" });

      return y + 30; // Retorna la nueva posición Y
    };

    // Función para agregar el pie de página (estilo cotización)
    const addFooter = (pageNumber, totalPages) => {
      const footerY = pageHeight - 10;
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`Generado: ${new Date().toLocaleDateString('es-ES')}`, 10, footerY);
      doc.text(`Página ${pageNumber} de ${totalPages}`, pageWidth - 10, footerY, {
        align: "right",
      });
      doc.setTextColor(0); // Resetear color
    };

    // Función para agregar información de empresa y sucursal (estilo cotización)
    const addCompanyInfo = (y) => {
      // Información de la empresa
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.text("Empresa:", 10, y + 5);
      doc.setFont("helvetica", "normal");
      doc.text(`${nombreEmpresa.toUpperCase()}`, 10, y + 10);

      // Información de la sucursal
      doc.setFont("helvetica", "bold");
      doc.text(`Sucursal:`, pageWidth - 10, y + 5, { align: "right" });
      doc.setFont("helvetica", "normal");
      doc.text(`${nombreSucursal.toUpperCase()}`, pageWidth - 10, y + 10, {
        align: "right",
      });

      // Información adicional de filtros
      let infoAdicional = [];
      if (selectedClient !== "todos") {
        const clienteData = clients.find(c => c.id.toString() === selectedClient);
        if (clienteData) {
          infoAdicional.push(`Cliente: ${clienteData.nombre_fiscal || clienteData.nombre}`);
        }
      }
      
      if (selectedStorage !== "todos") {
        const almacenData = filteredStorage.find(s => s.id.toString() === selectedStorage);
        if (almacenData) {
          infoAdicional.push(`Almacén: ${almacenData.name || almacenData.nombre}`);
        }
      }

      if (infoAdicional.length > 0) {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.text(infoAdicional.join(" | "), pageWidth / 2, y + 15, { align: "center" });
        return y + 20;
      }

      return y + 15;
    };

    // Función para determinar si los totales cabrán en la misma página
    const willTotalsFitOnSamePage = (tableEndY) => {
      const requiredSpace = TOTALS_SECTION_HEIGHT + 40;
      const availableSpace = pageHeight - tableEndY - FOOTER_HEIGHT;
      return availableSpace >= requiredSpace;
    };

    // Función para dividir productos en páginas
    const splitProductsIntoPages = () => {
      const pages = [];
      let currentPage = [];

      // Crear datos planos para la tabla
      const flatData = [];
      
      utilitiesFiltradas.productos.forEach((producto: any) => {
        // Fila principal del producto
        flatData.push({
          type: 'product',
          id: producto.producto_id,
          nombre: producto.producto_nombre,
          precio_compra: parseFloat(producto.precio_compra_promedio || "0"),
          precio_venta: parseFloat(producto.precio_venta_promedio || "0"),
          cantidad: producto.cantidad_vendida_total,
          utilidad: parseFloat(producto.utilidad_total || "0"),
          margen: parseFloat(producto.margen_promedio || "0")
        });

        // Filas de clientes (si existen)
        if (producto.clientes && producto.clientes.length > 0) {
          producto.clientes.forEach((cliente: any) => {
            flatData.push({
              type: 'client',
              cliente_nombre: cliente.cliente_nombre,
              cantidad_comprada: cliente.cantidad_comprada
            });
          });
        }
      });

      // Dividir en páginas
      flatData.forEach((item, index) => {
        currentPage.push(item);

        if (currentPage.length === SAFE_ITEMS_PER_PAGE || index === flatData.length - 1) {
          pages.push([...currentPage]);
          currentPage = [];
        }
      });

      if (currentPage.length > 0) {
        pages.push([...currentPage]);
      }

      return pages;
    };

    // Función para agregar totales e información adicional (estilo cotización)
    const addTotalsAndInfo = (y) => {
      // Verificar que y sea un número válido
      if (isNaN(y) || y < 0) {
        y = 50;
      }

      // Verificar que el rectángulo quepa en la página
      const rectHeight = 80;
      if (y + rectHeight > pageHeight - FOOTER_HEIGHT) {
        y = pageHeight - FOOTER_HEIGHT - rectHeight - 10;
      }

      // Sección de totales con fondo gris (estilo cotización)
      doc.setFillColor(224, 224, 224);

      try {
        doc.rect(10, y, pageWidth - 20, rectHeight, "F");
      } catch (error) {
        try {
          doc.rect(10, 50, pageWidth - 20, rectHeight, "F");
          y = 50;
        } catch (e) {
          console.error("Error al crear rectángulo de totales:", e);
        }
      }

      // Resumen ejecutivo dentro del rectángulo
      if (utilitiesFiltradas.resumen) {
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text("RESUMEN EJECUTIVO", 15, y + 8);
        
        const totalesY = y + 15;
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");

        // Columna izquierda
        doc.text(`Número de Ventas:`, 15, totalesY);
        doc.setFont("helvetica", "bold");
        doc.text(`${utilitiesFiltradas.resumen.numero_ventas_total || 0}`, 80, totalesY);

        doc.setFont("helvetica", "normal");
        doc.text(`Productos Vendidos:`, 15, totalesY + 8);
        doc.setFont("helvetica", "bold");
        doc.text(`${utilitiesFiltradas.resumen.numero_productos_vendidos || 0}`, 80, totalesY + 8);

        // Columna derecha - valores monetarios
        doc.setFont("helvetica", "normal");
        doc.text("Valor de Ventas:", pageWidth - 90, totalesY);
        doc.setFont("helvetica", "bold");
        doc.text(
          `$${parseFloat(utilitiesFiltradas.resumen.total_ventas || "0").toLocaleString('es-MX', { minimumFractionDigits: 2 })}`,
          pageWidth - 15,
          totalesY,
          { align: "right" }
        );

        doc.setFont("helvetica", "normal");
        doc.text("Utilidad Bruta:", pageWidth - 90, totalesY + 8);
        doc.setFont("helvetica", "bold");
        doc.text(
          `$${parseFloat(utilitiesFiltradas.resumen.total_utilidades || "0").toLocaleString('es-MX', { minimumFractionDigits: 2 })}`,
          pageWidth - 15,
          totalesY + 8,
          { align: "right" }
        );

        doc.setFont("helvetica", "normal");
        doc.text("Margen Promedio:", pageWidth - 90, totalesY + 16);
        doc.setFont("helvetica", "bold");
        doc.text(
          `${parseFloat(utilitiesFiltradas.resumen.margen_promedio_general || "0").toFixed(2)}%`,
          pageWidth - 15,
          totalesY + 16,
          { align: "right" }
        );
      }
    };

    // Iniciar primera página
    let currentY = addHeader();
    currentY = addCompanyInfo(currentY + 5);

    const productPages = splitProductsIntoPages();

    // Generar tablas por página
    let lastTableEndY = 0;

    for (let pageIndex = 0; pageIndex < productPages.length; pageIndex++) {
      const pageProducts = productPages[pageIndex];

      try {
        // Si no es la primera página, agregar nueva página
        if (pageIndex > 0) {
          doc.addPage();
          currentY = addHeader();
          currentY = addCompanyInfo(currentY + 5);
        }

        // Preparar datos para autoTable
        const tableData = pageProducts.map((item) => {
          if (item.type === 'product') {
            return [
              item.id,
              item.nombre.length > 40 ? item.nombre.substring(0, 40) + '...' : item.nombre,
              `$${item.precio_compra.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`,
              `$${item.precio_venta.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`,
              item.cantidad,
              `$${item.utilidad.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`,
              `${item.margen.toFixed(2)}%`
            ];
          } else {
            // Cliente
            return [
              '',
              ` ${item.cliente_nombre}`,
              '',
              '',
              `Cant: ${item.cantidad_comprada}`,
              '',
              ''
            ];
          }
        });

        // Configurar la tabla estilo cotización
        const tableOptions = {
          startY: currentY,
          margin: { left: 10, right: 10 },
          headStyles: {
            fillColor: [224, 224, 224],
            textColor: [0, 0, 0],
            fontStyle: 'bold'
          },
          bodyStyles: {
            textColor: [0, 0, 0],
          },
          styles: {
            lineWidth: 0.1,
            lineColor: [224, 224, 224],
            fontSize: 8,
            cellPadding: 2,
          },
          head: [['ID', 'Producto', 'P. Compra', 'P. Venta', 'Cantidad', 'Utilidad', 'Margen %']],
          body: tableData,
          columnStyles: {
            0: { halign: 'center', cellWidth: 15 },
            1: { halign: 'left', cellWidth: 60 },
            2: { halign: 'right', cellWidth: 25 },
            3: { halign: 'right', cellWidth: 25 },
            4: { halign: 'center', cellWidth: 20 },
            5: { halign: 'right', cellWidth: 30 },
            6: { halign: 'right', cellWidth: 20 },
          },
          didParseCell: function(data: any) {
            // Colorear filas de clientes
            if (data.row.raw[1] && data.row.raw[1].toString().includes('→')) {
              data.cell.styles.fillColor = [240, 248, 255];
              data.cell.styles.fontSize = 7;
            }
            
            // Colorear utilidades negativas en rojo
            if (data.column.index === 5 && data.cell.text[0] && data.cell.text[0].includes('-')) {
              data.cell.styles.textColor = [255, 0, 0];
            }
            
            // Colorear márgenes negativos en rojo
            if (data.column.index === 6 && data.cell.text[0] && data.cell.text[0].includes('-')) {
              data.cell.styles.textColor = [255, 0, 0];
            }
          }
        };

        // Generar la tabla
        (doc as any).autoTable(tableOptions);

        // Guardar la posición Y final de la última tabla
        if (pageIndex === productPages.length - 1) {
          lastTableEndY = (doc as any).lastAutoTable.finalY;
        }
      } catch (error) {
        console.error("Error al generar tabla en página", pageIndex, error);
      }
    }

    // Lógica para decidir si agregar nueva página para los totales
    if (!willTotalsFitOnSamePage(lastTableEndY)) {
      doc.addPage();
      currentY = addHeader();
      currentY += 15;
    } else {
      currentY = lastTableEndY + 15;
    }

    // Agregar totales e información adicional
    addTotalsAndInfo(currentY);

    // Agregar números de página
    const totalPages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      addFooter(i, totalPages);
    }

    // Generar nombre del archivo
    let fileName = 'Utilidades_';
    
    // Agregar nombre de la sucursal al archivo
    if (selectedBranch && (selectedBranch.id || selectedBranch) && branches) {
      const sucursalId = selectedBranch.id || selectedBranch;
      const sucursalData = branches.find(branch => branch.id === sucursalId);
      if (sucursalData) {
        const sucursalName = sucursalData.name
          .replace(/[^a-zA-Z0-9\s]/g, '')
          .replace(/\s+/g, '_');
        fileName += `${sucursalName}_`;
      } else {
        fileName += `Sucursal_${sucursalId}_`;
      }
    } else {
      fileName += 'TodasSucursales_';
    }

    // Agregar nombre de la empresa al archivo
    if (selectedEnterprise && enterprises) {
      const empresaData = enterprises.find(empresa => empresa.id === selectedEnterprise);
      if (empresaData) {
        const empresaName = empresaData.name
          .replace(/[^a-zA-Z0-9\s]/g, '')
          .replace(/\s+/g, '_');
        fileName += `${empresaName}_`;
      }
    }
    
    if (selectedClient !== "todos") {
      const clienteData = clients.find(c => c.id.toString() === selectedClient);
      let clienteName = "Cliente_Filtrado";
      
      if (!clienteData && utilitiesFiltradas.filtros_aplicados?.cliente_id) {
        for (const producto of utilitiesFiltradas.productos) {
          if (producto.clientes && producto.clientes.length > 0) {
            const clienteEncontrado = producto.clientes.find((c: any) => 
              c.cliente_id === utilitiesFiltradas.filtros_aplicados.cliente_id
            );
            if (clienteEncontrado) {
              clienteName = clienteEncontrado.cliente_nombre
                .replace(/[^a-zA-Z0-9\s]/g, '')
                .replace(/\s+/g, '_');
              break;
            }
          }
        }
      } else if (clienteData) {
        clienteName = (clienteData.nombre_fiscal || clienteData.nombre)
          .replace(/[^a-zA-Z0-9\s]/g, '')
          .replace(/\s+/g, '_');
      }
      
      fileName += `${clienteName}_`;
    } else {
      fileName += 'General_';
    }

    if (selectedStorage !== "todos") {
      const almacenData = filteredStorage.find(s => s.id.toString() === selectedStorage);
      if (almacenData) {
        const almacenName = (almacenData.name || almacenData.nombre)
          .replace(/[^a-zA-Z0-9\s]/g, '')
          .replace(/\s+/g, '_');
        fileName += `${almacenName}_`;
      }
    }

    if (startDate && endDate) {
      const fechaInicio = new Date(startDate).toLocaleDateString('es-ES').replace(/\//g, '-');
      const fechaFin = new Date(endDate).toLocaleDateString('es-ES').replace(/\//g, '-');
      fileName += `consulta_${fechaInicio}_al_${fechaFin}_`;
    }

    // Agregar fecha de descarga al final
    const fechaDescarga = new Date().toLocaleDateString('es-ES').replace(/\//g, '-');
    fileName += `descarga_${fechaDescarga}.pdf`;

    // Guardar el PDF
    doc.save(fileName);

    toast.success("Archivo PDF generado exitosamente");
    return true;
    
  } catch (error) {
    console.error('Error al crear el PDF de utilidades:', error);
    return false;
  }
};
