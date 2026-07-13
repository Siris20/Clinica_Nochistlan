from datetime import datetime
from sqlalchemy import String, Integer, Text, DateTime, ForeignKey, JSON, DECIMAL
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.sql.base import Base
from app.models.sql.enums import UnidadMedida
from typing import List, TYPE_CHECKING

if TYPE_CHECKING:
    from .subcategoria_producto import SubcategoriaProducto
    from .producto_cotizado import ProductoCotizado
    from .producto_comprado import ProductoComprado
    from .inventario import Inventarios
    from .producto_vendido import ProductoVendido

class Producto(Base):
    __tablename__ = "productos"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    model: Mapped[str] = mapped_column(String(100), nullable=True)
    brand: Mapped[str] = mapped_column(String(100), nullable=True)
    SAT_code: Mapped[str] = mapped_column(String(50), nullable=True)
    warranty: Mapped[int] = mapped_column(Integer, nullable=True)
    description: Mapped[str] = mapped_column(Text, nullable=True)
    images: Mapped[str] = mapped_column(JSON, nullable=True)
    sell_price: Mapped[float] = mapped_column(DECIMAL(10,2), nullable=True)
    unidad_medida: Mapped[str] = mapped_column(
        String(4),  
        nullable=False,
        default=UnidadMedida.PIEZA.value, 
        doc="Unidad de medida del producto según catálogo SAT (ver enum UnidadMedida)"
    )
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.now)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.now, onupdate=datetime.now)

    # Relaciones
    subcategoria_id: Mapped[int] = mapped_column(Integer, ForeignKey("subcategorias_productos.id", name="fk_productos_subcategoria_id"), nullable=True)
    subcategoria: Mapped["SubcategoriaProducto"] = relationship("SubcategoriaProducto", back_populates="productos")
    productos_cotizados: Mapped[List["ProductoCotizado"]] = relationship(
        "ProductoCotizado", 
        back_populates="producto", 
        cascade="all, delete")
    
    productos_comprados: Mapped[List["ProductoComprado"]] = relationship(
        "ProductoComprado", 
        back_populates="producto",
        cascade="all, delete-orphan"
    )

    inventarios: Mapped[List["Inventarios"]] = relationship(
        "Inventarios",
        back_populates="producto",
        cascade="all, delete-orphan"
    )

    productos_vendidos: Mapped[List["ProductoVendido"]] = relationship(
        "ProductoVendido",
        back_populates="producto",
        cascade="all, delete-orphan"
    )
