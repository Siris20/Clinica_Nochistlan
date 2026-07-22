from sqlalchemy import Integer, String, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.sql.base import Base
from typing import List, TYPE_CHECKING

if TYPE_CHECKING:
    from .empresa import Empresa
    from .empleado import Empleado
    from .cita import Cita  # <-- Agregamos Cita al TYPE_CHECKING

class Area(Base):
    __tablename__ = "areas"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str] = mapped_column(String(255), nullable=True)

    # Relaciones
    empresa_id: Mapped[int] = mapped_column(Integer, ForeignKey("empresas.id"), nullable=False)
    empresa: Mapped["Empresa"] = relationship(
        "Empresa", 
        back_populates="areas"
    )

    empleados: Mapped[List["Empleado"]] = relationship(
        "Empleado", 
        back_populates="area"
    )

    # Relación bidireccional con Citas (NUEVA)
    citas: Mapped[List["Cita"]] = relationship(
        "Cita",
        back_populates="area"
    )