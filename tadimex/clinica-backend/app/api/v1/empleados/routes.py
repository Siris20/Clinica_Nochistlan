from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List
from app.db.mariadb import get_db    
from app.schemas.empleado import EmpleadoCreateSchema, EmpleadoUpdateSchema, EmpleadoResponseSchema  
from app.services.empleado_service import create_empleado, update_empleado, delete_empleado, get_empleado, get_all_empleados
from app.models.sql.enums import Sexo, Status, PlazoContrato, PaymentPeriod, BloodType, TallaCalzado, TallaUniforme  
from datetime import date
router = APIRouter()
from typing import Optional


@router.post("/empleado", response_model=EmpleadoResponseSchema)
async def create_empleado_route(
    
    name: str = Form(...),
    last_name: str = Form(...),
    birth_date: date = Form(...),
    curp: str = Form(...),
    gender: Sexo = Form(...),
    status: Status = Form(...),
    phone_number: Optional[str] = Form(None),
    emergency_phone: Optional[str] = Form(None),
    emergency_phone_name: Optional[str] = Form(None),
    emergency_phone_relationship: Optional[str] = Form(None),
    email: Optional[str] = Form(None),

    # Dirección
    calle: Optional[str] = Form(None),
    numero_exterior: Optional[str] = Form(None),
    numero_interior: Optional[str] = Form(None),
    colonia: Optional[str] = Form(None),
    localidad: Optional[str] = Form(None),
    municipio: Optional[str] = Form(None),
    estado: Optional[str] = Form(None),
    codigo_postal: Optional[str] = Form(None),

    # Información laboral
    education_level: Optional[str] = Form(None),
    drivers_license: Optional[str] = Form(None),
    contract_term: Optional[PlazoContrato] = Form(None),
    contract_end_date: Optional[date] = Form(None),
    salary: Optional[float] = Form(None),
    base_salary: Optional[float] = Form(None),
    payment_period: Optional[PaymentPeriod] = Form(None),
    nss: Optional[str] = Form(None),
    rfc: Optional[str] = Form(None),
    infonavit_credit: Optional[str] = Form(None),
    department: Optional[str] = Form(None),
    employee_code: Optional[str] = Form(None),
    entry_date: Optional[date] = Form(None),
    position: Optional[str] = Form(None),

    # Información adicional
    blood_type: Optional[BloodType] = Form(None),
    shoe_size: Optional[TallaCalzado] = Form(None),
    allergies: Optional[str] = Form(None),
    uniform_size: Optional[TallaUniforme] = Form(None),

    # Archivo
    image: Optional[UploadFile] = File(None),
    
    # Dependencias
    db: Session = Depends(get_db)
):
  
    empleado_data = EmpleadoCreateSchema(
        name=name,
        last_name=last_name,
        birth_date=birth_date,
        curp=curp,
        gender=gender,
        status=status,
        phone_number=phone_number,
        emergency_phone=emergency_phone,
        emergency_phone_name=emergency_phone_name,
        emergency_phone_relationship=emergency_phone_relationship,
        email=email,
        calle=calle,
        numero_exterior=numero_exterior,
        numero_interior=numero_interior,
        colonia=colonia,
        localidad=localidad,
        municipio=municipio,
        estado=estado,
        codigo_postal=codigo_postal,
        education_level=education_level,
        drivers_license=drivers_license,
        contract_term=contract_term,
        contract_end_date=contract_end_date,
        salary=salary,
        base_salary=base_salary,
        payment_period=payment_period,
        nss=nss,
        rfc=rfc,
        infonavit_credit=infonavit_credit,
        department=department,
        employee_code=employee_code,
        entry_date=entry_date,
        position=position,
        blood_type=blood_type,
        shoe_size=shoe_size,
        allergies=allergies,
        uniform_size=uniform_size
    )

    try:
        nuevo_empleado = await create_empleado(db, empleado_data, image)
        return nuevo_empleado
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Ruta para obtener un empleado por ID
@router.get("/empleado/{empleado_id}", response_model=EmpleadoResponseSchema)
def obtener_empleado(empleado_id: int,
     
    db: Session = Depends(get_db)):
    """
    Obtiene un empleado por su ID.
    """
    empleado = get_empleado(db, empleado_id)
    if not empleado:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Empleado no encontrado"
        )
    return empleado

# Ruta para obtener todos los empleados (con paginación)
@router.get("/empleados/", response_model=List[EmpleadoResponseSchema])
def obtener_empleados(skip: int = 0, limit: int = 10, db: Session = Depends(get_db)):
    """
    Obtiene todos los empleados con paginación.
    """
    empleados = get_all_empleados(db, skip, limit)
    return empleados

# Ruta para actualizar un empleado por ID
@router.put("/empleado/{empleado_id}", response_model=EmpleadoResponseSchema)
async def actualizar_empleado(
    empleado_id: int, 
    name: Optional[str] = Form(None),
    last_name: Optional[str] = Form(None),
    birth_date: Optional[date] = Form(None),
    curp: Optional[str] = Form(None),
    gender: Optional[Sexo] = Form(None),
    status: Optional[Status] = Form(None),
    phone_number: Optional[str] = Form(None),
    emergency_phone: Optional[str] = Form(None),
    emergency_phone_name: Optional[str] = Form(None),
    emergency_phone_relationship: Optional[str] = Form(None),
    email: Optional[str] = Form(None),

    # Dirección
    calle: Optional[str] = Form(None),
    numero_exterior: Optional[str] = Form(None),
    numero_interior: Optional[str] = Form(None),
    colonia: Optional[str] = Form(None),
    localidad: Optional[str] = Form(None),
    municipio: Optional[str] = Form(None),
    estado: Optional[str] = Form(None),
    codigo_postal: Optional[str] = Form(None),

    # Información laboral
    education_level: Optional[str] = Form(None),
    drivers_license: Optional[str] = Form(None),
    contract_term: Optional[PlazoContrato] = Form(None),
    contract_end_date: Optional[date] = Form(None),
    salary: Optional[float] = Form(None),
    base_salary: Optional[float] = Form(None),
    payment_period: Optional[PaymentPeriod] = Form(None),
    nss: Optional[str] = Form(None),
    rfc: Optional[str] = Form(None),
    infonavit_credit: Optional[str] = Form(None),
    department: Optional[str] = Form(None),
    employee_code: Optional[str] = Form(None),
    entry_date: Optional[date] = Form(None),
    position: Optional[str] = Form(None),
    immediate_boss_id: Optional[int] = Form(None),

    # Información adicional
    blood_type: Optional[BloodType] = Form(None),
    shoe_size: Optional[TallaCalzado] = Form(None),
    allergies: Optional[str] = Form(None),
    uniform_size: Optional[TallaUniforme] = Form(None),

    # Archivo
    image: Optional[UploadFile] = File(None),
    
    # Dependencias
    db: Session = Depends(get_db)
    
    ):

    empleado_data = EmpleadoUpdateSchema(
        name=name,
        last_name=last_name,
        birth_date=birth_date,
        curp=curp,
        gender=gender,
        status=status,
        phone_number=phone_number,
        emergency_phone=emergency_phone,
        emergency_phone_name=emergency_phone_name,
        emergency_phone_relationship=emergency_phone_relationship,
        email=email,
        calle=calle,
        numero_exterior=numero_exterior,
        numero_interior=numero_interior,
        colonia=colonia,
        localidad=localidad,
        municipio=municipio,
        estado=estado,
        codigo_postal=codigo_postal,
        education_level=education_level,
        drivers_license=drivers_license,
        contract_term=contract_term,
        contract_end_date=contract_end_date,
        salary=salary,
        base_salary=base_salary,
        payment_period=payment_period,
        nss=nss,
        rfc=rfc,
        infonavit_credit=infonavit_credit,
        department=department,
        employee_code=employee_code,
        entry_date=entry_date,
        position=position,
        immediate_boss_id=immediate_boss_id,
        blood_type=blood_type,
        shoe_size=shoe_size,
        allergies=allergies,
        uniform_size=uniform_size

    )
    """
    Actualiza un empleado por su ID.
    """
    empleado_actualizado = await update_empleado(db, empleado_id, empleado_data, image)
    if not empleado_actualizado:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Empleado no encontrado"
        )
    return empleado_actualizado

# Ruta para eliminar un empleado por ID
@router.delete("/empleado/{empleado_id}", status_code=status.HTTP_200_OK)
async def eliminar_empleado(empleado_id: int, db: Session = Depends(get_db)):
    """
    Elimina un empleado por su ID.
    """
    empleado_eliminado = await delete_empleado(db, empleado_id)
    if not empleado_eliminado:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail=f"Empleado con ID {empleado_id} no encontrado"
        )
    return {"detail": "Empleado eliminado exitosamente"}