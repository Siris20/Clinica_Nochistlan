from fastapi import APIRouter, Depends, Query, Form, UploadFile, File
from sqlalchemy.orm import Session
from typing import List, Optional
from app.db.mariadb import get_db
from app.schemas.emisor import (
    EmisorCreateSchema,
    EmisorUpdateSchema,
    EmisorReadSchema,
)
from app.services.emisor import (
    create_emisor,
    get_emisor,
    get_all_emisores,
    update_emisor,
    delete_emisor,
)

router = APIRouter()

@router.post("/emisor", response_model=EmisorReadSchema)
async def crear_emisor(
    emisor_data: EmisorCreateSchema = Depends(EmisorCreateSchema.as_form),
    db: Session = Depends(get_db)
):

    return await create_emisor(db, emisor_data)

@router.get("/emisor/{emisor_id}", response_model=EmisorReadSchema)
def obtener_emisor(
    emisor_id: int,
    db: Session = Depends(get_db)
):
    return get_emisor(db, emisor_id)

@router.get("/emisores", response_model=List[EmisorReadSchema])
def obtener_emisores(
    skip: int = Query(default=0, ge=0, description="Número de registros a saltar"),
    limit: int = Query(default=100, ge=1, description="Número máximo de registros a retornar"),
    db: Session = Depends(get_db)
):
    return get_all_emisores(db, skip, limit)

@router.put("/emisor/{emisor_id}", response_model=EmisorReadSchema)
async def actualizar_emisor(
    emisor_id: int,
    emisor_data: EmisorUpdateSchema = Depends(EmisorUpdateSchema.as_form),
    db: Session = Depends(get_db)
):

    return await update_emisor(db, emisor_id, emisor_data)

@router.delete("/emisor/{emisor_id}")
async def eliminar_emisor(
    emisor_id: int,
    db: Session = Depends(get_db)
):
    result = await delete_emisor(db, emisor_id)
    return result