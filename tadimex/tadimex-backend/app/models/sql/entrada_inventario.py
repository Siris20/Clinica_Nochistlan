from sqlalchemy import Integer, ForeignKey, String, Date, Enum as SQLEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.sql.base import Base
from app.models.sql.enums import TipoEntrada
from typing import TYPE_CHECKING, Optional

if TYPE_CHECKING:
    from .almacen import Almacen
    from .movimiento_inventario import MovimientoInventario
    from .entrada_compra import EntradaCompra

class EntradaInventario(Base):
    __tablename__ = "entradas_inventario"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    movimiento_id: Mapped[int] = mapped_column(Integer, ForeignKey("movimientos_inventario.id", name="fk_entradas_inventario_movimiento_id", ondelete="CASCADE"), nullable=False, unique=True)
    almacen_id: Mapped[int] = mapped_column(Integer, ForeignKey("almacenes.id", name="fk_entradas_inventario_almacen_id", ondelete="RESTRICT"), nullable=False)
    tipo_entrada: Mapped[TipoEntrada] = mapped_column(SQLEnum(TipoEntrada), nullable=False)
    fecha_recepcion: Mapped[Optional[Date]] = mapped_column(Date, nullable=True)
    numero_documento: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)

    # Relaciones
    movimiento: Mapped["MovimientoInventario"] = relationship("MovimientoInventario", back_populates="entrada_inventario", uselist=False)
    almacen: Mapped["Almacen"] = relationship("Almacen", back_populates="entradas_inventario")
    entrada_compra: Mapped[Optional["EntradaCompra"]] = relationship("EntradaCompra", back_populates="entrada_inventario", uselist=False)
    