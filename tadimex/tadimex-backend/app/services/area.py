from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from fastapi import HTTPException, status
from app.models.sql.area import Area
from app.schemas.area import AreaCreateSchema, AreaUpdateSchema, AreaReadSchema, EmpleadoRead, EmpresaRead
from app.models.sql.empresa import Empresa
from app.models.sql.empleado import Empleado


def check_empresa_exists(db: Session, empresa_id: int) -> bool:
    
    empresa = db.query(Empresa).filter(Empresa.id == empresa_id).first()
    if not empresa:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Empresa con ID {empresa_id} no existe"
        )
    return True

def create_area(db: Session, area_data: AreaCreateSchema) -> AreaReadSchema:
    
    try:
        
        check_empresa_exists(db, area_data.empresa_id)

        
        db_area = Area(
            name=area_data.name,
            description=area_data.description,
            empresa_id=area_data.empresa_id,
        )
        
        db.add(db_area)
        db.commit()
        db.refresh(db_area)
        
        return AreaReadSchema.from_orm(db_area)
    except HTTPException as e:
        db.rollback()  
        raise e  
    except SQLAlchemyError as e:
        db.rollback()  
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al crear el área: {str(e)}",
        )
    except Exception as e:
        db.rollback()  
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Error inesperado: {str(e)}",
        )



def get_area_by_id(db: Session, area_id: int) -> Optional[AreaReadSchema]:
    
    try:
        
        db_area = db.query(Area).filter(Area.id == area_id).first()
        if not db_area:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Área con ID {area_id} no encontrada",
            )
        
        empresa = db.query(Empresa).filter(Empresa.id == db_area.empresa_id).first()
        
        empleados = db.query(Empleado).filter(Empleado.area_id == db_area.id).all()
        
        return AreaReadSchema(
            id=db_area.id,
            name=db_area.name,
            description=db_area.description,
            empresa_id=db_area.empresa_id,
            empresa=EmpresaRead.from_orm(empresa) if empresa else None,
            empleados=[EmpleadoRead.from_orm(emp) for emp in empleados],
        )
    except SQLAlchemyError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al obtener el área: {str(e)}",
        )
    except HTTPException:
        raise  
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Error inesperado: {str(e)}",
        )



def get_all_areas(db: Session, skip: int = 0, limit: int = 100) -> List[AreaReadSchema]:
    return db.query(Area).offset(skip).limit(limit).all()


def update_area(db: Session, area_id: int, area_data: AreaUpdateSchema) -> Optional[AreaReadSchema]:
  
    try:
        
        db_area = db.query(Area).filter(Area.id == area_id).first()
        if not db_area:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Área con ID {area_id} no encontrada",
            )
        
        if area_data.name is not None:
            db_area.name = area_data.name
        if area_data.description is not None:
            db_area.description = area_data.description
        if area_data.empresa_id is not None:
            db_area.empresa_id = area_data.empresa_id
        
        db.commit()
        db.refresh(db_area)
        
        return AreaReadSchema.from_orm(db_area)
    except SQLAlchemyError as e:
        db.rollback()  
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al actualizar el área: {str(e)}",
        )
    except HTTPException:
        raise  
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Error inesperado: {str(e)}",
        )


# Eliminar un área por su ID
def delete_area(db: Session, area_id: int) -> bool:
    
    try:
        
        db_area = db.query(Area).filter(Area.id == area_id).first()
        if not db_area:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Área con ID {area_id} no encontrada",
            )
        # Eliminar el área
        db.delete(db_area)
        db.commit()
        return True
    except SQLAlchemyError as e:
        db.rollback()  
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al eliminar el área: {str(e)}",
        )
    except HTTPException:
        raise  
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Error inesperado: {str(e)}",
        )