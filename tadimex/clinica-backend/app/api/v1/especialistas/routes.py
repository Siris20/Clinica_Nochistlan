from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from typing import List, Optional

from app.db.mariadb import get_db
from app.schemas.especialista import (
    EspecialistaCreateSchema,
    EspecialistaUpdateSchema,
    EspecialistaReadSchema,
)
from app.services.especialista_service import (
    get_all_especialistas,
    get_especialista,
    create_especialista,
    update_especialista,
    delete_especialista,
)

router = APIRouter()

@router.get("/especialistas", response_model=List[EspecialistaReadSchema])
def obtener_especialistas(
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=100, ge=1),
    area_id: int = Query(default=None, description="Filtrar especialistas por ID de área"),
    db: Session = Depends(get_db)
):
    return get_all_especialistas(db, skip=skip, limit=limit, area_id=area_id)

@router.get("/especialistas/{especialista_id}", response_model=EspecialistaReadSchema)
def obtener_especialista(especialista_id: int, db: Session = Depends(get_db)):
    return get_especialista(db, especialista_id)

@router.post("/especialistas", response_model=EspecialistaReadSchema, status_code=status.HTTP_201_CREATED)
def crear_especialista(data: EspecialistaCreateSchema, db: Session = Depends(get_db)):
    return create_especialista(db, data)

@router.put("/especialistas/{especialista_id}", response_model=EspecialistaReadSchema)
def actualizar_especialista(especialista_id: int, data: EspecialistaUpdateSchema, db: Session = Depends(get_db)):
    return update_especialista(db, especialista_id, data)

@router.delete("/especialistas/{especialista_id}")
def eliminar_especialista(especialista_id: int, db: Session = Depends(get_db)):
    return delete_especialista(db, especialista_id)