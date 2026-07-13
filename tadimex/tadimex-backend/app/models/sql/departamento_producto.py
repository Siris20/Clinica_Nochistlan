from sqlalchemy import String, Integer, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.sql.base import Base
from typing import List, TYPE_CHECKING

if TYPE_CHECKING:
    from .empresa import Empresa
    from .categoria_producto import CategoriaProducto

class DepartamentoProducto(Base):
    __tablename__ = "departamentos_productos"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str] = mapped_column(String(255), nullable=True)
    empresa_id: Mapped[int] = mapped_column(Integer, ForeignKey("empresas.id"), nullable=False)

    #Relaciones

    empresa: Mapped["Empresa"] = relationship("Empresa", back_populates="departamentos")
    categorias: Mapped[List["CategoriaProducto"]] = relationship("CategoriaProducto", back_populates="departamento", cascade="all, delete")