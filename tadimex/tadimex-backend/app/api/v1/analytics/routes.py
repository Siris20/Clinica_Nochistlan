from fastapi import APIRouter, Depends, Query, Request
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date, timedelta
from app.db.mariadb import get_db
from app.schemas.analytics import (
    WebsiteCreateSchema,
    WebsiteUpdateSchema,
    WebsiteReadSchema,
    SiteVisitCreateSchema,
    SiteVisitReadSchema,
    SiteVisitByUrlResponseSchema,
    VisitStatsSchema,
    PeriodVisitsSchema,
    DailyAverageSchema,
    VisitExtremesSchema,
    DashboardDataSchema,
    VisitRegistrationResponseSchema
)
from app.services.analytics import (
    create_website,
    get_website,
    get_website_by_domain,
    get_all_websites,
    update_website,
    update_website_by_domain,
    delete_website,
    delete_website_by_domain,
    register_visit_by_full_url,
    get_total_visits_by_domain,
    get_visits_by_period_by_domain,
    get_daily_average_by_domain,
    get_visit_extremes_by_domain,
    get_dashboard_data_by_domain
)

router = APIRouter()

# Endpoints para Website
@router.post("/website", response_model=WebsiteReadSchema)
async def crear_website(
    website_data: WebsiteCreateSchema,
    db: Session = Depends(get_db)
):
    """Crear un nuevo sitio web para analytics"""
    return await create_website(db, website_data)

@router.get("/website/{website_id}", response_model=WebsiteReadSchema)
def obtener_website(
    website_id: int,
    db: Session = Depends(get_db)
):
    """Obtener información de un sitio web específico por ID"""
    return get_website(db, website_id)

@router.get("/website/domain/{domain}", response_model=WebsiteReadSchema)
def obtener_website_por_dominio(
    domain: str,
    db: Session = Depends(get_db)
):
    """Obtener información de un sitio web específico por dominio"""
    return get_website_by_domain(db, domain)

@router.get("/websites", response_model=List[WebsiteReadSchema])
def obtener_websites(
    skip: int = Query(default=0, ge=0, description="Número de registros a saltar"),
    limit: int = Query(default=100, ge=1, description="Número máximo de registros a retornar"),
    db: Session = Depends(get_db)
):
    """Obtener lista de sitios web con paginación"""
    return get_all_websites(db, skip, limit)

@router.put("/website/{website_id}", response_model=WebsiteReadSchema)
async def actualizar_website(
    website_id: int,
    website_data: WebsiteUpdateSchema,
    db: Session = Depends(get_db)
):
    """Actualizar información de un sitio web por ID"""
    return await update_website(db, website_id, website_data)

@router.put("/website/domain/{domain}", response_model=WebsiteReadSchema)
async def actualizar_website_por_dominio(
    domain: str,
    website_data: WebsiteUpdateSchema,
    db: Session = Depends(get_db)
):
    """Actualizar información de un sitio web por dominio"""
    return await update_website_by_domain(db, domain, website_data)

@router.delete("/website/{website_id}")
async def eliminar_website(
    website_id: int,
    db: Session = Depends(get_db)
):
    """Eliminar un sitio web y todas sus visitas por ID"""
    result = await delete_website(db, website_id)
    return result

@router.delete("/website/domain/{domain}")
async def eliminar_website_por_dominio(
    domain: str,
    db: Session = Depends(get_db)
):
    """Eliminar un sitio web y todas sus visitas por dominio"""
    result = await delete_website_by_domain(db, domain)
    return result



# Nuevo endpoint para registrar visitas con URL completa
@router.post("/visits/url/{full_url:path}", response_model=SiteVisitByUrlResponseSchema)
async def registrar_visita_por_url(
    full_url: str,
    request: Request,
    db: Session = Depends(get_db)
):
    """Registrar una nueva visita usando la URL completa"""
    # Obtener datos automáticamente del request
    client_ip = request.client.host
    
    # Si usas proxy/load balancer, verificar headers
    forwarded_for = request.headers.get("X-Forwarded-For")
    if forwarded_for:
        client_ip = forwarded_for.split(",")[0].strip()
    
    # Obtener user_agent y referrer automáticamente de los headers
    user_agent = request.headers.get("User-Agent")
    referrer = request.headers.get("Referer")  # Nota: HTTP usa "Referer" no "Referrer"
    
    return await register_visit_by_full_url(db, full_url, client_ip, user_agent, referrer)

# Endpoints para Analytics (usando dominio)
@router.get("/analytics/{domain}/total", response_model=VisitStatsSchema)
def obtener_total_visitas(
    domain: str,
    start_date: Optional[date] = Query(None, description="Fecha de inicio (YYYY-MM-DD)"),
    end_date: Optional[date] = Query(None, description="Fecha de fin (YYYY-MM-DD)"),
    db: Session = Depends(get_db)
):
    """Obtener el total de visitas en un período específico usando dominio"""
    # Fechas por defecto (últimos 30 días)
    if not end_date:
        end_date = date.today()
    if not start_date:
        start_date = end_date - timedelta(days=30)
    
    return get_total_visits_by_domain(db, domain, start_date, end_date)

@router.get("/analytics/{domain}/period", response_model=List[PeriodVisitsSchema])
def obtener_visitas_por_periodo(
    domain: str,
    period_type: str = Query(..., regex="^(day|week|month)$", description="Tipo de período: day, week, month"),
    start_date: Optional[date] = Query(None, description="Fecha de inicio (YYYY-MM-DD)"),
    end_date: Optional[date] = Query(None, description="Fecha de fin (YYYY-MM-DD)"),
    db: Session = Depends(get_db)
):
    """Obtener visitas agrupadas por día, semana o mes usando dominio"""
    # Fechas por defecto (últimos 30 días)
    if not end_date:
        end_date = date.today()
    if not start_date:
        start_date = end_date - timedelta(days=30)
    
    return get_visits_by_period_by_domain(db, domain, period_type, start_date, end_date)

@router.get("/analytics/{domain}/average", response_model=DailyAverageSchema)
def obtener_promedio_diario(
    domain: str,
    start_date: Optional[date] = Query(None, description="Fecha de inicio (YYYY-MM-DD)"),
    end_date: Optional[date] = Query(None, description="Fecha de fin (YYYY-MM-DD)"),
    db: Session = Depends(get_db)
):
    """Calcular el promedio de visitas diarias usando dominio"""
    # Fechas por defecto (últimos 30 días)
    if not end_date:
        end_date = date.today()
    if not start_date:
        start_date = end_date - timedelta(days=30)
    
    return get_daily_average_by_domain(db, domain, start_date, end_date)

@router.get("/analytics/{domain}/extremes", response_model=VisitExtremesSchema)
def obtener_extremos_visitas(
    domain: str,
    start_date: Optional[date] = Query(None, description="Fecha de inicio (YYYY-MM-DD)"),
    end_date: Optional[date] = Query(None, description="Fecha de fin (YYYY-MM-DD)"),
    db: Session = Depends(get_db)
):
    """Obtener los días con más y menos visitas usando dominio"""
    # Fechas por defecto (últimos 30 días)
    if not end_date:
        end_date = date.today()
    if not start_date:
        start_date = end_date - timedelta(days=30)
    
    return get_visit_extremes_by_domain(db, domain, start_date, end_date)

# Endpoint principal del dashboard (usando dominio)
@router.get("/analytics/{domain}/dashboard", response_model=DashboardDataSchema)
def obtener_dashboard_analytics(
    domain: str,
    start_date: Optional[date] = Query(None, description="Fecha de inicio (YYYY-MM-DD)"),
    end_date: Optional[date] = Query(None, description="Fecha de fin (YYYY-MM-DD)"),
    db: Session = Depends(get_db)
):
    """Obtener todos los datos para el dashboard de analytics usando dominio"""
    # Fechas por defecto (últimos 30 días)
    if not end_date:
        end_date = date.today()
    if not start_date:
        start_date = end_date - timedelta(days=30)
    
    return get_dashboard_data_by_domain(db, domain, start_date, end_date)