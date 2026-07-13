from typing import List, Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.sql.proveedor import Proveedor
from app.models.sql.empresa import Empresa
from app.models.sql.entrada_compra import EntradaCompra
from app.schemas.proveedor import (
    ProveedorCreateSchema,
    ProveedorUpdateSchema,
    ProveedorReadSchema,
    ProveedorListSchema,
)

def create_proveedor(
    db: Session, proveedor_data: ProveedorCreateSchema
) -> ProveedorReadSchema:
    """
    Crea un nuevo proveedor en la base de datos.
    
    Args:
        db: Sesión de base de datos
        proveedor_data: Datos del proveedor a crear
        
    Returns:
        ProveedorReadSchema: Datos del proveedor creado
        
    Raises:
        HTTPException: Si la empresa no existe o hay un error en la creación
    """
    try:
        # Verificar si existe la empresa
        empresa = (
            db.query(Empresa)
            .filter(Empresa.id == proveedor_data.empresa_id)
            .first()
        )
        
        if not empresa:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Error al crear proveedor, no se encontró empresa con el ID {proveedor_data.empresa_id}"
            )

        # Crear el nuevo proveedor
        nuevo_proveedor = Proveedor()
        for key, value in proveedor_data.model_dump().items():
            setattr(nuevo_proveedor, key, value)
        
        db.add(nuevo_proveedor)
        db.commit()
        db.refresh(nuevo_proveedor)
        return ProveedorReadSchema.model_validate(nuevo_proveedor)
    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al crear el proveedor: {str(e)}",
        )

def get_proveedor(
    db: Session, proveedor_id: int, include_inactive: bool = False
) -> ProveedorReadSchema:
    """
    Obtiene un proveedor específico por su ID.
    
    Args:
        db: Sesión de base de datos
        proveedor_id: ID del proveedor a obtener
        include_inactive: Si incluir proveedores inactivos
        
    Returns:
        ProveedorReadSchema: Datos del proveedor
        
    Raises:
        HTTPException: Si el proveedor no existe o hay un error
    """
    try:
        query = db.query(Proveedor).filter(Proveedor.id == proveedor_id)
        
        if not include_inactive:
            query = query.filter(Proveedor.active == True)
            
        proveedor = query.first()
        
        if not proveedor:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Proveedor no encontrado",
            )
        return ProveedorReadSchema.model_validate(proveedor)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al obtener el proveedor: {str(e)}",
        )

def get_proveedores_by_empresa(
    db: Session, empresa_id: int, skip: int = 0, limit: int = 100, include_inactive: bool = False
) -> List[ProveedorReadSchema]:
    """
    Obtiene todos los proveedores de una empresa específica.
    
    Args:
        db: Sesión de base de datos
        empresa_id: ID de la empresa
        skip: Número de registros a omitir
        limit: Número máximo de registros a retornar
        include_inactive: Si incluir proveedores inactivos
        
    Returns:
        List[ProveedorReadSchema]: Lista de proveedores de la empresa
        
    Raises:
        HTTPException: Si hay un error al obtener los proveedores
    """
    try:
        # Verificar si existe la empresa
        empresa = (
            db.query(Empresa)
            .filter(Empresa.id == empresa_id)
            .first()
        )
        
        if not empresa:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Empresa con ID {empresa_id} no encontrada",
            )

        query = db.query(Proveedor).filter(Proveedor.empresa_id == empresa_id)
        
        if not include_inactive:
            query = query.filter(Proveedor.active == True)
            
        proveedores = query.offset(skip).limit(limit).all()
        
        return [
            ProveedorReadSchema.model_validate(proveedor)
            for proveedor in proveedores
        ]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al obtener los proveedores de la empresa: {str(e)}",
        )

def get_all_proveedores(
    db: Session, skip: int = 0, limit: int = 100, include_inactive: bool = False
) -> List[ProveedorReadSchema]:
    """
    Obtiene todos los proveedores con paginación.
    
    Args:
        db: Sesión de base de datos
        skip: Número de registros a omitir
        limit: Número máximo de registros a retornar
        include_inactive: Si incluir proveedores inactivos
        
    Returns:
        List[ProveedorReadSchema]: Lista de todos los proveedores
        
    Raises:
        HTTPException: Si hay un error al obtener los proveedores
    """
    try:
        query = db.query(Proveedor)
        
        if not include_inactive:
            query = query.filter(Proveedor.active == True)
            
        proveedores = query.offset(skip).limit(limit).all()
        return [
            ProveedorReadSchema.model_validate(proveedor)
            for proveedor in proveedores
        ]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al obtener la lista de proveedores: {str(e)}",
        )

def update_proveedor(
    db: Session, proveedor_id: int, proveedor_data: ProveedorUpdateSchema
) -> ProveedorReadSchema:
    """
    Actualiza los datos de un proveedor específico.
    
    Args:
        db: Sesión de base de datos
        proveedor_id: ID del proveedor a actualizar
        proveedor_data: Datos a actualizar
        
    Returns:
        ProveedorReadSchema: Datos del proveedor actualizado
        
    Raises:
        HTTPException: Si el proveedor no existe, la empresa no existe o hay un error
    """
    try:
        proveedor = (
            db.query(Proveedor)
            .filter(Proveedor.id == proveedor_id)
            .first()
        )
        if not proveedor:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Proveedor no encontrado",
            )

        # Verificar si se está actualizando la empresa y si existe
        update_data = proveedor_data.model_dump(exclude_unset=True)
        if "empresa_id" in update_data and update_data["empresa_id"] is not None:
            empresa = (
                db.query(Empresa)
                .filter(Empresa.id == update_data["empresa_id"])
                .first()
            )
            if not empresa:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Error al actualizar proveedor, no se encontró empresa con ID {update_data['empresa_id']}"
                )

        # Actualizar los campos del proveedor
        for key, value in update_data.items():
            if hasattr(proveedor, key) and value is not None:
                setattr(proveedor, key, value)

        db.commit()
        db.refresh(proveedor)
        return ProveedorReadSchema.model_validate(proveedor)
    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al actualizar el proveedor: {str(e)}",
        )

def delete_proveedor(db: Session, proveedor_id: int) -> dict:
    """
    Elimina un proveedor específico.
    
    Args:
        db: Sesión de base de datos
        proveedor_id: ID del proveedor a eliminar
        
    Returns:
        dict: Mensaje de confirmación
        
    Raises:
        HTTPException: Si el proveedor no existe, tiene relaciones activas o hay un error
    """
    try:
        proveedor = (
            db.query(Proveedor)
            .filter(Proveedor.id == proveedor_id)
            .first()
        )
        if not proveedor:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Proveedor no encontrado",
            )

        # Verificar si el proveedor tiene entradas de compra asociadas
        entradas_compra = (
            db.query(EntradaCompra)
            .filter(EntradaCompra.proveedor_id == proveedor_id)
            .first()
        )
        
        if entradas_compra:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No se puede eliminar el proveedor porque tiene entradas de compra asociadas. "
                       "Elimine primero las entradas de compra relacionadas."
            )

        db.delete(proveedor)
        db.commit()
        return {"detail": "Proveedor eliminado exitosamente"}
    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al eliminar el proveedor: {str(e)}",
        )

def get_proveedor_by_nombre(
    db: Session, nombre: str, empresa_id: Optional[int] = None, include_inactive: bool = False
) -> List[ProveedorReadSchema]:
    """
    Busca proveedores por nombre (búsqueda parcial).
    
    Args:
        db: Sesión de base de datos
        nombre: Nombre del proveedor a buscar
        empresa_id: ID de la empresa (opcional, para filtrar por empresa)
        include_inactive: Si incluir proveedores inactivos
        
    Returns:
        List[ProveedorReadSchema]: Lista de proveedores que coinciden con la búsqueda
        
    Raises:
        HTTPException: Si hay un error en la búsqueda
    """
    try:
        query = db.query(Proveedor).filter(
            Proveedor.nombre.ilike(f"%{nombre}%")
        )
        
        if not include_inactive:
            query = query.filter(Proveedor.active == True)
        
        if empresa_id is not None:
            # Verificar si existe la empresa
            empresa = (
                db.query(Empresa)
                .filter(Empresa.id == empresa_id)
                .first()
            )
            
            if not empresa:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Empresa con ID {empresa_id} no encontrada",
                )
            
            query = query.filter(Proveedor.empresa_id == empresa_id)
        
        proveedores = query.all()
        return [
            ProveedorReadSchema.model_validate(proveedor)
            for proveedor in proveedores
        ]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al buscar proveedores: {str(e)}",
        ) 

def toggle_proveedor_active(db: Session, proveedor_id: int) -> ProveedorReadSchema:
    """
    Activa o desactiva un proveedor específico.
    
    Args:
        db: Sesión de base de datos
        proveedor_id: ID del proveedor a activar/desactivar
        
    Returns:
        ProveedorReadSchema: Datos del proveedor actualizado
        
    Raises:
        HTTPException: Si el proveedor no existe o hay un error
    """
    try:
        proveedor = (
            db.query(Proveedor)
            .filter(Proveedor.id == proveedor_id)
            .first()
        )
        if not proveedor:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Proveedor no encontrado",
            )

        # Cambiar el estado activo
        proveedor.active = not proveedor.active

        db.commit()
        db.refresh(proveedor)
        return ProveedorReadSchema.model_validate(proveedor)
    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al cambiar el estado del proveedor: {str(e)}",
        ) 

def get_proveedores_list_by_empresa(
    db: Session, empresa_id: int, include_inactive: bool = False
) -> List[ProveedorListSchema]:
    """
    Obtiene una lista simplificada de proveedores de una empresa específica.
    
    Args:
        db: Sesión de base de datos
        empresa_id: ID de la empresa
        include_inactive: Si incluir proveedores inactivos
        
    Returns:
        List[ProveedorListSchema]: Lista simplificada de proveedores de la empresa
        
    Raises:
        HTTPException: Si hay un error al obtener los proveedores
    """
    try:
        # Verificar si existe la empresa
        empresa = (
            db.query(Empresa)
            .filter(Empresa.id == empresa_id)
            .first()
        )
        
        if not empresa:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Empresa con ID {empresa_id} no encontrada",
            )

        query = db.query(Proveedor).filter(Proveedor.empresa_id == empresa_id)
        
        if not include_inactive:
            query = query.filter(Proveedor.active == True)
            
        proveedores = query.all()
        
        return [
            ProveedorListSchema.model_validate(proveedor)
            for proveedor in proveedores
        ]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al obtener la lista de proveedores de la empresa: {str(e)}",
        )

def get_all_proveedores_list(
    db: Session, include_inactive: bool = False
) -> List[ProveedorListSchema]:
    """
    Obtiene una lista simplificada de todos los proveedores.
    
    Args:
        db: Sesión de base de datos
        include_inactive: Si incluir proveedores inactivos
        
    Returns:
        List[ProveedorListSchema]: Lista simplificada de todos los proveedores
        
    Raises:
        HTTPException: Si hay un error al obtener los proveedores
    """
    try:
        query = db.query(Proveedor)
        
        if not include_inactive:
            query = query.filter(Proveedor.active == True)
            
        proveedores = query.all()
        return [
            ProveedorListSchema.model_validate(proveedor)
            for proveedor in proveedores
        ]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al obtener la lista de proveedores: {str(e)}",
        ) 