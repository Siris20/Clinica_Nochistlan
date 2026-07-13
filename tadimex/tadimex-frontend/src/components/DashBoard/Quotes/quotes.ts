import { jsPDF } from "jspdf";
import "jspdf-autotable";
import { changeNumbersToLetters } from "./change_numbers_to_letters";
import dayjs from "dayjs";

// Crear PDF de cotización
export const createQuotePDF = async (quote, handleGetProduct) => {
  // Obtener detalles de productos
  const quotedProducts = await Promise.all(
    quote.productos_cotizados.map(async (producto) => {
      const details = await handleGetProduct(producto.producto_id);

      // Usar el precio personalizado si existe, o el original si no
      const precioUnitario =
        producto.precio_unitario !== undefined
          ? producto.precio_unitario
          : details.sell_price;
      const precioConDescuento =
        precioUnitario * (1 - producto.descuento / 100);
      const subtotalProduct = precioConDescuento * producto.cantidad;

      return {
        ...details,
        cantidad: producto.cantidad,
        descuento: producto.descuento,
        precio_original: details.sell_price,
        precio_cotizado: precioUnitario,
        nombre_original: details.name,
        concepto: producto.concepto || details.name,
        subtotal: subtotalProduct,
      };
    })
  );

  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;

  // Constantes para controlar espacios y límites
  const TABLE_MARGIN_BOTTOM = 10;
  const FOOTER_HEIGHT = 15;
  const HEADER_HEIGHT = 40;
  const TOTALS_SECTION_HEIGHT = 80;
  const SAFE_ITEMS_PER_PAGE = 20;

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = dayjs(dateString).startOf("day");
    return date.format("DD/MM/YYYY");
  };

  // Calcular totales correctos para mostrar
  const calculateDisplayTotals = () => {
    const subtotalProductos = quotedProducts.reduce(
      (sum, product) =>
        sum +
        product.precio_cotizado *
          product.cantidad *
          (1 - product.descuento / 100),
      0
    );
    const descuentoGeneral =
      subtotalProductos * (Number(quote.descuento_general || 0) / 100);
    const gastosEnvio = Number(quote.gastos_envio || 0);
    const subtotalConEnvio = subtotalProductos - descuentoGeneral + gastosEnvio;

    // IVA y total del endpoint
    const iva = Number(quote.iva || 0);
    const total = Number(quote.total || 0);

    return {
      subtotalProductos,
      descuentoGeneral,
      gastosEnvio,
      subtotalConEnvio,
      iva,
      total,
    };
  };

  const totales = calculateDisplayTotals();

  // Función para agregar el encabezado en cada página
  const addHeader = async (y = 10) => {
    // Logo
    if (quote.logo_nombre) {
      try {
        const logoUrl = `${import.meta.env.VITE_API_SERVER}/${
          quote.logo_nombre
        }`;

        const preloadImage = (url) => {
          return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = "Anonymous";

            img.onload = () => {
              const canvas = document.createElement("canvas");
              canvas.width = img.width;
              canvas.height = img.height;
              const ctx = canvas.getContext("2d");
              ctx.drawImage(img, 0, 0);

              try {
                const dataUrl = canvas.toDataURL("image/png");
                resolve(dataUrl);
              } catch (error) {
                console.error("Error al convertir imagen a base64:", error);
                reject(error);
              }
            };

            img.onerror = (error) => {
              console.error("Error al cargar el logo:", error);
              reject(new Error("Error al cargar el logo"));
            };

            img.src = `${url}?t=${new Date().getTime()}`;
          });
        };

        try {
          const logoDataUrl = await preloadImage(logoUrl);
          doc.addImage(logoDataUrl, "PNG", 10, y, 30, 30);
        } catch (error) {
          console.error("Error al procesar el logo:", error);
          // Continuar sin logo
        }
      } catch (error) {
        console.error("Error al cargar el logo:", error);
        // Continuar sin logo
      }
    } else {
      console.log("No se encontró logo para esta cotización", quote);
    }

    // Encabezado
    doc.setFontSize(11);
    doc.setFont(undefined, "bold");
    doc.text(`Fecha de Vencimiento:`, pageWidth - 35, y + 15, {
      align: "right",
    });
    doc.setFont(undefined, "normal");
    doc.text(`${formatDate(quote.fecha_vencimiento)}`, pageWidth - 10, y + 15, {
      align: "right",
    });

    doc.setFont(undefined, "bold");
    doc.text(`Folio de cotización:`, pageWidth - 35, y + 20, {
      align: "right",
    });
    doc.setFont(undefined, "normal");
    doc.text(`${quote.folio}`, pageWidth - 10, y + 20, { align: "right" });

    // Título
    doc.setFontSize(16.5);
    doc.setFont(undefined, "bold");
    doc.text("Cotización", pageWidth / 2, y + 30, { align: "center" });

    return y + 30; // Retorna la nueva posición Y
  };

  // Función para agregar el pie de página
  const addFooter = (pageNumber, totalPages) => {
    const footerY = pageHeight - 10;
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Fecha de Creación: ${formatDate(quote.created_at)}`, 10, footerY);
    doc.text(`Página ${pageNumber} de ${totalPages}`, pageWidth - 10, footerY, {
      align: "right",
    });
  };

  // Función para agregar información del cliente
  const addClientInfo = (y) => {
    // Información del Emisor
    doc.setFontSize(11);
    doc.setFont(undefined, "bold");
    doc.text("Emisor:", 10, y + 5);
    doc.setFont(undefined, "normal");
    doc.text(`${quote.emisor_nombre.toUpperCase()}`, 10, y + 10);
    doc.text(
      `RFC: ${quote.emisor_datos_completos?.rfc || "RFC no disponible"}`,
      10,
      y + 15
    );

    // Información del Cliente
    doc.setFont(undefined, "bold");
    doc.text(`Cliente:`, pageWidth - 10, y + 5, { align: "right" });
    doc.setFont(undefined, "normal");
    doc.text(`${quote.cliente_nombre.toUpperCase()}`, pageWidth - 10, y + 10, {
      align: "right",
    });
    const domicilio = quote.cliente_domicilio || "Dirección no especificada";
    const lines = doc.splitTextToSize(domicilio, 90);
    doc.text(lines, pageWidth - 10, y + 15, { align: "right" });

    return y + 20 + (lines.length - 1) * 5;
  };

  // Función mejorada para determinar si los totales cabrán en la misma página
  const willTotalsFitOnSamePage = (tableEndY) => {
    const requiredSpace = TOTALS_SECTION_HEIGHT + 40;
    const availableSpace = pageHeight - tableEndY - FOOTER_HEIGHT;
    return availableSpace >= requiredSpace;
  };

  // Función mejorada para dividir los productos en páginas
  const splitProductsIntoPages = () => {
    const pages = [];
    let currentPage = [];

    quotedProducts.forEach((product, index) => {
      currentPage.push(product);

      // Si alcanzamos el máximo seguro por página o es el último producto, finalizamos la página
      if (
        currentPage.length === SAFE_ITEMS_PER_PAGE ||
        index === quotedProducts.length - 1
      ) {
        pages.push([...currentPage]);
        currentPage = [];
      }
    });

    // Si quedaron productos sin asignar a una página
    if (currentPage.length > 0) {
      pages.push([...currentPage]);
    }

    return pages;
  };

  // Función mejorada para agregar totales e información adicional
  const addTotalsAndInfo = (y) => {
    // Verificar que y sea un número válido
    if (isNaN(y) || y < 0) {
      console.warn(
        "Valor Y inválido para totales, ajustando a un valor seguro"
      );
      y = 50; // Usar un valor seguro por defecto
    }

    // Verificar que el rectángulo quepa en la página
    const rectHeight = 37;
    if (y + rectHeight > pageHeight - FOOTER_HEIGHT) {
      y = pageHeight - FOOTER_HEIGHT - rectHeight - 10;
    }

    // Sección de totales con manejo de errores
    doc.setFillColor(224, 224, 224);

    try {
      doc.rect(10, y, pageWidth - 20, rectHeight, "F");
    } catch (error) {
      try {
        doc.rect(10, 50, pageWidth - 20, rectHeight, "F");
        y = 50;
      } catch (e) {
        console.error("Error fatal al obtener totales:", e);
      }
    }

    // Cantidad con letra
    doc.setFontSize(9);
    doc.text("Cantidad con Letra:", 15, y + 5);
    doc.setFont(undefined, "bold");
    doc.text(`${changeNumbersToLetters(totales.total)}`, 15, y + 10);

    // Columna de totales
    const totalesY = y + 5;
    doc.setFont(undefined, "normal");
    doc.text("Subtotal:", pageWidth - 70, totalesY);
    doc.text(
      `$${parseFloat(totales.subtotalProductos).toLocaleString("es-MX", {
        minimumFractionDigits: 2,
      })}`,
      pageWidth - 15,
      totalesY,
      {
        align: "right",
      }
    );

    doc.text(
      `Descuento ${quote.descuento_general}%:`,
      pageWidth - 70,
      totalesY + 5
    );
    doc.text(
      `$${parseFloat(totales.descuentoGeneral).toLocaleString("es-MX", {
        minimumFractionDigits: 2,
      })}`,
      pageWidth - 15,
      totalesY + 5,
      {
        align: "right",
      }
    );

    // Gastos de envío
    doc.text("Gastos de envío:", pageWidth - 70, totalesY + 10);
    doc.text(
      `$${parseFloat(totales.gastosEnvio).toLocaleString("es-MX", {
        minimumFractionDigits: 2,
      })}`,
      pageWidth - 15,
      totalesY + 10,
      {
        align: "right",
      }
    );

    // Subtotal con envío
    doc.text("Subtotal con envío:", pageWidth - 70, totalesY + 15);
    doc.text(
      `$${parseFloat(totales.subtotalConEnvio).toLocaleString("es-MX", {
        minimumFractionDigits: 2,
      })}`,
      pageWidth - 15,
      totalesY + 15,
      {
        align: "right",
      }
    );

    doc.text("I.V.A.:", pageWidth - 70, totalesY + 20);
    doc.text(
      `$${parseFloat(totales.iva).toLocaleString("es-MX", {
        minimumFractionDigits: 2,
      })}`,
      pageWidth - 15,
      totalesY + 20,
      {
        align: "right",
      }
    );

    doc.text("Ret.Isr:", pageWidth - 70, totalesY + 25);
    doc.text(
      `$${parseFloat(quote?.isr_ret || 0).toLocaleString("es-MX", {
        minimumFractionDigits: 2,
      })}`,
      pageWidth - 15,
      totalesY + 25,
      {
        align: "right",
      }
    );

    doc.setFont(undefined, "bold");
    doc.text("Total a pagar:", pageWidth - 70, totalesY + 30);
    doc.text(
      `$${parseFloat(totales.total).toLocaleString("es-MX", {
        minimumFractionDigits: 2,
      })}`,
      pageWidth - 15,
      totalesY + 30,
      {
        align: "right",
      }
    );

    // Información adicional
    const infoY = y + 40;
    doc.setFontSize(11);

    // Columna izquierda
    doc.text("Dudas con esta cotización:", 10, infoY + 5);
    doc.text("449 138 8110 y 449 223 4202", 10, infoY + 10);

    //Ancho maximo para el texto
    const maxWidth = (pageWidth - 20) * 0.5;

    doc.setFont(undefined, "bold");
    doc.text("OBSERVACIONES:", 10, infoY + 15);
    doc.setFont(undefined, "normal");
    const observaciones = quote?.observaciones || "Ninguna";
    const observacionesLines = doc.splitTextToSize(observaciones, maxWidth);
    doc.text(observacionesLines, 10, infoY + 20);

    //Nueva posicion Y despues de las observaciones
    const observacionesHeight = observacionesLines.length * 5;

    doc.setFont(undefined, "bold");
    doc.text("CONDICIONES DE VENTA:", 10, infoY + 20 + observacionesHeight + 5); // Reducido el espacio
    doc.setFont(undefined, "normal");
    const condiciones = quote?.condiciones_venta || "Ninguna";
    const condicionesLines = doc.splitTextToSize(condiciones, maxWidth);
    doc.text(condicionesLines, 10, infoY + 25 + observacionesHeight + 5); // Reducido el espacio

    // Columna derecha
    doc.text("Información para pagos:", pageWidth - 10, infoY + 5, {
      align: "right",
    });
    doc.setFont(undefined, "bold");
    doc.text("NOMBRE DEL BANCO:", pageWidth - 35, infoY + 10, {
      align: "right",
    });
    doc.setFont(undefined, "normal");
    doc.text(
      `${quote.emisor_datos_completos?.banco || "No se proporcionó"}`,
      pageWidth - 10,
      infoY + 10,
      { align: "right" }
    );
    doc.setFont(undefined, "bold");
    doc.text("CUENTA:", pageWidth - 35, infoY + 15, { align: "right" });
    doc.setFont(undefined, "normal");
    doc.text(
      `${quote.emisor_datos_completos?.numero_cuenta || "No se proporcionó"}`,
      pageWidth - 10,
      infoY + 15,
      { align: "right" }
    );
    doc.setFont(undefined, "bold");
    doc.text("CLABE:", pageWidth - 50, infoY + 20, { align: "right" });
    doc.setFont(undefined, "normal");
    doc.text(
      `${quote.emisor_datos_completos?.clabe || "No se proporcionó"}`,
      pageWidth - 10,
      infoY + 20,
      { align: "right" }
    );

    doc.setFont(undefined, "bold");
    doc.text("DEPOSITOS A TARJETA:", pageWidth - 50, infoY + 25, {
      align: "right",
    });
    doc.setFont(undefined, "normal");
    doc.text(
      `${quote.emisor_datos_completos?.numero_tarjeta || "No se proporcionó"}`,
      pageWidth - 10,
      infoY + 25,
      { align: "right" }
    );

    doc.setFont(undefined, "bold");
    doc.text("TOTAL A PAGAR:", pageWidth - 35, infoY + 30, {
      align: "right",
    });
    doc.setFont(undefined, "normal");
    doc.text(
      `$${
        parseFloat(quote.total).toLocaleString("es-MX", {
          minimumFractionDigits: 2,
        }) || "No se proporcionó"
      }`,
      pageWidth - 10,
      infoY + 30,
      { align: "right" }
    );

    doc.setFont(undefined, "bold");
    doc.text("PAGAR ANTES DE:", pageWidth - 35, infoY + 35, {
      align: "right",
    });
    doc.setFont(undefined, "normal");
    doc.text(
      `${formatDate(quote.fecha_vencimiento) || "No se proporcionó"}`,
      pageWidth - 10,
      infoY + 35,
      { align: "right" }
    );
  };

  // Iniciar primera página
  let currentY = await addHeader();
  currentY = addClientInfo(currentY + 5); // Aumentado el espacio

  const productPages = splitProductsIntoPages();

  // Generar tablas por página
  let lastTableEndY = 0;

  for (let pageIndex = 0; pageIndex < productPages.length; pageIndex++) {
    const pageProducts = productPages[pageIndex];

    try {
      // Si no es la primera página, agregar nueva página
      if (pageIndex > 0) {
        doc.addPage();
        currentY = await addHeader();
        currentY = addClientInfo(currentY + 5);
      }

      // Configurar la tabla para esta página
      const tableOptions = {
        startY: currentY,
        margin: { left: 10, right: 10 },
        headStyles: {
          fillColor: [224, 224, 224],
          textColor: [0, 0, 0],
        },
        bodyStyles: {
          textColor: [0, 0, 0],
        },
        styles: {
          lineWidth: 0.1,
          lineColor: [224, 224, 224],
          fontSize: 10,
          cellPadding: 2,
        },
        head: [["Cantidad", "Concepto", "Precio U.", "Descuento", "Subtotal"]],
        body: pageProducts.map((product) => [
          product.cantidad,
          // Usar el concepto personalizado en lugar del nombre original
          product.concepto || product.name,
          // Usar el precio cotizado personalizado
          `$${parseFloat(product.precio_cotizado).toLocaleString("es-MX", {
            minimumFractionDigits: 2,
          })}`,
          `${product.descuento}%`,
          // Calcular el subtotal usando el precio cotizado personalizado
          `$${(
            product.precio_cotizado *
            product.cantidad *
            (1 - product.descuento / 100)
          ).toLocaleString("es-MX", {
            minimumFractionDigits: 2,
          })}`,
        ]),
        // Opciones adicionales para control de desbordamiento
        didDrawPage: (data) => {
          // No hacer nada específico aquí, solo capturar la posición
        },
      };

      // Generar la tabla
      doc.autoTable(tableOptions);

      // Guardar la posición Y final de la última tabla
      if (pageIndex === productPages.length - 1) {
        lastTableEndY = doc.lastAutoTable.finalY;
      }
    } catch (error) {
      console.error("Error al generar tabla en página", pageIndex, error);
    }
  }

  // Lógica mejorada para decidir si agregar nueva página para los totales
  if (!willTotalsFitOnSamePage(lastTableEndY)) {
    doc.addPage();
    currentY = await addHeader();
    // Agregar más espacio después del encabezado
    currentY += 15;
  } else {
    currentY = lastTableEndY + 15; // Más espacio después de la tabla
  }

  // Agregar totales e información adicional
  addTotalsAndInfo(currentY);

  // Agregar números de página
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    addFooter(i, totalPages);
  }

  return doc;
};

//Crear PDF de Catálogo de Conceptos
export const createConceptsCatalogPDF = async (quote, handleGetProduct) => {
  // Obtener detalles de productos
  const quotedProducts = await Promise.all(
    quote.productos_cotizados.map(async (producto) => {
      const details = await handleGetProduct(producto.producto_id);
      const precioUnitario =
        producto.precio_unitario !== undefined
          ? producto.precio_unitario
          : details.sell_price;
      const nombreProducto = producto.concepto || details.name;
      const importe =
        precioUnitario * producto.cantidad * (1 - producto.descuento / 100);

      return {
        ...details,
        clave: details.SAT_code || `PROD-${producto.producto_id}`,
        nombre: nombreProducto,
        nombre_original: details.name,
        descripcion: details.description || "Sin descripción",
        marca: details.brand || "No especificada",
        modelo: details.model || "No especificado",
        codigoSAT: details.SAT_code || "No especificado",
        garantia: details.warranty
          ? `${details.warranty} año(s)`
          : "No especificada",
        precioVenta: precioUnitario,
        precio_original: details.sell_price,
        cantidad: producto.cantidad,
        descuento: producto.descuento,
        importe: importe,
        imagen:
          details.images && details.images.length > 0
            ? `${import.meta.env.VITE_API_SERVER}/${details.images[0]}`
            : null,
      };
    })
  );

  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  let currentY = 50;

  // Función para formatear la fecha
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = dayjs(dateString).startOf("day");
    return date.format("DD/MM/YYYY");
  };

  // Función mejorada para agregar el encabezado en cada página
  const addHeader = async (y = 10) => {
    // Logo - Versión mejorada con manejo de errores y precarga de imagen
    if (quote.logo_nombre) {
      try {
        const logoUrl = `${import.meta.env.VITE_API_SERVER}/${
          quote.logo_nombre
        }`;

        // Creamos una función para precargar la imagen
        const preloadImage = (url) => {
          return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = "Anonymous"; // Intenta resolver problemas de CORS

            img.onload = () => {
              // Convertir la imagen a base64 para evitar problemas de CORS
              const canvas = document.createElement("canvas");
              canvas.width = img.width;
              canvas.height = img.height;
              const ctx = canvas.getContext("2d");
              ctx.drawImage(img, 0, 0);

              // Obtener la imagen como data URL
              try {
                const dataUrl = canvas.toDataURL("image/png");
                resolve(dataUrl);
              } catch (error) {
                console.error("Error al convertir imagen a base64:", error);
                reject(error);
              }
            };

            img.onerror = (error) => {
              console.error("Error al cargar el logo:", error);
              reject(new Error("No se pudo cargar el logo"));
            };

            // Añadir un timestamp para evitar caché
            img.src = `${url}?t=${new Date().getTime()}`;
          });
        };

        try {
          // Precargar y obtener la imagen como base64
          const logoDataUrl = await preloadImage(logoUrl);
          // Agregar la imagen al PDF
          doc.addImage(logoDataUrl, "PNG", 10, y, 30, 30);
        } catch (error) {
          console.error("Error al procesar el logo:", error);
          // Continuar sin logo
        }
      } catch (error) {
        console.error("Error al cargar el logo:", error);
        // Continuar sin logo
      }
    } else {
      console.log("No se encontró logo para esta cotización", quote);
    }

    // Encabezado
    doc.setFontSize(11);
    doc.setFont(undefined, "bold");
    doc.text(`Fecha de Vencimiento:`, pageWidth - 35, y + 15, {
      align: "right",
    });
    doc.setFont(undefined, "normal");
    doc.text(`${formatDate(quote.fecha_vencimiento)}`, pageWidth - 10, y + 15, {
      align: "right",
    });

    doc.setFont(undefined, "bold");
    doc.text(`Folio de cotización:`, pageWidth - 35, y + 20, {
      align: "right",
    });
    doc.setFont(undefined, "normal");
    doc.text(`${quote.folio}`, pageWidth - 10, y + 20, { align: "right" });

    // Título
    doc.setFontSize(16.5);
    doc.setFont(undefined, "bold");
    doc.text("Catálogo de Conceptos", pageWidth / 2, y + 30, {
      align: "center",
    });

    return y + 40;
  };

  // Calcular el número total de páginas necesarias (ahora 5 productos por página)
  const productosPerPage = 5;
  const totalPages = Math.ceil((quotedProducts.length + 1) / productosPerPage);

  // Función para agregar pie de página
  const addAllFooters = () => {
    const totalPagesReal = doc.internal.getNumberOfPages();

    for (let i = 1; i <= totalPagesReal; i++) {
      doc.setPage(i);

      // Texto informativo en la parte superior del pie de página
      doc.setFontSize(8);
      doc.setFont(undefined, "normal");
      doc.text(
        "Este documento forma parte de la cotización y detalla los conceptos incluidos en la misma.",
        10,
        pageHeight - 25,
        { maxWidth: pageWidth - 20 }
      );

      // Línea divisoria para separar el contenido del pie de página
      doc.setDrawColor(200, 200, 200);
      doc.line(10, pageHeight - 18, pageWidth - 10, pageHeight - 18);

      // Distribuimos los elementos del pie de página en 3 columnas

      // Emisor - primera columna (izquierda)
      const emisorText = `Emisor: ${quote.emisor_nombre}`;
      const emisorTextShort =
        emisorText.length > 35
          ? emisorText.substring(0, 32) + "..."
          : emisorText;
      doc.text(emisorTextShort, 10, pageHeight - 12);

      // Cliente - segunda columna (centro)
      const clienteNombreCorto =
        quote.cliente_nombre.length > 30
          ? quote.cliente_nombre.substring(0, 27) + "..."
          : quote.cliente_nombre;
      doc.text(
        `Cliente: ${clienteNombreCorto}`,
        pageWidth / 2,
        pageHeight - 12,
        { align: "center" }
      );

      // Número de página - tercera columna (derecha)
      doc.text(
        `Página ${i} de ${totalPagesReal}`,
        pageWidth - 10,
        pageHeight - 12,
        { align: "right" }
      );
    }
  };

  // Agregar primer encabezado - ahora asíncrono
  currentY = await addHeader();

  // Iterar sobre los productos - reducir tamaño para 5 por página
  for (let index = 0; index < quotedProducts.length; index++) {
    const producto = quotedProducts[index];

    // Verificar si necesitamos una nueva página (ajustamos el espacio para 5 productos)
    if (currentY > pageHeight - 80) {
      doc.addPage();
      currentY = await addHeader(); // Ahora también es asíncrono
    }

    // Altura reducida por producto para caber 5 por página
    const itemHeight = 50;

    // Crear un rectángulo de fondo para cada producto
    doc.setFillColor(248, 249, 250);
    doc.rect(10, currentY - 5, pageWidth - 20, itemHeight, "F");

    // Mejora la carga de imágenes de productos
    // Reemplazar la sección de carga de imágenes de productos con esta versión mejorada

    // Añadir imagen o mensaje "Producto sin imagen"
    try {
      if (producto.imagen) {
        // Usar la misma estrategia de precargar y convertir a base64
        const preloadProductImage = (url) => {
          return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = "Anonymous";

            img.onload = () => {
              try {
                const canvas = document.createElement("canvas");
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext("2d");
                ctx.drawImage(img, 0, 0);

                const dataUrl = canvas.toDataURL("image/jpeg");
                resolve(dataUrl);
              } catch (error) {
                console.error(
                  "Error al convertir imagen de producto a base64:",
                  error
                );
                reject(error);
              }
            };

            img.onerror = (error) => {
              console.error("Error al cargar imagen de producto:", error);
              reject(error);
            };

            img.src = `${url}?t=${new Date().getTime()}`;
          });
        };

        try {
          const imageDataUrl = await preloadProductImage(producto.imagen);
          doc.addImage(imageDataUrl, "JPEG", 15, currentY, 35, 35);
        } catch (error) {
          console.error("Error al procesar imagen de producto:", error);
          // Si falla la carga, mostrar mensaje "Producto sin imagen"
          doc.setFillColor(240, 240, 240);
          doc.rect(15, currentY, 35, 35, "F"); // Rectángulo gris claro
          doc.setFontSize(7);
          doc.setTextColor(100, 100, 100);
          doc.text("Producto", 32.5, currentY + 18, { align: "center" });
          doc.text("sin imagen", 32.5, currentY + 23, { align: "center" });
          doc.setTextColor(0, 0, 0);
        }
      } else {
        // Si el producto no tiene imagen definida
        doc.setFillColor(240, 240, 240);
        doc.rect(15, currentY, 35, 35, "F"); // Rectángulo gris claro
        doc.setFontSize(7);
        doc.setTextColor(100, 100, 100);
        doc.text("Producto", 32.5, currentY + 18, { align: "center" });
        doc.text("sin imagen", 32.5, currentY + 23, { align: "center" });
        doc.setTextColor(0, 0, 0);
      }
    } catch (error) {
      console.error("Error general al cargar imagen:", error);
      // En caso de error general, también mostrar el mensaje
      doc.setFillColor(240, 240, 240);
      doc.rect(15, currentY, 35, 35, "F"); // Rectángulo gris claro
      doc.setFontSize(7);
      doc.setTextColor(100, 100, 100);
      doc.text("Producto", 32.5, currentY + 18, { align: "center" });
      doc.text("sin imagen", 32.5, currentY + 23, { align: "center" });
      doc.setTextColor(0, 0, 0);
    }

    // Información del producto con mejor formato (más compacto)
    doc.setFontSize(10);
    doc.setFont(undefined, "bold");
    const maxWidth = 85;
    const nombreProductoLines = doc.splitTextToSize(producto.nombre, maxWidth);
    const limitedNombreLines = nombreProductoLines.slice(0, 2);
    const lineHeight = 5;
    const nombreHeight = limitedNombreLines.length * lineHeight;
    limitedNombreLines.forEach((line, i) => {
      doc.text(line, 60, currentY + 5 + i * lineHeight);
    });
    const offsetY = limitedNombreLines.length > 1 ? 5 : 0;

    doc.setFontSize(8);
    doc.setFont(undefined, "normal");

    // Primera línea de información
    doc.text(
      `Marca: ${producto.marca} | Modelo: ${producto.modelo}`,
      60,
      currentY + 12 + offsetY
    );

    doc.text(`Código SAT: ${producto.codigoSAT}`, 60, currentY + 18 + offsetY);
    doc.text(
      `Concepto SAT: ${producto?.conceptoSat || "No existe"}`,
      60,
      currentY + 24 + offsetY
    );

    // Segunda línea con garantía
    doc.text(`Garantía: ${producto.garantia}`, 60, currentY + 30 + offsetY);

    const descripLines = doc.splitTextToSize(producto.descripcion, 90);
    const limitedDescripLines = descripLines.slice(0, 2);
    doc.text(limitedDescripLines, 60, currentY + 36 + offsetY);

    // Información de precios con mejor formato (más compacto)
    doc.setFontSize(9);

    // Primera columna de precios
    doc.setFont(undefined, "bold");
    doc.text(`Precio Unitario:`, 150, currentY + 8);
    doc.setFont(undefined, "normal");
    doc.text(
      `$${producto.precioVenta.toLocaleString("es-MX", {
        minimumFractionDigits: 2,
      })}`,
      195,
      currentY + 8,
      { align: "right" }
    );

    doc.setFont(undefined, "bold");
    doc.text(`Descuento:`, 150, currentY + 16);
    doc.setFont(undefined, "normal");
    doc.text(`${producto.descuento}%`, 195, currentY + 16, { align: "right" });

    // Segunda columna de precios
    doc.setFont(undefined, "bold");
    doc.text(`Cantidad:`, 150, currentY + 24);
    doc.setFont(undefined, "normal");
    doc.text(`${producto.cantidad}`, 195, currentY + 24, { align: "right" });

    doc.setFont(undefined, "bold");
    doc.text(`Importe:`, 150, currentY + 32);
    doc.setTextColor(0, 100, 0);
    doc.text(
      `$${producto.importe.toLocaleString("es-MX", {
        minimumFractionDigits: 2,
      })}`,
      195,
      currentY + 32,
      { align: "right" }
    );
    doc.setTextColor(0, 0, 0);

    // Avanzamos la posición Y para el siguiente producto
    currentY += itemHeight + 5; // 5px de espacio entre productos
  }

  // Agregar totales en la última página
  if (currentY > pageHeight - 80) {
    doc.addPage();
    currentY = await addHeader(); // También asíncrono aquí
  }
  currentY += 5;

  // Calcular totales de manera similar a createQuotePDF
  const calculateTotals = () => {
    const subtotalProductos = quotedProducts.reduce(
      (sum, product) => sum + product.importe,
      0
    );
    const descuentoGeneral =
      subtotalProductos * (parseFloat(quote.descuento_general || 0) / 100);
    const gastosEnvio = parseFloat(quote.gastos_envio || 0);
    const subtotalConEnvio = subtotalProductos - descuentoGeneral + gastosEnvio;

    // IVA y total
    const iva = parseFloat(quote.iva || 0);
    const total = parseFloat(quote.total || 0);

    return {
      subtotalProductos,
      descuentoGeneral,
      gastosEnvio,
      subtotalConEnvio,
      iva,
      total,
    };
  };

  const totales = calculateTotals();

  // Verificar que currentY es un número válido
  if (isNaN(currentY) || currentY < 0) {
    console.warn("Valor Y inválido para totales, ajustando a un valor seguro");
    currentY = 50;
  }

  const anchoTabla = pageWidth - 20;

  // Asegurarnos de que el rectángulo está dentro de los límites de la página
  const rectHeight = 75; // Altura aproximada de la sección de totales
  if (currentY - 5 + rectHeight > pageHeight - 30) {
    doc.addPage();
    currentY = await addHeader();
    currentY += 10;
  }

  try {
    doc.setFillColor(248, 249, 250);
    doc.rect(10, currentY - 5, anchoTabla, rectHeight, "F");
  } catch (error) {
    console.error("Error al dibujar rectángulo de totales:", error);
    try {
      // Intentar con valores seguros
      doc.rect(10, 50, anchoTabla, rectHeight, "F");
      currentY = 55; // Actualizar currentY
    } catch (e) {
      console.error("Error fatal al dibujar rectángulo:", e);
      // Continuar sin el rectángulo
    }
  }

  // Línea superior de la tabla
  doc.setDrawColor(224, 224, 224);
  doc.line(10, currentY - 5, pageWidth - 10, currentY - 5);
  doc.setFontSize(10);

  // Subtotal de productos
  doc.setFont(undefined, "normal");
  doc.text("Subtotal:", 20, currentY + 5);
  doc.setFont(undefined, "bold");
  doc.text(
    `$${parseFloat(totales.subtotalProductos).toLocaleString("es-MX", {
      minimumFractionDigits: 2,
    })}`,
    pageWidth - 20,
    currentY + 5,
    { align: "right" }
  );

  // Descuento general
  doc.setFont(undefined, "normal");
  doc.text(`Descuento ${quote.descuento_general}%:`, 20, currentY + 15);
  doc.setFont(undefined, "bold");
  doc.text(
    `$${parseFloat(totales.descuentoGeneral).toLocaleString("es-MX", {
      minimumFractionDigits: 2,
    })}`,
    pageWidth - 20,
    currentY + 15,
    { align: "right" }
  );

  // Gastos de envío
  doc.setFont(undefined, "normal");
  doc.text("Gastos de envío:", 20, currentY + 25);
  doc.setFont(undefined, "bold");
  doc.text(
    `$${parseFloat(totales.gastosEnvio).toLocaleString("es-MX", {
      minimumFractionDigits: 2,
    })}`,
    pageWidth - 20,
    currentY + 25,
    { align: "right" }
  );

  // Subtotal con envío
  doc.setFont(undefined, "normal");
  doc.text("Subtotal con envío:", 20, currentY + 35);
  doc.setFont(undefined, "bold");
  doc.text(
    `$${parseFloat(totales.subtotalConEnvio).toLocaleString("es-MX", {
      minimumFractionDigits: 2,
    })}`,
    pageWidth - 20,
    currentY + 35,
    { align: "right" }
  );

  // IVA
  doc.setFont(undefined, "normal");
  doc.text("IVA (16%):", 20, currentY + 45);
  doc.setFont(undefined, "bold");
  doc.text(
    `$${parseFloat(totales.iva).toLocaleString("es-MX", {
      minimumFractionDigits: 2,
    })}`,
    pageWidth - 20,
    currentY + 45,
    { align: "right" }
  );

  // Retención ISR
  doc.setFont(undefined, "normal");
  doc.text("Retención ISR (0.0125%):", 20, currentY + 55);
  doc.setFont(undefined, "bold");
  doc.text(
    `$${parseFloat(quote?.isr_ret || 0).toLocaleString("es-MX", {
      minimumFractionDigits: 2,
    })}`,
    pageWidth - 20,
    currentY + 55,
    { align: "right" }
  );

  // Total con fondo destacado
  doc.setFont(undefined, "bold");
  doc.setFontSize(11);
  doc.text("TOTAL:", 20, currentY + 65);
  doc.setTextColor(0, 100, 0);
  doc.text(
    `$${parseFloat(totales.total).toLocaleString("es-MX", {
      minimumFractionDigits: 2,
    })}`,
    pageWidth - 20,
    currentY + 65,
    { align: "right" }
  );
  doc.setTextColor(0, 0, 0);

  // Líneas divisorias
  doc.setDrawColor(224, 224, 224);
  doc.line(10, currentY - 5 + 15, pageWidth - 10, currentY - 5 + 15); // Línea después del subtotal
  doc.line(10, currentY - 5 + 25, pageWidth - 10, currentY - 5 + 25); // Línea después del descuento
  doc.line(10, currentY - 5 + 35, pageWidth - 10, currentY - 5 + 35); // Línea después de gastos de envío
  doc.line(10, currentY - 5 + 45, pageWidth - 10, currentY - 5 + 45); // Línea después del subtotal con envío
  doc.line(10, currentY - 5 + 55, pageWidth - 10, currentY - 5 + 55); // Línea después del IVA
  doc.line(10, currentY - 5 + 65, pageWidth - 10, currentY - 5 + 65); // Línea final
  doc.line(10, currentY - 5 + 75, pageWidth - 10, currentY - 5 + 75); // Línea final

  // Pie de página en la última página
  addAllFooters();

  return doc;
};
