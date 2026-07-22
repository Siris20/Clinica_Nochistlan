from sqlalchemy import String, Integer, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.sql.base import Base
from typing import List, TYPE_CHECKING

if TYPE_CHECKING:
    from .categoria_producto import CategoriaProducto
    from .producto import Producto

class SubcategoriaProducto(Base):
    __tablename__ = "subcategorias_productos"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str] = mapped_column(String(255), nullable=True)

    # Relaciones
    categoria_id: Mapped[int] = mapped_column(Integer, ForeignKey("categorias_productos.id"), nullable=False)
    categoria: Mapped["CategoriaProducto"] = relationship("CategoriaProducto", back_populates="subcategorias")
    productos: Mapped[List["Producto"]] = relationship(
        "Producto", 
        back_populates="subcategoria",
        cascade="all, delete-orphan",
        passive_deletes=True
        )