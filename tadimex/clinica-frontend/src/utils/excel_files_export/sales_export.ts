import { toast } from 'react-toastify';
import * as XLSX from 'xlsx-js-style';

export const createSaleExcel = async (
  sale: any,
  handleGetProduct: any,
  selectedBranch?: any,
  branches?: any[],
  selectedEnterprise?: any,
  enterprises?: any[],
  customFileName?: string
) => {
  try {
    if (!sale || !sale.productos_vendidos || sale.productos_vendidos.length === 0) {
      toast.error("No hay productos para exportar");
      return false;
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

    // Calcular totales
    const totales = {
      subtotalProductos: soldProducts.reduce((acc, prod) => acc + prod.importe, 0),
      costoEnvio: parseFloat(sale.costo_envio || "0"),
      total: parseFloat(sale.total || "0"),
      utilidadTotal: soldProducts.reduce((acc, prod) => acc + prod.utilidad_total, 0),
    };

    // Preparar datos para Excel con estilos
    let styledData: any[] = [];
    const numColumns = 8; // Modelo, Concepto, Marca, Cantidad, P.Unitario, Importe, Utilidad, Margen%

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
    const subtitleRow = Array(numColumns).fill(null);
    subtitleRow[0] = {
      v: "Comprobante de Venta",
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

    // Fila 4: ID de venta
    const idRow = Array(numColumns).fill(null);
    idRow[0] = {
      v: `ID de Venta: ${sale.id}`,
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
      ['Tipo de Movimiento', sale.tipo_movimiento?.toUpperCase() || "SALIDA"],
      ['Fecha de Movimiento', sale.fecha_movimiento ? new Date(sale.fecha_movimiento).toLocaleDateString('es-ES') : "No especificada"],
      ['Fecha de Salida', sale.fecha_salida ? new Date(sale.fecha_salida).toLocaleDateString('es-ES') : "No especificada"],
      ['Observaciones', sale.observaciones || "Sin observaciones"],
      ['Estado', sale.estado?.toUpperCase() || "COMPLETADO"],
      ['Empleado', sale.empleado_nombre || "No especificado"],
      ['Tipo de Salida', sale.tipo_salida?.toUpperCase() || "VENTA"],
      ['Cliente', sale.cliente_nombre || "Sin cliente"],
      ['Número de Factura', sale.numero_factura || "Sin factura"],
      ['Fecha de Factura', sale.fecha_factura ? new Date(sale.fecha_factura).toLocaleDateString('es-ES') : "No especificada"],
      ['Fecha de Pago', sale.fecha_pago ? new Date(sale.fecha_pago).toLocaleDateString('es-ES') : "No especificada"],
      ['Método de Pago', sale.metodo_pago?.toUpperCase() || "NO ESPECIFICADO"],
      ['Costo de Envío', `$${parseFloat(sale.costo_envio || "0").toFixed(2)}`],
      ['Cotización ID', sale.cotizacion_id || "Sin cotización"],
      ['Fecha de Creación', sale.created_at ? new Date(sale.created_at).toLocaleDateString('es-ES') : "No especificada"],
      ['Última Actualización', sale.updated_at ? new Date(sale.updated_at).toLocaleDateString('es-ES') : "No especificada"]
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

    // ========== PRODUCTOS VENDIDOS ==========
    // Fila vacía
    styledData.push(Array(numColumns).fill(null));

    // Título productos
    const productsTitleRow = Array(numColumns).fill(null);
    productsTitleRow[0] = {
      v: 'PRODUCTOS VENDIDOS',
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
    styledData.push(productsTitleRow);

    // Encabezados de productos con estilo
    const headers = ['Modelo', 'Concepto', 'Marca', 'Cantidad', 'P. Compra Unitario', 'P. Venta Unitario', 'P.Venta Unitario + IVA', 'Importe', 'Utilidad Unitaria', 'Margen%'];
    
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
    soldProducts.forEach((producto, prodIndex) => {
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
              bottom: prodIndex === soldProducts.length - 1 ? { style: "medium", color: { rgb: "000000" } } : { style: "thin", color: { rgb: "CCCCCC" } }
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
              bottom: prodIndex === soldProducts.length - 1 ? { style: "medium", color: { rgb: "000000" } } : { style: "thin", color: { rgb: "CCCCCC" } }
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
              bottom: prodIndex === soldProducts.length - 1 ? { style: "medium", color: { rgb: "000000" } } : { style: "thin", color: { rgb: "CCCCCC" } }
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
              bottom: prodIndex === soldProducts.length - 1 ? { style: "medium", color: { rgb: "000000" } } : { style: "thin", color: { rgb: "CCCCCC" } }
            }
          }
        },
        {
          v: producto.precio_compra_unitario || 0,
          t: 'n',
          s: {
            alignment: { horizontal: "right", vertical: "center" },
            numFmt: '$#,##0.00',
            border: { 
              top: { style: "thin", color: { rgb: "CCCCCC" } },
              left: { style: "thin", color: { rgb: "CCCCCC" } },
              right: { style: "thin", color: { rgb: "CCCCCC" } },
              bottom: prodIndex === soldProducts.length - 1 ? { style: "medium", color: { rgb: "000000" } } : { style: "thin", color: { rgb: "CCCCCC" } }
            }
          }
        },
        {
          v: producto.precio_unitario_original || 0,
          t: 'n',
          s: {
            alignment: { horizontal: "right", vertical: "center" },
            numFmt: '$#,##0.00',
            border: { 
              top: { style: "thin", color: { rgb: "CCCCCC" } },
              left: { style: "thin", color: { rgb: "CCCCCC" } },
              right: { style: "thin", color: { rgb: "CCCCCC" } },
              bottom: prodIndex === soldProducts.length - 1 ? { style: "medium", color: { rgb: "000000" } } : { style: "thin", color: { rgb: "CCCCCC" } }
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
              bottom: prodIndex === soldProducts.length - 1 ? { style: "medium", color: { rgb: "000000" } } : { style: "thin", color: { rgb: "CCCCCC" } }
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
              right: { style: "thin", color: { rgb: "CCCCCC" } },
              bottom: prodIndex === soldProducts.length - 1 ? { style: "medium", color: { rgb: "000000" } } : { style: "thin", color: { rgb: "CCCCCC" } }
            }
          }
        },
        {
          v: producto.utilidad_unitaria,
          t: 'n',
          s: {
            alignment: { horizontal: "right", vertical: "center" },
            numFmt: '$#,##0.00',
            border: { 
              top: { style: "thin", color: { rgb: "CCCCCC" } },
              left: { style: "thin", color: { rgb: "CCCCCC" } },
              right: { style: "thin", color: { rgb: "CCCCCC" } },
              bottom: prodIndex === soldProducts.length - 1 ? { style: "medium", color: { rgb: "000000" } } : { style: "thin", color: { rgb: "CCCCCC" } }
            }
          }
        },
        {
          v: producto.margen_porcentaje / 100, 
          t: 'n',
          s: {
            alignment: { horizontal: "right", vertical: "center" },
            numFmt: '0.00%',
            border: { 
              top: { style: "thin", color: { rgb: "CCCCCC" } },
              left: { style: "thin", color: { rgb: "CCCCCC" } },
              right: { style: "medium", color: { rgb: "000000" } },
              bottom: prodIndex === soldProducts.length - 1 ? { style: "medium", color: { rgb: "000000" } } : { style: "thin", color: { rgb: "CCCCCC" } }
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
        fill: { fgColor: { rgb: "dc3545" } },
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
      ['Total de la Venta', totales.total],
      ['Utilidad Total', totales.utilidadTotal]
    ];

    totalsData.forEach((total, index) => {
      const totalRow = Array(numColumns).fill(null);
      totalRow[0] = {
        v: total[0],
        t: 's',
        s: {
          font: { bold: true },
          fill: { fgColor: { rgb: "FFE8E8" } },
          alignment: { horizontal: "left", vertical: "center" },
          border: { 
            left: { style: "medium", color: { rgb: "000000" } },
            right: { style: "thin", color: { rgb: "dc3545" } },
            top: { style: "thin", color: { rgb: "dc3545" } },
            bottom: index === totalsData.length - 1 ? { style: "medium", color: { rgb: "000000" } } : { style: "thin", color: { rgb: "dc3545" } }
          }
        }
      };
      
      totalRow[1] = {
        v: total[1],
        t: 'n',
        s: {
          font: { bold: true },
          fill: { fgColor: { rgb: "FFF0F0" } },
          alignment: { horizontal: "right", vertical: "center" },
          border: { 
            right: { style: "medium", color: { rgb: "000000" } },
            left: { style: "thin", color: { rgb: "dc3545" } },
            top: { style: "thin", color: { rgb: "dc3545" } },
            bottom: index === totalsData.length - 1 ? { style: "medium", color: { rgb: "000000" } } : { style: "thin", color: { rgb: "dc3545" } }
          }
        }
      };
      styledData.push(totalRow);
    });

    // ========== CREAR HOJA ==========
    const ws = XLSX.utils.aoa_to_sheet(styledData);

    // Ajustar ancho de columnas
    ws['!cols'] = [
      { wch: 12 },  // Modelo
      { wch: 40 },  // Concepto
      { wch: 15 },  // Marca
      { wch: 12 },  // Cantidad
      { wch: 16 },  // P.Unitario
      { wch: 16 },  // Importe
      { wch: 16 },  // Utilidad
      { wch: 12 },  // Margen%
    ];

    // Ajustar altura de filas
    ws['!rows'] = [
      { hpt: 30 }, // Altura del título
      { hpt: 25 }, // Altura del subtítulo
      { hpt: 20 }, // Altura ID venta
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
      fileName = `Venta_${sale.id}_${sale.fecha_factura ? new Date(sale.fecha_factura).toLocaleDateString('es-ES').replace(/\//g, '-') : today}_descarga_${new Date().toLocaleDateString('es-ES').replace(/\//g, '-')}.xlsx`;
    }

    // Crear libro y descargar
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, ws, 'Comprobante de Venta');
    XLSX.writeFile(workbook, fileName);

    toast.success("Archivo Excel generado exitosamente");
    return true;
    
  } catch (error) {
    console.error('Error al crear el archivo Excel:', error);
    toast.error("Error al crear el archivo Excel");
    return false;
  }
};
