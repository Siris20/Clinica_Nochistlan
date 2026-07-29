from typing import Optional, List, TYPE_CHECKING
from sqlalchemy import String, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.sql.base import Base

if TYPE_CHECKING:
    from .empleado import Empleado
    from .cita import Cita
    from .area import Area  

class Especialista(Base):
    __tablename__ = "especialistas"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)

    # Relación 1:1 con Empleado
    empleado_id: Mapped[int] = mapped_column(
        ForeignKey("empleados.id"), 
        unique=True, 
        nullable=False
    )

    area_id: Mapped[int] = mapped_column(
        ForeignKey("areas.id"), 
        nullable=False,
        index=True
    )

    # Campos específicos
    cedula_profesional: Mapped[str] = mapped_column(
        String(50), 
        unique=True, 
        nullable=False, 
        index=True
    )
    especialidad: Mapped[str] = mapped_column(String(100), nullable=False)
    universidad_egreso: Mapped[Optional[str]] = mapped_column(String(150), nullable=True)

    # ==========================================
    # RELACIONES
    # ==========================================
    empleado: Mapped["Empleado"] = relationship(
        "Empleado", 
        back_populates="especialista"
    )
    
    area: Mapped["Area"] = relationship(
        "Area",
        back_populates="especialistas"
    )

    citas: Mapped[List["Cita"]] = relationship(
        "Cita", 
        back_populates="especialista"
    )