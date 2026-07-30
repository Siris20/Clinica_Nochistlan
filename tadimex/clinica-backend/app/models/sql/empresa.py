from sqlalchemy import String, Integer
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.sql.base import Base
from typing import List, TYPE_CHECKING

if TYPE_CHECKING:
    from .sucursal import Sucursal
    from .departamento_producto import DepartamentoProducto
    from .area import Area
    from .emisor import Emisor
    from .cliente import Cliente
    from .logo import Logo
    from .proveedor import Proveedor

class Empresa(Base):
    __tablename__ = "empresas"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    calle: Mapped[str] = mapped_column(String(255), nullable=True)
    numero_exterior: Mapped[str] = mapped_column(String(50), nullable=True)
    numero_interior: Mapped[str] = mapped_column(String(50), nullable=True)
    colonia: Mapped[str] = mapped_column(String(255), nullable=True)
    localidad: Mapped[str] = mapped_column(String(255), nullable=True)
    municipio: Mapped[str] = mapped_column(String(255), nullable=True)
    estado: Mapped[str] = mapped_column(String(100), nullable=True)
    codigo_postal: Mapped[str] = mapped_column(String(5), nullable=True)
    phone_number: Mapped[str] = mapped_column(String(15), nullable=True)
    SAT_certificate: Mapped[str] = mapped_column(String(255), nullable=True)
    SAT_stamp: Mapped[str] = mapped_column(String(255), nullable=True)
    regimen_fiscal: Mapped[str] = mapped_column(String(100), nullable=True)


    #Relaciones

    sucursales: Mapped[List["Sucursal"]] = relationship("Sucursal", back_populates="empresa", cascade="all, delete")
    departamentos: Mapped[List["DepartamentoProducto"]] = relationship("DepartamentoProducto", back_populates="empresa", cascade="all, delete")
    areas: Mapped[List["Area"]] = relationship("Area", back_populates="empresa", cascade="all, delete")
    emisores: Mapped[List["Emisor"]] = relationship("Emisor", back_populates="empresa", cascade="all, delete")
    clientes: Mapped[List["Cliente"]] = relationship("Cliente", back_populates="empresa", cascade="all, delete")
    logos: Mapped[List["Logo"]] = relationship("Logo", back_populates="empresa", cascade="all, delete")
    proveedores: Mapped[List["Proveedor"]] = relationship("Proveedor", back_populates="empresa", cascade="all, delete")