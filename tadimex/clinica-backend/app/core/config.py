from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    # Configuración General del Proyecto
    PROJECT_NAME: str
    VERSION: str
    DESCRIPTION: str
    ENVIRONMENT: str

    # Configuración del Servidor
    HOST: str
    PORT: int
    DEBUG: bool
    WORKERS: int

    # Configuración de API y Seguridad
    API_V1_STR: str
    SECRET_KEY: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int
    ALGORITHM: str
    VERIFY_SSL: bool

    # Configuración de CORS
    BACKEND_CORS_ORIGINS: List[str] = []

    # Configuración de MariaDB
    MARIADB_USER: str
    MARIADB_PASSWORD: str
    MARIADB_HOST: str
    MARIADB_PORT: int
    MARIADB_DATABASE: str
    DATABASE_POOL_SIZE: int
    DATABASE_MAX_OVERFLOW: int
    DATABASE_URL: str

    # Configuración de Archivos y Almacenamiento
    UPLOAD_FOLDER: str
    LOGOS_FOLDER: str
    COTIZACIONES_FOLDER: str
    MAX_CONTENT_LENGTH: int
    ALLOWED_EXTENSIONS: List[str] = []
    IMAGE_EXTENSIONS: List[str] = []
    CERTIFICATE_EXTENSION: List[str] = []
    PRIVATE_KEY_EXTENSION: List[str] = []

    class Config:
        env_file = ".env"

settings = Settings()
