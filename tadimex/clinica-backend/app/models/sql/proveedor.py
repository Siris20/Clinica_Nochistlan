#Modelo proveedor para hacer relacion con compras
from sqlalchemy import String, Integer, ForeignKey, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.sql.base import Base
from typing import List, Optional, TYPE_CHECKING

if TYPE_CHECKING:
    from .entrada_compra import EntradaCompra
    from .empresa import Empresa

class Proveedor(Base):
    __tablename__ = "proveedores"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    nombre: Mapped[str] = mapped_column(String(255), nullable=False)
    telefono: Mapped[Optional[str]] = mapped_column(String(15), nullable=True)
    email: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    
    # Dirección
    calle: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    numero_exterior: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    numero_interior: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    colonia: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    localidad: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    municipio: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    estado: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    codigo_postal: Mapped[Optional[str]] = mapped_column(String(5), nullable=True)
    observaciones: Mapped[Optional[str]] = mapped_column(String(200), nullable=True)
    
    # Relaciones
    empresa_id: Mapped[int] = mapped_column(Integer, ForeignKey("empresas.id"), nullable=False)
    empresa: Mapped["Empresa"] = relationship("Empresa", back_populates="proveedores")
    entradas_compra: Mapped[List["EntradaCompra"]] = relationship(
        "EntradaCompra",
        back_populates="proveedor"
    )