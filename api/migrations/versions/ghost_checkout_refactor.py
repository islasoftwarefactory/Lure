"""Ghost checkout refactor

Revision ID: ghost_checkout_001
Revises: b2f58bf642c7_gsfsg
Create Date: 2024-01-01 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import mysql

# revision identifiers, used by Alembic.
revision = 'ghost_checkout_001'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    # Create auth_providers table
    op.create_table('auth_providers',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('name', sa.String(length=50), nullable=False),
    sa.Column('description', sa.String(length=255), nullable=True),
    sa.Column('created_at', sa.DateTime(), nullable=False),
    sa.Column('updated_at', sa.DateTime(), nullable=False),
    sa.PrimaryKeyConstraint('id'),
    sa.UniqueConstraint('name')
    )
    
    # Insert default auth providers
    op.execute("INSERT INTO auth_providers (name, description, created_at, updated_at) VALUES ('Google', 'Google OAuth authentication', NOW(), NOW())")
    op.execute("INSERT INTO auth_providers (name, description, created_at, updated_at) VALUES ('Ghost', 'Guest user without authentication', NOW(), NOW())")
    
    # Add auth_provider_id column to users table
    op.add_column('users', sa.Column('auth_provider_id', sa.Integer(), nullable=True))
    
    # Migrate existing data: set auth_provider_id based on auth_provider enum
    op.execute("UPDATE users SET auth_provider_id = (SELECT id FROM auth_providers WHERE name = 'Google') WHERE auth_provider = 'Google'")
    
    # Make auth_provider_id not nullable after data migration
    op.alter_column('users', 'auth_provider_id', nullable=False)
    
    # Add foreign key constraint
    op.create_foreign_key('fk_users_auth_provider', 'users', 'auth_providers', ['auth_provider_id'], ['id'])
    
    # Drop old unique constraint
    op.drop_constraint('uq_provider_identity', 'users', type_='unique')
    
    # Make provider_id nullable
    op.alter_column('users', 'provider_id', nullable=True)
    
    # Remove unique constraint from email
    op.drop_constraint('email', 'users', type_='unique')
    
    # Create new unique constraint with auth_provider_id
    op.create_unique_constraint('uq_provider_identity', 'users', ['auth_provider_id', 'provider_id'])
    
    # Drop old auth_provider enum column
    op.drop_column('users', 'auth_provider')


def downgrade():
    # Add back auth_provider enum column
    op.add_column('users', sa.Column('auth_provider', mysql.ENUM('GOOGLE', 'APPLE'), nullable=True))
    
    # Migrate data back
    op.execute("UPDATE users SET auth_provider = 'GOOGLE' WHERE auth_provider_id = (SELECT id FROM auth_providers WHERE name = 'Google')")
    
    # Make auth_provider not nullable
    op.alter_column('users', 'auth_provider', nullable=False)
    
    # Drop new unique constraint
    op.drop_constraint('uq_provider_identity', 'users', type_='unique')
    
    # Add back email unique constraint
    op.create_unique_constraint('email', 'users', ['email'])
    
    # Make provider_id not nullable
    op.alter_column('users', 'provider_id', nullable=False)
    
    # Create old unique constraint
    op.create_unique_constraint('uq_provider_identity', 'users', ['auth_provider', 'provider_id'])
    
    # Drop foreign key and column
    op.drop_constraint('fk_users_auth_provider', 'users', type_='foreignkey')
    op.drop_column('users', 'auth_provider_id')
    
    # Drop auth_providers table
    op.drop_table('auth_providers')