from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from app.core.config import settings  # Asegúrate de que settings contenga la DATABASE_URL
from sqlalchemy.exc import SQLAlchemyError
from typing import Generator

# Crear el motor de SQLAlchemy
engine = create_engine(
    settings.DATABASE_URL,
    pool_size=settings.DATABASE_POOL_SIZE,
    max_overflow=settings.DATABASE_MAX_OVERFLOW,
    echo=True  # Este parámetro es para depuración, opcional
)

# Crear la sesión de SQLAlchemy
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Función para obtener la sesión de la base de datos
def get_db() -> Generator[Session, None, None]:
    """
    Proporciona una sesión de base de datos.
    Esta sesión es utilizada en las rutas de FastAPI para interactuar con la base de datos.
    """
    db_session = SessionLocal()
    try:
        yield db_session
    finally:
        db_session.close()

# Función para obtener la conexión a MariaDB directamente
def get_mariadb_connection():
    try:
        print(f"Conectando a la base de datos con la URL: {settings.DATABASE_URL}")
        connection = engine.connect()  # Esto se puede usar para obtener conexiones directas
        print("Conexión exitosa a la base de datos MariaDB.")
        return connection
    except SQLAlchemyError as e:
        # Si ocurre un error con la conexión
        print(f"Error al conectar a la base de datos MariaDB: {e}")
        return None

# Si quieres hacer alguna prueba o ver cómo funciona la conexión
if __name__ == "__main__":
    print("Intentando obtener conexión a MariaDB...")
    get_mariadb_connection()
