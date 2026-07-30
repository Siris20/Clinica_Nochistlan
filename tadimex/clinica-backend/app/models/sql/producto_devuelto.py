from sqlalchemy import (
    Integer, String, DateTime, Date, Text, DECIMAL, Boolean, Enum as SQLEnum,
    ForeignKey, JSON
)
from sqlalchemy.orm import Mapped, mapped_column, relationship
from datetime import datetime
from enum import Enum
from typing import List, Optional, TYPE_CHECKING
from decimal import Decimal
from app.models.sql.base import Base

if TYPE_CHECKING:
    from .producto import Producto
    from .entrada_devolucion import EntradaDevolucion

class ProductoDevuelto(Base):
    __tablename__ = "productos_devueltos"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    cantidad: Mapped[int] = mapped_column(Integer, nullable=False)
    precio_unitario_original: Mapped[Optional[Decimal]] = mapped_column(DECIMAL(10,2), nullable=True)
    estado_producto: Mapped[Optional[str]] = mapped_column(String(100), nullable=True, doc="nuevo, usado, dañado, etc.")

    producto_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("productos.id", ondelete="RESTRICT"),
        nullable=False
    )
    producto: Mapped["Producto"] = relationship("Producto", back_populates="productos_devueltos")
    
    # Relación con entrada de devolución
    entrada_devolucion_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("entradas_devolucion.id", ondelete="CASCADE"),
        nullable=False
    )
    entrada_devolucion: Mapped["EntradaDevolucion"] = relationship(
        "EntradaDevolucion", 
        back_populates="productos_devueltos"
    )