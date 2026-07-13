from pydantic import BaseModel
from app.models.sql.enums import RolUsuario
from typing import Optional

class UsuarioBaseSchema(BaseModel):
    empleado_id: int
    rol: RolUsuario
    activo: bool = True

    class Config:
        from_attributes = True  

class UsuarioCreateSchema(UsuarioBaseSchema):
    password: str  

    class Config:
        from_attributes = True  

class UsuarioResponseSchema(UsuarioBaseSchema):
    id: int  
    
    class Config:
        from_attributes = True

class UsuarioUpdateSchema(BaseModel):
    
    rol: Optional[RolUsuario] = None
    activo: Optional[bool] = None

    class Config:
        from_attributes = True

class UsuarioPasswordUpdateSchema(BaseModel):
    current_password: str
    new_password: str