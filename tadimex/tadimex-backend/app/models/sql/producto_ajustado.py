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
    from .entrada_ajuste import EntradaAjuste

class ProductoAjustado(Base):
    __tablename__ = "productos_ajustados"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    cantidad: Mapped[int] = mapped_column(Integer, nullable=False)
    costo_unitario_asignado: Mapped[Optional[Decimal]] = mapped_column(DECIMAL(10,2), nullable=True)
    razon_ajuste: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    producto_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("productos.id", ondelete="RESTRICT"),
        nullable=False
    )
    producto: Mapped["Producto"] = relationship("Producto", back_populates="productos_ajustados")
    
    # Relación con entrada de ajuste
    entrada_ajuste_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("entradas_ajuste.id", ondelete="CASCADE"),
        nullable=False
    )
    entrada_ajuste: Mapped["EntradaAjuste"] = relationship(
        "EntradaAjuste", 
        back_populates="productos_ajustados"
    )
