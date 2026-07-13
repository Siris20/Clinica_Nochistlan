from sqlalchemy import Integer, ForeignKey, DECIMAL, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.sql.base import Base
from typing import TYPE_CHECKING
from decimal import Decimal

if TYPE_CHECKING:
    from .salida_venta import SalidaVenta
    from .producto import Producto
    from .almacen import Almacen

class ProductoVendido(Base):
    __tablename__ = "productos_vendidos"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    salida_venta_id: Mapped[int] = mapped_column(Integer, ForeignKey("salidas_venta.id", name="fk_productos_vendidos_salida_venta_id", ondelete="CASCADE"), nullable=False)
    producto_id: Mapped[int] = mapped_column(Integer, ForeignKey("productos.id", name="fk_productos_vendidos_producto_id", ondelete="RESTRICT"), nullable=False)
    almacen_id: Mapped[int] = mapped_column(Integer, ForeignKey("almacenes.id", name="fk_productos_vendidos_almacen_id", ondelete="RESTRICT"), nullable=False)
    cantidad: Mapped[int] = mapped_column(Integer, nullable=False)
    costo_unitario: Mapped[Decimal] = mapped_column(DECIMAL(10,2), nullable=False)
    
    # Campos para almacenar datos originales
    precio_unitario_original: Mapped[Decimal] = mapped_column(DECIMAL(10,2), nullable=False)
    incluye_iva_original: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)

    # Relaciones
    salida_venta: Mapped["SalidaVenta"] = relationship("SalidaVenta", back_populates="productos_vendidos")
    producto: Mapped["Producto"] = relationship("Producto", back_populates="productos_vendidos")
    almacen: Mapped["Almacen"] = relationship("Almacen", back_populates="productos_vendidos")
