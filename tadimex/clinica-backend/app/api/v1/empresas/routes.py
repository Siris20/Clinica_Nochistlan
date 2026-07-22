from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.schemas.empresa import EmpresaCreateSchema, EmpresaResponseSchema
from app.services.empresa import EmpresaService
from app.db.mariadb import get_db

router = APIRouter()

@router.post("/empresa", response_model=EmpresaResponseSchema, status_code=status.HTTP_200_OK)
def crear_empresa(empresa: EmpresaCreateSchema, db: Session = Depends(get_db)):
    empresa_service = EmpresaService()
    try:
        return empresa_service.create_empresa(db, empresa)
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error inesperado al crear la empresa: {str(e)}"
        )

@router.get("/empresa/{empresa_id}", response_model=EmpresaResponseSchema)
def obtener_empresa(empresa_id: int, db: Session = Depends(get_db)):
    empresa_service = EmpresaService()
    try:
        return empresa_service.get_empresa(db, empresa_id)
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error inesperado al obtener la empresa: {str(e)}"
        )

@router.get("/empresa", response_model=List[EmpresaResponseSchema])
def obtener_empresas(db: Session = Depends(get_db)):
    empresa_service = EmpresaService()
    try:
        return empresa_service.get_all_empresas(db)
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error inesperado al obtener todas las empresas: {str(e)}"
        )

@router.put("/empresa/{empresa_id}", response_model=EmpresaResponseSchema)
def actualizar_empresa(empresa_id: int, empresa: EmpresaCreateSchema, db: Session = Depends(get_db)):
    empresa_service = EmpresaService()
    try:
        return empresa_service.update_empresa(db, empresa_id, empresa)
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error inesperado al actualizar la empresa: {str(e)}"
        )

@router.delete("/empresa/{empresa_id}", status_code=status.HTTP_200_OK)
def eliminar_empresa(empresa_id: int, db: Session = Depends(get_db)):
    empresa_service = EmpresaService()
    try:
        empresa_service.delete_empresa(db, empresa_id)
        return {"detail": "Empresa eliminada correctamente"}
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error inesperado al eliminar la empresa: {str(e)}"
        )