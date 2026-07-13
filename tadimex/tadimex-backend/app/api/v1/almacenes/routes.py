from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.schemas.almacen import AlmacenCreateSchema, AlmacenUpdateSchema, AlmacenResponseSchema, AlmacenWithRelationsSchema

from app.services.almacen import create_almacen, update_almacen, delete_almacen, get_all_almacenes, get_almacen
from app.db.mariadb import get_db 


router = APIRouter()



@router.post("/almacen", response_model=AlmacenResponseSchema, status_code=status.HTTP_201_CREATED)
def crear_almacen(almacen: AlmacenCreateSchema, db: Session = Depends(get_db)):
  
    return create_almacen(db, almacen)

@router.get("/almacen/{almacen_id}", response_model=AlmacenWithRelationsSchema)
def obtener_almacen(almacen_id: int, db: Session = Depends(get_db)):

    return get_almacen(db, almacen_id)

@router.get("/almacenes", response_model=List[AlmacenResponseSchema])
def obtener_almacenes(db: Session = Depends(get_db)):

    return get_all_almacenes(db)

@router.put("/almacen/{almacen_id}", response_model=AlmacenResponseSchema)
def actualizar_almacen(almacen_id: int, almacen: AlmacenUpdateSchema, db: Session = Depends(get_db)):

    return update_almacen(db, almacen_id, almacen)

@router.delete("/almacen/{almacen_id}", status_code=status.HTTP_200_OK)
def borrar_almacen(almacen_id: int, db: Session = Depends(get_db)):

    return delete_almacen(db, almacen_id)
    