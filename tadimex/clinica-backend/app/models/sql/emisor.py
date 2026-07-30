from sqlalchemy import String, Boolean, Enum, Integer, ForeignKey
from sqlalchemy.orm import relationship, Mapped, mapped_column
from app.models.sql.base import Base
from app.models.sql.enums import TipoPersona, RegimenFiscal
from typing import TYPE_CHECKING, List

if TYPE_CHECKING:
    from .empresa import Empresa
    from .cotizacion import Cotizacion

class Emisor(Base):
    __tablename__ = "emisores"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True)

    rfc: Mapped[str] = mapped_column(String(13), unique=True, nullable=False)
    tipo_persona: Mapped[TipoPersona] = mapped_column(
        Enum(TipoPersona, values_callable=lambda x: [e.value for e in x]),
        nullable=True
    )
    regimen_fiscal: Mapped[RegimenFiscal] = mapped_column(
        Enum(RegimenFiscal, values_callable=lambda x: [e.value for e in x]),
        nullable=True
    )
    razon_social: Mapped[str] = mapped_column(String(255), nullable=False)
    
    # Dirección
    calle: Mapped[str] = mapped_column(String(255), nullable=True)
    numero_exterior: Mapped[str] = mapped_column(String(50), nullable=True)
    numero_interior: Mapped[str] = mapped_column(String(50), nullable=True)
    colonia: Mapped[str] = mapped_column(String(255), nullable=True)
    localidad: Mapped[str] = mapped_column(String(255), nullable=True)
    municipio: Mapped[str] = mapped_column(String(255), nullable=True)
    estado: Mapped[str] = mapped_column(String(100), nullable=True)
    codigo_postal: Mapped[str] = mapped_column(String(5), nullable=True)
    
    # Información bancaria
    banco: Mapped[str] = mapped_column(String(100), nullable=True)
    numero_cuenta: Mapped[str] = mapped_column(String(20), nullable=True)
    numero_tarjeta: Mapped[str] = mapped_column(String(16), nullable=True)
    clabe: Mapped[str] = mapped_column(String(18), nullable=True)
    
    # Información CSD
    certificado_path: Mapped[str] = mapped_column(String(255), nullable=True)
    clave_privada_path: Mapped[str] = mapped_column(String(255), nullable=True)
    numero_certificado: Mapped[str] = mapped_column(String(100), nullable=True)
    contrasena_clave: Mapped[str] = mapped_column(String(255), nullable=True)
    es_pruebas: Mapped[bool] = mapped_column(Boolean, default=False)
    
    # Relaciones
    empresa_id: Mapped[int] = mapped_column(Integer, ForeignKey("empresas.id"), nullable=False)
    empresa: Mapped["Empresa"] = relationship("Empresa", back_populates="emisores")
    cotizaciones: Mapped[List["Cotizacion"]] = relationship("Cotizacion", back_populates="emisor")