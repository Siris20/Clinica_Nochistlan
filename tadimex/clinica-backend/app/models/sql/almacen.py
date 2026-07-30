from sqlalchemy import String, Integer, Enum, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.sql.base import Base
from app.models.sql.enums import TipoAlmacen
from typing import List, Optional, TYPE_CHECKING

if TYPE_CHECKING:
    from .sucursal import Sucursal
    from .empleado import Empleado
    from .entrada_inventario import EntradaInventario
    from .inventario import Inventarios
    from .producto_vendido import ProductoVendido

class Almacen(Base):
    __tablename__ = "almacenes"
    
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    calle: Mapped[str] = mapped_column(String(255), nullable=True)
    numero_exterior: Mapped[str] = mapped_column(String(50), nullable=True)
    numero_interior: Mapped[str] = mapped_column(String(50), nullable=True)
    colonia: Mapped[str] = mapped_column(String(255), nullable=True)
    localidad: Mapped[str] = mapped_column(String(255), nullable=True)
    municipio: Mapped[str] = mapped_column(String(255), nullable=True)
    estado: Mapped[str] = mapped_column(String(100), nullable=True)
    codigo_postal: Mapped[str] = mapped_column(String(5), nullable=True)
    type: Mapped[TipoAlmacen] = mapped_column(Enum(TipoAlmacen), nullable=True)

    #Relaciones
    sucursal_id: Mapped[int] = mapped_column(
        Integer, 
        ForeignKey("sucursales.id", ondelete="CASCADE"),
        nullable=False
    )
    sucursal: Mapped["Sucursal"] = relationship(
        "Sucursal", 
        back_populates="almacenes"
    )

    # Relación con encargado
    encargado_id: Mapped[Optional[int]] = mapped_column(
        Integer,
        ForeignKey("empleados.id"),
        nullable=True
    )
    encargado: Mapped[Optional["Empleado"]] = relationship(
        "Empleado",
        back_populates="almacenes_encargado"
    )
    entradas_inventario: Mapped[List["EntradaInventario"]] = relationship("EntradaInventario", back_populates="almacen", cascade="all, delete-orphan")
    inventarios: Mapped[List["Inventarios"]] = relationship("Inventarios", back_populates="almacen", cascade="all, delete-orphan")
    productos_vendidos: Mapped[List["ProductoVendido"]] = relationship("ProductoVendido", back_populates="almacen")