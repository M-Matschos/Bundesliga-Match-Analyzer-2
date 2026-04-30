"""Add teams table and FK constraints on matches.

Revision ID: 002
Revises: 001
Create Date: 2026-04-26

Changes:
- Create teams table with league standings columns
- Alter matches.home_team_id: String → UUID + FK → teams.id
- Alter matches.away_team_id: String → UUID + FK → teams.id
- Add supporting indexes

NOTE: upgrade() truncates existing match rows because the column type changes
from String (API-Football short codes) to UUID (internal team PKs).
Run seed_teams.py after this migration to repopulate teams, then re-import
match data through the API-Football collector.
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = '002'
down_revision = '001'
branch_labels = None
depends_on = None


def upgrade() -> None:
    """Create teams table and add FK constraints to matches."""

    # 1. Create teams table
    op.create_table(
        'teams',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column('name', sa.String(100), nullable=False, unique=True),
        sa.Column('logo_url', sa.String(500), nullable=True),
        sa.Column('league', sa.String(50), nullable=False),
        sa.Column('position', sa.Integer(), nullable=True),
        sa.Column('wins', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('draws', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('losses', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('goals_for', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('goals_against', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('points', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.func.now()),
    )

    op.create_index('ix_teams_name', 'teams', ['name'], unique=True)
    op.create_index('ix_teams_league', 'teams', ['league'])
    op.create_index('ix_teams_position', 'teams', ['position'])

    # 2. Truncate FK-dependent tables so column type change succeeds.
    #    Old rows have short-code IDs (e.g. 'FCB'), not UUIDs.
    op.execute('TRUNCATE TABLE bets, predictions, matches RESTART IDENTITY CASCADE')

    # 3. Drop compound indexes before altering column types
    op.drop_index('idx_matches_kickoff', table_name='matches')
    op.drop_index('idx_matches_league_season', table_name='matches')

    # 4. Alter home_team_id: String → UUID (nullable temporarily for cast)
    op.alter_column(
        'matches',
        'home_team_id',
        type_=postgresql.UUID(as_uuid=True),
        postgresql_using='NULL::uuid',
        existing_nullable=False,
        nullable=True,
    )

    # 5. Alter away_team_id: String → UUID
    op.alter_column(
        'matches',
        'away_team_id',
        type_=postgresql.UUID(as_uuid=True),
        postgresql_using='NULL::uuid',
        existing_nullable=False,
        nullable=True,
    )

    # 6. Add FK constraints (RESTRICT prevents team deletion while matches exist)
    op.create_foreign_key(
        'fk_matches_home_team_id',
        'matches', 'teams',
        ['home_team_id'], ['id'],
        ondelete='RESTRICT',
    )
    op.create_foreign_key(
        'fk_matches_away_team_id',
        'matches', 'teams',
        ['away_team_id'], ['id'],
        ondelete='RESTRICT',
    )

    # 7. Restore NOT NULL now that FKs are in place
    op.alter_column('matches', 'home_team_id', nullable=False)
    op.alter_column('matches', 'away_team_id', nullable=False)

    # 8. Recreate compound indexes
    op.create_index('idx_matches_league_season', 'matches', ['league_id', 'season'])
    op.create_index('idx_matches_kickoff', 'matches', ['kickoff'])
    op.create_index('idx_matches_home_team_id', 'matches', ['home_team_id'])
    op.create_index('idx_matches_away_team_id', 'matches', ['away_team_id'])


def downgrade() -> None:
    """Remove FK constraints on matches, drop teams table."""

    op.drop_index('idx_matches_away_team_id', table_name='matches')
    op.drop_index('idx_matches_home_team_id', table_name='matches')
    op.drop_constraint('fk_matches_away_team_id', 'matches', type_='foreignkey')
    op.drop_constraint('fk_matches_home_team_id', 'matches', type_='foreignkey')

    # Truncate before reverting UUID → String (no safe cast path)
    op.execute('TRUNCATE TABLE bets, predictions, matches RESTART IDENTITY CASCADE')

    op.alter_column(
        'matches',
        'home_team_id',
        type_=sa.String(50),
        postgresql_using="''",
        existing_nullable=False,
    )
    op.alter_column(
        'matches',
        'away_team_id',
        type_=sa.String(50),
        postgresql_using="''",
        existing_nullable=False,
    )

    op.create_index('idx_matches_league_season', 'matches', ['league_id', 'season'])
    op.create_index('idx_matches_kickoff', 'matches', ['kickoff'])

    op.drop_index('ix_teams_position', table_name='teams')
    op.drop_index('ix_teams_league', table_name='teams')
    op.drop_index('ix_teams_name', table_name='teams')
    op.drop_table('teams')
