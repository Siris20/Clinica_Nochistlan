from sqlalchemy import String, Integer, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.sql.base import Base
from typing import TYPE_CHECKING, List, Optional

if TYPE_CHECKING:
    from .empresa import Empresa
    from .almacen import Almacen
    from .empleado import Empleado

class Sucursal(Base):
    __tablename__ = "sucursales"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    calle: Mapped[str] = mapped_column(String(255), nullable=True)
    numero_exterior: Mapped[str] = mapped_column(String(50), nullable=True)
    numero_interior: Mapped[str] = mapped_column(String(50), nullable=True)
    colonia: Mapped[str] = mapped_column(String(255), nullable=True)
    localidad: Mapped[str] = mapped_column(String(255), nullable=True)
    municipio: Mapped[str] = mapped_column(String(255), nullable=True)
    estado: Mapped[str] = mapped_column(String(100), nullable=True)
    codigo_postal: Mapped[str] = mapped_column(String(5), nullable=True)
    phone_number: Mapped[str] = mapped_column(String(10), nullable=True)

    # Relaciones
    empresa_id: Mapped[int] = mapped_column(
        Integer, 
        ForeignKey("empresas.id", ondelete="CASCADE"),
        nullable=False
    )
    empresa: Mapped["Empresa"] = relationship(
        "Empresa", 
        back_populates="sucursales"
    )

    almacenes: Mapped[List["Almacen"]] = relationship(
        "Almacen", 
        back_populates="sucursal",
        cascade="all, delete-orphan"
    )
    
    empleados: Mapped[List["Empleado"]] = relationship(
        "Empleado",
        back_populates="sucursal",
        foreign_keys="[Empleado.sucursal_id]"
    )
    
    gerente_id: Mapped[Optional[int]] = mapped_column(
        Integer, 
        ForeignKey("empleados.id", use_alter=True, name="fk_gerente"),
        nullable=True
    )
    gerente: Mapped[Optional["Empleado"]] = relationship(
        "Empleado",
        back_populates="sucursales_gerente",
        foreign_keys=[gerente_id]
    )