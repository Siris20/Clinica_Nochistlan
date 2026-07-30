from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.schemas.sucursal import SucursalCreateSchema, SucursalReadSchema, SucursalUpdateSchema
from app.services.sucursal import SucursalService
from app.db.mariadb import get_db


router = APIRouter()


@router.post("/sucursal", response_model=SucursalReadSchema, status_code=status.HTTP_201_CREATED)
def crear_sucursal(
    sucursal: SucursalCreateSchema,
    db: Session = Depends(get_db)
):
    sucursal_service = SucursalService()
    try:
        return sucursal_service.create_sucursal(db, sucursal)
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error inesperado al crear la sucursal: {str(e)}"
        )


@router.get("/sucursal/{sucursal_id}", response_model=SucursalReadSchema)
def obtener_sucursal(
    sucursal_id: int,
    db: Session = Depends(get_db)
):
    sucursal_service = SucursalService()
    try:
        return sucursal_service.get_sucursal(db, sucursal_id)
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error inesperado al obtener la sucursal: {str(e)}"
        )


@router.get("/sucursal", response_model=List[SucursalReadSchema])
def obtener_sucursales(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    sucursal_service = SucursalService()
    try:
        return sucursal_service.get_all_sucursales(db, skip, limit)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error inesperado al obtener las sucursales: {str(e)}"
        )


@router.put("/sucursal/{sucursal_id}", response_model=SucursalReadSchema)
def actualizar_sucursal(
    sucursal_id: int,
    sucursal: SucursalUpdateSchema,
    db: Session = Depends(get_db)
):
    sucursal_service = SucursalService()
    try:
        return sucursal_service.update_sucursal(db, sucursal_id, sucursal)
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error inesperado al actualizar la sucursal: {str(e)}"
        )


@router.delete("/sucursal/{sucursal_id}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar_sucursal(
    sucursal_id: int,
    db: Session = Depends(get_db)
):
    sucursal_service = SucursalService()
    try:
        sucursal_service.delete_sucursal(db, sucursal_id)
        return {"detail": "Sucursal eliminada correctamente"}
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error inesperado al eliminar la sucursal: {str(e)}"
        )