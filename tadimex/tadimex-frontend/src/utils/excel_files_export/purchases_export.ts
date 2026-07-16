import { toast } from 'react-toastify';
import * as XLSX from 'xlsx-js-style';

export const createPurchaseExcel = async (
  purchase: any,
  handleGetProduct: any,
  selectedBranch?: any,
  branches?: any[],
  selectedEnterprise?: any,
  enterprises?: any[],
  customFileName?: string
) => {
  try {
    if (!purchase || !purchase.productos_comprados || purchase.productos_comprados.length === 0) {
      toast.error("No hay productos para exportar");
      return false;
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

    // Calcular totales
    const totales = {
      subtotalProductos: purchasedProducts.reduce((acc, prod) => acc + prod.importe, 0),
      costoEnvio: parseFloat(purchase.costo_envio || "0"),
      total: parseFloat(purchase.total || "0"),
    };

    // Preparar datos para Excel con estilos
    let styledData: any[] = [];
    const numColumns = 6; // Ajustar según las columnas que necesitemos

    // ========== TÍTULOS ==========
    // Obtener el nombre de la empresa
    let nombreEmpresa = "Impulsora Izcaltia, S.A. de C.V.";
    if (selectedEnterprise && enterprises) {
      const empresaData = enterprises.find(empresa => empresa.id === selectedEnterprise);
      if (empresaData) {
        nombreEmpresa = empresaData.name;
      }
    }

    // Obtener el nombre de la sucursal
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

    // Fila 1: Título de la empresa (dinámico)
    const titleRow = Array(numColumns).fill(null);
    titleRow[0] = {
      v: nombreEmpresa,
      t: 's',
      s: {
        font: { sz: 16, bold: true, color: { rgb: "FFFFFF" } },
        fill: { fgColor: { rgb: "222B35" } },
        alignment: { horizontal: "center", vertical: "center" },
        border: { 
          top: { style: "medium", color: { rgb: "000000" } },
          left: { style: "medium", color: { rgb: "000000" } },
          right: { style: "medium", color: { rgb: "000000" } },
          bottom: { style: "medium", color: { rgb: "000000" } }
        }
      }
    };
    styledData.push(titleRow);

    // Fila 2: Nombre de la sucursal
    const sucursalRow = Array(numColumns).fill(null);
    sucursalRow[0] = {
      v: `Sucursal: ${nombreSucursal}`,
      t: 's',
      s: {
        font: { sz: 12, bold: true, color: { rgb: "FFFFFF" } },
        fill: { fgColor: { rgb: "34495E" } },
        alignment: { horizontal: "center", vertical: "center" },
        border: { 
          top: { style: "medium", color: { rgb: "000000" } },
          left: { style: "medium", color: { rgb: "000000" } },
          right: { style: "medium", color: { rgb: "000000" } },
          bottom: { style: "medium", color: { rgb: "000000" } }
        }
      }
    };
    styledData.push(sucursalRow);

    // Fila 3: Subtítulo del reporte
    // Fila 3: Subtítulo del reporte
    const subtitleRow = Array(numColumns).fill(null);
    subtitleRow[0] = {
      v: "Comprobante de Compra",
      t: 's',
      s: {
        font: { sz: 14, bold: true, color: { rgb: "000000" } },
        fill: { fgColor: { rgb: "D9D9D9" } },
        alignment: { horizontal: "center", vertical: "center" },
        border: { 
          left: { style: "medium", color: { rgb: "000000" } },
          right: { style: "medium", color: { rgb: "000000" } },
          bottom: { style: "medium", color: { rgb: "000000" } }
        }
      }
    };
    styledData.push(subtitleRow);

    // Fila 4: ID de compra
    const idRow = Array(numColumns).fill(null);
    idRow[0] = {
      v: `ID de Compra: ${purchase.id}`,
      t: 's',
      s: {
        font: { sz: 12, bold: true, color: { rgb: "000000" } },
        fill: { fgColor: { rgb: "F8F9FA" } },
        alignment: { horizontal: "center", vertical: "center" },
        border: { 
          left: { style: "medium", color: { rgb: "000000" } },
          right: { style: "medium", color: { rgb: "000000" } },
          bottom: { style: "thin", color: { rgb: "CCCCCC" } }
        }
      }
    };
    styledData.push(idRow);

    // Fila 5: Fecha de descarga
    const fechaDescargaRow = Array(numColumns).fill(null);
    fechaDescargaRow[0] = {
      v: `Fecha de descarga: ${new Date().toLocaleDateString('es-ES')}`,
      t: 's',
      s: {
        font: { sz: 10, bold: false, color: { rgb: "000000" } },
        fill: { fgColor: { rgb: "F8F9FA" } },
        alignment: { horizontal: "center", vertical: "center" },
        border: { 
          left: { style: "medium", color: { rgb: "000000" } },
          right: { style: "medium", color: { rgb: "000000" } },
          bottom: { style: "medium", color: { rgb: "000000" } }
        }
      }
    };
    styledData.push(fechaDescargaRow);

    // ========== INFORMACIÓN GENERAL ==========
    // Fila vacía
    styledData.push(Array(numColumns).fill(null));

    // Título información general
    const infoTitleRow = Array(numColumns).fill(null);
    infoTitleRow[0] = {
      v: 'INFORMACIÓN GENERAL',
      t: 's',
      s: {
        font: { sz: 12, bold: true, color: { rgb: "FFFFFF" } },
        fill: { fgColor: { rgb: "4472C4" } },
        alignment: { horizontal: "center", vertical: "center" },
        border: { 
          top: { style: "medium", color: { rgb: "000000" } },
          left: { style: "medium", color: { rgb: "000000" } },
          right: { style: "medium", color: { rgb: "000000" } },
          bottom: { style: "medium", color: { rgb: "000000" } }
        }
      }
    };
    styledData.push(infoTitleRow);

    // Información general en filas
    const infoData = [
      ['Tipo de Movimiento', purchase.tipo_movimiento?.toUpperCase() || "ENTRADA"],
      ['Fecha de Movimiento', purchase.fecha_movimiento ? new Date(purchase.fecha_movimiento).toLocaleDateString('es-ES') : "No especificada"],
      ['Fecha de Recepción', purchase.fecha_recepcion ? new Date(purchase.fecha_recepcion).toLocaleDateString('es-ES') : "No especificada"],
      ['Observaciones', purchase.observaciones || "Sin observaciones"],
      ['Estado', purchase.estado?.toUpperCase() || "COMPLETADO"],
      ['Empleado', purchase.empleado_nombre || "No especificado"],
      ['Tipo de Entrada', purchase.tipo_entrada?.toUpperCase() || "COMPRA"],
      ['Almacén', purchase.almacen_nombre || "No especificado"],
      ['Proveedor', purchase.proveedor_nombre || "Sin proveedor"],
      ['Número de Factura', purchase.numero_factura || "Sin factura"],
      ['Fecha de Factura', purchase.fecha_factura ? new Date(purchase.fecha_factura).toLocaleDateString('es-ES') : "No especificada"],
      ['Fecha de Pago', purchase.fecha_pago ? new Date(purchase.fecha_pago).toLocaleDateString('es-ES') : "No especificada"],
      ['Método de Pago', purchase.metodo_pago?.toUpperCase() || "NO ESPECIFICADO"],
      ['Costo de Envío', `$${parseFloat(purchase.costo_envio || "0").toFixed(2)}`],
      ['Fecha de Creación', purchase.created_at ? new Date(purchase.created_at).toLocaleDateString('es-ES') : "No especificada"],
      ['Última Actualización', purchase.updated_at ? new Date(purchase.updated_at).toLocaleDateString('es-ES') : "No especificada"]
    ];

    infoData.forEach((info, index) => {
      const infoRow = Array(numColumns).fill(null);
      infoRow[0] = {
        v: info[0],
        t: 's',
        s: {
          font: { bold: true },
          fill: { fgColor: { rgb: "E7F3FF" } },
          alignment: { horizontal: "left", vertical: "center" },
          border: { 
            left: { style: "medium", color: { rgb: "000000" } },
            right: { style: "thin", color: { rgb: "4472C4" } },
            top: { style: "thin", color: { rgb: "4472C4" } },
            bottom: index === infoData.length - 1 ? { style: "medium", color: { rgb: "000000" } } : { style: "thin", color: { rgb: "4472C4" } }
          }
        }
      };
      
      infoRow[1] = {
        v: info[1],
        t: 's',
        s: {
          font: { bold: false },
          fill: { fgColor: { rgb: "F0F8FF" } },
          alignment: { horizontal: "left", vertical: "center" },
          border: { 
            right: { style: "medium", color: { rgb: "000000" } },
            left: { style: "thin", color: { rgb: "4472C4" } },
            top: { style: "thin", color: { rgb: "4472C4" } },
            bottom: index === infoData.length - 1 ? { style: "medium", color: { rgb: "000000" } } : { style: "thin", color: { rgb: "4472C4" } }
          }
        }
      };
      styledData.push(infoRow);
    });

    // ========== PRODUCTOS COMPRADOS ==========
    // Fila vacía
    styledData.push(Array(numColumns).fill(null));

    // Título productos
    const productsTitleRow = Array(numColumns).fill(null);
    productsTitleRow[0] = {
      v: 'PRODUCTOS COMPRADOS',
      t: 's',
      s: {
        font: { sz: 12, bold: true, color: { rgb: "FFFFFF" } },
        fill: { fgColor: { rgb: "0DA7AF" } },
        alignment: { horizontal: "center", vertical: "center" },
        border: { 
          top: { style: "medium", color: { rgb: "000000" } },
          left: { style: "medium", color: { rgb: "000000" } },
          right: { style: "medium", color: { rgb: "000000" } },
          bottom: { style: "medium", color: { rgb: "000000" } }
        }
      }
    };
    styledData.push(productsTitleRow);

    // Encabezados de productos con estilo
    const headers = ['Modelo', 'Concepto', 'Marca', 'Cantidad', 'Costo Unitario', 'Importe'];
    
    // Crear fila de encabezados con estilo
    const headerRow = headers.map(header => ({
      v: header,
      t: 's',
      s: {
        font: { bold: true, color: { rgb: "000000" } },
        fill: { fgColor: { rgb: "E0E0E0" } }, // rgb(224,224,224)
        alignment: { horizontal: "center", vertical: "center" },
        border: { 
          top: { style: "medium", color: { rgb: "000000" } },
          left: { style: "medium", color: { rgb: "000000" } },
          right: { style: "medium", color: { rgb: "000000" } },
          bottom: { style: "medium", color: { rgb: "000000" } }
        }
      }
    }));
    styledData.push(headerRow);

    // Filas de productos con bordes
    purchasedProducts.forEach((producto, prodIndex) => {
      const productRow = [
        {
          v: producto.model || "N/A",
          t: 's',
          s: {
            alignment: { horizontal: "center", vertical: "center" },
            border: { 
              top: { style: "thin", color: { rgb: "CCCCCC" } },
              left: { style: "medium", color: { rgb: "000000" } },
              right: { style: "thin", color: { rgb: "CCCCCC" } },
              bottom: prodIndex === purchasedProducts.length - 1 ? { style: "medium", color: { rgb: "000000" } } : { style: "thin", color: { rgb: "CCCCCC" } }
            }
          }
        },
        {
          v: producto.name || "Sin concepto",
          t: 's',
          s: {
            alignment: { horizontal: "left", vertical: "center" },
            border: { 
              top: { style: "thin", color: { rgb: "CCCCCC" } },
              left: { style: "thin", color: { rgb: "CCCCCC" } },
              right: { style: "thin", color: { rgb: "CCCCCC" } },
              bottom: prodIndex === purchasedProducts.length - 1 ? { style: "medium", color: { rgb: "000000" } } : { style: "thin", color: { rgb: "CCCCCC" } }
            }
          }
        },
        {
          v: producto.brand || "Sin marca",
          t: 's',
          s: {
            alignment: { horizontal: "center", vertical: "center" },
            border: { 
              top: { style: "thin", color: { rgb: "CCCCCC" } },
              left: { style: "thin", color: { rgb: "CCCCCC" } },
              right: { style: "thin", color: { rgb: "CCCCCC" } },
              bottom: prodIndex === purchasedProducts.length - 1 ? { style: "medium", color: { rgb: "000000" } } : { style: "thin", color: { rgb: "CCCCCC" } }
            }
          }
        },
        {
          v: producto.cantidad,
          t: 'n',
          s: {
            alignment: { horizontal: "center", vertical: "center" },
            border: { 
              top: { style: "thin", color: { rgb: "CCCCCC" } },
              left: { style: "thin", color: { rgb: "CCCCCC" } },
              right: { style: "thin", color: { rgb: "CCCCCC" } },
              bottom: prodIndex === purchasedProducts.length - 1 ? { style: "medium", color: { rgb: "000000" } } : { style: "thin", color: { rgb: "CCCCCC" } }
            }
          }
        },
        {
          v: producto.costo_unitario || 0,
          t: 'n',
          s: {
            alignment: { horizontal: "right", vertical: "center" },
            numFmt: '$#,##0.00',
            border: { 
              top: { style: "thin", color: { rgb: "CCCCCC" } },
              left: { style: "thin", color: { rgb: "CCCCCC" } },
              right: { style: "thin", color: { rgb: "CCCCCC" } },
              bottom: prodIndex === purchasedProducts.length - 1 ? { style: "medium", color: { rgb: "000000" } } : { style: "thin", color: { rgb: "CCCCCC" } }
            }
          }
        },
        {
          v: producto.importe,
          t: 'n',
          s: {
            alignment: { horizontal: "right", vertical: "center" },
            numFmt: '$#,##0.00',
            border: { 
              top: { style: "thin", color: { rgb: "CCCCCC" } },
              left: { style: "thin", color: { rgb: "CCCCCC" } },
              right: { style: "medium", color: { rgb: "000000" } },
              bottom: prodIndex === purchasedProducts.length - 1 ? { style: "medium", color: { rgb: "000000" } } : { style: "thin", color: { rgb: "CCCCCC" } }
            }
          }
        }
      ];
      
      styledData.push(productRow);
    });

    // ========== TOTALES ==========
    // Fila vacía
    styledData.push(Array(numColumns).fill(null));

    // Título totales
    const totalsTitleRow = Array(numColumns).fill(null);
    totalsTitleRow[0] = {
      v: 'RESUMEN FINANCIERO',
      t: 's',
      s: {
        font: { sz: 12, bold: true, color: { rgb: "FFFFFF" } },
        fill: { fgColor: { rgb: "28a745" } },
        alignment: { horizontal: "center", vertical: "center" },
        border: { 
          top: { style: "medium", color: { rgb: "000000" } },
          left: { style: "medium", color: { rgb: "000000" } },
          right: { style: "medium", color: { rgb: "000000" } },
          bottom: { style: "medium", color: { rgb: "000000" } }
        }
      }
    };
    styledData.push(totalsTitleRow);

    // Totales
    const totalsData = [
      ['Subtotal de Productos', totales.subtotalProductos],
      ['Costo de Envío', totales.costoEnvio],
      ['Total de la Compra', totales.total]
    ];

    totalsData.forEach((total, index) => {
      const totalRow = Array(numColumns).fill(null);
      totalRow[0] = {
        v: total[0],
        t: 's',
        s: {
          font: { bold: true },
          fill: { fgColor: { rgb: "E8F5E8" } },
          alignment: { horizontal: "left", vertical: "center" },
          border: { 
            left: { style: "medium", color: { rgb: "000000" } },
            right: { style: "thin", color: { rgb: "28a745" } },
            top: { style: "thin", color: { rgb: "28a745" } },
            bottom: index === totalsData.length - 1 ? { style: "medium", color: { rgb: "000000" } } : { style: "thin", color: { rgb: "28a745" } }
          }
        }
      };
      
      totalRow[1] = {
        v: total[1],
        t: 'n',
        s: {
          font: { bold: true },
          fill: { fgColor: { rgb: "F0FFF0" } },
          alignment: { horizontal: "right", vertical: "center" },
          border: { 
            right: { style: "medium", color: { rgb: "000000" } },
            left: { style: "thin", color: { rgb: "28a745" } },
            top: { style: "thin", color: { rgb: "28a745" } },
            bottom: index === totalsData.length - 1 ? { style: "medium", color: { rgb: "000000" } } : { style: "thin", color: { rgb: "28a745" } }
          }
        }
      };
      styledData.push(totalRow);
    });

    // ========== CREAR HOJA ==========
    const ws = XLSX.utils.aoa_to_sheet(styledData);
    
    // NO combinar nada por ahora - solo crear la hoja básica
    // ws['!merges'] = [];

    // Ajustar ancho de columnas
    ws['!cols'] = [
      { wch: 12 },  // Modelo
      { wch: 40 },  // Concepto
      { wch: 15 },  // Marca
      { wch: 12 },  // Cantidad
      { wch: 16 },  // Costo Unitario
      { wch: 16 },  // Importe
    ];

    // Ajustar altura de filas
    ws['!rows'] = [
      { hpt: 30 }, // Altura del título
      { hpt: 25 }, // Altura del subtítulo
      { hpt: 20 }, // Altura ID compra
      { hpt: 20 }  // Altura fecha descarga
    ];

    // Generar nombre del archivo
    let fileName;
    if (customFileName) {
      // Si se proporciona un nombre personalizado, usarlo
      fileName = customFileName.endsWith('.xlsx') ? customFileName : `${customFileName}.xlsx`;
    } else {
      // Usar el nombre por defecto
      const today = new Date().toISOString().split('T')[0];
      fileName = `Compra_${purchase.id}_${purchase.fecha_factura ? new Date(purchase.fecha_factura).toLocaleDateString('es-ES').replace(/\//g, '-') : today}_descarga_${new Date().toLocaleDateString('es-ES').replace(/\//g, '-')}.xlsx`;
    }

    // Crear libro y descargar
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, ws, 'Comprobante de Compra');
    XLSX.writeFile(workbook, fileName);

    toast.success("Archivo Excel generado exitosamente");
    return true;
    
  } catch (error) {
    console.error('Error al crear el archivo Excel:', error);
    toast.error("Error al crear el archivo Excel");
    return false;
  }
};