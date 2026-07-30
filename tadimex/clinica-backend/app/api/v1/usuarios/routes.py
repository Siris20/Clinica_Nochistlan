from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import Session
from app.schemas.usuario import UsuarioCreateSchema, UsuarioResponseSchema, UsuarioUpdateSchema, UsuarioPasswordUpdateSchema
from app.services import usuario_service
from app.db.mariadb import get_db

router = APIRouter()

@router.post("/usuario", response_model=UsuarioResponseSchema)
def crear_usuario(usuario: UsuarioCreateSchema, db: AsyncSession = Depends(get_db)):
    return usuario_service.create_usuario(db, usuario)

@router.get("/usuario/{usuario_id}", response_model=UsuarioResponseSchema)
def obtener_usuario(usuario_id: int, db: AsyncSession = Depends(get_db)):
    usuario = usuario_service.get_usuario(db, usuario_id)
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    return usuario

@router.get("/usuarios", response_model=list[UsuarioResponseSchema])
def listar_usuarios(skip: int = 0, limit: int = 10, db: Session = Depends(get_db)):
    return usuario_service.get_usuarios(db, skip, limit)

@router.put("/usuario/{usuario_id}", response_model=UsuarioResponseSchema)
def actualizar_usuario(usuario_id: int, usuario: UsuarioUpdateSchema, db: AsyncSession = Depends(get_db)):
    usuario_actualizado = usuario_service.update_usuario(db, usuario_id, usuario)
    if not usuario_actualizado:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    return usuario_actualizado

@router.put("/usuarios/{usuario_id}/password", status_code=status.HTTP_200_OK)
def actualizar_contraseña(
    usuario_id: int, 
    password_data: UsuarioPasswordUpdateSchema, 
    db: Session = Depends(get_db)
):
    try:
        
        result = usuario_service.update_password(db, usuario_id, password_data)
        
        
        return {"detail": result}
    except ValueError as e:
        
        raise HTTPException(status_code=400, detail=str(e))


@router.delete("/usuario/{usuario_id}", status_code=status.HTTP_200_OK)
def eliminar_usuario(usuario_id: int, db: AsyncSession = Depends(get_db)):
    usuario_eliminado = usuario_service.delete_usuario(db, usuario_id)
    if not usuario_eliminado:
        raise HTTPException(status_code=404, detail=f"Usuario con ID {usuario_id} no encontrado")
    return {"detail":"Usuario eliminado exitosamente"}