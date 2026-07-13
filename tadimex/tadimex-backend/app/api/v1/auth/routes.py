from fastapi import APIRouter, Depends
from fastapi.security import OAuth2PasswordBearer, HTTPBearer
from sqlalchemy.orm import Session
from app.services.auth_service import authenticate_user, create_access_token, get_token_from_header, get_current_user
from app.schemas.auth import LoginRequest, TokenResponse
from app.db.mariadb import get_db
from app.core.config import settings
from app.models.sql.usuario import Usuario
from app.schemas.usuario import UsuarioResponseSchema

router = APIRouter(prefix="/auth") 
security = HTTPBearer()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_STR}/auth/login")

# Ruta para autenticar al usuario
@router.post("/login", response_model=TokenResponse)
def login(credentials: LoginRequest, db: Session = Depends(get_db)):
    user = authenticate_user(db, credentials.credential, credentials.password)
    access_token = create_access_token(data={"sub": user.id})
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/protected")
def protected_route(token: str = Depends(get_token_from_header)):
    return {"message": "Acceso permitido", "token": token}

@router.get("/current-user", response_model=UsuarioResponseSchema)
async def read_current_user(current_user: Usuario = Depends(get_current_user)):
    return current_user