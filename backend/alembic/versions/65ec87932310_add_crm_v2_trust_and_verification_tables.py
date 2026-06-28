"""Add CRM V2, Trust and Verification tables

Revision ID: 65ec87932310
Revises: 
Create Date: 2026-06-24 15:25:18.508649

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '65ec87932310'
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Create the 11 new tables for CRM V2, Trust and Verification
    
    op.create_table('buyer_labels',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('seller_id', sa.Integer(), nullable=False),
        sa.Column('buyer_id', sa.Integer(), nullable=False),
        sa.Column('label', sa.String(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['buyer_id'], ['users.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['seller_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_buyer_labels_buyer_id'), 'buyer_labels', ['buyer_id'], unique=False)
    op.create_index(op.f('ix_buyer_labels_created_at'), 'buyer_labels', ['created_at'], unique=False)
    op.create_index(op.f('ix_buyer_labels_id'), 'buyer_labels', ['id'], unique=False)
    op.create_index(op.f('ix_buyer_labels_label'), 'buyer_labels', ['label'], unique=False)
    op.create_index(op.f('ix_buyer_labels_seller_id'), 'buyer_labels', ['seller_id'], unique=False)

    op.create_table('buyer_notes',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('seller_id', sa.Integer(), nullable=False),
        sa.Column('buyer_id', sa.Integer(), nullable=False),
        sa.Column('note', sa.Text(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['buyer_id'], ['users.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['seller_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_buyer_notes_buyer_id'), 'buyer_notes', ['buyer_id'], unique=False)
    op.create_index(op.f('ix_buyer_notes_created_at'), 'buyer_notes', ['created_at'], unique=False)
    op.create_index(op.f('ix_buyer_notes_id'), 'buyer_notes', ['id'], unique=False)
    op.create_index(op.f('ix_buyer_notes_seller_id'), 'buyer_notes', ['seller_id'], unique=False)

    op.create_table('buyer_timeline',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('seller_id', sa.Integer(), nullable=False),
        sa.Column('buyer_id', sa.Integer(), nullable=False),
        sa.Column('event_type', sa.String(), nullable=False),
        sa.Column('event_data', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['buyer_id'], ['users.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['seller_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_buyer_timeline_buyer_id'), 'buyer_timeline', ['buyer_id'], unique=False)
    op.create_index(op.f('ix_buyer_timeline_created_at'), 'buyer_timeline', ['created_at'], unique=False)
    op.create_index(op.f('ix_buyer_timeline_id'), 'buyer_timeline', ['id'], unique=False)
    op.create_index(op.f('ix_buyer_timeline_seller_id'), 'buyer_timeline', ['seller_id'], unique=False)

    op.create_table('buyer_trust_events',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('buyer_id', sa.Integer(), nullable=False),
        sa.Column('event_type', sa.String(), nullable=False),
        sa.Column('old_score', sa.Integer(), nullable=False),
        sa.Column('new_score', sa.Integer(), nullable=False),
        sa.Column('reason', sa.String(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['buyer_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_buyer_trust_events_buyer_id'), 'buyer_trust_events', ['buyer_id'], unique=False)
    op.create_index(op.f('ix_buyer_trust_events_created_at'), 'buyer_trust_events', ['created_at'], unique=False)
    op.create_index(op.f('ix_buyer_trust_events_id'), 'buyer_trust_events', ['id'], unique=False)

    op.create_table('buyer_trust_scores',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('buyer_id', sa.Integer(), nullable=False),
        sa.Column('trust_score', sa.Integer(), nullable=False),
        sa.Column('trust_level', sa.String(), nullable=False),
        sa.Column('completed_deals', sa.Integer(), nullable=False),
        sa.Column('cancelled_deals', sa.Integer(), nullable=False),
        sa.Column('spam_reports', sa.Integer(), nullable=False),
        sa.Column('response_rate', sa.Float(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['buyer_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_buyer_trust_scores_buyer_id'), 'buyer_trust_scores', ['buyer_id'], unique=True)
    op.create_index(op.f('ix_buyer_trust_scores_id'), 'buyer_trust_scores', ['id'], unique=False)
    op.create_index(op.f('ix_buyer_trust_scores_trust_score'), 'buyer_trust_scores', ['trust_score'], unique=False)

    op.create_table('crm_activities',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('seller_id', sa.Integer(), nullable=False),
        sa.Column('buyer_id', sa.Integer(), nullable=False),
        sa.Column('activity_type', sa.String(), nullable=False),
        sa.Column('metadata', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['buyer_id'], ['users.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['seller_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_crm_activities_buyer_id'), 'crm_activities', ['buyer_id'], unique=False)
    op.create_index(op.f('ix_crm_activities_created_at'), 'crm_activities', ['created_at'], unique=False)
    op.create_index(op.f('ix_crm_activities_id'), 'crm_activities', ['id'], unique=False)
    op.create_index(op.f('ix_crm_activities_seller_id'), 'crm_activities', ['seller_id'], unique=False)

    op.create_table('lead_scores',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('seller_id', sa.Integer(), nullable=False),
        sa.Column('buyer_id', sa.Integer(), nullable=False),
        sa.Column('score', sa.Integer(), nullable=False),
        sa.Column('category', sa.String(), nullable=False),
        sa.Column('last_calculated', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['buyer_id'], ['users.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['seller_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_lead_scores_buyer_id'), 'lead_scores', ['buyer_id'], unique=False)
    op.create_index(op.f('ix_lead_scores_id'), 'lead_scores', ['id'], unique=False)
    op.create_index(op.f('ix_lead_scores_score'), 'lead_scores', ['score'], unique=False)
    op.create_index(op.f('ix_lead_scores_seller_id'), 'lead_scores', ['seller_id'], unique=False)

    op.create_table('lead_status',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('seller_id', sa.Integer(), nullable=False),
        sa.Column('buyer_id', sa.Integer(), nullable=False),
        sa.Column('status', sa.String(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['buyer_id'], ['users.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['seller_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_lead_status_buyer_id'), 'lead_status', ['buyer_id'], unique=False)
    op.create_index(op.f('ix_lead_status_id'), 'lead_status', ['id'], unique=False)
    op.create_index(op.f('ix_lead_status_seller_id'), 'lead_status', ['seller_id'], unique=False)
    op.create_index(op.f('ix_lead_status_status'), 'lead_status', ['status'], unique=False)

    op.create_table('risk_scores',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('risk_score', sa.Integer(), nullable=False),
        sa.Column('risk_level', sa.String(), nullable=False),
        sa.Column('reason', sa.Text(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_risk_scores_id'), 'risk_scores', ['id'], unique=False)
    op.create_index(op.f('ix_risk_scores_user_id'), 'risk_scores', ['user_id'], unique=True)

    op.create_table('seller_verifications',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('seller_id', sa.Integer(), nullable=False),
        sa.Column('verification_type', sa.String(), nullable=False),
        sa.Column('status', sa.String(), nullable=False),
        sa.Column('submitted_at', sa.DateTime(), nullable=False),
        sa.Column('approved_at', sa.DateTime(), nullable=True),
        sa.Column('review_notes', sa.Text(), nullable=True),
        sa.ForeignKeyConstraint(['seller_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_seller_verifications_id'), 'seller_verifications', ['id'], unique=False)
    op.create_index(op.f('ix_seller_verifications_seller_id'), 'seller_verifications', ['seller_id'], unique=False)
    op.create_index(op.f('ix_seller_verifications_status'), 'seller_verifications', ['status'], unique=False)

    op.create_table('verification_documents',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('verification_id', sa.Integer(), nullable=False),
        sa.Column('file_path', sa.String(), nullable=False),
        sa.Column('document_type', sa.String(), nullable=False),
        sa.Column('uploaded_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['verification_id'], ['seller_verifications.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_verification_documents_id'), 'verification_documents', ['id'], unique=False)
    op.create_index(op.f('ix_verification_documents_verification_id'), 'verification_documents', ['verification_id'], unique=False)


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index(op.f('ix_verification_documents_verification_id'), table_name='verification_documents')
    op.drop_index(op.f('ix_verification_documents_id'), table_name='verification_documents')
    op.drop_table('verification_documents')
    op.drop_index(op.f('ix_seller_verifications_status'), table_name='seller_verifications')
    op.drop_index(op.f('ix_seller_verifications_seller_id'), table_name='seller_verifications')
    op.drop_index(op.f('ix_seller_verifications_id'), table_name='seller_verifications')
    op.drop_table('seller_verifications')
    op.drop_index(op.f('ix_risk_scores_user_id'), table_name='risk_scores')
    op.drop_index(op.f('ix_risk_scores_id'), table_name='risk_scores')
    op.drop_table('risk_scores')
    op.drop_index(op.f('ix_lead_status_status'), table_name='lead_status')
    op.drop_index(op.f('ix_lead_status_seller_id'), table_name='lead_status')
    op.drop_index(op.f('ix_lead_status_id'), table_name='lead_status')
    op.drop_index(op.f('ix_lead_status_buyer_id'), table_name='lead_status')
    op.drop_table('lead_status')
    op.drop_index(op.f('ix_lead_scores_seller_id'), table_name='lead_scores')
    op.drop_index(op.f('ix_lead_scores_score'), table_name='lead_scores')
    op.drop_index(op.f('ix_lead_scores_id'), table_name='lead_scores')
    op.drop_index(op.f('ix_lead_scores_buyer_id'), table_name='lead_scores')
    op.drop_table('lead_scores')
    op.drop_index(op.f('ix_crm_activities_seller_id'), table_name='crm_activities')
    op.drop_index(op.f('ix_crm_activities_id'), table_name='crm_activities')
    op.drop_index(op.f('ix_crm_activities_created_at'), table_name='crm_activities')
    op.drop_index(op.f('ix_crm_activities_buyer_id'), table_name='crm_activities')
    op.drop_table('crm_activities')
    op.drop_index(op.f('ix_buyer_trust_scores_trust_score'), table_name='buyer_trust_scores')
    op.drop_index(op.f('ix_buyer_trust_scores_id'), table_name='buyer_trust_scores')
    op.drop_index(op.f('ix_buyer_trust_scores_buyer_id'), table_name='buyer_trust_scores')
    op.drop_table('buyer_trust_scores')
    op.drop_index(op.f('ix_buyer_trust_events_id'), table_name='buyer_trust_events')
    op.drop_index(op.f('ix_buyer_trust_events_created_at'), table_name='buyer_trust_events')
    op.drop_index(op.f('ix_buyer_trust_events_buyer_id'), table_name='buyer_trust_events')
    op.drop_table('buyer_trust_events')
    op.drop_index(op.f('ix_buyer_timeline_seller_id'), table_name='buyer_timeline')
    op.drop_index(op.f('ix_buyer_timeline_id'), table_name='buyer_timeline')
    op.drop_index(op.f('ix_buyer_timeline_created_at'), table_name='buyer_timeline')
    op.drop_index(op.f('ix_buyer_timeline_buyer_id'), table_name='buyer_timeline')
    op.drop_table('buyer_timeline')
    op.drop_index(op.f('ix_buyer_notes_seller_id'), table_name='buyer_notes')
    op.drop_index(op.f('ix_buyer_notes_id'), table_name='buyer_notes')
    op.drop_index(op.f('ix_buyer_notes_created_at'), table_name='buyer_notes')
    op.drop_index(op.f('ix_buyer_notes_buyer_id'), table_name='buyer_notes')
    op.drop_table('buyer_notes')
    op.drop_index(op.f('ix_buyer_labels_seller_id'), table_name='buyer_labels')
    op.drop_index(op.f('ix_buyer_labels_label'), table_name='buyer_labels')
    op.drop_index(op.f('ix_buyer_labels_id'), table_name='buyer_labels')
    op.drop_index(op.f('ix_buyer_labels_created_at'), table_name='buyer_labels')
    op.drop_index(op.f('ix_buyer_labels_buyer_id'), table_name='buyer_labels')
    op.drop_table('buyer_labels')
