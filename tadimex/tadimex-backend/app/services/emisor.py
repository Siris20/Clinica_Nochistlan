from typing import List, Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException, status, UploadFile
from pathlib import Path
import os
from app.core.config import settings
from app.models.sql.emisor import Emisor
from app.models.sql.empresa import Empresa
from app.schemas.emisor import (
    EmisorCreateSchema,
    EmisorUpdateSchema,
    EmisorReadSchema,
)
from app.utils.file_handlers import save_upload_certificate, save_upload_key, delete_file


UPLOAD_DIR = Path("static/uploads/certificados")

async def create_emisor(db: Session, emisor_data: EmisorCreateSchema) -> EmisorReadSchema:
    try:
        
        empresa = db.query(Empresa).filter(Empresa.id == emisor_data.empresa_id).first()
        if not empresa:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Empresa con ID {emisor_data.empresa_id} no encontrada",
            )

        
        certificado_path = None
        clave_privada_path = None

        if emisor_data.certificado_path:
            try:
                upload_folder = Path("static/uploads/certificados")
                certificado_path = await save_upload_certificate(emisor_data.certificado_path, upload_folder)
            except HTTPException as e:
                raise e
            except Exception as e:
                raise HTTPException(
                    status_code=500,
                    detail=f"Error inesperado al guardar el certificado: {str(e)}"
                )

        if emisor_data.clave_privada_path:
            try:
                upload_folder = Path("static/uploads/certificados")
                clave_privada_path = await save_upload_key(emisor_data.clave_privada_path, upload_folder)
            except HTTPException as e:
                if certificado_path:
                    await delete_file(certificado_path)  
                raise e
            except Exception as e:
                if certificado_path:
                    await delete_file(certificado_path)  
                raise HTTPException(
                    status_code=500,
                    detail=f"Error inesperado al guardar la clave privada: {str(e)}"
                )

        
        emisor_dict = emisor_data.model_dump(exclude_unset=True, exclude={"certificado_path", "clave_privada_path"})
        if certificado_path:
            emisor_dict["certificado_path"] = certificado_path
        if clave_privada_path:
            emisor_dict["clave_privada_path"] = clave_privada_path

        nuevo_emisor = Emisor(**emisor_dict)
        db.add(nuevo_emisor)
        db.commit()
        db.refresh(nuevo_emisor)
        return EmisorReadSchema.model_validate(nuevo_emisor)
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Error inesperado al crear el emisor: {str(e)}"
        )

def get_emisor(db: Session, emisor_id: int) -> EmisorReadSchema:
    try:
        emisor = db.query(Emisor).filter(Emisor.id == emisor_id).first()
        if not emisor:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Emisor no encontrado",
            )
        return EmisorReadSchema.model_validate(emisor)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al obtener el emisor: {str(e)}",
        )

def get_all_emisores(db: Session, skip: int = 0, limit: int = 100) -> List[EmisorReadSchema]:
    try:
        emisores = db.query(Emisor).offset(skip).limit(limit).all()
        return [EmisorReadSchema.model_validate(emisor) for emisor in emisores]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al obtener la lista de emisores: {str(e)}",
        )

async def update_emisor(
    db: Session, emisor_id: int, emisor_data: EmisorUpdateSchema
) -> EmisorReadSchema:
    try:
        emisor = db.query(Emisor).filter(Emisor.id == emisor_id).first()
        if not emisor:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Emisor no encontrado",
            )

        
        if emisor_data.certificado_path:
           
            if emisor.certificado_path:
                old_certificate_path = os.path.join("static/uploads/certificados", 
                                                  os.path.basename(emisor.certificado_path))
                if os.path.exists(old_certificate_path):
                    await delete_file(old_certificate_path)
            
            
            upload_folder = Path("static/uploads/certificados")
            new_certificate_path = await save_upload_certificate(emisor_data.certificado_path, upload_folder)
            emisor.certificado_path = new_certificate_path

        
        if emisor_data.clave_privada_path:
            
            if emisor.clave_privada_path:
                old_key_path = os.path.join("static/uploads/certificados", 
                                          os.path.basename(emisor.clave_privada_path))
                if os.path.exists(old_key_path):
                    await delete_file(old_key_path)
            
            
            upload_folder = Path("static/uploads/certificados")
            new_key_path = await save_upload_key(emisor_data.clave_privada_path, upload_folder)
            emisor.clave_privada_path = new_key_path

        
        update_data = emisor_data.model_dump(
            exclude_unset=True, 
            exclude={"certificado_path", "clave_privada_path"}
        )
        for key, value in update_data.items():
            if value is not None:
                setattr(emisor, key, value)

        db.commit()
        db.refresh(emisor)
        return EmisorReadSchema.model_validate(emisor)
        
    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al actualizar el emisor: {str(e)}",
        )

async def delete_emisor(db: Session, emisor_id: int) -> dict:
    try:
        emisor = db.query(Emisor).filter(Emisor.id == emisor_id).first()
        if not emisor:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Emisor no encontrado",
            )

        
        if emisor.certificado_path:
            certificate_path = os.path.join("static/uploads/certificados", 
                                            os.path.basename(emisor.certificado_path))
            
            if os.path.exists(certificate_path):
                await delete_file(certificate_path)
            

        
        if emisor.clave_privada_path:
            clave_privada_path = os.path.join("static/uploads/certificados",
                                              os.path.basename(emisor.clave_privada_path))
            
            if os.path.exists(clave_privada_path):
                await delete_file(clave_privada_path)
            
        db.delete(emisor)
        db.commit()
        

        return {"detail": "Emisor eliminado exitosamente"}
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al eliminar el emisor: {str(e)}",
        )