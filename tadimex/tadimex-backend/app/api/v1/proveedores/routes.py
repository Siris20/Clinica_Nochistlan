from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.db.mariadb import get_db
from app.schemas.proveedor import (
    ProveedorCreateSchema,
    ProveedorUpdateSchema,
    ProveedorReadSchema,
    ProveedorListSchema,
)
from app.services.proveedor import (
    create_proveedor,
    get_proveedor,
    get_all_proveedores,
    get_proveedores_by_empresa,
    update_proveedor,
    delete_proveedor,
    get_proveedor_by_nombre,
    toggle_proveedor_active,
    get_proveedores_list_by_empresa,
    get_all_proveedores_list,
)

router = APIRouter()

@router.post("/proveedor", response_model=ProveedorReadSchema)
def crear_proveedor(
    proveedor_data: ProveedorCreateSchema,
    db: Session = Depends(get_db)
):
    """
    Crea un nuevo proveedor.
    """
    return create_proveedor(db, proveedor_data)

@router.get("/proveedor/{proveedor_id}", response_model=ProveedorReadSchema)
def obtener_proveedor(
    proveedor_id: int,
    include_inactive: bool = Query(default=False, description="Incluir proveedores inactivos"),
    db: Session = Depends(get_db)
):
    """
    Obtiene un proveedor específico por su ID.
    """
    return get_proveedor(db, proveedor_id, include_inactive)

@router.get("/proveedores", response_model=List[ProveedorReadSchema])
def obtener_proveedores(
    skip: int = Query(default=0, ge=0, description="Número de registros a saltar"),
    limit: int = Query(default=100, ge=1, description="Número máximo de registros a retornar"),
    include_inactive: bool = Query(default=False, description="Incluir proveedores inactivos"),
    db: Session = Depends(get_db)
):
    """
    Obtiene todos los proveedores con paginación.
    """
    return get_all_proveedores(db, skip, limit, include_inactive)

@router.get("/proveedores/empresa/{empresa_id}", response_model=List[ProveedorReadSchema])
def obtener_proveedores_por_empresa(
    empresa_id: int,
    skip: int = Query(default=0, ge=0, description="Número de registros a saltar"),
    limit: int = Query(default=100, ge=1, description="Número máximo de registros a retornar"),
    include_inactive: bool = Query(default=False, description="Incluir proveedores inactivos"),
    db: Session = Depends(get_db)
):
    """
    Obtiene todos los proveedores de una empresa específica.
    """
    return get_proveedores_by_empresa(db, empresa_id, skip, limit, include_inactive)

@router.get("/proveedores/buscar", response_model=List[ProveedorReadSchema])
def buscar_proveedores_por_nombre(
    nombre: str = Query(..., description="Nombre del proveedor a buscar"),
    empresa_id: Optional[int] = Query(None, description="ID de la empresa para filtrar (opcional)"),
    include_inactive: bool = Query(default=False, description="Incluir proveedores inactivos"),
    db: Session = Depends(get_db)
):
    """
    Busca proveedores por nombre (búsqueda parcial).
    """
    return get_proveedor_by_nombre(db, nombre, empresa_id, include_inactive)

@router.put("/proveedor/{proveedor_id}", response_model=ProveedorReadSchema)
def actualizar_proveedor(
    proveedor_id: int,
    proveedor_data: ProveedorUpdateSchema,
    db: Session = Depends(get_db)
):
    """
    Actualiza los datos de un proveedor específico.
    """
    return update_proveedor(db, proveedor_id, proveedor_data)

@router.patch("/proveedor/{proveedor_id}/toggle", response_model=ProveedorReadSchema)
def activar_desactivar_proveedor(
    proveedor_id: int,
    db: Session = Depends(get_db)
):
    """
    Activa o desactiva un proveedor específico.
    """
    return toggle_proveedor_active(db, proveedor_id)

@router.delete("/proveedor/{proveedor_id}")
def eliminar_proveedor(
    proveedor_id: int,
    db: Session = Depends(get_db)
):
    """
    Elimina un proveedor específico.
    Nota: No se puede eliminar si tiene entradas de compra asociadas.
    """
    return delete_proveedor(db, proveedor_id)
