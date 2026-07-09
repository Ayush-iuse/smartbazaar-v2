"""Add rental_price_per_day to listings

Revision ID: a1b2c3d4e5f6
Revises: 44f1ebcce96a
Create Date: 2026-07-08 10:35:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'a1b2c3d4e5f6'
down_revision: Union[str, None] = '44f1ebcce96a'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add rental_price_per_day column to listings table (nullable, no default)
    op.add_column('listings', sa.Column('rental_price_per_day', sa.Float(), nullable=True))


def downgrade() -> None:
    op.drop_column('listings', 'rental_price_per_day')
