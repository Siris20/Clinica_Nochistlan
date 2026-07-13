from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError, IntegrityError
from fastapi import HTTPException, status
from app.models.sql.sucursal import Sucursal
from app.schemas.sucursal import SucursalCreateSchema, SucursalUpdateSchema
from app.models.sql.empresa import Empresa
from app.models.sql.empleado import Empleado

class SucursalService:
    def __init__(self):
        pass

    def _check_empresa_exists(self, db: Session, empresa_id: int) -> bool:
        empresa = db.query(Empresa).filter(Empresa.id == empresa_id).first()
        if not empresa:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Empresa con ID {empresa_id} no existe"
            )
        return True

    def _check_gerente_exists(self, db: Session, gerente_id: int) -> bool:
        if gerente_id is None:
            return True  # No es obligatorio proporcionar un gerente
        empleado = db.query(Empleado).filter(Empleado.id == gerente_id).first()
        if not empleado:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Empleado con ID {gerente_id} no existe"
            )
        return True

    def create_sucursal(self, db: Session, sucursal: SucursalCreateSchema) -> Sucursal:
        try:
            # Verificar que la empresa exista
            self._check_empresa_exists(db, sucursal.empresa_id)
            
            # Verificar que el gerente exista (si se proporciona)
            if sucursal.gerente_id is not None:
                self._check_gerente_exists(db, sucursal.gerente_id)
            
            # Convertir el schema de Pydantic a un diccionario
            sucursal_data = sucursal.model_dump()
            # Crear una instancia del modelo Sucursal
            db_sucursal = Sucursal(**sucursal_data)
            # Agregar y guardar en la base de datos
            db.add(db_sucursal)
            db.commit()
            db.refresh(db_sucursal)
            return db_sucursal

        except HTTPException as e:
            db.rollback()  # Hacer rollback si la empresa o el gerente no existen
            raise e  # Re-lanzar la excepción HTTP con el mensaje de error
        except SQLAlchemyError as e:
            db.rollback()  # Hacer rollback en caso de otros errores de SQLAlchemy
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error al crear la sucursal: {str(e)}"
            )

    # Obtener una sucursal por ID
    def get_sucursal(self, db: Session, sucursal_id: int) -> Sucursal:
        db_sucursal = db.query(Sucursal).filter(Sucursal.id == sucursal_id).first()
        if not db_sucursal:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Sucursal con ID {sucursal_id} no encontrada"
            )
        return db_sucursal

    # Obtener todas las sucursales
    def get_all_sucursales(self, db: Session, skip: int = 0, limit: int = 100) -> list[Sucursal]:
        return db.query(Sucursal).offset(skip).limit(limit).all()

    # Actualizar una sucursal
    def update_sucursal(self, db: Session, sucursal_id: int, sucursal: SucursalUpdateSchema) -> Sucursal:
        try:
            # Obtener la sucursal existente
            db_sucursal = self.get_sucursal(db, sucursal_id)
            if not db_sucursal:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Sucursal con ID {sucursal_id} no encontrada"
                )
            # Verificar que la empresa exista (si se proporciona)
            if sucursal.empresa_id is not None:
                self._check_empresa_exists(db, sucursal.empresa_id)
            # Verificar que el gerente exista (si se proporciona)
            if sucursal.gerente_id is not None:
                self._check_gerente_exists(db, sucursal.gerente_id)
            # Actualizar los campos proporcionados
            update_data = sucursal.model_dump(exclude_unset=True)
            for key, value in update_data.items():
                setattr(db_sucursal, key, value)
            # Guardar los cambios
            db.commit()
            db.refresh(db_sucursal)
            return db_sucursal
        except SQLAlchemyError as e:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error al actualizar la sucursal: {str(e)}"
            )

    # Eliminar una sucursal
    def delete_sucursal(self, db: Session, sucursal_id: int) -> bool:
        try:
            # Obtener la sucursal existente
            db_sucursal = self.get_sucursal(db, sucursal_id)
            if not db_sucursal:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Sucursal con ID {sucursal_id} no encontrada"
                )
            # Eliminar la sucursal
            db.delete(db_sucursal)
            db.commit()
            return True
        except SQLAlchemyError as e:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error al eliminar la sucursal: {str(e)}"
            )