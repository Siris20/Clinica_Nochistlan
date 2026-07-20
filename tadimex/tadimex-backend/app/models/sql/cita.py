from sqlalchemy import Integer, ForeignKey, DateTime, Text, Enum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.sql.base import Base
from datetime import datetime
from typing import Optional, TYPE_CHECKING
import enum

# Usamos TYPE_CHECKING para evitar que Python intente importar estos archivos
# en tiempo de ejecución, lo que rompe el sistema con un error 500.
if TYPE_CHECKING:
    from app.models.sql.cliente import Cliente
    from app.models.sql.area import Area
    from app.models.sql.sucursal import Sucursal

class EstadoCita(str, enum.Enum):
    PENDIENTE = "Pendiente"
    CONFIRMADA = "Confirmada"
    CANCELADA = "Cancelada"
    COMPLETADA = "Completada"

class Cita(Base):
    __tablename__ = "citas"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    
    cliente_id: Mapped[int] = mapped_column(Integer, ForeignKey("clientes.id", ondelete="CASCADE"), nullable=False)
    area_id: Mapped[int] = mapped_column(Integer, ForeignKey("areas.id", ondelete="RESTRICT"), nullable=False)
    sucursal_id: Mapped[int] = mapped_column(Integer, ForeignKey("sucursales.id", ondelete="RESTRICT"), nullable=False)
    
    fecha_inicio: Mapped[datetime] = mapped_column(DateTime, nullable=False, index=True)
    fecha_fin: Mapped[datetime] = mapped_column(DateTime, nullable=False, index=True)
    
    motivo: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    estado: Mapped[EstadoCita] = mapped_column(Enum(EstadoCita), default=EstadoCita.PENDIENTE, nullable=False)
    observaciones: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # NOTA CRÍTICA: Definir el destino como un String ("Cliente", "Area", "Sucursal")
    # evita que SQLAlchemy necesite importar físicamente el archivo de inmediato.
    cliente: Mapped["Cliente"] = relationship("Cliente", back_populates="citas")
    area: Mapped["Area"] = relationship("Area", back_populates="citas")
    sucursal: Mapped["Sucursal"] = relationship("Sucursal", back_populates="citas")