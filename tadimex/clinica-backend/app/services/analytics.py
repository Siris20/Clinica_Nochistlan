from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import func
from fastapi import HTTPException, status
from datetime import date, timedelta

from urllib.parse import urlparse
from app.models.sql.website import Website
from app.models.sql.site_visit import SiteVisit
from app.schemas.analytics import (
    WebsiteCreateSchema,
    WebsiteUpdateSchema,
    WebsiteReadSchema,
    SiteVisitCreateSchema,
    SiteVisitByUrlResponseSchema,
    VisitStatsSchema,
    PeriodVisitsSchema,
    DailyAverageSchema,
    VisitExtremesSchema,
    DashboardDataSchema,
    VisitRegistrationResponseSchema
)
from app.utils.url_normalizer import(
    validate_and_normalize_domain,
    validate_and_normalize_full_url,
    validate_ip_address,
    validate_date_range,
    validate_website_name,
    sanitize_referrer,
    sanitize_user_agent
)



async def create_website(
    db: Session,
    website_data: WebsiteCreateSchema
) -> WebsiteReadSchema:
    try:
        # Validar y normalizar datos
        normalized_domain = validate_and_normalize_domain(website_data.domain)
        normalized_name = validate_website_name(website_data.name)
        
        # Verificar que el dominio no existe (case-insensitive)
        existing_website = db.query(Website).filter(
            func.lower(Website.domain) == normalized_domain.lower()
        ).first()
        
        if existing_website:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Ya existe un sitio web con el dominio {normalized_domain}"
            )

        nuevo_website = Website(
            name=normalized_name,
            domain=normalized_domain
        )
        
        db.add(nuevo_website)
        db.commit()
        db.refresh(nuevo_website)
        
        return WebsiteReadSchema.model_validate(nuevo_website)

    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al crear el sitio web: {str(e)}"
        )

def get_website(
    db: Session,
    website_id: int
) -> WebsiteReadSchema:
    try:
        if website_id <= 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="ID de sitio web inválido"
            )
            
        website = db.query(Website).filter(Website.id == website_id).first()
        if not website:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Sitio web no encontrado"
            )
        return WebsiteReadSchema.model_validate(website)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al obtener el sitio web: {str(e)}"
        )

def get_website_by_domain(
    db: Session,
    domain: str
) -> WebsiteReadSchema:
    try:
        normalized_domain = validate_and_normalize_domain(domain)
        
        website = db.query(Website).filter(
            func.lower(Website.domain) == normalized_domain.lower()
        ).first()
        
        if not website:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Sitio web no encontrado con dominio {normalized_domain}"
            )
        return WebsiteReadSchema.model_validate(website)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al obtener el sitio web: {str(e)}"
        )

def get_all_websites(
    db: Session,
    skip: int = 0,
    limit: int = 100
) -> List[WebsiteReadSchema]:
    try:
        # Validar parámetros de paginación
        if skip < 0:
            skip = 0
        if limit <= 0 or limit > 1000:  # Limitar máximo por seguridad
            limit = 100
            
        websites = db.query(Website).offset(skip).limit(limit).all()
        return [
            WebsiteReadSchema.model_validate(website)
            for website in websites
        ]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al obtener la lista de sitios web: {str(e)}"
        )

async def update_website(
    db: Session,
    website_id: int,
    website_data: WebsiteUpdateSchema
) -> WebsiteReadSchema:
    try:
        if website_id <= 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="ID de sitio web inválido"
            )
            
        website = db.query(Website).filter(Website.id == website_id).first()
        if not website:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"No se encontró sitio web con ID {website_id}"
            )

        # Validar y normalizar dominio si se está actualizando
        if website_data.domain is not None:
            normalized_domain = validate_and_normalize_domain(website_data.domain)
            
            if normalized_domain.lower() != website.domain.lower():
                existing_website = db.query(Website).filter(
                    func.lower(Website.domain) == normalized_domain.lower(),
                    Website.id != website_id
                ).first()
                
                if existing_website:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail=f"Ya existe un sitio web con el dominio {normalized_domain}"
                    )
                website.domain = normalized_domain

        # Validar y normalizar nombre si se está actualizando
        if website_data.name is not None:
            normalized_name = validate_website_name(website_data.name)
            website.name = normalized_name

        db.commit()
        db.refresh(website)
        
        return WebsiteReadSchema.model_validate(website)

    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al actualizar el sitio web: {str(e)}"
        )

async def update_website_by_domain(
    db: Session,
    domain: str,
    website_data: WebsiteUpdateSchema
) -> WebsiteReadSchema:
    try:
        normalized_domain = validate_and_normalize_domain(domain)
        
        website = db.query(Website).filter(
            func.lower(Website.domain) == normalized_domain.lower()
        ).first()
        
        if not website:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"No se encontró sitio web con dominio {normalized_domain}"
            )

        # Validar y normalizar nuevo dominio si se está actualizando
        if website_data.domain is not None:
            new_normalized_domain = validate_and_normalize_domain(website_data.domain)
            
            if new_normalized_domain.lower() != website.domain.lower():
                existing_website = db.query(Website).filter(
                    func.lower(Website.domain) == new_normalized_domain.lower(),
                    Website.id != website.id
                ).first()
                
                if existing_website:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail=f"Ya existe un sitio web con el dominio {new_normalized_domain}"
                    )
                website.domain = new_normalized_domain

        # Validar y normalizar nombre si se está actualizando
        if website_data.name is not None:
            normalized_name = validate_website_name(website_data.name)
            website.name = normalized_name

        db.commit()
        db.refresh(website)
        
        return WebsiteReadSchema.model_validate(website)

    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al actualizar el sitio web: {str(e)}"
        )

async def delete_website(db: Session, website_id: int) -> dict:
    try:
        if website_id <= 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="ID de sitio web inválido"
            )
            
        website = db.query(Website).filter(Website.id == website_id).first()
        if not website:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Sitio web no encontrado"
            )

        db.delete(website)
        db.commit()

        return {"detail": "Sitio web eliminado exitosamente"}
    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al eliminar el sitio web: {str(e)}"
        )

async def delete_website_by_domain(db: Session, domain: str) -> dict:
    try:
        normalized_domain = validate_and_normalize_domain(domain)
        
        website = db.query(Website).filter(
            func.lower(Website.domain) == normalized_domain.lower()
        ).first()
        
        if not website:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Sitio web no encontrado con dominio {normalized_domain}"
            )

        db.delete(website)
        db.commit()

        return {"detail": "Sitio web eliminado exitosamente"}
    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al eliminar el sitio web: {str(e)}"
        )


async def register_visit_by_full_url(
    db: Session,
    full_url: str,
    visitor_ip: str,
    user_agent: Optional[str] = None,
    referrer: Optional[str] = None
) -> SiteVisitByUrlResponseSchema:
    try:
        # Usar la nueva función para URLs completas
        normalized_domain, normalized_path = validate_and_normalize_full_url(full_url)
        
        # Validar otros datos
        validated_ip = validate_ip_address(visitor_ip)
        sanitized_user_agent = sanitize_user_agent(user_agent)
        sanitized_referrer = sanitize_referrer(referrer)
        
        # Buscar sitio web por dominio
        website = db.query(Website).filter(
            func.lower(Website.domain) == normalized_domain.lower()
        ).first()
        
        if not website:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"No se encontró sitio web con dominio {normalized_domain}"
            )

        # Crear nueva visita
        nueva_visita = SiteVisit(
            site_id=website.id,
            page_url=normalized_path,
            visitor_ip=validated_ip,
            user_agent=sanitized_user_agent,
            referrer=sanitized_referrer
        )
        
        db.add(nueva_visita)
        db.commit()
        db.refresh(nueva_visita)
        
        return SiteVisitByUrlResponseSchema(
            message="Visita registrada exitosamente",
            visit_id=nueva_visita.id,
            domain=normalized_domain,
            page_url=normalized_path
        )

    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al registrar la visita: {str(e)}"
        )


def get_total_visits_by_domain(
    db: Session,
    domain: str,
    start_date: date,
    end_date: date
) -> VisitStatsSchema:
    try:
        start_date, end_date = validate_date_range(start_date, end_date)
        # Verificar que el sitio existe
        website = db.query(Website).filter(Website.domain == domain).first()
        if not website:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"No se encontró sitio web con dominio {domain}"
            )

        total = db.query(func.count(SiteVisit.id)).filter(
            SiteVisit.site_id == website.id,
            func.date(SiteVisit.visited_at) >= start_date,
            func.date(SiteVisit.visited_at) <= end_date
        ).scalar() or 0

        return VisitStatsSchema(
            total_visits=total,
            period_start=start_date,
            period_end=end_date
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al obtener total de visitas: {str(e)}"
        )

def get_visits_by_period_by_domain(
    db: Session,
    domain: str,
    period_type: str,
    start_date: date,
    end_date: date
) -> List[PeriodVisitsSchema]:
    try:
        start_date, end_date = validate_date_range(start_date, end_date)
        
        # Verificar que el sitio existe
        website = db.query(Website).filter(Website.domain == domain).first()
        if not website:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"No se encontró sitio web con dominio {domain}"
            )

        if period_type == "day":
            date_group = func.date(SiteVisit.visited_at)
        elif period_type == "week":
            date_group = func.concat(
                func.year(SiteVisit.visited_at), 
                '-W',
                func.lpad(func.week(SiteVisit.visited_at), 2, '0')
            )
        elif period_type == "month":
            date_group = func.concat(
                func.year(SiteVisit.visited_at),
                '-',
                func.lpad(func.month(SiteVisit.visited_at), 2, '0')
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Tipo de período debe ser 'day', 'week' o 'month'"
            )

        query = db.query(
            date_group.label('period'),
            func.count(SiteVisit.id).label('visits')
        ).filter(
            SiteVisit.site_id == website.id,
            func.date(SiteVisit.visited_at) >= start_date,
            func.date(SiteVisit.visited_at) <= end_date
        ).group_by(date_group).order_by(date_group)

        results = query.all()
        return [
            PeriodVisitsSchema(date=str(row.period), visits=row.visits)
            for row in results
        ]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al obtener visitas por período: {str(e)}"
        )

def get_daily_average_by_domain(
    db: Session,
    domain: str,
    start_date: date,
    end_date: date
) -> DailyAverageSchema:
    # Validación de fechas en un bloque separado (ERRORES SE PROPAGAN DIRECTAMENTE)
    try:
        start_date, end_date = validate_date_range(start_date, end_date)
        # Resto de la lógica (solo se ejecuta si las fechas son válidas)
        website = db.query(Website).filter(Website.domain == domain).first()
        if not website:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"No se encontró sitio web con dominio {domain}"
            )

        total_visits = db.query(func.count(SiteVisit.id)).filter(
            SiteVisit.site_id == website.id,
            func.date(SiteVisit.visited_at) >= start_date,
            func.date(SiteVisit.visited_at) <= end_date
        ).scalar() or 0

        total_days = (end_date - start_date).days + 1
        average = round(total_visits / total_days, 2) if total_days > 0 else 0.0

        return DailyAverageSchema(
            average_visits=average,
            total_days=total_days,
            total_visits=total_visits
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al calcular promedio diario: {str(e)}"
        )

def get_visit_extremes_by_domain(
    db: Session,
    domain: str,
    start_date: date,
    end_date: date
) -> VisitExtremesSchema:
    
    try:
        start_date, end_date = validate_date_range(start_date, end_date)
        # Verificar que el sitio existe
        website = db.query(Website).filter(Website.domain == domain).first()
        if not website:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"No se encontró sitio web con dominio {domain}"
            )

        # Generar todas las fechas en el rango
        all_dates = []
        current_date = start_date
        while current_date <= end_date:
            all_dates.append(current_date)
            current_date += timedelta(days=1)

        # Obtener visitas por día (solo días con visitas)
        daily_visits_query = db.query(
            func.date(SiteVisit.visited_at).label('visit_date'),
            func.count(SiteVisit.id).label('visits')
        ).filter(
            SiteVisit.site_id == website.id,
            func.date(SiteVisit.visited_at) >= start_date,
            func.date(SiteVisit.visited_at) <= end_date
        ).group_by(func.date(SiteVisit.visited_at)).all()

        # Crear diccionario con todas las fechas (incluyendo días con 0 visitas)
        visits_dict = {d: 0 for d in all_dates}  # Inicializar todos los días con 0 visitas
        
        # Llenar con los datos reales de visitas
        for row in daily_visits_query:
            visits_dict[row.visit_date] = row.visits

        if not visits_dict:
            return VisitExtremesSchema(max_day=None, min_day=None)

        # Encontrar máximo y mínimo considerando todos los días
        max_date = max(visits_dict.keys(), key=lambda x: visits_dict[x])
        min_date = min(visits_dict.keys(), key=lambda x: visits_dict[x])
        
        max_visits = visits_dict[max_date]
        min_visits = visits_dict[min_date]

        return VisitExtremesSchema(
            max_day={"date": str(max_date), "visits": max_visits},
            min_day={"date": str(min_date), "visits": min_visits}
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al obtener extremos de visitas: {str(e)}"
        )

def get_dashboard_data_by_domain(
    db: Session,
    domain: str,
    start_date: date,
    end_date: date
) -> DashboardDataSchema:
    
    try:
        start_date, end_date = validate_date_range(start_date, end_date)
        # Verificar que el sitio existe
        website = db.query(Website).filter(Website.domain == domain).first()
        if not website:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"No se encontró sitio web con dominio {domain}"
            )

        # Obtener todos los datos necesarios
        total_visits_data = get_total_visits_by_domain(db, domain, start_date, end_date)
        daily_average_data = get_daily_average_by_domain(db, domain, start_date, end_date)
        extremes_data = get_visit_extremes_by_domain(db, domain, start_date, end_date)
        
        daily_visits = get_visits_by_period_by_domain(db, domain, "day", start_date, end_date)
        weekly_visits = get_visits_by_period_by_domain(db, domain, "week", start_date, end_date)
        monthly_visits = get_visits_by_period_by_domain(db, domain, "month", start_date, end_date)

        return DashboardDataSchema(
            domain=website.domain,
            site_name=website.name,
            period={
                "start_date": start_date.isoformat(),
                "end_date": end_date.isoformat()
            },
            total_visits=total_visits_data.total_visits,
            daily_average=daily_average_data.average_visits,
            max_day=extremes_data.max_day,
            min_day=extremes_data.min_day,
            daily_visits=daily_visits,
            weekly_visits=weekly_visits,
            monthly_visits=monthly_visits
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al obtener datos del dashboard: {str(e)}"
        )