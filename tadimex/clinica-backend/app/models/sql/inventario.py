from sqlalchemy import Integer, ForeignKey, DateTime, DECIMAL, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.sql.base import Base
from datetime import datetime
from typing import TYPE_CHECKING, Optional
from decimal import Decimal

if TYPE_CHECKING:
    from .almacen import Almacen
    from .producto import Producto

class Inventarios(Base):
    __tablename__ = "inventarios"
    __table_args__ = (UniqueConstraint('almacen_id', 'producto_id', name='uix_almacen_producto'),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    almacen_id: Mapped[int] = mapped_column(Integer, ForeignKey("almacenes.id", name="fk_inventarios_almacen_id", ondelete="CASCADE"), nullable=False)
    producto_id: Mapped[int] = mapped_column(Integer, ForeignKey("productos.id", name="fk_inventarios_producto_id", ondelete="CASCADE"), nullable=False)
    cantidad_actual: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    costo_promedio: Mapped[Decimal] = mapped_column(DECIMAL(10,2), nullable=False, default=0)
    fecha_ultima_entrada: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    fecha_ultima_salida: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    fecha_ultima_actualizacion: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=datetime.now)
    stock_minimo: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    stock_maximo: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)

    # Relaciones
    almacen: Mapped["Almacen"] = relationship("Almacen", back_populates="inventarios")
    producto: Mapped["Producto"] = relationship("Producto", back_populates="inventarios")

