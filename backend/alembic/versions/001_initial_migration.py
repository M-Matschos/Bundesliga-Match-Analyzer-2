"""Initial migration: create users, matches, predictions, bets tables.

Revision ID: 001
Revises:
Create Date: 2026-04-24

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = '001'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    """Create initial schema."""
    # Create users table
    op.create_table(
        'users',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False, primary_key=True),
        sa.Column('email', sa.String(255), nullable=False, unique=True, index=True),
        sa.Column('username', sa.String(100), nullable=False, unique=True, index=True),
        sa.Column('password_hash', sa.String(255), nullable=False),
        sa.Column('full_name', sa.String(255), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=False, default=True),
        sa.Column('is_superuser', sa.Boolean(), nullable=False, default=False),
        sa.Column('created_at', sa.DateTime(), nullable=False, default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(), nullable=False, default=sa.func.now()),
        sa.Column('last_login', sa.DateTime(), nullable=True),
    )

    # Create matches table
    op.create_table(
        'matches',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False, primary_key=True),
        sa.Column('api_football_id', sa.Integer(), nullable=True, unique=True, index=True),
        sa.Column('home_team_id', sa.String(10), nullable=False, index=True),
        sa.Column('away_team_id', sa.String(10), nullable=False, index=True),
        sa.Column('league_id', sa.String(50), nullable=False, index=True),
        sa.Column('season', sa.String(10), nullable=False),
        sa.Column('matchday', sa.Integer(), nullable=True),
        sa.Column('kickoff', sa.DateTime(), nullable=False, index=True),
        sa.Column('status', sa.String(20), nullable=False, default='scheduled'),
        sa.Column('home_score', sa.Integer(), nullable=True),
        sa.Column('away_score', sa.Integer(), nullable=True),
        sa.Column('home_xg', sa.Float(), nullable=True),
        sa.Column('away_xg', sa.Float(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False, default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(), nullable=False, default=sa.func.now()),
    )

    # Create predictions table
    op.create_table(
        'predictions',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False, primary_key=True),
        sa.Column('match_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('home_win_prob', sa.Float(), nullable=False),
        sa.Column('draw_prob', sa.Float(), nullable=False),
        sa.Column('away_win_prob', sa.Float(), nullable=False),
        sa.Column('confidence', sa.Float(), nullable=False),
        sa.Column('confidence_label', sa.String(20), nullable=True),
        sa.Column('expected_goals_home', sa.Float(), nullable=True),
        sa.Column('expected_goals_away', sa.Float(), nullable=True),
        sa.Column('most_likely_score', sa.String(10), nullable=True),
        sa.Column('model_version', sa.String(20), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False, default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(), nullable=False, default=sa.func.now()),
        sa.ForeignKeyConstraint(['match_id'], ['matches.id'], name='fk_predictions_match_id'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], name='fk_predictions_user_id'),
    )

    # Create bets table
    op.create_table(
        'bets',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False, primary_key=True),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('match_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('bet_type', sa.String(20), nullable=False),  # home_win, draw, away_win
        sa.Column('odds', sa.Float(), nullable=False),
        sa.Column('amount', sa.Float(), nullable=False),
        sa.Column('status', sa.String(20), nullable=False, default='pending'),  # pending, won, lost, void
        sa.Column('win_amount', sa.Float(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False, default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(), nullable=False, default=sa.func.now()),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], name='fk_bets_user_id'),
        sa.ForeignKeyConstraint(['match_id'], ['matches.id'], name='fk_bets_match_id'),
    )

    # Create indexes
    op.create_index('idx_matches_league_season', 'matches', ['league_id', 'season'])
    op.create_index('idx_matches_kickoff', 'matches', ['kickoff'])
    op.create_index('idx_predictions_match_user', 'predictions', ['match_id', 'user_id'])
    op.create_index('idx_bets_user_match', 'bets', ['user_id', 'match_id'])


def downgrade() -> None:
    """Drop all tables."""
    op.drop_index('idx_bets_user_match', table_name='bets')
    op.drop_index('idx_predictions_match_user', table_name='predictions')
    op.drop_index('idx_matches_kickoff', table_name='matches')
    op.drop_index('idx_matches_league_season', table_name='matches')

    op.drop_table('bets')
    op.drop_table('predictions')
    op.drop_table('matches')
    op.drop_table('users')
