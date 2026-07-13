from sqlalchemy import String, Integer, Float, Date, Text, ForeignKey, Enum, Boolean
from sqlalchemy.orm import relationship, Mapped, mapped_column
from app.models.sql.base import Base
from app.models.sql.enums import Sexo, PlazoContrato, RolUsuario, BloodType, PaymentPeriod, TallaUniforme, TallaCalzado, Status
from sqlalchemy.orm import validates
from typing import TYPE_CHECKING, Optional, List

if TYPE_CHECKING:
    from .empleado import Empleado


class Usuario(Base):
    __tablename__ = "usuarios"
    
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    rol: Mapped[RolUsuario] = mapped_column(
        Enum(RolUsuario, values_callable=lambda x: [e.value for e in x]),
        nullable=False
    )
    activo: Mapped[bool] = mapped_column(Boolean, default=True)
    
    # Relaciones
    empleado_id: Mapped[int] = mapped_column(Integer, ForeignKey('empleados.id', ondelete="CASCADE"), unique=True)
    empleado: Mapped["Empleado"] = relationship("Empleado", back_populates="usuario")