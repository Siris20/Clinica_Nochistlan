from sqlalchemy import String, Integer, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.sql.base import Base
from typing import List, TYPE_CHECKING

if TYPE_CHECKING:
    from .departamento_producto import DepartamentoProducto
    from .subcategoria_producto import SubcategoriaProducto

class CategoriaProducto(Base):
    __tablename__ = "categorias_productos"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str] = mapped_column(String(255), nullable=True)

    # Relaciones
    departamento_id: Mapped[int] = mapped_column(Integer, ForeignKey("departamentos_productos.id"), nullable=False)
    departamento: Mapped["DepartamentoProducto"] = relationship("DepartamentoProducto", back_populates="categorias")
    subcategorias: Mapped[List["SubcategoriaProducto"]] = relationship("SubcategoriaProducto", back_populates="categoria", cascade="all, delete")