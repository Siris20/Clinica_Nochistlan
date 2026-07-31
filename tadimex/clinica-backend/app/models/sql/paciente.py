from datetime import date
from decimal import Decimal
from typing import Optional
from sqlalchemy import String, Integer, Date, Numeric, Text
from sqlalchemy.orm import Mapped, mapped_column
from app.models.sql.base import Base


class Paciente(Base):
    __tablename__ = "pacientes"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    nombre: Mapped[str] = mapped_column(String(100), nullable=False)
    apellido_paterno: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    apellido_materno: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    fecha_nacimiento: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    edad: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    peso: Mapped[Optional[Decimal]] = mapped_column(Numeric(5, 2), nullable=True)
    altura: Mapped[Optional[Decimal]] = mapped_column(Numeric(3, 2), nullable=True)
    genero: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    curp: Mapped[Optional[str]] = mapped_column(String(18), nullable=True)
    grupo_sanguineo: Mapped[Optional[str]] = mapped_column(String(5), nullable=True)
    alergias: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    telefono_celular: Mapped[Optional[str]] = mapped_column(String(15), nullable=True)
    telefono_fijo: Mapped[Optional[str]] = mapped_column(String(15), nullable=True)
    email: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    calle: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    numero_exterior: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    numero_interior: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    colonia: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    localidad: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    municipio: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    estado: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    codigo_postal: Mapped[Optional[str]] = mapped_column(String(5), nullable=True)
    contacto_emergencia_nombre: Mapped[Optional[str]] = mapped_column(String(150), nullable=True)
    contacto_emergencia_telefono: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    contacto_emergencia_parentesco: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    observaciones: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    estatus: Mapped[Optional[str]] = mapped_column(String(20), server_default="activo", nullable=True)