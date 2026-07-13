import { jsPDF } from "jspdf";
import "jspdf-autotable";
import dayjs from "dayjs";
import { toast } from "react-toastify";
import { changeNumbersToLetters } from "../../components/DashBoard/Quotes/change_numbers_to_letters";

// Crear PDF de venta
export const createSalePDF = async (sale: any, handleGetProduct: any) => {
  try {
    if (!sale || !sale.productos_vendidos || sale.productos_vendidos.length === 0) {
      toast.error("No hay productos para exportar");
      return null;
    }

    // Obtener detalles de productos vendidos
    const soldProducts = await Promise.all(
      sale.productos_vendidos.map(async (producto: any) => {
        const details = await handleGetProduct(producto.producto_id);
        return {
          ...details,
          cantidad: producto.cantidad,
          costo_unitario: Number(producto.costo_unitario),
          precio_unitario_original: Number(producto.precio_unitario_original),
          precio_compra_unitario: Number(producto.precio_compra_unitario),
          importe: Number(producto.importe),
          include_tax: producto.include_tax || false,
          utilidad_unitaria: Number(producto.utilidad_unitaria || 0),
          utilidad_total: Number(producto.utilidad_total || 0),
          margen_porcentaje: Number(producto.margen_porcentaje || 0),
        };
      })
    );

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;

    // Constantes para controlar espacios y límites (igual que purchases)
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
      const subtotalProductos = soldProducts.reduce(
        (sum, product) => sum + product.importe,
        0
      );
      const costoEnvio = Number(sale.costo_envio || 0);
      const total = Number(sale.total || 0);
      const utilidadTotal = soldProducts.reduce(
        (sum, product) => sum + (product.utilidad_total || 0),
        0
      );

      return {
        subtotalProductos,
        costoEnvio,
        total,
        utilidadTotal,
      };
    };

    const totales = calculateTotals();

    // Función para agregar el encabezado en cada página
    const addHeader = async (y = 10) => {
      // Información en la esquina superior derecha (más abajo para no chocar)
      doc.setFontSize(11);
      doc.setFont(undefined, "bold");
      doc.text("ID de Venta:", pageWidth - 50, y + 15, { align: "right" });
      doc.setFont(undefined, "normal");
      doc.text(`${sale.id}`, pageWidth - 10, y + 15, { align: "right" });

      doc.setFont(undefined, "bold");
      doc.text("Fecha de Movimiento:", pageWidth - 50, y + 20, { align: "right" });
      doc.setFont(undefined, "normal");
      doc.text(`${formatDateTime(sale.fecha_movimiento)}`, pageWidth - 10, y + 20, { align: "right" });

      doc.setFont(undefined, "bold");
      doc.text("Estado:", pageWidth - 50, y + 25, { align: "right" });
      doc.setFont(undefined, "normal");
      doc.text(`${sale.estado?.toUpperCase()}`, pageWidth - 10, y + 25, { align: "right" });

      // Título principal (más arriba)
      doc.setFontSize(16);
      doc.setFont(undefined, "bold");
      doc.text("Comprobante de venta", pageWidth / 2, y + 35, { align: "center" });


      return y + 40; // Retorna la nueva posición Y con más espacio para separar bien
    };

    // Función para agregar el pie de página
    const addFooter = (pageNumber: number, totalPages: number) => {
      const footerY = pageHeight - 10;
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`Fecha de Creación: ${formatDateTime(sale.created_at)}`, 10, footerY);
      doc.text(`Página ${pageNumber} de ${totalPages}`, pageWidth - 10, footerY, {
        align: "right",
      });
      doc.setTextColor(0); // Reset color
    };

    // Función para agregar información de la venta
    const addSaleInfo = (y: number) => {
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
      doc.text(`${sale.empleado_nombre || "No especificado"}`, 50, leftY);

      leftY += 5;
      doc.setFont(undefined, "bold");
      doc.text("Tipo de Salida:", 10, leftY);
      doc.setFont(undefined, "normal");
      doc.text(`${sale.tipo_salida?.toUpperCase() || "VENTA"}`, 50, leftY);

      leftY += 5;
      doc.setFont(undefined, "bold");
      doc.text("Fecha de Salida:", 10, leftY);
      doc.setFont(undefined, "normal");
      doc.text(`${formatDate(sale.fecha_salida)}`, 50, leftY);

      leftY += 5;
      doc.setFont(undefined, "bold");
      doc.text("Fecha de Factura:", 10, leftY);
      doc.setFont(undefined, "normal");
      doc.text(`${formatDate(sale.fecha_factura)}`, 50, leftY);

      // Columna derecha
      let rightY = y + 15;
      doc.setFont(undefined, "bold");
      doc.text("Cliente:", 105, rightY);
      doc.setFont(undefined, "normal");
      doc.text(`${sale.cliente_nombre || "Sin cliente"}`, 155, rightY);

      rightY += 5;
      doc.setFont(undefined, "bold");
      doc.text("Número de Factura:", 105, rightY);
      doc.setFont(undefined, "normal");
      doc.text(`${sale.numero_factura || "Sin factura"}`, 155, rightY);

      rightY += 5;
      doc.setFont(undefined, "bold");
      doc.text("Fecha de Pago:", 105, rightY);
      doc.setFont(undefined, "normal");
      doc.text(`${formatDate(sale.fecha_pago)}`, 155, rightY);

      rightY += 5;
      doc.setFont(undefined, "bold");
      doc.text("Método de Pago:", 105, rightY);
      doc.setFont(undefined, "normal");
      doc.text(`${sale.metodo_pago?.toUpperCase() || "EFECTIVO"}`, 155, rightY);

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

      soldProducts.forEach((product) => {
        if (currentPage.length >= SAFE_ITEMS_PER_PAGE) {
          pages.push([...currentPage]);
          currentPage = [];
        }
        currentPage.push(product);
      });

      // Si quedaron productos sin asignar a una página
      if (currentPage.length > 0) {
        pages.push(currentPage);
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
      const rectHeight = 45;
      
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

      doc.text("Subtotal de Productos:", pageWidth - 70, totalesY);
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
        doc.text("Costo de Envío:", pageWidth - 70, totalesY + 8);
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
      doc.text("TOTAL:", pageWidth - 70, totalesY + 18);
      doc.text(
        `$${totales.total.toLocaleString("es-MX", {
          minimumFractionDigits: 2,
        })}`,
        pageWidth - 15,
        totalesY + 18,
        { align: "right" }
      );

      doc.text("Utilidad Total:", pageWidth - 70, totalesY + 28);
      doc.text(
        `$${totales.utilidadTotal.toLocaleString("es-MX", {
          minimumFractionDigits: 2,
        })}`,
        pageWidth - 15,
        totalesY + 28,
        { align: "right" }
      );

      // Observaciones
      if (sale.observaciones) {
        const obsY = y + 50;
        doc.setFontSize(10);
        doc.setFont(undefined, "bold");
        doc.text("OBSERVACIONES:", 15, obsY);
        doc.setFont(undefined, "normal");
        const lines = doc.splitTextToSize(sale.observaciones, pageWidth - 30);
        doc.text(lines, 15, obsY + 8);
      }
    };

    // Iniciar primera página
    let currentY = await addHeader();
    currentY = addSaleInfo(currentY + 5);

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
      doc.text("Productos Vendidos", 10, currentY);
      currentY += 8;

      // Preparar datos para la tabla
      const tableData = products.map((product: any) => [
        product.model || "N/A",
        product.name || "Sin nombre",
        product.brand || "N/A",
        product.cantidad.toString(),
        `$${product.precio_compra_unitario.toLocaleString("es-MX", { minimumFractionDigits: 2 })}`,
        `$${product.precio_unitario_original.toLocaleString("es-MX", { minimumFractionDigits: 2 })}`,
        `$${product.costo_unitario.toLocaleString("es-MX", { minimumFractionDigits: 2 })}`,
        `$${product.importe.toLocaleString("es-MX", { minimumFractionDigits: 2 })}`,
        `$${(product.utilidad_unitaria || 0).toLocaleString("es-MX", { minimumFractionDigits: 2 })}`,
        `${(product.margen_porcentaje || 0).toFixed(1)}%`,
      ]);

      // Generar tabla con autoTable
      (doc as any).autoTable({
        startY: currentY,
        head: [['Modelo', 'Concepto', 'Marca', 'Cantidad', 'P.Compra Unitario', 'P.Venta Unitario', 'P.Venta Unitario + IVA', 'Importe', 'Util. Unit.', 'Margen %']],
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
          0: { halign: 'center', cellWidth: 17 }, // Modelo
          1: { halign: 'left', cellWidth: 49 },   // Concepto - más espacio
          2: { halign: 'center', cellWidth: 18 }, // Marca
          3: { halign: 'center', cellWidth: 12 }, // Cantidad
          4: { halign: 'right', cellWidth: 15 },  // P.Compra
          5: { halign: 'right', cellWidth: 15 },  // P.Venta
          6: { halign: 'right', cellWidth: 16 },  // P.Venta+IVA
          7: { halign: 'right', cellWidth: 16 },  // Importe
          8: { halign: 'right', cellWidth: 16 },  // Util.Unit.
          9: { halign: 'center', cellWidth: 16 }, // Margen %
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

    toast.success("PDF de venta generado exitosamente");
    return doc;
  } catch (error) {
    console.error("Error al crear PDF de venta:", error);
    toast.error("Error al generar el PDF de venta");
    return null;
  }
};
