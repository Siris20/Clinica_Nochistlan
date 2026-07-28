import enum
from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Enum as SQLEnum, Text
from sqlalchemy.orm import relationship
from app.models.sql.base import Base


class EstadoCita(str, enum.Enum):
    PROGRAMADA = "PROGRAMADA"
    CONFIRMADA = "CONFIRMADA"
    PENDIENTE = "PENDIENTE"
    CANCELADA = "CANCELADA"
    COMPLETADA = "COMPLETADA"
    NO_ASISTIO = "NO_ASISTIO"


class Cita(Base):
    __tablename__ = "citas"

    id = Column(Integer, primary_key=True, index=True)
    
    # Llaves Foráneas
    cliente_id = Column(Integer, ForeignKey("clientes.id"), nullable=False)
    area_id = Column(Integer, ForeignKey("areas.id"), nullable=False)
    sucursal_id = Column(Integer, ForeignKey("sucursales.id"), nullable=False)
    especialista_id = Column(Integer, ForeignKey("especialistas.id"), nullable=False)
    
    fecha_inicio = Column(DateTime, nullable=False)
    fecha_fin = Column(DateTime, nullable=False)
    motivo = Column(String(255), nullable=True)
    estado = Column(SQLEnum(EstadoCita), default=EstadoCita.PENDIENTE, nullable=False)
    observaciones = Column(Text, nullable=True)
    
    # Solución al deprecado datetime.utcnow
    created_at = Column(
        DateTime, 
        default=lambda: datetime.now(timezone.utc), 
        nullable=False
    )
    updated_at = Column(
        DateTime, 
        default=lambda: datetime.now(timezone.utc), 
        onupdate=lambda: datetime.now(timezone.utc), 
        nullable=False
    )

    # Relaciones ORM
    cliente = relationship("Cliente", back_populates="citas")
    area = relationship("Area", back_populates="citas")
    sucursal = relationship("Sucursal", back_populates="citas")
    especialista = relationship("Especialista", back_populates="citas")