import { toast } from 'react-toastify';
import * as XLSX from 'xlsx-js-style';

export const createUtilitiesExcel = (
  utilities: any,
  selectedStorage: string,
  selectedClient: string,
  filteredStorage: any[],
  clients: any[],
  startDate?: string | null,
  endDate?: string | null,
  selectedBranch?: any,
  branches?: any[],
  selectedEnterprise?: any,  // ✅ AGREGAMOS selectedEnterprise
  enterprises?: any[]        // ✅ AGREGAMOS la lista de empresas
) => {
  try {
    if (!utilities || !utilities.productos || utilities.productos.length === 0) {
      toast.error("No hay datos para exportar");
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

    // Preparar datos para Excel con estilos
    let styledData: any[] = [];
    const numColumns = 9; // ID, Producto, P.Compra, P.Venta, Cantidad, Importe, Utilidad, Margen, Cliente

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
    let tituloReporte = 'Reporte de Utilidades';
    if (selectedClient !== "todos") {
      const clienteData = clients.find(c => c.id.toString() === selectedClient);
      tituloReporte += ` - ${clienteData?.nombre || 'Cliente Seleccionado'}`;
    } else {
      tituloReporte += ' - General';
    }

    const subtitleRow = Array(numColumns).fill(null);
    subtitleRow[0] = {
      v: tituloReporte,
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

    // Fila 4: Fecha de descarga
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
          bottom: { style: "thin", color: { rgb: "CCCCCC" } }
        }
      }
    };
    styledData.push(fechaDescargaRow);

    // Fila 5: Fecha de consulta (solo si hay fechas)
    if (startDate && endDate) {
      const fechaInicioFormato = new Date(startDate).toLocaleDateString('es-ES');
      const fechaFinFormato = new Date(endDate).toLocaleDateString('es-ES');
      
      const fechaConsultaRow = Array(numColumns).fill(null);
      fechaConsultaRow[0] = {
        v: `Fecha de consulta: ${fechaInicioFormato} - ${fechaFinFormato}`,
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
      styledData.push(fechaConsultaRow);
    }

    // ========== ENCABEZADOS ==========
    const headers = ['ID', 'Producto', 'P. Compra Promedio', 'P. Venta Promedio', 'Cantidad Comprada', 'Importe', 'Utilidad Total', 'Margen Promedio %', 'Cliente'];
    const headerRow = headers.map((header, index) => {
      let borderStyle = {
        top: { style: "thin", color: { rgb: "0DA7AF" } },
        bottom: { style: "thin", color: { rgb: "0DA7AF" } },
        left: { style: "thin", color: { rgb: "0DA7AF" } },
        right: { style: "thin", color: { rgb: "0DA7AF" } }
      };
      
      if (index === 0) {
        borderStyle.left = { style: "medium", color: { rgb: "000000" } };
      }
      if (index === headers.length - 1) {
        borderStyle.right = { style: "medium", color: { rgb: "000000" } };
      }
      
      return {
        v: header,
        t: 's',
        s: {
          fill: { fgColor: { rgb: "f1f1f1" } },
          font: { bold: true, color: { rgb: "000000" } },
          alignment: { horizontal: "center", vertical: "center", wrapText: true },
          border: borderStyle
        }
      };
    });
    styledData.push(headerRow);

    // ========== FILAS DE DATOS ==========
    utilitiesFiltradas.productos.forEach((producto: any, prodIndex: number) => {
      // Calcular cuántas filas ocupará este producto (1 principal + clientes)
      const numClientRows = producto.clientes ? producto.clientes.length : 0;
      const totalRows = numClientRows > 0 ? numClientRows : 1;

      // Fila principal del producto
      const mainRow = headers.map((header, colIndex) => {
        let borderStyle = {
          top: { style: "thin", color: { rgb: "0DA7AF" } },
          bottom: numClientRows > 0 ? { style: "thin", color: { rgb: "CCCCCC" } } : { style: "thin", color: { rgb: "0DA7AF" } },
          left: { style: "thin", color: { rgb: "0DA7AF" } },
          right: { style: "thin", color: { rgb: "0DA7AF" } }
        };
        
        if (colIndex === 0) {
          borderStyle.left = { style: "medium", color: { rgb: "000000" } };
        }
        if (colIndex === headers.length - 1) {
          borderStyle.right = { style: "medium", color: { rgb: "000000" } };
        }

        let cellValue = '';
        let cellStyle = {
          border: borderStyle,
          alignment: { horizontal: "left", vertical: "center" }
        };

        switch (colIndex) {
          case 0: // ID
            cellValue = producto.producto_id;
            cellStyle.alignment.horizontal = "center";
            break;
          case 1: // Producto
            cellValue = producto.producto_nombre;
            break;
          case 2: // P. Compra
            cellValue = parseFloat(producto.precio_compra_promedio || "0");
            cellStyle.alignment.horizontal = "right";
            break;
          case 3: // P. Venta
            cellValue = parseFloat(producto.precio_venta_promedio || "0");
            cellStyle.alignment.horizontal = "right";
            break;
          case 4: // Cantidad
            cellValue = producto.cantidad_vendida_total;
            cellStyle.alignment.horizontal = "center";
            break;
          case 5: // Importe
            cellValue = parseFloat(producto.precio_venta_promedio || "0") * producto.cantidad_vendida_total;
            cellStyle.alignment.horizontal = "right";
            break;
          case 6: // Utilidad
            cellValue = parseFloat(producto.utilidad_total || "0");
            cellStyle.alignment.horizontal = "right";
            if (cellValue < 0) {
              cellStyle.font = { color: { rgb: "FF0000" } };
            } else {
              cellStyle.font = { color: { rgb: "008000" } };
            }
            break;
          case 7: // Margen
            cellValue = `${parseFloat(producto.margen_promedio || "0").toFixed(2)}%`;
            cellStyle.alignment.horizontal = "right";
            if (parseFloat(producto.margen_promedio || "0") < 0) {
              cellStyle.font = { color: { rgb: "FF0000" } };
            }
            break;
          case 8: // Cliente (vacío en fila principal)
            cellValue = '';
            break;
        }

        return {
          v: cellValue,
          t: typeof cellValue === 'number' ? 'n' : 's',
          s: cellStyle
        };
      });
      styledData.push(mainRow);

      // Filas de clientes
      if (producto.clientes && producto.clientes.length > 0) {
        producto.clientes.forEach((cliente: any, clientIndex: number) => {
          const clientRow = headers.map((header, colIndex) => {
            let borderStyle = {
              top: { style: "thin", color: { rgb: "CCCCCC" } },
              bottom: clientIndex === producto.clientes.length - 1 ? { style: "thin", color: { rgb: "0DA7AF" } } : { style: "thin", color: { rgb: "CCCCCC" } },
              left: { style: "thin", color: { rgb: "0DA7AF" } },
              right: { style: "thin", color: { rgb: "0DA7AF" } }
            };
            
            if (colIndex === 0) {
              borderStyle.left = { style: "medium", color: { rgb: "000000" } };
            }
            if (colIndex === headers.length - 1) {
              borderStyle.right = { style: "medium", color: { rgb: "000000" } };
            }

            let cellValue = '';
            let cellStyle = {
              border: borderStyle,
              alignment: { horizontal: "left", vertical: "center" },
              fill: { fgColor: { rgb: "F9F9F9" } }
            };

            if (colIndex === 8) { // Columna Cliente
              cellValue = `${cliente.cliente_nombre}\nCantidad: ${cliente.cantidad_comprada}`;
              cellStyle.alignment = { horizontal: "left", vertical: "center", wrapText: true };
            }

            return {
              v: cellValue,
              t: 's',
              s: cellStyle
            };
          });
          styledData.push(clientRow);
        });
      }
    });

    // ========== RESUMEN ==========
    if (utilities.resumen) {
      // Fila vacía
      styledData.push(Array(numColumns).fill(null));
      
      // Título del resumen
      const resumenTitleRow = Array(numColumns).fill(null);
      resumenTitleRow[0] = {
        v: 'RESUMEN GENERAL',
        t: 's',
        s: {
          font: { sz: 14, bold: true, color: { rgb: "FFFFFF" } },
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
      styledData.push(resumenTitleRow);

      // Métricas del resumen
      const metrics = [
        ['Número de Ventas totales', utilities.resumen.numero_ventas_total || 0],
        ['Productos Vendidos', utilities.resumen.numero_productos_vendidos || 0],
        ['Valor de las ventas', parseFloat(utilities.resumen.total_ventas || "0")],
        ['Utilidad Bruta', parseFloat(utilities.resumen.total_utilidades || "0")],
        ['Margen Promedio', `${parseFloat(utilities.resumen.margen_promedio_general || "0").toFixed(2)}%`]
      ];

      metrics.forEach((metric, index) => {
        const metricRow = Array(numColumns).fill(null);
        metricRow[0] = {
          v: metric[0],
          t: 's',
          s: {
            font: { bold: true },
            fill: { fgColor: { rgb: "E7F3FF" } },
            alignment: { horizontal: "left", vertical: "center" },
            border: { 
              left: { style: "medium", color: { rgb: "000000" } },
              right: { style: "thin", color: { rgb: "4472C4" } },
              top: { style: "thin", color: { rgb: "4472C4" } },
              bottom: index === metrics.length - 1 ? { style: "medium", color: { rgb: "000000" } } : { style: "thin", color: { rgb: "4472C4" } }
            }
          }
        };
        
        metricRow[1] = {
          v: metric[1],
          t: typeof metric[1] === 'number' ? 'n' : 's',
          s: {
            font: { bold: true },
            fill: { fgColor: { rgb: "F0F8FF" } },
            alignment: { horizontal: "right", vertical: "center" },
            border: { 
              right: { style: "medium", color: { rgb: "000000" } },
              left: { style: "thin", color: { rgb: "4472C4" } },
              top: { style: "thin", color: { rgb: "4472C4" } },
              bottom: index === metrics.length - 1 ? { style: "medium", color: { rgb: "000000" } } : { style: "thin", color: { rgb: "4472C4" } }
            }
          }
        };
        styledData.push(metricRow);
      });
    }

    // ========== CREAR HOJA ==========
    const ws = XLSX.utils.aoa_to_sheet(styledData);
    
    // Combinar celdas
    ws['!merges'] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: numColumns - 1 } }, // Título empresa
      { s: { r: 1, c: 0 }, e: { r: 1, c: numColumns - 1 } }, // Subtítulo
    ];

    // Si hay resumen, combinar esas celdas también
    if (utilities.resumen) {
      const resumenStartRow = styledData.length - 6; // Ajustar según cuántas filas de resumen hay
      ws['!merges'].push({ s: { r: resumenStartRow, c: 0 }, e: { r: resumenStartRow, c: numColumns - 1 } });
      
      // Combinar celdas de métricas para que ocupen más columnas
      for (let i = 1; i <= 5; i++) {
        ws['!merges'].push({ s: { r: resumenStartRow + i, c: 2 }, e: { r: resumenStartRow + i, c: numColumns - 1 } });
      }
    }

    // Ajustar ancho de columnas
    ws['!cols'] = [
      { wch: 8 },   // ID
      { wch: 40 },  // Producto
      { wch: 16 },  // P. Compra
      { wch: 16 },  // P. Venta
      { wch: 12 },  // Cantidad
      { wch: 16 },  // Importe
      { wch: 16 },  // Utilidad
      { wch: 14 },  // Margen
      { wch: 35 }   // Cliente
    ];

    // Ajustar altura de filas
    ws['!rows'] = [
      { hpt: 30 }, // Altura del título
      { hpt: 25 }, // Altura del subtítulo
      { hpt: 40 }  // Altura de los encabezados
    ];

    // Generar nombre del archivo
    const today = new Date().toISOString().split('T')[0];
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
  }    // Debug: Log para ver los datos disponibles
    
    if (selectedClient !== "todos") {
      // Buscar primero en el array de clients
      let clienteData = clients.find(c => c.id.toString() === selectedClient);
      
      // Si no se encuentra en clients, buscar en los datos de utilidades usando el cliente_id de filtros
      if (!clienteData && utilitiesFiltradas.filtros_aplicados?.cliente_id) {
        // Buscar en los clientes que vienen en los productos
        for (const producto of utilitiesFiltradas.productos) {
          if (producto.clientes && producto.clientes.length > 0) {
            const clienteEncontrado = producto.clientes.find((c: any) => 
              c.cliente_id === utilitiesFiltradas.filtros_aplicados.cliente_id
            );
            if (clienteEncontrado) {
              clienteData = { 
                nombre_fiscal: clienteEncontrado.cliente_nombre,
                nombre: clienteEncontrado.cliente_nombre 
              };
              break;
            }
          }
        }
      }
      
      // Usar nombre_fiscal si existe, si no usar nombre
      const clienteName = (clienteData?.nombre_fiscal || clienteData?.nombre || "Cliente_Filtrado")
        .replace(/[^a-zA-Z0-9\s]/g, '')
        .replace(/\s+/g, '_');
      fileName += `${clienteName}_`;
    } else {
      fileName += 'General_';
    }

    if (selectedStorage !== "todos") {
      // Buscar primero en el array de filteredStorage
      let almacenData = filteredStorage.find(s => s.id.toString() === selectedStorage);
      
      // Si no se encuentra en filteredStorage, intentar usar el almacen_id de filtros aplicados
      if (!almacenData && utilitiesFiltradas.filtros_aplicados?.almacen_id) {
        // Buscar por almacen_id en filtros aplicados
        almacenData = filteredStorage.find(s => s.id === utilitiesFiltradas.filtros_aplicados.almacen_id);
        
        // Si aún no se encuentra, usar un nombre genérico
        if (!almacenData) {
          almacenData = { 
            name: `Almacen_ID_${utilitiesFiltradas.filtros_aplicados.almacen_id}` 
          };
        }
      }
      
      const almacenName = (almacenData?.name || almacenData?.nombre || "Almacen_Filtrado")
        .replace(/[^a-zA-Z0-9\s]/g, '')
        .replace(/\s+/g, '_');
      fileName += `${almacenName}_`;
    }

    if (startDate && endDate) {
      const fechaInicio = new Date(startDate).toLocaleDateString('es-ES').replace(/\//g, '-');
      const fechaFin = new Date(endDate).toLocaleDateString('es-ES').replace(/\//g, '-');
      fileName += `consulta_${fechaInicio}_al_${fechaFin}_`;
    }

    // Agregar fecha de descarga al final
    const fechaDescarga = new Date().toLocaleDateString('es-ES').replace(/\//g, '-');
    fileName += `descarga_${fechaDescarga}.xlsx`;

    // Crear libro y descargar
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, ws, 'Reporte de Utilidades');
    XLSX.writeFile(workbook, fileName);

    toast.success("Archivo Excel generado exitosamente");
    return true;
    
  } catch (error) {
    console.error('Error al crear el archivo Excel:', error);
    toast.error("Error al crear el archivo Excel");
    return false;
  }
};