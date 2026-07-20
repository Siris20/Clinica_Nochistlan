from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.core.config import settings
from app.api.v1.empleados.routes import router as empleado_router
from app.api.v1.usuarios.routes import router as usuario_router
from app.api.v1.auth.routes import router as auth_router
from app.api.v1.empresas.routes import router as empresa_router
from app.api.v1.sucursales.routes import router as sucursal_router
from app.api.v1.areas.routes import router as area_router
from app.api.v1.almacenes.routes import router as almacen_router
from app.api.v1.departamentos_productos.routes import router as departamento_producto_router
from app.api.v1.categorias_productos.routes import router as categoria_producto_router
from app.api.v1.subcategorias_productos.routes import router as subcategoria_producto_router
from app.api.v1.productos.routes import router as producto_router
from app.api.v1.clientes.routes import router as cliente_router
from app.api.v1.emisores.routes import router as emisor_router
from app.api.v1.logos.routes import router as logo_router
from app.api.v1.cotizaciones.routes import router as cotizacion_router
from app.api.v1.conceptos_sat.routes import router as concepto_sat_router
from app.api.v1.analytics.routes import router as analytics_router
from app.api.v1.movimientos.entradas.compras.routes import router as compra_inventario_router
from app.api.v1.movimientos.entradas.stock.routes import router as stock_router
from app.api.v1.movimientos.salidas.ventas.routes import router as venta_inventario_router
from app.api.v1.proveedores.routes import router as proveedor_router
from app.api.v1.utilidades.routes import router as utilidades_router
from app.api.v1.citas.routes import router as citas_router

from fastapi.openapi.utils import get_openapi
from pathlib import Path

UPLOAD_DIR = Path("static/uploads")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

def get_application():
    _app = FastAPI(
        title=settings.PROJECT_NAME,
        description=settings.DESCRIPTION,
        version=settings.VERSION
    )

    
    def custom_openapi():
        if _app.openapi_schema:
            return _app.openapi_schema
            
        openapi_schema = get_openapi(
            title=settings.PROJECT_NAME,
            version=settings.VERSION,
            description=settings.DESCRIPTION,
            routes=_app.routes,
        )
        
        
        openapi_schema["components"]["securitySchemes"] = {
            "bearerAuth": {  
                "type": "http",
                "scheme": "bearer",
                "bearerFormat": "JWT",
            }
        }
        
       
        openapi_schema["security"] = [{"bearerAuth": []}]
        
        _app.openapi_schema = openapi_schema
        return _app.openapi_schema

    
    _app.openapi = custom_openapi
    
    
    if settings.BACKEND_CORS_ORIGINS:
        _app.add_middleware(
            CORSMiddleware,
            allow_origins=[str(origin) for origin in settings.BACKEND_CORS_ORIGINS],
            allow_credentials=True,
            allow_methods=["*"],
            allow_headers=["*"],
        )

    _app.mount("/static", StaticFiles(directory="static"), name="static")
    
    
    @_app.get("/", tags=["root"])
    def read_root():
        return {
            "mensaje": f"Bienvenido a la API de {settings.PROJECT_NAME}",
            "descripción": settings.DESCRIPTION,
            "versión": settings.VERSION,
            "entorno": settings.ENVIRONMENT,
            "debug": settings.DEBUG
        }

    
    
    _app.include_router(empresa_router, prefix=settings.API_V1_STR, tags=["empresas"])
    _app.include_router(sucursal_router, prefix=settings.API_V1_STR, tags=["sucursales"])
    _app.include_router(almacen_router, prefix=settings.API_V1_STR, tags=["almacenes"])
    _app.include_router(departamento_producto_router, prefix=settings.API_V1_STR, tags=["departamentos de productos"])
    _app.include_router(categoria_producto_router, prefix=settings.API_V1_STR, tags=["categorias de productos"])
    _app.include_router(subcategoria_producto_router, prefix=settings.API_V1_STR, tags=["subcategorias de productos"])
    _app.include_router(producto_router, prefix=settings.API_V1_STR, tags=["productos"])
    _app.include_router(concepto_sat_router, prefix=settings.API_V1_STR, tags=["conceptos SAT"])
    _app.include_router(cliente_router, prefix=settings.API_V1_STR, tags=["clientes"])
    _app.include_router(emisor_router, prefix=settings.API_V1_STR, tags=["emisores"])
    _app.include_router(logo_router, prefix=settings.API_V1_STR, tags=["logos"])
    _app.include_router(cotizacion_router, prefix=settings.API_V1_STR, tags=["cotizaciones"])
    _app.include_router(area_router, prefix=settings.API_V1_STR, tags=["areas"])
    _app.include_router(empleado_router, prefix=settings.API_V1_STR, tags=["empleados"])
    _app.include_router(usuario_router, prefix=settings.API_V1_STR, tags=["usuarios"])
    _app.include_router(auth_router, prefix=settings.API_V1_STR, tags=["auth"])
    _app.include_router(analytics_router, prefix=settings.API_V1_STR, tags=["Estadísticas"])
    _app.include_router(compra_inventario_router, prefix=settings.API_V1_STR, tags=["Compras"])
    _app.include_router(venta_inventario_router, prefix=settings.API_V1_STR, tags=["Ventas"])
    _app.include_router(stock_router, prefix=settings.API_V1_STR, tags=["Stock"])
    _app.include_router(proveedor_router, prefix=settings.API_V1_STR, tags=["proveedores"])
    _app.include_router(utilidades_router, prefix=settings.API_V1_STR, tags=["utilidades"])
    _app.include_router(citas_router, prefix=settings.API_V1_STR, tags=["Citas"])
    
    return _app

app = get_application()

# comntario de prueba