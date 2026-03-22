"""extend blog.photo_names for comma-separated UUIDs

Revision ID: d4e8f1a2b3c4
Revises: c75a46c3df5c
Create Date: 2026-03-22

"""
from alembic import op
import sqlalchemy as sa

revision = 'd4e8f1a2b3c4'
down_revision = 'c75a46c3df5c'
branch_labels = None
depends_on = None


def upgrade():
    op.alter_column(
        'blog',
        'photo_names',
        existing_type=sa.String(length=300),
        type_=sa.String(length=2000),
        existing_nullable=True,
    )


def downgrade():
    op.alter_column(
        'blog',
        'photo_names',
        existing_type=sa.String(length=2000),
        type_=sa.String(length=300),
        existing_nullable=True,
    )
