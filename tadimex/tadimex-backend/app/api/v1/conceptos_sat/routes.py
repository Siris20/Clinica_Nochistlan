from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List, Optional
from app.services.concepto_sat import (
    get_concepto_sat_by_id,
    get_concepto_sat_by_clave,
    get_all_conceptos_sat,
    search_conceptos_sat,
)
from app.schemas.concepto_sat import (
    ConceptoSATReadSchema,
    ConceptoSATByClaveSchema,
    ConceptoSATSearchSchema,
)
from app.db.mariadb import get_db

router = APIRouter()

@router.get("/concepto-sat/{concepto_id}", response_model=ConceptoSATReadSchema)
def obtener_concepto_por_id(concepto_id: int, db: Session = Depends(get_db)):
    
    return get_concepto_sat_by_id(db, concepto_id)

@router.get("/concepto-sat/clave/{clave}", response_model=ConceptoSATByClaveSchema)
def obtener_concepto_por_clave(clave: str, db: Session = Depends(get_db)):

    return get_concepto_sat_by_clave(db, clave)

@router.get("/conceptos-sat", response_model=List[ConceptoSATReadSchema])
def listar_conceptos(
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db)
):
    return get_all_conceptos_sat(db, skip=skip, limit=limit)

@router.get("/conceptos-sat/search", response_model=List[ConceptoSATSearchSchema])
def buscar_conceptos(
    search_term: Optional[str] = None,
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db)
):
    return search_conceptos_sat(db, search_term=search_term, skip=skip, limit=limit)