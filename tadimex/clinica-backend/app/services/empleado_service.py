from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from typing import List, Optional
from app.models.sql.empleado import Empleado
from app.schemas.empleado import EmpleadoCreateSchema, EmpleadoUpdateSchema
from fastapi import UploadFile
from app.core.config import settings
from app.utils.file_handlers import save_upload_image, delete_file
from pathlib import Path
import os

async def create_empleado(
    db: Session, 
    empleado_data: EmpleadoCreateSchema, 
    image: UploadFile = None
) -> Empleado:
    try:
        # Manejar la imagen si existe
        image_url = None
        if image:
            try:
                upload_folder = Path("static/uploads")
                image_url = await save_upload_image(image, upload_folder)
            except HTTPException as e:
                raise e
            except Exception as e:
                raise HTTPException(
                    status_code=500,
                    detail=f"Error inesperado al guardar la imagen: {str(e)}"
                )

        # Crear diccionario con datos del empleado
        empleado_dict = empleado_data.model_dump(exclude_unset=True)
        if image_url:
            empleado_dict["image"] = image_url

        # Crear empleado
        empleado = Empleado(**empleado_dict)
        db.add(empleado)
        
        try:
            db.commit()
            db.refresh(empleado)
        except IntegrityError as e:
            db.rollback()
            raise HTTPException(
                status_code=400,
                detail=f"Error de integridad al crear el empleado: {str(e)}"
            )
        
        return empleado

    except HTTPException as e:
        raise e
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Error inesperado al crear el empleado: {str(e)}"
        )

def get_empleado(db: Session, empleado_id: int) -> Optional[Empleado]:
   
    return db.query(Empleado).filter(Empleado.id == empleado_id).first()

def get_all_empleados(db: Session, skip: int = 0, limit: int = 10) -> List[Empleado]:
   
    return db.query(Empleado).offset(skip).limit(limit).all()

async def update_empleado(db: Session, empleado_id: int, empleado_data: EmpleadoUpdateSchema, image:UploadFile = None) -> Optional[Empleado]:
    try:
 
        empleado = get_empleado(db, empleado_id)
        if not empleado:
            raise ValueError(f"Empleado con ID {empleado_id} no encontrado")
        
        #Inicializar image_url fuera del bloque condicional
        image_url = None

    
        if image:
            try:
                if empleado.image:
                    old_image_path = os.path.join("static/uploads", os.path.basename(empleado.image))
                    await delete_file(old_image_path)

                upload_folder = Path("static/uploads")
                image_url = await save_upload_image(image, upload_folder)
            except HTTPException as e:
                raise e
            except Exception as e:
                raise HTTPException(
                    status_code=500,
                    detail=f"Error inesperado al guardar la imagen: {str(e)}"
                )
            
        empleado_dict = {
            key: value for key, value in empleado_data.dict(exclude_unset=True).items()
            if value is not None
        }
        if image_url:
            empleado_dict["image"] = image_url
        for key, value in empleado_dict.items():
            setattr(empleado, key, value)
        try:
            db.commit()
            db.refresh(empleado)
        except IntegrityError as e:
            db.rollback()
            raise ValueError(f"Error al actualizar el empleado: {e}")
        return empleado
    
    except HTTPException as e:
        raise e
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Error inesperado al actualizar el empleado: {str(e)}"
        )

async def delete_empleado(db: Session, empleado_id: int):
    empleado = get_empleado(db, empleado_id)
    if not empleado:
        return False
    
    if empleado.image:
            image_path = os.path.join("static/uploads", os.path.basename(empleado.image))
            print(f"Image path: {image_path}")
            await delete_file(image_path)
    
    for subordinado in empleado.subordinados:
        subordinado.immediate_boss_id = None
        db.flush()
    
    
    
    if empleado.usuario:
        db.delete(empleado.usuario)
        db.flush()  
    
    
    db.delete(empleado)
    
    try:
        db.commit()
        return True
    except IntegrityError as e:
        db.rollback()
        return False