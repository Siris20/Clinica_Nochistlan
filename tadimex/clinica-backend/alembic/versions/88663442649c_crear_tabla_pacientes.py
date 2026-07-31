"""crear_tabla_pacientes

Revision ID: 88663442649c
Revises: 4ed7a4c65aa7
Create Date: 2026-07-31 16:58:03.066666

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = '88663442649c'
down_revision: Union[str, None] = '4ed7a4c65aa7'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    tables = inspector.get_table_names()

    # Re-inspeccionar tablas
    inspector = sa.inspect(bind)
    tables = inspector.get_table_names()

    if 'pacientes' not in tables:
        op.create_table(
            'pacientes',
            sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
            sa.Column('nombre', sa.String(length=100), nullable=False),
            sa.Column('apellido_paterno', sa.String(length=100), nullable=True),
            sa.Column('apellido_materno', sa.String(length=100), nullable=True),
            sa.Column('fecha_nacimiento', sa.Date(), nullable=True),
            sa.Column('edad', sa.Integer(), nullable=True),
            sa.Column('peso', sa.Numeric(precision=5, scale=2), nullable=True),
            sa.Column('altura', sa.Numeric(precision=3, scale=2), nullable=True),
            sa.Column('genero', sa.String(length=20), nullable=True),
            sa.Column('curp', sa.String(length=18), nullable=True),
            sa.Column('grupo_sanguineo', sa.String(length=5), nullable=True),
            sa.Column('alergias', sa.Text(), nullable=True),
            sa.Column('telefono_celular', sa.String(length=15), nullable=True),
            sa.Column('telefono_fijo', sa.String(length=15), nullable=True),
            sa.Column('email', sa.String(length=255), nullable=True),
            sa.Column('calle', sa.String(length=255), nullable=True),
            sa.Column('numero_exterior', sa.String(length=50), nullable=True),
            sa.Column('numero_interior', sa.String(length=50), nullable=True),
            sa.Column('colonia', sa.String(length=255), nullable=True),
            sa.Column('localidad', sa.String(length=255), nullable=True),
            sa.Column('municipio', sa.String(length=255), nullable=True),
            sa.Column('estado', sa.String(length=100), nullable=True),
            sa.Column('codigo_postal', sa.String(length=5), nullable=True),
            sa.Column('contacto_emergencia_nombre', sa.String(length=150), nullable=True),
            sa.Column('contacto_emergencia_telefono', sa.String(length=20), nullable=True),
            sa.Column('contacto_emergencia_parentesco', sa.String(length=50), nullable=True),
            sa.Column('observaciones', sa.Text(), nullable=True),
            sa.Column('created_at', sa.DateTime(), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=True),
            sa.Column('updated_at', sa.DateTime(), server_default=sa.text('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'), nullable=True),
            sa.Column('estatus', sa.String(length=20), server_default='activo', nullable=True),
            sa.PrimaryKeyConstraint('id')
        )

    if 'cotizaciones' in tables:
        cot_cols = [c['name'] for c in inspector.get_columns('cotizaciones')]
        if 'paciente_id' not in cot_cols:
            op.add_column('cotizaciones', sa.Column('paciente_id', sa.Integer(), sa.ForeignKey('pacientes.id'), nullable=True))


def downgrade() -> None:
    
    pass