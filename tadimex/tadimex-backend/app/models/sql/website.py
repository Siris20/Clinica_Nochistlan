from sqlalchemy import Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.sql.base import Base
from datetime import datetime
from typing import TYPE_CHECKING, List, Optional


if TYPE_CHECKING:
    from .site_visit import SiteVisit


class Website(Base):
    __tablename__ = "websites"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    domain: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)

    #Relaciones

    visits: Mapped[List["SiteVisit"]] = relationship(
        "SiteVisit", 
        back_populates="website", 
        cascade="all, delete-orphan"
    )

