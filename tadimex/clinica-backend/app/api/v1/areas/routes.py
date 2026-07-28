from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.schemas.area import AreaCreateSchema, AreaReadSchema, AreaUpdateSchema
from app.services.area import create_area, get_area_by_id, get_all_areas, update_area, delete_area
from app.db.mariadb import get_db

# Crear el router
router = APIRouter()

# Crear un área
@router.post("/area", response_model=AreaReadSchema, status_code=status.HTTP_201_CREATED)
def crear_area(
    area: AreaCreateSchema,
    db: Session = Depends(get_db)
):
    try:
        return create_area(db, area)
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error inesperado al crear el área: {str(e)}"
        )

# Obtener un área por ID
@router.get("/area/{area_id}", response_model=AreaReadSchema)
def get_area(
    area_id: int,
    db: Session = Depends(get_db)
):
    try:
        return get_area_by_id(db, area_id)
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error inesperado al obtener el área: {str(e)}"
        )

# Obtener todas las áreas
@router.get("/areas", response_model=List[AreaReadSchema])
def obtener_areas(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    try:
        return get_all_areas(db, skip, limit)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error inesperado al obtener las áreas: {str(e)}"
        )

# Actualizar un área
@router.put("/area/{area_id}", response_model=AreaReadSchema)
def actualizar_area(
    area_id: int,
    area: AreaUpdateSchema,
    db: Session = Depends(get_db)
):
    try:
        return update_area(db, area_id, area)
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error inesperado al actualizar el área: {str(e)}"
        )

# Eliminar un área
@router.delete("/area/{area_id}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar_area(
    area_id: int,
    db: Session = Depends(get_db)
):
    try:
        delete_area(db, area_id)
        return {"detail": "Área eliminada correctamente"}
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error inesperado al eliminar el área: {str(e)}"
        )