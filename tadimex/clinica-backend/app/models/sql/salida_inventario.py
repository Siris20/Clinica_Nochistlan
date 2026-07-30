from sqlalchemy import Integer, ForeignKey, String, Date, Enum as SQLEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.sql.base import Base
from app.models.sql.enums import TipoSalida
from typing import TYPE_CHECKING, Optional

if TYPE_CHECKING:
    from .movimiento_inventario import MovimientoInventario
    from .salida_venta import SalidaVenta

class SalidaInventario(Base):
    __tablename__ = "salidas_inventario"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    movimiento_id: Mapped[int] = mapped_column(Integer, ForeignKey("movimientos_inventario.id", name="fk_salidas_inventario_movimiento_id", ondelete="CASCADE"), nullable=False, unique=True)
    tipo_salida: Mapped[TipoSalida] = mapped_column(SQLEnum(TipoSalida), nullable=False)
    fecha_salida: Mapped[Optional[Date]] = mapped_column(Date, nullable=True)
    numero_documento: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)

    # Relaciones
    movimiento: Mapped["MovimientoInventario"] = relationship("MovimientoInventario", back_populates="salida_inventario", uselist=False)
    salida_venta: Mapped[Optional["SalidaVenta"]] = relationship("SalidaVenta", back_populates="salida_inventario", uselist=False)
