from sqlalchemy.orm import Session
from app.models.sql import Usuario, Empleado
from app.schemas.usuario import UsuarioCreateSchema, UsuarioUpdateSchema, UsuarioPasswordUpdateSchema
from typing import Optional, List
from fastapi import HTTPException
from sqlalchemy.exc import IntegrityError
import bcrypt

def get_usuario(db: Session, usuario_id: int) -> Optional[Usuario]:
    return db.query(Usuario).filter(Usuario.id == usuario_id).first()


def get_usuarios(db: Session, skip: int = 0, limit: int = 10) -> List[Usuario]:
    return db.query(Usuario).offset(skip).limit(limit).all()


def create_usuario(db: Session, usuario_data: UsuarioCreateSchema) -> Usuario:
    # Verificar si el empleado existe
    empleado = db.query(Empleado).filter(Empleado.id == usuario_data.empleado_id).first()
    if not empleado:
        raise HTTPException(status_code=404, detail="Empleado no encontrado")
    
    # Verificar si ya existe un usuario asignado al empleado
    if empleado.usuario:
        raise HTTPException(status_code=400, detail="El empleado ya tiene un usuario asignado")

    # Encriptar la contraseña
    hashed_password = bcrypt.hashpw(usuario_data.password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

    # Crear un nuevo objeto usuario
    usuario = Usuario(
        empleado_id=usuario_data.empleado_id,
        password_hash=hashed_password,
        rol=usuario_data.rol,
        activo=usuario_data.activo,
    )
    
    db.add(usuario)
    
    try:
        db.commit()  # Confirmar los cambios
        db.refresh(usuario)  # Refrescar para obtener los datos generados (como ID)
    except IntegrityError as e:
        db.rollback()  # Revertir si ocurre algún error
        raise ValueError(f"Error al crear el usuario: {e}")
    
    return usuario

def update_usuario(db: Session, usuario_id: int, usuario_data: UsuarioUpdateSchema) -> Optional[Usuario]:

    usuario = get_usuario(db, usuario_id)
    
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    
    
    update_data = usuario_data.dict(exclude_unset=True)
    
    
    for key, value in update_data.items():
        setattr(usuario, key, value)
    
    try:
        
        db.commit()
        
        db.refresh(usuario)
    except IntegrityError as e:
        
        db.rollback()
        raise HTTPException(status_code=400, detail=f"Error al actualizar el usuario: {e}")
    
    
    return usuario


def update_password(db: Session, usuario_id: int, password_data: UsuarioPasswordUpdateSchema):
    usuario = db.query(Usuario).filter(Usuario.id == usuario_id).first()
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    
    # Verificar la contraseña actual
    if not bcrypt.checkpw(password_data.current_password.encode('utf-8'), usuario.password_hash.encode('utf-8')):
        raise HTTPException(status_code=400, detail="Contraseña actual incorrecta")
    
    # Actualizar la contraseña
    new_password_hash = bcrypt.hashpw(password_data.new_password.encode('utf-8'), bcrypt.gensalt())
    usuario.password_hash = new_password_hash.decode('utf-8')  # Guarda el hash como string
    db.commit()
    db.refresh(usuario)
    return {"detail": "La contraseña ha sido actualizada exitosamente"}


def delete_usuario(db: Session, usuario_id: int):

   
    usuario = get_usuario(db, usuario_id)
    
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    
    try:
        
        db.delete(usuario)
        db.commit()
    except IntegrityError as e:
        
        db.rollback()
        raise HTTPException(status_code=400, detail=f"Error al eliminar el usuario: {e}")
    
    # Devuelve el usuario eliminado
    return usuario
