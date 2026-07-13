from typing import List, Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException, status, UploadFile
from pathlib import Path
import os
from app.core.config import settings
from app.models.sql.logo import Logo
from app.models.sql.empresa import Empresa
from app.schemas.logo import (
    LogoCreateSchema,
    LogoUpdateSchema,
    LogoReadSchema,
)
from app.utils.file_handlers import save_upload_logo, delete_file


UPLOAD_DIR = Path("static/logos")

async def create_logo(db: Session, logo_data: LogoCreateSchema) -> LogoReadSchema:
    try:
        
        empresa = db.query(Empresa).filter(Empresa.id == logo_data.empresa_id).first()
        if not empresa:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Empresa con ID {logo_data.empresa_id} no encontrada",
            )

        
        image_url = None
        if logo_data.image_file:
            try:
                image_url = await save_upload_logo(logo_data.image_file, UPLOAD_DIR)
            except HTTPException as e:
                raise e
            except Exception as e:
                raise HTTPException(
                    status_code=500,
                    detail=f"Error inesperado al guardar la imagen del logo: {str(e)}"
                )

        
        logo_dict = logo_data.model_dump(exclude_unset=True, exclude={"image_file"})
        if image_url:
            logo_dict["image_url"] = image_url

        nuevo_logo = Logo(**logo_dict)
        db.add(nuevo_logo)
        db.commit()
        db.refresh(nuevo_logo)
        return LogoReadSchema.model_validate(nuevo_logo)
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Error inesperado al crear el logo: {str(e)}"
        )

def get_logo(db: Session, logo_id: int) -> LogoReadSchema:
    try:
        logo = db.query(Logo).filter(Logo.id == logo_id).first()
        if not logo:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Logo no encontrado",
            )
        return LogoReadSchema.model_validate(logo)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al obtener el logo: {str(e)}",
        )

def get_all_logos(db: Session, skip: int = 0, limit: int = 100) -> List[LogoReadSchema]:
    try:
        logos = db.query(Logo).offset(skip).limit(limit).all()
        return [LogoReadSchema.model_validate(logo) for logo in logos]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al obtener la lista de logos: {str(e)}",
        )

async def update_logo(
    db: Session, logo_id: int, logo_data: LogoUpdateSchema
) -> LogoReadSchema:
    try:
        logo = db.query(Logo).filter(Logo.id == logo_id).first()
        if not logo:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Logo no encontrado",
            )

        
        if logo_data.new_image_file:
            
            if logo.image_url:
                old_image_path = os.path.join(UPLOAD_DIR, os.path.basename(logo.image_url))
                if os.path.exists(old_image_path):
                    await delete_file(old_image_path)

            
            new_image_url = await save_upload_logo(logo_data.new_image_file, UPLOAD_DIR)
            logo.image_url = new_image_url

        
        update_data = logo_data.model_dump(exclude_unset=True, exclude={"new_image_file"})
        for key, value in update_data.items():
            if value is not None:
                setattr(logo, key, value)

        db.commit()
        db.refresh(logo)
        return LogoReadSchema.model_validate(logo)
    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al actualizar el logo: {str(e)}",
        )

async def delete_logo(db: Session, logo_id: int) -> dict:
    try:
        logo = db.query(Logo).filter(Logo.id == logo_id).first()
        if not logo:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Logo no encontrado",
            )

        
        if logo.image_url:
            image_path = os.path.join(UPLOAD_DIR, os.path.basename(logo.image_url))
            if os.path.exists(image_path):
                await delete_file(image_path)

        
        db.delete(logo)
        db.commit()

        return {"detail": "Logo eliminado exitosamente"}
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al eliminar el logo: {str(e)}",
        )