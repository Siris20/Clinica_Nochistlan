from typing import List, Optional
from sqlalchemy import or_
from sqlalchemy.orm import Session
from app.models.sql.concepto_sat import ConceptoSAT
from app.schemas.concepto_sat import ConceptoSATReadSchema, ConceptoSATByClaveSchema, ConceptoSATSearchSchema
from fastapi import HTTPException, status

def get_concepto_sat_by_id(
    db: Session, concepto_id: int
) -> ConceptoSATReadSchema:
   
    try:
        concepto = (
            db.query(ConceptoSAT)
            .filter(ConceptoSAT.id == concepto_id)
            .first()
        )
        if not concepto:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Concepto SAT no encontrado",
            )
        return ConceptoSATReadSchema.from_orm(concepto)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al obtener el concepto SAT: {str(e)}",
        )

def get_concepto_sat_by_clave(
    db: Session, clave: str
) -> ConceptoSATByClaveSchema:
 
    try:
        concepto = (
            db.query(ConceptoSAT)
            .filter(ConceptoSAT.clave == clave)
            .first()
        )
        if not concepto:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Concepto SAT con clave {clave} no encontrado",
            )
        return ConceptoSATByClaveSchema.from_orm(concepto)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al obtener el concepto SAT por clave: {str(e)}",
        )

def get_all_conceptos_sat(
    db: Session, skip: int = 0, limit: int = 100
) -> List[ConceptoSATReadSchema]:
   
    try:
        conceptos = db.query(ConceptoSAT).offset(skip).limit(limit).all()
        return [
            ConceptoSATReadSchema.from_orm(concepto)
            for concepto in conceptos
        ]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al obtener la lista de conceptos SAT: {str(e)}",
        )
    
def search_conceptos_sat(
    db: Session, 
    search_term: Optional[str] = None,
    skip: int = 0, 
    limit: int = 100
) -> List[ConceptoSATSearchSchema]:
    
    try:
        query = db.query(ConceptoSAT)
        
        if search_term:
            search_pattern = f"%{search_term}%"
            query = query.filter(
                or_(
                    ConceptoSAT.clave.ilike(search_pattern),
                    ConceptoSAT.descripcion.ilike(search_pattern)
                )
            )
        
        conceptos = query.offset(skip).limit(limit).all()
        
        return [
            ConceptoSATSearchSchema.from_orm(concepto)
            for concepto in conceptos
        ]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al buscar conceptos SAT: {str(e)}",
        )