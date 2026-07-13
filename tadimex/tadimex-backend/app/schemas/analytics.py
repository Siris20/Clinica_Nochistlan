from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List
from datetime import datetime, date

# Esquemas para Website
class WebsiteBase(BaseModel):
    name: str = Field(..., description="Nombre del sitio web")
    domain: str = Field(..., description="Dominio del sitio web")
    model_config = ConfigDict(from_attributes=True)

class WebsiteCreateSchema(WebsiteBase):
    pass

class WebsiteUpdateSchema(BaseModel):
    name: Optional[str] = Field(None, description="Nombre del sitio web")
    domain: Optional[str] = Field(None, description="Dominio del sitio web")
    model_config = ConfigDict(from_attributes=True)

class WebsiteReadSchema(WebsiteBase):
    id: int = Field(..., description="ID del website")
    created_at: datetime = Field(..., description="Fecha de creación del website")
    model_config = ConfigDict(from_attributes=True)

# Esquemas para SiteVisit
class SiteVisitBase(BaseModel):
    visitor_ip: Optional[str] = Field(None, description="IP del visitante")
    user_agent: Optional[str] = Field(None, description="User agent del navegador")
    page_url: str = Field(..., description="URL de la página visitada")
    referrer: Optional[str] = Field(None, description="URL de referencia")
    model_config = ConfigDict(from_attributes=True)

class SiteVisitCreateSchema(BaseModel):
    pass

# Nuevo esquema simplificado para el endpoint de URL completa (sin body)
class SiteVisitByUrlResponseSchema(BaseModel):
    message: str = Field(..., description="Mensaje de confirmación")
    visit_id: int = Field(..., description="ID de la visita registrada")
    domain: str = Field(..., description="Dominio extraído de la URL")
    page_url: str = Field(..., description="Ruta extraída de la URL")
    model_config = ConfigDict(from_attributes=True)

class SiteVisitReadSchema(SiteVisitBase):
    id: int = Field(..., description="ID de la visita")
    site_id: int = Field(..., description="ID del sitio web visitado")
    visited_at: datetime = Field(..., description="Fecha y hora de la visita")
    created_at: datetime = Field(..., description="Fecha de creación del registro")
    model_config = ConfigDict(from_attributes=True)

# Esquemas para Analytics/Dashboard
class VisitStatsSchema(BaseModel):
    total_visits: int = Field(..., description="Total de visitas en el período")
    period_start: date = Field(..., description="Fecha de inicio del período")
    period_end: date = Field(..., description="Fecha de fin del período")
    model_config = ConfigDict(from_attributes=True)

class PeriodVisitsSchema(BaseModel):
    date: str = Field(..., description="Fecha del período (formato depende del tipo)")
    visits: int = Field(..., description="Número de visitas en ese período")
    model_config = ConfigDict(from_attributes=True)

class DailyAverageSchema(BaseModel):
    average_visits: float = Field(..., description="Promedio de visitas diarias")
    total_days: int = Field(..., description="Total de días en el período")
    total_visits: int = Field(..., description="Total de visitas en el período")
    model_config = ConfigDict(from_attributes=True)

class VisitExtremesSchema(BaseModel):
    max_day: Optional[dict] = Field(None, description="Día con más visitas: {'date': 'YYYY-MM-DD', 'visits': int}")
    min_day: Optional[dict] = Field(None, description="Día con menos visitas: {'date': 'YYYY-MM-DD', 'visits': int}")
    model_config = ConfigDict(from_attributes=True)

class DashboardDataSchema(BaseModel):
    domain: str = Field(..., description="Dominio del sitio web")
    site_name: str = Field(..., description="Nombre del sitio web")
    period: dict = Field(..., description="Período analizado: {'start_date': 'YYYY-MM-DD', 'end_date': 'YYYY-MM-DD'}")
    total_visits: int = Field(..., description="Total de visitas en el período")
    daily_average: float = Field(..., description="Promedio de visitas diarias")
    max_day: Optional[dict] = Field(None, description="Día con más visitas")
    min_day: Optional[dict] = Field(None, description="Día con menos visitas")
    daily_visits: List[PeriodVisitsSchema] = Field(..., description="Visitas por día")
    weekly_visits: List[PeriodVisitsSchema] = Field(..., description="Visitas por semana")
    monthly_visits: List[PeriodVisitsSchema] = Field(..., description="Visitas por mes")
    model_config = ConfigDict(from_attributes=True)

# Esquema para respuesta de registro de visita
class VisitRegistrationResponseSchema(BaseModel):
    message: str = Field(..., description="Mensaje de confirmación")
    visit_id: int = Field(..., description="ID de la visita registrada")
    model_config = ConfigDict(from_attributes=True)