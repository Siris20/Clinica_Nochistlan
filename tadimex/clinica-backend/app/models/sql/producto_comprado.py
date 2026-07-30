from sqlalchemy import Integer, ForeignKey, DECIMAL, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.sql.base import Base
from typing import TYPE_CHECKING
from decimal import Decimal

if TYPE_CHECKING:
    from .entrada_compra import EntradaCompra
    from .producto import Producto

class ProductoComprado(Base):
    __tablename__ = "productos_comprados"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    entrada_compra_id: Mapped[int] = mapped_column(Integer, ForeignKey("entradas_compra.id", name="fk_productos_comprados_entrada_compra_id", ondelete="CASCADE"), nullable=False)
    producto_id: Mapped[int] = mapped_column(Integer, ForeignKey("productos.id", name="fk_productos_comprados_producto_id", ondelete="RESTRICT"), nullable=False)
    cantidad: Mapped[int] = mapped_column(Integer, nullable=False)
    costo_unitario: Mapped[Decimal] = mapped_column(DECIMAL(10,2), nullable=False)
    
    # Campos para almacenar datos originales
    precio_unitario_original: Mapped[Decimal] = mapped_column(DECIMAL(10,2), nullable=False)
    incluye_iva_original: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)

    # Relaciones
    entrada_compra: Mapped["EntradaCompra"] = relationship("EntradaCompra", back_populates="productos_comprados")
    producto: Mapped["Producto"] = relationship("Producto", back_populates="productos_comprados")
