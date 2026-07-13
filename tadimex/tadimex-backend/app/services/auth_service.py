from fastapi import HTTPException, status, Depends, Header
import jwt
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app.models.sql.usuario import Usuario
from app.models.sql.empleado import Empleado
from app.models.sql.enums import Status
from app.core.config import settings
from app.db.mariadb import get_db
import bcrypt
import requests
import logging

SECRET_KEY = settings.SECRET_KEY
ALGORITHM = settings.ALGORITHM
ACCESS_TOKEN_EXPIRE_MINUTES = settings.ACCESS_TOKEN_EXPIRE_MINUTES
VERIFY_SSL = settings.VERIFY_SSL
logger = logging.getLogger(__name__)

class AuthenticationError(Exception):
    pass

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))


def create_access_token(data: dict, expires_delta: timedelta | None = None) -> str:

    to_encode = data.copy()
    
    # Convertir el campo "sub" a cadena, si existe
    if "sub" in to_encode:
        to_encode["sub"] = str(to_encode["sub"])
    
    # Configurar la expiración
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    
    # Generar el token firmado
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def authenticate_user(db: Session, credential: str, password: str) -> Usuario | None:
    try:
        # Buscar el empleado por correo electrónico o teléfono
        empleado = (
            db.query(Empleado)
            .filter((Empleado.email == credential) | (Empleado.phone_number == credential))
            .first()
        )
        
        if not empleado:
            raise AuthenticationError("Credenciales incorrectas")
        
        # Verificar si el empleado está activo
        if empleado.status == Status.INACTIVO:
            raise AuthenticationError("Empleado inactivo")
        
        # Buscar el usuario asociado al empleado
        user = db.query(Usuario).filter(Usuario.empleado_id == empleado.id).first()
        
        if not user:
            raise AuthenticationError("Usuario no encontrado para el empleado, contacta a recursos humanos")
        
        # Verificar la contraseña
        if not verify_password(password, user.password_hash):
            raise AuthenticationError("Credenciales incorrectas")
        
        return user
    
    except AuthenticationError as e:
        # Manejo de errores relacionados con la autenticación
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e)
        )
    
    except Exception as e:
        # Manejo de cualquier otro tipo de error
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error en la autenticación. Por favor, intente nuevamente más tarde."
        )
    
def get_token_from_header(authorization: str = Header(None)) -> str:
    print(f"Authorization header received: {authorization}")  # Esto imprime el valor del header
    if authorization is None or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=401,
            detail="Token de autorización no proporcionado o formato inválido. Se espera 'Bearer <token>'"
        )
    return authorization[7:]

async def get_current_user(token: str = Depends(get_token_from_header), db: Session = Depends(get_db)) -> Usuario:
    try:
        # verify_jwt_token ya maneja las excepciones de JWT y devuelve el payload
        payload = verify_jwt_token(token)
        
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token malformado: falta el ID de usuario",
                headers={"WWW-Authenticate": "Bearer"}
            )

        user = db.query(Usuario).filter(Usuario.id == user_id).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Usuario no encontrado o desactivado",
                headers={"WWW-Authenticate": "Bearer"}
            )
            
        # Opcional: Verificar si el usuario está activo
        if not user.activo:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Usuario inactivo",
                headers={"WWW-Authenticate": "Bearer"}
            )

        return user
        
    except HTTPException:
        # Re-lanzar excepciones HTTP que ya están formateadas
        raise
    except Exception as e:
        # Log del error inesperado
        logger.error(f"Error inesperado en autenticación: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Error de autenticación",
            headers={"WWW-Authenticate": "Bearer"}
        )


# Verificar token JWT
def verify_jwt_token(token: str) -> dict:
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token expirado",
            headers={"WWW-Authenticate": "Bearer"}
        )
    except jwt.InvalidTokenError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Token inválido: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"}
        )





# Solicitudes a servicios externos
def external_service_request(url: str, params: dict = None):
    try:
        response = requests.get(url, params=params, verify=VERIFY_SSL)
        if response.status_code == 200:
            return response.json()
        else:
            raise HTTPException(
                status_code=response.status_code,
                detail="Error en la solicitud externa"
            )
    except requests.RequestException:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error en la solicitud externa. Por favor, intente más tarde."
        )