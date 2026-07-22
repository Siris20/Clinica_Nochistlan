from sqlalchemy import Integer, ForeignKey, String, Date, DECIMAL, Enum as SQLEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.sql.base import Base
from app.models.sql.enums import MetodoPago
from typing import TYPE_CHECKING, List, Optional
from decimal import Decimal

if TYPE_CHECKING:
    from .entrada_inventario import EntradaInventario
    from .producto_comprado import ProductoComprado
    from .proveedor import Proveedor

class EntradaCompra(Base):
    __tablename__ = "entradas_compra"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    entrada_inventario_id: Mapped[int] = mapped_column(Integer, ForeignKey("entradas_inventario.id", name="fk_entradas_compra_entrada_inventario_id", ondelete="CASCADE"), nullable=False, unique=True)
    proveedor_id: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey("proveedores.id", name="fk_entradas_compra_proveedor_id", ondelete="RESTRICT"), nullable=True)
    numero_factura: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    fecha_factura: Mapped[Optional[Date]] = mapped_column(Date, nullable=True)
    fecha_pago: Mapped[Optional[Date]] = mapped_column(Date, nullable=True)
    metodo_pago: Mapped[Optional[MetodoPago]] = mapped_column(SQLEnum(MetodoPago), nullable=True)
    costo_envio: Mapped[Optional[Decimal]] = mapped_column(DECIMAL(10,2), nullable=True, default=0)
    descuento_general: Mapped[Optional[Decimal]] = mapped_column(DECIMAL(10,2), nullable=True, default=0)
    impuesto: Mapped[Optional[Decimal]] = mapped_column(DECIMAL(10,2), nullable=True, default=0)

    # Relaciones
    entrada_inventario: Mapped["EntradaInventario"] = relationship("EntradaInventario", back_populates="entrada_compra", uselist=False)
    proveedor: Mapped[Optional["Proveedor"]] = relationship("Proveedor", back_populates="entradas_compra")
    productos_comprados: Mapped[List["ProductoComprado"]] = relationship(
        "ProductoComprado", back_populates="entrada_compra", cascade="all, delete-orphan"
    )