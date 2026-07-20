from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from datetime import datetime
from fastapi import HTTPException, status
from app.models.sql.cita import Cita, EstadoCita
from app.schemas.cita import CitaCreateSchema, CitaUpdateSchema

def verificar_disponibilidad(
    db: Session, 
    sucursal_id: int, 
    area_id: int, 
    fecha_inicio: datetime, 
    fecha_fin: datetime, 
    excluir_cita_id: int = None
) -> bool:
    """
    Verifica si existe un traslape de horario en la misma sucursal y área.
    Retorna True si el horario está disponible, False si ya está ocupado.
    """
    # Consulta para buscar citas que se empalmen en el rango de tiempo solicitado
    query = db.query(Cita).filter(
        Cita.sucursal_id == sucursal_id,
        Cita.area_id == area_id,
        Cita.estado != EstadoCita.CANCELADA,  # Las citas canceladas liberan el espacio
        or_(
            # Caso 1: La nueva cita empieza dentro de una existente
            and_(Cita.fecha_inicio <= fecha_inicio, Cita.fecha_fin > fecha_inicio),
            # Caso 2: La nueva cita termina dentro de una existente
            and_(Cita.fecha_inicio < fecha_fin, Cita.fecha_fin >= fecha_fin),
            # Caso 3: La nueva cita engloba completamente a una existente
            and_(Cita.fecha_inicio >= fecha_inicio, Cita.fecha_fin <= fecha_fin)
        )
    )

    # Si estamos actualizando, ignoramos la cita actual para que no choque consigo misma
    if excluir_cita_id:
        query = query.filter(Cita.id != excluir_cita_id)

    cita_existente = query.first()
    return cita_existente is None


def create_cita(db: Session, cita_data: CitaCreateSchema) -> Cita:
    """Crea una nueva cita validando que el horario esté libre."""
    disponible = verificar_disponibilidad(
        db, 
        sucursal_id=cita_data.sucursal_id, 
        area_id=cita_data.area_id, 
        fecha_inicio=cita_data.fecha_inicio, 
        fecha_fin=cita_data.fecha_fin
    )
    
    if not disponible:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El horario seleccionado ya está ocupado para esta área en la sucursal."
        )
        
    nueva_cita = Cita(
        cliente_id=cita_data.cliente_id,
        area_id=cita_data.area_id,
        sucursal_id=cita_data.sucursal_id,
        fecha_inicio=cita_data.fecha_inicio,
        fecha_fin=cita_data.fecha_fin,
        motivo=cita_data.motivo,
        observaciones=cita_data.observaciones
    )
    
    db.add(nueva_cita)
    db.commit()
    db.refresh(nueva_cita)
    # Cargar explícitamente las relaciones para la serialización
    db.refresh(nueva_cita, ["cliente", "area", "sucursal"])
    return nueva_cita


def get_cita(db: Session, cita_id: int) -> Cita:
    """Obtiene una cita específica por su ID."""
    cita = db.query(Cita).filter(Cita.id == cita_id).first()
    if not cita:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Cita no encontrada."
        )
    # Cargar explícitamente las relaciones para la serialización
    db.refresh(cita, ["cliente", "area", "sucursal"])
    return cita


def get_citas_rango(
    db: Session, 
    fecha_desde: datetime, 
    fecha_hasta: datetime, 
    sucursal_id: int = None, 
    area_id: int = None
):
    """
    Obtiene las citas dentro de un rango de fechas para pintar en el calendario del dashboard.
    Permite filtrar opcionalmente por sucursal y área médica.
    """
    query = db.query(Cita).filter(
        Cita.fecha_inicio >= fecha_desde,
        Cita.fecha_fin <= fecha_hasta
    )
    
    if sucursal_id:
        query = query.filter(Cita.sucursal_id == sucursal_id)
    if area_id:
        query = query.filter(Cita.area_id == area_id)
        
    return query.all()


def update_cita(db: Session, cita_id: int, cita_data: CitaUpdateSchema) -> Cita:
    """Actualiza los datos de la cita validando la disponibilidad de horario si cambió."""
    db_cita = get_cita(db, cita_id)
    
    # Verificar si REALMENTE cambió alguno de estos campos críticos
    cambio_horario = (
        (cita_data.fecha_inicio is not None and cita_data.fecha_inicio != db_cita.fecha_inicio) or
        (cita_data.fecha_fin is not None and cita_data.fecha_fin != db_cita.fecha_fin) or
        (cita_data.area_id is not None and cita_data.area_id != db_cita.area_id) or
        (cita_data.sucursal_id is not None and cita_data.sucursal_id != db_cita.sucursal_id)
    )

    # Solo validar disponibilidad si realmente cambió el horario, área o sucursal
    if cambio_horario:
        sucursal = cita_data.sucursal_id if cita_data.sucursal_id is not None else db_cita.sucursal_id
        area = cita_data.area_id if cita_data.area_id is not None else db_cita.area_id
        inicio = cita_data.fecha_inicio if cita_data.fecha_inicio is not None else db_cita.fecha_inicio
        fin = cita_data.fecha_fin if cita_data.fecha_fin is not None else db_cita.fecha_fin
        
        disponible = verificar_disponibilidad(
            db, 
            sucursal_id=sucursal, 
            area_id=area, 
            fecha_inicio=inicio, 
            fecha_fin=fin, 
            excluir_cita_id=cita_id
        )
        if not disponible:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="El nuevo horario solicitado ya está ocupado."
            )

    # Convertimos los datos del esquema a diccionario
    update_data = cita_data.model_dump(exclude_unset=True)
    
    # SEGURIDAD: Evita intentar modificar la llave primaria "id" en el modelo de la base de datos
    update_data.pop("id", None)
    
    for key, value in update_data.items():
        setattr(db_cita, key, value)
        
    db.commit()
    db.refresh(db_cita)
    
    # Forzamos la carga segura de relaciones de forma interna en lugar de usar db.refresh(db_cita, ["cliente", ...])
    _ = db_cita.cliente
    _ = db_cita.area
    _ = db_cita.sucursal
    
    return db_cita


def delete_cita(db: Session, cita_id: int):
    """Elimina una cita físicamente de la base de datos."""
    db_cita = get_cita(db, cita_id)
    db.delete(db_cita)
    db.commit()
    return {"detail": "Cita eliminada correctamente de la base de datos."}