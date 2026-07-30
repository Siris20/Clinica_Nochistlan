"""agregar_nuevos_estados_estadocita

Revision ID: 4ed7a4c65aa7
Revises: 60f99c9c339b
Create Date: 2026-07-29 01:38:16.767316

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '4ed7a4c65aa7'
down_revision: Union[str, None] = '60f99c9c339b'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # IMPORTANTE: Reemplaza 'citas' por el nombre REAL de tu tabla en la BD
    # y 'estado' por el nombre REAL de la columna (ej: 'estado' o 'estado_cita')
    op.execute("""
        ALTER TABLE citas 
        MODIFY COLUMN estado ENUM(
            'PROGRAMADA', 
            'CONFIRMADA', 
            'PENDIENTE', 
            'CANCELADA', 
            'COMPLETADA', 
            'NO_ASISTIO'
        ) NOT NULL;
    """)


def downgrade() -> None:
    # Si quisieras revertir la migración a los estados antiguos:
    op.execute("""
        ALTER TABLE citas 
        MODIFY COLUMN estado ENUM(
            'PROGRAMADA', 
            'CONFIRMADA', 
            'PENDIENTE', 
            'CANCELADA'
        ) NOT NULL;
    """)