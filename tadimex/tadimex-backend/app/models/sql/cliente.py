from sqlalchemy import String, Integer, Enum, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.sql.base import Base
from app.models.sql.enums import TipoPersona, RegimenFiscal, EstadoCliente
from typing import TYPE_CHECKING, List

if TYPE_CHECKING:
    from .empresa import Empresa
    from .cotizacion import Cotizacion
    from .salida_venta import SalidaVenta

class Cliente(Base):
    __tablename__ = "clientes"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    
    nombre_fiscal: Mapped[str] = mapped_column(String(255), nullable=False)
    tipo_persona: Mapped[TipoPersona] = mapped_column(
        Enum(TipoPersona, values_callable=lambda x: [e.value for e in x]),
        nullable=True
    )
    regimen_fiscal: Mapped[RegimenFiscal] = mapped_column(
        Enum(RegimenFiscal, values_callable=lambda x: [e.value for e in x]),
        nullable=True
    )
    rfc: Mapped[str] = mapped_column(String(13), nullable=False)
    contact_name: Mapped[str] = mapped_column(String(255), nullable=True)
    alias: Mapped[str] = mapped_column(String(100), nullable=True)
    land_line: Mapped[str] = mapped_column(String(15), nullable=True)
    phone_number: Mapped[str] = mapped_column(String(15), nullable=True)
    email: Mapped[str] = mapped_column(String(255), nullable=True)
    calle: Mapped[str] = mapped_column(String(255), nullable=True)
    numero_exterior: Mapped[str] = mapped_column(String(50), nullable=True)
    numero_interior: Mapped[str] = mapped_column(String(50), nullable=True)
    colonia: Mapped[str] = mapped_column(String(255), nullable=True)
    localidad: Mapped[str] = mapped_column(String(255), nullable=True)
    municipio: Mapped[str] = mapped_column(String(255), nullable=True)
    estado: Mapped[str] = mapped_column(String(100), nullable=True)
    codigo_postal: Mapped[str] = mapped_column(String(5), nullable=True)
    observaciones: Mapped[str] = mapped_column(String(255), nullable =True)
    estado_cliente: Mapped[EstadoCliente] = mapped_column(
        Enum(EstadoCliente, values_callable=lambda x: [e.value for e in x]),
        nullable=False,
        default=EstadoCliente.PROSPECTO
    )

    # Relaciones
    empresa_id: Mapped[int] = mapped_column(Integer, ForeignKey("empresas.id"), nullable=False)
    empresa: Mapped["Empresa"] = relationship("Empresa", back_populates="clientes")
    cotizaciones: Mapped[List["Cotizacion"]] = relationship("Cotizacion", back_populates="cliente")
    salidas_venta: Mapped[List["SalidaVenta"]] = relationship("SalidaVenta", back_populates="cliente")
    citas: Mapped[List["Cita"]] = relationship("Cita", back_populates="cliente", cascade="all, delete-orphan")