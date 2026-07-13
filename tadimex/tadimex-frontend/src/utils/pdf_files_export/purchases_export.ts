import { jsPDF } from "jspdf";
import "jspdf-autotable";
import dayjs from "dayjs";
import { toast } from "react-toastify";
import { changeNumbersToLetters } from "../../components/DashBoard/Quotes/change_numbers_to_letters";

// Crear PDF de compra
export const createPurchasePDF = async (purchase: any, handleGetProduct: any) => {
  try {
    if (!purchase || !purchase.productos_comprados || purchase.productos_comprados.length === 0) {
      toast.error("No hay productos para exportar");
      return null;
    }

    // Obtener detalles de productos comprados
    const purchasedProducts = await Promise.all(
      purchase.productos_comprados.map(async (producto: any) => {
        const details = await handleGetProduct(producto.producto_id);
        return {
          ...details,
          cantidad: producto.cantidad,
          costo_unitario: Number(producto.costo_unitario),
          importe: Number(producto.importe),
          precio_unitario_original: Number(producto.precio_unitario_original || 0),
          incluye_iva_original: producto.incluye_iva_original || false,
        };
      })
    );

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;

    // Constantes para controlar espacios y límites (igual que cotizaciones)
    const TABLE_MARGIN_BOTTOM = 10;
    const FOOTER_HEIGHT = 15;
    const HEADER_HEIGHT = 40;
    const TOTALS_SECTION_HEIGHT = 80;
    const SAFE_ITEMS_PER_PAGE = 20;

    // Función para formatear fechas
    const formatDate = (dateString: string) => {
      if (!dateString) return "No especificada";
      const date = dayjs(dateString).startOf("day");
      return date.format("DD/MM/YYYY");
    };

    const formatDateTime = (dateString: string) => {
      if (!dateString) return "No especificada";
      const date = dayjs(dateString);
      return date.format("DD/MM/YYYY HH:mm");
    };

    // Calcular totales
    const calculateTotals = () => {
      const subtotalProductos = purchasedProducts.reduce(
        (sum, product) => sum + product.importe,
        0
      );
      const costoEnvio = Number(purchase.costo_envio || 0);
      const total = Number(purchase.total || 0);

      return {
        subtotalProductos,
        costoEnvio,
        total,
      };
    };

    const totales = calculateTotals();

    // Función para agregar el encabezado en cada página
    const addHeader = async (y = 10) => {

      // Información en la esquina superior derecha (más abajo para no chocar)
      doc.setFontSize(11);
      doc.setFont(undefined, "bold");
      doc.text("ID de Compra:", pageWidth - 50, y + 15, { align: "right" });
      doc.setFont(undefined, "normal");
      doc.text(`${purchase.id}`, pageWidth - 10, y + 15, { align: "right" });

      doc.setFont(undefined, "bold");
      doc.text("Fecha de Movimiento:", pageWidth - 50, y + 20, { align: "right" });
      doc.setFont(undefined, "normal");
      doc.text(`${formatDateTime(purchase.fecha_movimiento)}`, pageWidth - 10, y + 20, { align: "right" });

      doc.setFont(undefined, "bold");
      doc.text("Estado:", pageWidth - 50, y + 25, { align: "right" });
      doc.setFont(undefined, "normal");
      doc.text(`${purchase.estado?.toUpperCase()}`, pageWidth - 10, y + 25, { align: "right" });


      // Título principal (más arriba)
      doc.setFontSize(16);
      doc.setFont(undefined, "bold");
      doc.text("Comprobante de compra", pageWidth / 2, y + 35, { align: "center" });

      return y + 40; // Retorna la nueva posición Y con más espacio para separar bien
    };

    // Función para agregar el pie de página
    const addFooter = (pageNumber: number, totalPages: number) => {
      const footerY = pageHeight - 10;
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`Fecha de Creación: ${formatDateTime(purchase.created_at)}`, 10, footerY);
      doc.text(`Página ${pageNumber} de ${totalPages}`, pageWidth - 10, footerY, {
        align: "right",
      });
      doc.setTextColor(0); // Reset color
    };

    // Función para agregar información de la compra
    const addPurchaseInfo = (y: number) => {
      // Información General
      doc.setFontSize(12);
      doc.setFont(undefined, "bold");
      doc.text("Información General", 10, y + 5);

      doc.setFontSize(10);
      doc.setFont(undefined, "normal");

      // Columna izquierda
      let leftY = y + 15;
      doc.setFont(undefined, "bold");
      doc.text("Empleado:", 10, leftY);
      doc.setFont(undefined, "normal");
      doc.text(`${purchase.empleado_nombre || "No especificado"}`, 50, leftY);

      leftY += 5;
      doc.setFont(undefined, "bold");
      doc.text("Almacén:", 10, leftY);
      doc.setFont(undefined, "normal");
      doc.text(`${purchase.almacen_nombre || "No especificado"}`, 50, leftY);

      leftY += 5;
      doc.setFont(undefined, "bold");
      doc.text("Tipo de Entrada:", 10, leftY);
      doc.setFont(undefined, "normal");
      doc.text(`${purchase.tipo_entrada?.toUpperCase() || "COMPRA"}`, 50, leftY);

      leftY += 5;
      doc.setFont(undefined, "bold");
      doc.text("Fecha de Recepción:", 10, leftY);
      doc.setFont(undefined, "normal");
      doc.text(`${formatDate(purchase.fecha_recepcion)}`, 50, leftY);

      // Columna derecha
      let rightY = y + 15;
      doc.setFont(undefined, "bold");
      doc.text("Proveedor:", 110, rightY);
      doc.setFont(undefined, "normal");
      doc.text(`${purchase.proveedor_nombre || "Sin proveedor"}`, 160, rightY);

      rightY += 5;
      doc.setFont(undefined, "bold");
      doc.text("Número de Factura:", 110, rightY);
      doc.setFont(undefined, "normal");
      doc.text(`${purchase.numero_factura || "Sin factura"}`, 160, rightY);

      rightY += 5;
      doc.setFont(undefined, "bold");
      doc.text("Fecha de Factura:", 110, rightY);
      doc.setFont(undefined, "normal");
      doc.text(`${formatDate(purchase.fecha_factura)}`, 160, rightY);

      rightY += 5;
      doc.setFont(undefined, "bold");
      doc.text("Fecha de Pago:", 110, rightY);
      doc.setFont(undefined, "normal");
      doc.text(`${formatDate(purchase.fecha_pago)}`, 160, rightY);

      rightY += 5;
      doc.setFont(undefined, "bold");
      doc.text("Método de Pago:", 110, rightY);
      doc.setFont(undefined, "normal");
      doc.text(`${purchase.metodo_pago?.toUpperCase() || "EFECTIVO"}`, 160, rightY);

      return Math.max(leftY, rightY) + 10;
    };

    // Función para determinar si los totales cabrán en la misma página
    const willTotalsFitOnSamePage = (tableEndY: number) => {
      const requiredSpace = TOTALS_SECTION_HEIGHT + 40;
      const availableSpace = pageHeight - tableEndY - FOOTER_HEIGHT;
      return availableSpace >= requiredSpace;
    };

    // Función para dividir los productos en páginas
    const splitProductsIntoPages = () => {
      const pages: any[][] = [];
      let currentPage: any[] = [];

      purchasedProducts.forEach((product) => {
        if (currentPage.length >= SAFE_ITEMS_PER_PAGE) {
          pages.push([...currentPage]);
          currentPage = [];
        }
        currentPage.push(product);
      });

      // Si quedaron productos sin asignar a una página
      if (currentPage.length > 0) {
        pages.push([...currentPage]);
      }

      return pages;
    };

    // Función para agregar totales e información adicional
    const addTotalsAndInfo = (y: number) => {
      // Verificar que y sea un número válido
      if (isNaN(y) || y < 0) {
        y = pageHeight - TOTALS_SECTION_HEIGHT - FOOTER_HEIGHT;
      }

      // Sección de totales con fondo gris
      doc.setFillColor(224, 224, 224);
      const rectHeight = 35;
      
      if (y + rectHeight <= pageHeight - FOOTER_HEIGHT) {
        doc.rect(10, y - 5, pageWidth - 20, rectHeight, 'F');
      }

      // Cantidad con letra
      doc.setFontSize(9);
      doc.text("Cantidad con Letra:", 15, y + 5);
      doc.setFont(undefined, "bold");
      doc.text(`${changeNumbersToLetters(totales.total)}`, 15, y + 10);

      // Columna de totales
      const totalesY = y + 5;
      doc.setFont(undefined, "normal");
      
      doc.text("Subtotal de Productos:", pageWidth - 80, totalesY);
      doc.setFont(undefined, "bold");
      doc.text(
        `$${totales.subtotalProductos.toLocaleString("es-MX", {
          minimumFractionDigits: 2,
        })}`,
        pageWidth - 15,
        totalesY,
        { align: "right" }
      );

      if (totales.costoEnvio > 0) {
        doc.setFont(undefined, "normal");
        doc.text("Costo de Envío:", pageWidth - 80, totalesY + 8);
        doc.setFont(undefined, "bold");
        doc.text(
          `$${totales.costoEnvio.toLocaleString("es-MX", {
            minimumFractionDigits: 2,
          })}`,
          pageWidth - 15,
          totalesY + 8,
          { align: "right" }
        );
      }

      doc.setFont(undefined, "bold");
      doc.setFontSize(12);
      doc.text("TOTAL:", pageWidth - 80, totalesY + 18);
      doc.text(
        `$${totales.total.toLocaleString("es-MX", {
          minimumFractionDigits: 2,
        })}`,
        pageWidth - 15,
        totalesY + 18,
        { align: "right" }
      );

      // Observaciones
      if (purchase.observaciones) {
        const obsY = y + 40;
        doc.setFontSize(10);
        doc.setFont(undefined, "bold");
        doc.text("OBSERVACIONES:", 15, obsY);
        doc.setFont(undefined, "normal");
        const lines = doc.splitTextToSize(purchase.observaciones, pageWidth - 30);
        doc.text(lines, 15, obsY + 8);
      }
    };

    // Iniciar primera página
    let currentY = await addHeader();
    currentY = addPurchaseInfo(currentY + 5);

    const productPages = splitProductsIntoPages();
    let lastTableEndY = 0;

    // Generar tablas por página
    for (let pageIndex = 0; pageIndex < productPages.length; pageIndex++) {
      const isFirstPage = pageIndex === 0;
      const products = productPages[pageIndex];

      if (!isFirstPage) {
        doc.addPage();
        currentY = await addHeader();
        currentY += 5;
      }

      // Título de la tabla
      doc.setFontSize(12);
      doc.setFont(undefined, "bold");
      doc.text("Productos Comprados", 10, currentY);
      currentY += 8;

      // Preparar datos para la tabla
      const tableData = products.map((product: any) => [
        product.model || "N/A",
        product.name || "Sin nombre",
        product.brand || "N/A",
        product.cantidad.toString(),
        `$${product.costo_unitario.toLocaleString("es-MX", { minimumFractionDigits: 2 })}`,
        `$${product.importe.toLocaleString("es-MX", { minimumFractionDigits: 2 })}`,
      ]);

      // Generar tabla con autoTable
      (doc as any).autoTable({
        startY: currentY,
        head: [['Modelo', 'Concepto', 'Marca', 'Cantidad', 'Costo Unitario', 'Importe']],
        body: tableData,
        styles: {
          fontSize: 9,
          cellPadding: 3,
        },
        headStyles: {
          fillColor: [224, 224, 224], 
          textColor: [0, 0, 0],
          fontStyle: 'bold',
        },
        columnStyles: {
          0: { halign: 'center', cellWidth: 25 }, // Modelo
          1: { halign: 'left', cellWidth: 60 },   // Concepto
          2: { halign: 'center', cellWidth: 25 }, // Marca
          3: { halign: 'center', cellWidth: 20 }, // Cantidad
          4: { halign: 'right', cellWidth: 30 },  // Costo Unitario
          5: { halign: 'right', cellWidth: 30 },  // Importe
        },
        alternateRowStyles: {
          fillColor: [249, 249, 249]
        },
        margin: { left: 10, right: 10 },
        didDrawPage: (data: any) => {
          lastTableEndY = data.cursor.y;
        }
      });
    }

    // Lógica para decidir si agregar nueva página para los totales
    if (!willTotalsFitOnSamePage(lastTableEndY)) {
      doc.addPage();
      currentY = 60; // Posición inicial en nueva página con más espacio
    } else {
      currentY = lastTableEndY + TABLE_MARGIN_BOTTOM;
    }

    // Agregar totales e información adicional
    addTotalsAndInfo(currentY);

    // Agregar números de página
    const totalPages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      addFooter(i, totalPages);
    }

    toast.success("PDF de compra generado exitosamente");
    return doc;

  } catch (error) {
    toast.error("Error al generar el PDF de compra");
    return null;
  }
};
