from sqlalchemy import Integer, ForeignKey, Numeric, Date
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.sql.base import Base
from datetime import date
from typing import TYPE_CHECKING, List, Optional

if TYPE_CHECKING:
    from .emisor import Emisor
    from .cliente import Cliente
    from .logo import Logo
    from .producto_cotizado import ProductoCotizado
    from .salida_venta import SalidaVenta

from sqlalchemy import String

class Cotizacion(Base):
    __tablename__ = "cotizaciones"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    emisor_id: Mapped[int] = mapped_column(Integer, ForeignKey("emisores.id"), nullable=False)
    cliente_id: Mapped[int] = mapped_column(Integer, ForeignKey("clientes.id"), nullable=False)
    logo_id: Mapped[int] = mapped_column(Integer, ForeignKey("logos.id"), nullable=True)
    folio: Mapped[Optional[str]] = mapped_column(String(50), nullable=True, unique=True)
    fecha_vencimiento: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    subtotal: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False, default=0.0)
    iva: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False, default=0.0)
    isr_ret: Mapped[float] = mapped_column(Numeric(10,2), nullable=False, default=0.0)
    descuento_general: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False, default=0.0)
    gastos_envio: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False, default=0.0)
    total: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False, default=0.0)
    observaciones: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    condiciones_venta: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)

    # Relaciones
    emisor: Mapped["Emisor"] = relationship("Emisor", back_populates="cotizaciones")
    cliente: Mapped["Cliente"] = relationship("Cliente", back_populates="cotizaciones")
    logo: Mapped["Logo"] = relationship("Logo", back_populates="cotizaciones")
    productos_cotizados: Mapped[List["ProductoCotizado"]] = relationship(
        "ProductoCotizado", 
        back_populates="cotizacion", 
        cascade="all, delete-orphan"
    )
    salidas_venta: Mapped[List["SalidaVenta"]] = relationship("SalidaVenta", back_populates="cotizacion")