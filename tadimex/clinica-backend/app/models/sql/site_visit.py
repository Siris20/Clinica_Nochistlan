from sqlalchemy import Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.sql.base import Base
from datetime import datetime
from typing import TYPE_CHECKING, List, Optional

if TYPE_CHECKING:
    from .website import Website



class SiteVisit(Base):
    __tablename__ = "site_visits"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    site_id: Mapped[int] = mapped_column(Integer, ForeignKey("websites.id"), nullable=False)
    visitor_ip: Mapped[Optional[str]] = mapped_column(String(45), nullable=True)
    user_agent: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    visited_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    page_url: Mapped[str] = mapped_column(Text, nullable=False)
    referrer: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    
    # Relaciones


    website: Mapped["Website"] = relationship("Website", back_populates="visits")


