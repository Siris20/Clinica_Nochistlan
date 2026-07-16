from pydantic import BaseModel, root_validator
from datetime import date
from typing import Optional
from app.models.sql.enums import Sexo, PlazoContrato, BloodType, PaymentPeriod, TallaUniforme, TallaCalzado, Status


class EmpleadoBaseSchema(BaseModel):
    # Información personal
    name: str
    last_name: str
    image: Optional[str] = None
    birth_date: Optional[date] = None
    curp: Optional[str] = None
    gender: Optional[Sexo] = None
    phone_number: Optional[str] = None
    emergency_phone: Optional[str] = None
    emergency_phone_name: Optional[str] = None
    emergency_phone_relationship: Optional[str] = None
    email: Optional[str] = None

    # Dirección
    calle: Optional[str] = None
    numero_exterior: Optional[str] = None
    numero_interior: Optional[str] = None
    colonia: Optional[str] = None
    localidad: Optional[str] = None
    municipio: Optional[str] = None
    estado: Optional[str] = None
    codigo_postal: Optional[str] = None

    # Información laboral
    education_level: Optional[str] = None
    drivers_license: Optional[str] = None
    contract_term: Optional[PlazoContrato] = None
    contract_end_date: Optional[date] = None
    salary: Optional[float] = None
    base_salary: Optional[float] = None
    payment_period: Optional[PaymentPeriod] = None
    nss: Optional[str] = None
    rfc: Optional[str] = None
    infonavit_credit: Optional[str] = None
    department: Optional[str] = None 
    employee_code: Optional[str] = None
    entry_date: Optional[date] = None
    status: Optional[Status] = None
    position: Optional[str] = None

    # Información adicional
    blood_type: Optional[BloodType] = None
    shoe_size: Optional[TallaCalzado] = None
    allergies: Optional[str] = None
    uniform_size: Optional[TallaUniforme] = None

    class Config:
        from_attributes = True  


class EmpleadoCreateSchema(EmpleadoBaseSchema):
    @root_validator(pre=True)
    def check_contract_end_date(cls, values):
        contract_term = values.get('contract_term')
        contract_end_date = values.get('contract_end_date')
        
        if contract_term == PlazoContrato.DETERMINADO and not contract_end_date:
            raise ValueError('La fecha de fin de contrato es obligatoria para contratos determinados')
        return values


class EmpleadoResponseSchema(EmpleadoBaseSchema):
    id: int
    immediate_boss_id: Optional[int] = None


class EmpleadoUpdateSchema(BaseModel):
    # Solo incluir los campos que pueden ser actualizados
    name: Optional[str] = None
    last_name: Optional[str] = None
    curp: Optional[str] = None
    gender: Optional[Sexo] = None
    phone_number: Optional[str] = None
    emergency_phone: Optional[str] = None
    emergency_phone_name: Optional[str] = None
    emergency_phone_relationship: Optional[str] = None
    email: Optional[str] = None
    calle: Optional[str] = None
    numero_exterior: Optional[str] = None
    numero_interior: Optional[str] = None
    colonia: Optional[str] = None
    localidad: Optional[str] = None
    municipio: Optional[str] = None
    estado: Optional[str] = None
    codigo_postal: Optional[str] = None
    salary: Optional[float] = None
    base_salary: Optional[float] = None
    payment_period: Optional[PaymentPeriod] = None
    contract_end_date: Optional[date] = None
    education_level: Optional[str] = None
    drivers_license: Optional[str] = None
    infonavit_credit: Optional[str] = None
    department: Optional[str] = None 
    employee_code: Optional[str] = None
    blood_type: Optional[BloodType] = None
    shoe_size: Optional[TallaCalzado] = None
    allergies: Optional[str] = None
    uniform_size: Optional[TallaUniforme] = None
    immediate_boss_id: Optional[int] = None
    status: Optional[Status] = None
    position: Optional[str] = None

    class Config:
        from_attributes = True
