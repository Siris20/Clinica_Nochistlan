from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from fastapi import HTTPException, status
from app.models.sql.empresa import Empresa
from app.schemas.empresa import EmpresaCreateSchema, EmpresaResponseSchema

class EmpresaService:
    def create_empresa(self, db: Session, empresa: EmpresaCreateSchema) -> Empresa:
        try:
            db_empresa = Empresa(
                name=empresa.name,
                calle=empresa.calle,
                numero_exterior=empresa.numero_exterior,
                numero_interior=empresa.numero_interior,
                colonia=empresa.colonia,
                localidad=empresa.localidad,
                municipio=empresa.municipio,
                estado=empresa.estado,
                codigo_postal=empresa.codigo_postal,
                phone_number=empresa.phone_number,
                SAT_certificate=empresa.SAT_certificate,
                SAT_stamp=empresa.SAT_stamp,
                regimen_fiscal=empresa.regimen_fiscal
            )
            db.add(db_empresa)
            db.commit()
            db.refresh(db_empresa)
            return db_empresa
        except SQLAlchemyError as e:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error al crear la empresa: {str(e)}"
            )

    def get_empresa(self, db: Session, empresa_id: int) -> Optional[Empresa]:
        try:
            empresa = db.query(Empresa).filter(Empresa.id == empresa_id).first()
            if not empresa:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Empresa con ID {empresa_id} no encontrada"
                )
            return empresa
        except SQLAlchemyError as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error al obtener la empresa: {str(e)}"
            )

    def get_all_empresas(self, db: Session) -> List[Empresa]:
        try:
            return db.query(Empresa).all()
        except SQLAlchemyError as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error al obtener todas las empresas: {str(e)}"
            )

    def update_empresa(self, db: Session, empresa_id: int, empresa: EmpresaCreateSchema) -> Optional[Empresa]:
        try:
            db_empresa = self.get_empresa(db, empresa_id)
            if not db_empresa:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Empresa con ID {empresa_id} no encontrada"
                )
            
            # Filtra los campos que no son None
            update_data = empresa.dict(exclude_unset=True)
            
            # Actualiza solo los campos proporcionados
            for key, value in update_data.items():
                setattr(db_empresa, key, value)
            
            db.commit()
            db.refresh(db_empresa)
            return db_empresa
        except SQLAlchemyError as e:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error al actualizar la empresa: {str(e)}"
            )

    def delete_empresa(self, db: Session, empresa_id: int) -> bool:
        try:
            db_empresa = self.get_empresa(db, empresa_id)
            if not db_empresa:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Empresa con ID {empresa_id} no encontrada"
                )
            db.delete(db_empresa)
            db.commit()
            return True
        except SQLAlchemyError as e:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error al eliminar la empresa: {str(e)}"
            )