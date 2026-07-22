from pathlib import Path
import uuid
from typing import Set, List, Optional
from fastapi import HTTPException, UploadFile
import os
from app.core.config import settings

class FileHandler:
    @staticmethod
    def validate_file_size(file_size: int, max_size: int) -> bool:
        return file_size <= max_size

    @staticmethod
    def validate_extension(filename: str, allowed_extensions: Set[str]) -> bool:
        return filename.lower().split('.')[-1] in allowed_extensions

    @staticmethod
    def generate_unique_filename(original_filename: str) -> str:
        extension = original_filename.lower().split('.')[-1]
        return f"{uuid.uuid4()}.{extension}"

    @staticmethod
    def standardize_path(path: str) -> str:
        """Convierte todas las rutas a usar diagonales simples (/)"""
        return path.replace('\\', '/') if path else path

    @staticmethod
    async def delete_file(file_path: str) -> bool:
        try:
            if file_path and os.path.exists(file_path):
                os.remove(file_path)
                return True
            return False
        except Exception:
            return False

class FileUploader:
    def __init__(self, allowed_extensions: Set[str], max_size: int = settings.MAX_CONTENT_LENGTH):
        self.allowed_extensions = allowed_extensions
        self.max_size = max_size

    async def validate_and_read_file(self, upload_file: UploadFile) -> bytes:
        if not upload_file:
            raise HTTPException(status_code=400, detail="No se proporcionó un archivo")

        if not FileHandler.validate_extension(upload_file.filename, self.allowed_extensions):
            raise HTTPException(
                status_code=400,
                detail=f"Tipo de archivo no permitido. Extensiones permitidas: {', '.join(self.allowed_extensions)}"
            )

        content = await upload_file.read()
        if not FileHandler.validate_file_size(len(content), self.max_size):
            await upload_file.seek(0)
            raise HTTPException(
                status_code=400,
                detail=f"El archivo excede el tamaño máximo permitido de {self.max_size/1024/1024:.1f}MB"
            )

        await upload_file.seek(0)
        return content

    async def save_file(self, upload_file: UploadFile, base_folder: Path, subfolder: str = "") -> str:
        content = await self.validate_and_read_file(upload_file)
        
        unique_filename = FileHandler.generate_unique_filename(upload_file.filename)
        folder = base_folder / subfolder
        folder.mkdir(parents=True, exist_ok=True)
        
        file_path = folder / unique_filename
        with open(file_path, "wb") as file:
            file.write(content)
        
        relative_path = Path(subfolder) / unique_filename if subfolder else unique_filename
        return FileHandler.standardize_path(f"static/uploads/{relative_path}")

    async def save_file_to_folder(self, upload_file: UploadFile, base_folder: Path, subfolder: str = "") -> str:
        content = await self.validate_and_read_file(upload_file)
        
        unique_filename = FileHandler.generate_unique_filename(upload_file.filename)
        folder = base_folder / subfolder
        folder.mkdir(parents=True, exist_ok=True)
        
        file_path = folder / unique_filename
        with open(file_path, "wb") as file:
            file.write(content)
        
        relative_path = Path(subfolder) / unique_filename if subfolder else unique_filename
        return FileHandler.standardize_path(f"{base_folder}/{relative_path}")

# Instancias preconfiguradas para diferentes tipos de archivos
image_uploader = FileUploader(allowed_extensions=settings.IMAGE_EXTENSIONS)
certificate_uploader = FileUploader(allowed_extensions=settings.CERTIFICATE_EXTENSION)
key_uploader = FileUploader(allowed_extensions=settings.PRIVATE_KEY_EXTENSION)
logo_uploader = FileUploader(allowed_extensions=settings.IMAGE_EXTENSIONS)

# Funciones legacy para mantener compatibilidad
async def save_upload_image(upload_file: UploadFile, folder: Path) -> str:
    return await image_uploader.save_file(upload_file, folder)

async def save_upload_certificate(upload_file: UploadFile, folder: Path) -> str:
    return await certificate_uploader.save_file(upload_file, folder, "certificados")

async def save_upload_key(upload_file: UploadFile, folder: Path) -> str:
    return await key_uploader.save_file(upload_file, folder, "certificados")

async def save_upload_logo(upload_file: UploadFile, folder: Path) -> str:
    return await logo_uploader.save_file_to_folder(upload_file, folder)

async def delete_file(file_path: str) -> bool:
    return await FileHandler.delete_file(file_path)