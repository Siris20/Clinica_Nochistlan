from sqlalchemy import String, Integer, Float, Date, Text, ForeignKey, Enum
from sqlalchemy.orm import relationship, Mapped, mapped_column
from app.models.sql.base import Base
from app.models.sql.enums import Sexo, PlazoContrato, BloodType, PaymentPeriod, TallaUniforme, TallaCalzado, Status
from sqlalchemy.orm import validates
from typing import TYPE_CHECKING, Optional, List

if TYPE_CHECKING:
    from .almacen import Almacen
    from .area import Area
    from .sucursal import Sucursal
    from .usuario import Usuario
    from .especialista import Especialista
    from .movimiento_inventario import MovimientoInventario

    
class Empleado(Base):
    __tablename__ = "empleados"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True)

    # Información personal
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    last_name: Mapped[str] = mapped_column(String(200), nullable=False)
    image: Mapped[str] = mapped_column(String(255), nullable=True)
    birth_date: Mapped[Date] = mapped_column(Date, nullable=True)
    curp: Mapped[str] = mapped_column(String(18), nullable=True)
    gender: Mapped[Sexo] = mapped_column(Enum(Sexo), nullable=True)
    phone_number: Mapped[str] = mapped_column(String(15), nullable=True)
    emergency_phone: Mapped[str] = mapped_column(String(15), nullable=True)
    emergency_phone_name: Mapped[str] = mapped_column(String(255), nullable=True)
    emergency_phone_relationship: Mapped[str] = mapped_column(String(100), nullable=True)
    email: Mapped[str] = mapped_column(String(255), nullable=True)
    
    # Dirección
    calle: Mapped[str] = mapped_column(String(255), nullable=True)
    numero_exterior: Mapped[str] = mapped_column(String(50), nullable=True)
    numero_interior: Mapped[str] = mapped_column(String(50), nullable=True)
    colonia: Mapped[str] = mapped_column(String(255), nullable=True)
    localidad: Mapped[str] = mapped_column(String(255), nullable=True)
    municipio: Mapped[str] = mapped_column(String(255), nullable=True)
    estado: Mapped[str] = mapped_column(String(100), nullable=True)
    codigo_postal: Mapped[str] = mapped_column(String(5), nullable=True)
    
    # Información laboral
    education_level: Mapped[str] = mapped_column(String(100), nullable=True)
    drivers_license: Mapped[str] = mapped_column(String(50), nullable=True)
    contract_term: Mapped[PlazoContrato] = mapped_column(Enum(PlazoContrato), nullable=True)
    contract_end_date: Mapped[Date] = mapped_column(Date, nullable=True)
    salary: Mapped[float] = mapped_column(Float, nullable=True)
    base_salary: Mapped[float] = mapped_column(Float, nullable=True)
    payment_period: Mapped[PaymentPeriod] = mapped_column(Enum(PaymentPeriod), nullable=True)
    nss: Mapped[str] = mapped_column(String(11), nullable=True)
    rfc: Mapped[str] = mapped_column(String(13), nullable=True)
    infonavit_credit: Mapped[str] = mapped_column(String(50), nullable=True)
    department: Mapped[str] = mapped_column(String(100), nullable=True)
    employee_code: Mapped[str] = mapped_column(String(50), nullable=True)
    entry_date: Mapped[Date] = mapped_column(Date, nullable=True)
    status: Mapped[Status] = mapped_column(Enum(Status), nullable=True)
    position: Mapped[str] = mapped_column(String(100), nullable=True)


    
    # Información adicional
    allergies: Mapped[str] = mapped_column(Text, nullable=True)

    blood_type: Mapped[BloodType] = mapped_column(
        Enum(BloodType, values_callable=lambda x: [e.value for e in x]),
        nullable=True
    )
    
    shoe_size: Mapped[TallaCalzado] = mapped_column(
        Enum(TallaCalzado, values_callable=lambda x: [e.value for e in x]),
        nullable=True
    )
    uniform_size: Mapped[str] = mapped_column(Enum(TallaUniforme), nullable=True)


    # Relaciones

    area_id: Mapped[Optional[int]] = mapped_column(ForeignKey("areas.id"), nullable=True)
    area: Mapped[Optional["Area"]] = relationship("Area", back_populates="empleados")

    sucursal_id: Mapped[Optional[int]] = mapped_column(ForeignKey("sucursales.id"), nullable=True)
    sucursal: Mapped[Optional["Sucursal"]] = relationship(
        "Sucursal", 
        back_populates="empleados",
        foreign_keys=[sucursal_id]
    )
        
    sucursales_gerente: Mapped[List["Sucursal"]] = relationship(
        "Sucursal",
        back_populates="gerente",
        foreign_keys="[Sucursal.gerente_id]"
    )

    almacenes_encargado: Mapped[List["Almacen"]] = relationship(
        "Almacen",
        back_populates="encargado",
        primaryjoin="Almacen.encargado_id == Empleado.id"
    )
    
    immediate_boss_id: Mapped[Optional[int]] = mapped_column(ForeignKey("empleados.id"), nullable=True)
    jefe: Mapped[Optional["Empleado"]] = relationship(
        "Empleado",
        remote_side=[id],
        back_populates="subordinados",
        foreign_keys=[immediate_boss_id]
    )
    subordinados: Mapped[List["Empleado"]] = relationship(
        "Empleado",
        back_populates="jefe",
        foreign_keys=[immediate_boss_id]
    )

    usuario: Mapped[Optional["Usuario"]] = relationship(
        "Usuario", 
        back_populates="empleado", 
        uselist=False
    )
    
    # Relación 1:1 con Especialista (uselist=False para indicar que no es lista)
    especialista: Mapped[Optional["Especialista"]] = relationship(
        "Especialista", 
        back_populates="empleado", 
        uselist=False
    )
    movimientos_inventario: Mapped[List["MovimientoInventario"]] = relationship("MovimientoInventario", back_populates="empleado")

    
    @validates("contract_end_date")
    def validate_fecha_fin_contrato(self, key, value):
        # Validar que si el contrato es de tipo "DETERMINADO", la fecha de fin no sea None
        if self.contract_term == PlazoContrato.DETERMINADO and value is None:
            raise ValueError("La fecha de fin de contrato es obligatoria para contratos determinados")
        return value



