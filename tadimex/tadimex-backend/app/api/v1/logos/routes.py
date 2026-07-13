from fastapi import APIRouter, Depends, Query, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List
from app.db.mariadb import get_db
from app.schemas.logo import (
    LogoCreateSchema,
    LogoUpdateSchema,
    LogoReadSchema,
)
from app.services.logo import (
    create_logo,
    get_logo,
    get_all_logos,
    update_logo,
    delete_logo,
)

router = APIRouter()

@router.post("/logo", response_model=LogoReadSchema)
async def crear_logo(
    name: str = Form(...),
    empresa_id: int = Form(...),
    image_file: UploadFile = File(None),
    db: Session = Depends(get_db)
):
    logo_data = LogoCreateSchema(
        name=name,
        empresa_id=empresa_id,
        image_file=image_file
    )
    return await create_logo(db, logo_data)

@router.get("/logo/{logo_id}", response_model=LogoReadSchema)
def obtener_logo(
    logo_id: int,
    db: Session = Depends(get_db)
):
    return get_logo(db, logo_id)

@router.get("/logos", response_model=List[LogoReadSchema])
def obtener_logos(
    skip: int = Query(default=0, ge=0, description="Número de registros a saltar"),
    limit: int = Query(default=100, ge=1, description="Número máximo de registros a retornar"),
    db: Session = Depends(get_db)
):
    return get_all_logos(db, skip, limit)

@router.put("/logo/{logo_id}", response_model=LogoReadSchema)
async def actualizar_logo(
    logo_id: int,
    name: str = Form(None),
    empresa_id: int = Form(None),
    new_image_file: UploadFile = File(None),
    db: Session = Depends(get_db)
):
    logo_data = LogoUpdateSchema(
        name=name,
        empresa_id=empresa_id,
        new_image_file=new_image_file
    )
    return await update_logo(db, logo_id, logo_data)

@router.delete("/logo/{logo_id}")
async def eliminar_logo(
    logo_id: int,
    db: Session = Depends(get_db)
):
    return await delete_logo(db, logo_id)