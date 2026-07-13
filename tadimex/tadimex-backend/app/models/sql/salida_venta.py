from sqlalchemy import Integer, ForeignKey, String, Date, DECIMAL, Enum as SQLEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.sql.base import Base
from app.models.sql.enums import MetodoPago
from typing import TYPE_CHECKING, List, Optional
from decimal import Decimal

if TYPE_CHECKING:
    from .salida_inventario import SalidaInventario
    from .producto_vendido import ProductoVendido
    from .cliente import Cliente
    from .cotizacion import Cotizacion

class SalidaVenta(Base):
    __tablename__ = "salidas_venta"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    salida_inventario_id: Mapped[int] = mapped_column(Integer, ForeignKey("salidas_inventario.id", name="fk_salidas_venta_salida_inventario_id", ondelete="CASCADE"), nullable=False, unique=True)
    cliente_id: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey("clientes.id", name="fk_salidas_venta_cliente_id", ondelete="RESTRICT"), nullable=True)
    cotizacion_id: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey("cotizaciones.id",name="fk_salidas_venta_cotizacion_id", ondelete="RESTRICT"), nullable=True)
    numero_factura: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    fecha_factura: Mapped[Optional[Date]] = mapped_column(Date, nullable=True)
    fecha_pago: Mapped[Optional[Date]] = mapped_column(Date, nullable=True)
    metodo_pago: Mapped[Optional[MetodoPago]] = mapped_column(SQLEnum(MetodoPago), nullable=True)
    costo_envio: Mapped[Optional[Decimal]] = mapped_column(DECIMAL(10,2), nullable=True, default=0)

    # Relaciones
    salida_inventario: Mapped["SalidaInventario"] = relationship("SalidaInventario", back_populates="salida_venta", uselist=False)
    cliente: Mapped[Optional["Cliente"]] = relationship("Cliente", back_populates="salidas_venta")
    cotizacion: Mapped[Optional["Cotizacion"]] = relationship("Cotizacion", back_populates="salidas_venta")
    productos_vendidos: Mapped[List["ProductoVendido"]] = relationship(
        "ProductoVendido", back_populates="salida_venta", cascade="all, delete-orphan"
    )