from sqlalchemy import Integer, ForeignKey, Numeric, UniqueConstraint, String
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.sql.base import Base
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from .cotizacion import Cotizacion
    from .producto import Producto

class ProductoCotizado(Base):
    __tablename__ = "productos_cotizados"
    __table_args__ = (UniqueConstraint('cotizacion_id', 'producto_id', name='uq_cotizacion_producto'),)
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    cotizacion_id: Mapped[int] = mapped_column(Integer, ForeignKey("cotizaciones.id"))
    producto_id: Mapped[int] = mapped_column(Integer, ForeignKey("productos.id"))
    cantidad: Mapped[int] = mapped_column(Integer, nullable=False, default=1)
    descuento: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False, default=0.0)
    concepto: Mapped[str] = mapped_column(String(255), nullable=False)
    precio_unitario: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)

    # Relaciones
    cotizacion: Mapped["Cotizacion"] = relationship("Cotizacion", back_populates="productos_cotizados")
    producto: Mapped["Producto"] = relationship("Producto", back_populates="productos_cotizados")