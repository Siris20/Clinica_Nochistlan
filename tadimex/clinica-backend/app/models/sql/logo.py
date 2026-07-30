from sqlalchemy import String, Integer, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.sql.base import Base
from typing import TYPE_CHECKING, List
if TYPE_CHECKING:
    from .empresa import Empresa
    from .cotizacion import Cotizacion


class Logo(Base):
    __tablename__ = "logos"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(30), nullable=False)
    image_url: Mapped[str] = mapped_column(String(255), nullable=False)

    # Relaciones 
    empresa_id: Mapped[int] = mapped_column(Integer, ForeignKey("empresas.id"), nullable=False)
    empresa: Mapped["Empresa"] = relationship("Empresa", back_populates="logos")
    cotizaciones: Mapped[list["Cotizacion"]] = relationship("Cotizacion", back_populates="logo")