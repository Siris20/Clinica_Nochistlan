"""insertar registros en conceptos sat

Revision ID: 432dc9cb85f6
Revises: e67d391afd6d
Create Date: 2025-04-02 18:03:56.349849

"""
from typing import Sequence, Union
from datetime import datetime
import csv
from pathlib import Path
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '432dc9cb85f6'
down_revision: Union[str, None] = 'e67d391afd6d'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade():
    # Ruta al archivo CSV
    csv_path = Path(__file__).parent.parent.parent / "app" / "data" / "conceptos_sat.csv"
    
    # Leer todos los datos del CSV
    with open(csv_path, mode="r", encoding="utf-8") as csv_file:
        reader = csv.DictReader(csv_file)
        batch_size = 500
        batch = []
        
        for row in reader:
            batch.append({
                "id": row["id_clave_prod_serv"],
                "clave": row["clave_prod_serv"],
                "segmento": row["cve_segmento"],
                "familia": row["cve_familia"],
                "clase": row["cve_clase"],
                "mercancia": row["cve_mercancia"],
                "descripcion": row["descripcion"],
                "created_at": datetime.now(),
                "updated_at": datetime.now()
            })
            
            # Cuando el lote alcanza el tamaño definido, ejecutar la inserción
            if len(batch) >= batch_size:
                op.bulk_insert(
                    sa.table('conceptos_sat',
                        sa.column('id', sa.String),
                        sa.column('clave', sa.String),
                        sa.column('segmento', sa.String),
                        sa.column('familia', sa.String),
                        sa.column('clase', sa.String),
                        sa.column('mercancia', sa.String),
                        sa.column('descripcion', sa.String),
                        sa.column('created_at', sa.DateTime),
                        sa.column('updated_at', sa.DateTime)
                    ),
                    batch
                )
                batch = []
        
        # Insertar cualquier registro restante
        if batch:
            op.bulk_insert(
                sa.table('conceptos_sat',
                    sa.column('id', sa.String),
                    sa.column('clave', sa.String),
                    sa.column('segmento', sa.String),
                    sa.column('familia', sa.String),
                    sa.column('clase', sa.String),
                    sa.column('mercancia', sa.String),
                    sa.column('descripcion', sa.String),
                    sa.column('created_at', sa.DateTime),
                    sa.column('updated_at', sa.DateTime)
                ),
                batch
            )


def downgrade():
    # Vaciar la tabla conceptos_sat
    op.execute("DELETE FROM conceptos_sat")