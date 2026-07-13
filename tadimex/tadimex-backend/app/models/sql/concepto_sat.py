from sqlalchemy import String, Integer
from sqlalchemy.orm import Mapped, mapped_column
from app.models.sql.base import Base

class ConceptoSAT(Base):
    __tablename__ = "conceptos_sat"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    clave: Mapped[str] = mapped_column(String(10), nullable=False)
    segmento: Mapped[str] = mapped_column(String(2), nullable=True)
    familia: Mapped[str] = mapped_column(String(2), nullable=True)
    clase: Mapped[str] = mapped_column(String(2), nullable=True)
    mercancia: Mapped[str] = mapped_column(String(2), nullable=True)
    descripcion: Mapped[str] = mapped_column(String(200), nullable=True)