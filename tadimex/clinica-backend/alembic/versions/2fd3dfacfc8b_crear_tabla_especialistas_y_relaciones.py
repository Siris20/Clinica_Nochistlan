"""crear_tabla_especialistas_y_relaciones

Revision ID: 2fd3dfacfc8b
Revises: 77dbf36d9d75
Create Date: 2026-07-28 02:45:42.737243

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '2fd3dfacfc8b'
down_revision: Union[str, None] = '77dbf36d9d75'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
