import pytest
from decimal import Decimal
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from app.main import app
from app.services.inventario import get_stock_producto

client = TestClient(app)

def test_flujo_completo_compra_con_datos_originales(db: Session):
    """
    Test para verificar que el flujo completo de compra funciona correctamente
    con el almacenamiento y recuperación de datos originales
    """
    # 1. Crear una compra con precio sin IVA y costo de envío
    compra_data = {
        "empleado_id": 1,
        "tipo_movimiento": "entrada",
        "observaciones": "",
        "estado": "completado",
        "almacen_id": 1,
        "fecha_recepcion": None,
        "numero_factura": "FACT-001",
        "fecha_factura": None,
        "fecha_pago": None,
        "metodo_pago": "efectivo",
        "costo_envio": 100.00,  # $100 de envío
        "proveedor_id": None,
        "productos_comprados": [
            {
                "producto_id": 13,
                "cantidad": 1,
                "precio_unitario": 100.00,  # $100 sin IVA
                "incluye_iva": False  # Sin IVA incluido
            }
        ]
    }
    
    # Crear la compra
    response = client.post("/api/v1/movimientos/entradas/compras/compra", json=compra_data)
    assert response.status_code == 201
    compra_id = response.json()["id"]
    
    # Verificar que se almacenaron los datos originales
    compra_creada = response.json()
    producto_comprado = compra_creada["productos_comprados"][0]
    
    # Verificar datos originales
    assert producto_comprado["precio_unitario_original"] == Decimal("100.00")
    assert producto_comprado["incluye_iva_original"] == False
    
    # Verificar costo unitario calculado (100 * 1.16 + 100 = 216)
    assert producto_comprado["costo_unitario"] == Decimal("216.00")
    
    # 2. Obtener la compra para verificar que se devuelven los datos originales
    response = client.get(f"/api/v1/movimientos/entradas/compras/compra/{compra_id}")
    assert response.status_code == 200
    
    compra_obtenida = response.json()
    producto_obtenido = compra_obtenida["productos_comprados"][0]
    
    # Verificar que se devuelven los datos originales
    assert producto_obtenido["precio_unitario_original"] == Decimal("100.00")
    assert producto_obtenido["incluye_iva_original"] == False
    assert producto_obtenido["costo_unitario"] == Decimal("216.00")
    
    # 3. Actualizar la compra usando los datos originales
    update_data = {
        "compra_data": {
            "numero_factura": "FACT-002"
        },
        "productos_comprados": [
            {
                "producto_id": 13,
                "cantidad": 1,
                "precio_unitario": 100.00,  # Mismo precio original
                "incluye_iva": False  # Mismo valor original
            }
        ]
    }
    
    # Actualizar la compra
    response = client.put(f"/api/v1/movimientos/entradas/compras/compra/{compra_id}", json=update_data)
    assert response.status_code == 200
    
    # Verificar que el número de factura se actualizó
    compra_actualizada = response.json()
    assert compra_actualizada["numero_factura"] == "FACT-002"
    
    # Verificar que los datos originales se mantuvieron
    producto_actualizado = compra_actualizada["productos_comprados"][0]
    assert producto_actualizado["precio_unitario_original"] == Decimal("100.00")
    assert producto_actualizado["incluye_iva_original"] == False
    assert producto_actualizado["costo_unitario"] == Decimal("216.00")
    
    # 4. Verificar que no se generó stock fantasma
    stock_final = get_stock_producto(db, 13)
    cantidad_final = stock_final["existencias_totales"]
    
    # Debería tener solo 1 producto (no se duplicó)
    assert cantidad_final == 1, f"El stock debería ser 1, pero es {cantidad_final}"

def test_actualizar_compra_cambiando_precio_original(db: Session):
    """
    Test para verificar que se puede actualizar una compra cambiando
    el precio original y que se recalcula correctamente
    """
    # 1. Crear una compra inicial
    compra_data = {
        "empleado_id": 1,
        "tipo_movimiento": "entrada",
        "observaciones": "",
        "estado": "completado",
        "almacen_id": 1,
        "fecha_recepcion": None,
        "numero_factura": "FACT-001",
        "fecha_factura": None,
        "fecha_pago": None,
        "metodo_pago": "efectivo",
        "costo_envio": 50.00,  # $50 de envío
        "proveedor_id": None,
        "productos_comprados": [
            {
                "producto_id": 13,
                "cantidad": 1,
                "precio_unitario": 100.00,  # $100 sin IVA
                "incluye_iva": False
            }
        ]
    }
    
    # Crear la compra
    response = client.post("/api/v1/movimientos/entradas/compras/compra", json=compra_data)
    assert response.status_code == 201
    compra_id = response.json()["id"]
    
    # Obtener stock inicial
    stock_inicial = get_stock_producto(db, 13)
    cantidad_inicial = stock_inicial["existencias_totales"]
    
    # 2. Actualizar la compra cambiando el precio original
    update_data = {
        "compra_data": {
            "numero_factura": "FACT-002"
        },
        "productos_comprados": [
            {
                "producto_id": 13,
                "cantidad": 1,
                "precio_unitario": 200.00,  # Cambiamos a $200 sin IVA
                "incluye_iva": False
            }
        ]
    }
    
    # Actualizar la compra
    response = client.put(f"/api/v1/movimientos/entradas/compras/compra/{compra_id}", json=update_data)
    assert response.status_code == 200
    
    # Verificar que se actualizaron los datos originales
    compra_actualizada = response.json()
    producto_actualizado = compra_actualizada["productos_comprados"][0]
    
    # Verificar datos originales actualizados
    assert producto_actualizado["precio_unitario_original"] == Decimal("200.00")
    assert producto_actualizado["incluye_iva_original"] == False
    
    # Verificar costo unitario recalculado (200 * 1.16 + 50 = 282)
    assert producto_actualizado["costo_unitario"] == Decimal("282.00")
    
    # Verificar que el inventario se actualizó correctamente
    stock_final = get_stock_producto(db, 13)
    cantidad_final = stock_final["existencias_totales"]
    
    # Debería seguir siendo 1 (no se duplicó)
    assert cantidad_final == 1, f"El stock debería ser 1, pero es {cantidad_final}" 