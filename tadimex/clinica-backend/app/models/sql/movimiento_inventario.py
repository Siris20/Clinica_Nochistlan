from sqlalchemy import Integer, ForeignKey, String, DateTime, Text, Enum as SQLEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.sql.base import Base
from app.models.sql.enums import TipoMovimiento, EstadoMovimiento
from datetime import datetime
from typing import TYPE_CHECKING, Optional

if TYPE_CHECKING:
    from .empleado import Empleado
    from .entrada_inventario import EntradaInventario
    from .salida_inventario import SalidaInventario

class MovimientoInventario(Base):
    __tablename__ = "movimientos_inventario"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    empleado_id: Mapped[int] = mapped_column(Integer, ForeignKey("empleados.id", name="fk_movimientos_inventario_empleado_id", ondelete="RESTRICT"), nullable=False)
    tipo_movimiento: Mapped[TipoMovimiento] = mapped_column(SQLEnum(TipoMovimiento), nullable=False)
    fecha_movimiento: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=datetime.now)
    observaciones: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    estado: Mapped[EstadoMovimiento] = mapped_column(SQLEnum(EstadoMovimiento), nullable=False, default=EstadoMovimiento.PENDIENTE)

    # Relaciones
    empleado: Mapped["Empleado"] = relationship("Empleado", back_populates="movimientos_inventario")
    entrada_inventario: Mapped[Optional["EntradaInventario"]] = relationship("EntradaInventario", back_populates="movimiento", uselist=False)
    salida_inventario: Mapped[Optional["SalidaInventario"]] = relationship("SalidaInventario", back_populates="movimiento", uselist=False)