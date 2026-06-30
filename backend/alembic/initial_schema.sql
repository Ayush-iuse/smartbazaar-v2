BEGIN;

CREATE TABLE alembic_version (
    version_num VARCHAR(32) NOT NULL, 
    CONSTRAINT alembic_version_pkc PRIMARY KEY (version_num)
);

-- Running upgrade  -> 44f1ebcce96a

CREATE TABLE analytics_snapshots (
    id SERIAL NOT NULL, 
    category VARCHAR NOT NULL, 
    avg_price FLOAT NOT NULL, 
    listing_count INTEGER NOT NULL, 
    fraud_rate FLOAT NOT NULL, 
    snapshot_date DATE, 
    PRIMARY KEY (id)
);

CREATE INDEX ix_analytics_snapshots_category ON analytics_snapshots (category);

CREATE INDEX ix_analytics_snapshots_id ON analytics_snapshots (id);

CREATE INDEX ix_analytics_snapshots_snapshot_date ON analytics_snapshots (snapshot_date);

CREATE TABLE background_jobs (
    id SERIAL NOT NULL, 
    job_type VARCHAR NOT NULL, 
    payload TEXT NOT NULL, 
    status VARCHAR NOT NULL, 
    error TEXT, 
    created_at TIMESTAMP WITHOUT TIME ZONE, 
    scheduled_at TIMESTAMP WITHOUT TIME ZONE, 
    completed_at TIMESTAMP WITHOUT TIME ZONE, 
    PRIMARY KEY (id)
);

CREATE INDEX ix_background_jobs_id ON background_jobs (id);

CREATE TABLE system_settings (
    key VARCHAR NOT NULL, 
    value TEXT NOT NULL, 
    description VARCHAR, 
    PRIMARY KEY (key)
);

CREATE INDEX ix_system_settings_key ON system_settings (key);

CREATE TABLE users (
    id SERIAL NOT NULL, 
    email VARCHAR NOT NULL, 
    full_name VARCHAR, 
    hashed_password VARCHAR NOT NULL, 
    is_admin BOOLEAN, 
    is_suspended BOOLEAN, 
    created_at TIMESTAMP WITHOUT TIME ZONE, 
    PRIMARY KEY (id)
);

CREATE UNIQUE INDEX ix_users_email ON users (email);

CREATE INDEX ix_users_id ON users (id);

CREATE TABLE audit_logs (
    id SERIAL NOT NULL, 
    user_id INTEGER, 
    action VARCHAR NOT NULL, 
    entity_type VARCHAR, 
    entity_id INTEGER, 
    details TEXT, 
    ip_address VARCHAR, 
    user_agent VARCHAR, 
    created_at TIMESTAMP WITHOUT TIME ZONE, 
    PRIMARY KEY (id), 
    FOREIGN KEY(user_id) REFERENCES users (id) ON DELETE SET NULL
);

CREATE INDEX ix_audit_logs_id ON audit_logs (id);

CREATE TABLE buyer_labels (
    id SERIAL NOT NULL, 
    seller_id INTEGER NOT NULL, 
    buyer_id INTEGER NOT NULL, 
    label VARCHAR NOT NULL, 
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL, 
    PRIMARY KEY (id), 
    FOREIGN KEY(buyer_id) REFERENCES users (id) ON DELETE CASCADE, 
    FOREIGN KEY(seller_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE INDEX ix_buyer_labels_buyer_id ON buyer_labels (buyer_id);

CREATE INDEX ix_buyer_labels_created_at ON buyer_labels (created_at);

CREATE INDEX ix_buyer_labels_id ON buyer_labels (id);

CREATE INDEX ix_buyer_labels_label ON buyer_labels (label);

CREATE INDEX ix_buyer_labels_seller_id ON buyer_labels (seller_id);

CREATE TABLE buyer_notes (
    id SERIAL NOT NULL, 
    seller_id INTEGER NOT NULL, 
    buyer_id INTEGER NOT NULL, 
    note TEXT NOT NULL, 
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL, 
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL, 
    PRIMARY KEY (id), 
    FOREIGN KEY(buyer_id) REFERENCES users (id) ON DELETE CASCADE, 
    FOREIGN KEY(seller_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE INDEX ix_buyer_notes_buyer_id ON buyer_notes (buyer_id);

CREATE INDEX ix_buyer_notes_created_at ON buyer_notes (created_at);

CREATE INDEX ix_buyer_notes_id ON buyer_notes (id);

CREATE INDEX ix_buyer_notes_seller_id ON buyer_notes (seller_id);

CREATE TABLE buyer_timeline (
    id SERIAL NOT NULL, 
    seller_id INTEGER NOT NULL, 
    buyer_id INTEGER NOT NULL, 
    event_type VARCHAR NOT NULL, 
    event_data TEXT, 
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL, 
    PRIMARY KEY (id), 
    FOREIGN KEY(buyer_id) REFERENCES users (id) ON DELETE CASCADE, 
    FOREIGN KEY(seller_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE INDEX ix_buyer_timeline_buyer_id ON buyer_timeline (buyer_id);

CREATE INDEX ix_buyer_timeline_created_at ON buyer_timeline (created_at);

CREATE INDEX ix_buyer_timeline_id ON buyer_timeline (id);

CREATE INDEX ix_buyer_timeline_seller_id ON buyer_timeline (seller_id);

CREATE TABLE buyer_trust_events (
    id SERIAL NOT NULL, 
    buyer_id INTEGER NOT NULL, 
    event_type VARCHAR NOT NULL, 
    old_score INTEGER NOT NULL, 
    new_score INTEGER NOT NULL, 
    reason VARCHAR, 
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL, 
    PRIMARY KEY (id), 
    FOREIGN KEY(buyer_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE INDEX ix_buyer_trust_events_buyer_id ON buyer_trust_events (buyer_id);

CREATE INDEX ix_buyer_trust_events_created_at ON buyer_trust_events (created_at);

CREATE INDEX ix_buyer_trust_events_id ON buyer_trust_events (id);

CREATE TABLE buyer_trust_scores (
    id SERIAL NOT NULL, 
    buyer_id INTEGER NOT NULL, 
    trust_score INTEGER NOT NULL, 
    trust_level VARCHAR NOT NULL, 
    completed_deals INTEGER NOT NULL, 
    cancelled_deals INTEGER NOT NULL, 
    spam_reports INTEGER NOT NULL, 
    response_rate FLOAT NOT NULL, 
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL, 
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL, 
    PRIMARY KEY (id), 
    FOREIGN KEY(buyer_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE UNIQUE INDEX ix_buyer_trust_scores_buyer_id ON buyer_trust_scores (buyer_id);

CREATE INDEX ix_buyer_trust_scores_id ON buyer_trust_scores (id);

CREATE INDEX ix_buyer_trust_scores_trust_score ON buyer_trust_scores (trust_score);

CREATE TABLE copilot_memory (
    id SERIAL NOT NULL, 
    user_id INTEGER NOT NULL, 
    key VARCHAR NOT NULL, 
    value TEXT NOT NULL, 
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL, 
    PRIMARY KEY (id), 
    FOREIGN KEY(user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE INDEX ix_copilot_memory_id ON copilot_memory (id);

CREATE INDEX ix_copilot_memory_key ON copilot_memory (key);

CREATE INDEX ix_copilot_memory_user_id ON copilot_memory (user_id);

CREATE TABLE copilot_sessions (
    id SERIAL NOT NULL, 
    user_id INTEGER NOT NULL, 
    title VARCHAR, 
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL, 
    PRIMARY KEY (id), 
    FOREIGN KEY(user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE INDEX ix_copilot_sessions_id ON copilot_sessions (id);

CREATE INDEX ix_copilot_sessions_user_id ON copilot_sessions (user_id);

CREATE TABLE crm_activities (
    id SERIAL NOT NULL, 
    seller_id INTEGER NOT NULL, 
    buyer_id INTEGER NOT NULL, 
    activity_type VARCHAR NOT NULL, 
    metadata TEXT, 
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL, 
    PRIMARY KEY (id), 
    FOREIGN KEY(buyer_id) REFERENCES users (id) ON DELETE CASCADE, 
    FOREIGN KEY(seller_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE INDEX ix_crm_activities_buyer_id ON crm_activities (buyer_id);

CREATE INDEX ix_crm_activities_created_at ON crm_activities (created_at);

CREATE INDEX ix_crm_activities_id ON crm_activities (id);

CREATE INDEX ix_crm_activities_seller_id ON crm_activities (seller_id);

CREATE TABLE lead_scores (
    id SERIAL NOT NULL, 
    seller_id INTEGER NOT NULL, 
    buyer_id INTEGER NOT NULL, 
    score INTEGER NOT NULL, 
    category VARCHAR NOT NULL, 
    last_calculated TIMESTAMP WITHOUT TIME ZONE NOT NULL, 
    PRIMARY KEY (id), 
    FOREIGN KEY(buyer_id) REFERENCES users (id) ON DELETE CASCADE, 
    FOREIGN KEY(seller_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE INDEX ix_lead_scores_buyer_id ON lead_scores (buyer_id);

CREATE INDEX ix_lead_scores_id ON lead_scores (id);

CREATE INDEX ix_lead_scores_score ON lead_scores (score);

CREATE INDEX ix_lead_scores_seller_id ON lead_scores (seller_id);

CREATE TABLE lead_status (
    id SERIAL NOT NULL, 
    seller_id INTEGER NOT NULL, 
    buyer_id INTEGER NOT NULL, 
    status VARCHAR NOT NULL, 
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL, 
    PRIMARY KEY (id), 
    FOREIGN KEY(buyer_id) REFERENCES users (id) ON DELETE CASCADE, 
    FOREIGN KEY(seller_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE INDEX ix_lead_status_buyer_id ON lead_status (buyer_id);

CREATE INDEX ix_lead_status_id ON lead_status (id);

CREATE INDEX ix_lead_status_seller_id ON lead_status (seller_id);

CREATE INDEX ix_lead_status_status ON lead_status (status);

CREATE TABLE listings (
    id SERIAL NOT NULL, 
    title VARCHAR NOT NULL, 
    description TEXT, 
    price FLOAT NOT NULL, 
    category VARCHAR NOT NULL, 
    location VARCHAR NOT NULL, 
    image_urls TEXT, 
    seller_id INTEGER NOT NULL, 
    fraud_score FLOAT, 
    fraud_level VARCHAR, 
    status VARCHAR NOT NULL, 
    is_featured BOOLEAN, 
    created_at TIMESTAMP WITHOUT TIME ZONE, 
    PRIMARY KEY (id), 
    FOREIGN KEY(seller_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE INDEX ix_listings_category ON listings (category);

CREATE INDEX ix_listings_id ON listings (id);

CREATE INDEX ix_listings_location ON listings (location);

CREATE INDEX ix_listings_title ON listings (title);

CREATE TABLE login_histories (
    id SERIAL NOT NULL, 
    user_id INTEGER NOT NULL, 
    ip_address VARCHAR NOT NULL, 
    user_agent VARCHAR NOT NULL, 
    device_info VARCHAR, 
    status VARCHAR NOT NULL, 
    created_at TIMESTAMP WITHOUT TIME ZONE, 
    PRIMARY KEY (id), 
    FOREIGN KEY(user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE INDEX ix_login_histories_id ON login_histories (id);

CREATE TABLE notifications (
    id SERIAL NOT NULL, 
    user_id INTEGER NOT NULL, 
    type VARCHAR NOT NULL, 
    title VARCHAR NOT NULL, 
    message TEXT NOT NULL, 
    is_read BOOLEAN NOT NULL, 
    link VARCHAR, 
    created_at TIMESTAMP WITHOUT TIME ZONE, 
    PRIMARY KEY (id), 
    FOREIGN KEY(user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE INDEX ix_notifications_id ON notifications (id);

CREATE TABLE risk_scores (
    id SERIAL NOT NULL, 
    user_id INTEGER NOT NULL, 
    risk_score INTEGER NOT NULL, 
    risk_level VARCHAR NOT NULL, 
    reason TEXT, 
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL, 
    PRIMARY KEY (id), 
    FOREIGN KEY(user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE INDEX ix_risk_scores_id ON risk_scores (id);

CREATE UNIQUE INDEX ix_risk_scores_user_id ON risk_scores (user_id);

CREATE TABLE saved_searches (
    id SERIAL NOT NULL, 
    user_id INTEGER NOT NULL, 
    query VARCHAR NOT NULL, 
    filters TEXT, 
    created_at TIMESTAMP WITHOUT TIME ZONE, 
    PRIMARY KEY (id), 
    FOREIGN KEY(user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE INDEX ix_saved_searches_id ON saved_searches (id);

CREATE TABLE search_history (
    id SERIAL NOT NULL, 
    user_id INTEGER, 
    query_string TEXT NOT NULL, 
    intent VARCHAR, 
    resolved_filters TEXT, 
    created_at TIMESTAMP WITHOUT TIME ZONE, 
    PRIMARY KEY (id), 
    FOREIGN KEY(user_id) REFERENCES users (id) ON DELETE SET NULL
);

CREATE INDEX ix_search_history_id ON search_history (id);

CREATE TABLE seller_scores (
    id SERIAL NOT NULL, 
    seller_id INTEGER NOT NULL, 
    trust_score INTEGER NOT NULL, 
    response_rate FLOAT NOT NULL, 
    quality_score INTEGER NOT NULL, 
    fraud_score INTEGER NOT NULL, 
    level VARCHAR NOT NULL, 
    created_at TIMESTAMP WITHOUT TIME ZONE, 
    PRIMARY KEY (id), 
    FOREIGN KEY(seller_id) REFERENCES users (id) ON DELETE CASCADE, 
    UNIQUE (seller_id)
);

CREATE INDEX ix_seller_scores_id ON seller_scores (id);

CREATE TABLE seller_verifications (
    id SERIAL NOT NULL, 
    seller_id INTEGER NOT NULL, 
    verification_type VARCHAR NOT NULL, 
    status VARCHAR NOT NULL, 
    submitted_at TIMESTAMP WITHOUT TIME ZONE NOT NULL, 
    approved_at TIMESTAMP WITHOUT TIME ZONE, 
    review_notes TEXT, 
    PRIMARY KEY (id), 
    FOREIGN KEY(seller_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE INDEX ix_seller_verifications_id ON seller_verifications (id);

CREATE INDEX ix_seller_verifications_seller_id ON seller_verifications (seller_id);

CREATE INDEX ix_seller_verifications_status ON seller_verifications (status);

CREATE TABLE conversations (
    id SERIAL NOT NULL, 
    listing_id INTEGER NOT NULL, 
    buyer_id INTEGER NOT NULL, 
    seller_id INTEGER NOT NULL, 
    is_archived_buyer BOOLEAN NOT NULL, 
    is_archived_seller BOOLEAN NOT NULL, 
    is_pinned_buyer BOOLEAN NOT NULL, 
    is_pinned_seller BOOLEAN NOT NULL, 
    created_at TIMESTAMP WITHOUT TIME ZONE, 
    updated_at TIMESTAMP WITHOUT TIME ZONE, 
    PRIMARY KEY (id), 
    FOREIGN KEY(buyer_id) REFERENCES users (id) ON DELETE CASCADE, 
    FOREIGN KEY(listing_id) REFERENCES listings (id) ON DELETE CASCADE, 
    FOREIGN KEY(seller_id) REFERENCES users (id) ON DELETE CASCADE, 
    CONSTRAINT uq_listing_buyer_conversation UNIQUE (listing_id, buyer_id)
);

CREATE INDEX ix_conversations_id ON conversations (id);

CREATE TABLE copilot_actions (
    id SERIAL NOT NULL, 
    session_id INTEGER NOT NULL, 
    action_type VARCHAR NOT NULL, 
    action_data TEXT, 
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL, 
    PRIMARY KEY (id), 
    FOREIGN KEY(session_id) REFERENCES copilot_sessions (id) ON DELETE CASCADE
);

CREATE INDEX ix_copilot_actions_id ON copilot_actions (id);

CREATE INDEX ix_copilot_actions_session_id ON copilot_actions (session_id);

CREATE TABLE copilot_messages (
    id SERIAL NOT NULL, 
    session_id INTEGER NOT NULL, 
    sender VARCHAR NOT NULL, 
    content TEXT NOT NULL, 
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL, 
    PRIMARY KEY (id), 
    FOREIGN KEY(session_id) REFERENCES copilot_sessions (id) ON DELETE CASCADE
);

CREATE INDEX ix_copilot_messages_id ON copilot_messages (id);

CREATE INDEX ix_copilot_messages_session_id ON copilot_messages (session_id);

CREATE TABLE listing_scores (
    id SERIAL NOT NULL, 
    listing_id INTEGER, 
    listing_score INTEGER NOT NULL, 
    sale_probability INTEGER NOT NULL, 
    competition_score INTEGER NOT NULL, 
    price_score INTEGER NOT NULL, 
    description_score INTEGER NOT NULL, 
    recommendations TEXT, 
    created_at TIMESTAMP WITHOUT TIME ZONE, 
    PRIMARY KEY (id), 
    FOREIGN KEY(listing_id) REFERENCES listings (id) ON DELETE CASCADE
);

CREATE INDEX ix_listing_scores_id ON listing_scores (id);

CREATE TABLE listing_views (
    id SERIAL NOT NULL, 
    listing_id INTEGER NOT NULL, 
    viewer_id INTEGER, 
    viewed_at TIMESTAMP WITHOUT TIME ZONE, 
    PRIMARY KEY (id), 
    FOREIGN KEY(listing_id) REFERENCES listings (id) ON DELETE CASCADE, 
    FOREIGN KEY(viewer_id) REFERENCES users (id) ON DELETE SET NULL
);

CREATE INDEX ix_listing_views_id ON listing_views (id);

CREATE INDEX ix_listing_views_listing_id ON listing_views (listing_id);

CREATE INDEX ix_listing_views_viewer_id ON listing_views (viewer_id);

CREATE TABLE offers (
    id SERIAL NOT NULL, 
    listing_id INTEGER NOT NULL, 
    buyer_id INTEGER NOT NULL, 
    seller_id INTEGER NOT NULL, 
    offer_amount FLOAT NOT NULL, 
    status VARCHAR NOT NULL, 
    created_at TIMESTAMP WITHOUT TIME ZONE, 
    updated_at TIMESTAMP WITHOUT TIME ZONE, 
    PRIMARY KEY (id), 
    FOREIGN KEY(buyer_id) REFERENCES users (id) ON DELETE CASCADE, 
    FOREIGN KEY(listing_id) REFERENCES listings (id) ON DELETE CASCADE, 
    FOREIGN KEY(seller_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE INDEX ix_offers_buyer_id ON offers (buyer_id);

CREATE INDEX ix_offers_id ON offers (id);

CREATE INDEX ix_offers_listing_id ON offers (listing_id);

CREATE INDEX ix_offers_seller_id ON offers (seller_id);

CREATE TABLE price_watches (
    id SERIAL NOT NULL, 
    user_id INTEGER NOT NULL, 
    listing_id INTEGER NOT NULL, 
    last_notified_price FLOAT NOT NULL, 
    created_at TIMESTAMP WITHOUT TIME ZONE, 
    PRIMARY KEY (id), 
    FOREIGN KEY(listing_id) REFERENCES listings (id) ON DELETE CASCADE, 
    FOREIGN KEY(user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE INDEX ix_price_watches_id ON price_watches (id);

CREATE TABLE recently_viewed (
    id SERIAL NOT NULL, 
    user_id INTEGER NOT NULL, 
    listing_id INTEGER NOT NULL, 
    viewed_at TIMESTAMP WITHOUT TIME ZONE, 
    PRIMARY KEY (id), 
    FOREIGN KEY(listing_id) REFERENCES listings (id) ON DELETE CASCADE, 
    FOREIGN KEY(user_id) REFERENCES users (id) ON DELETE CASCADE, 
    CONSTRAINT _user_listing_viewed_uc UNIQUE (user_id, listing_id)
);

CREATE INDEX ix_recently_viewed_id ON recently_viewed (id);

CREATE INDEX ix_recently_viewed_listing_id ON recently_viewed (listing_id);

CREATE INDEX ix_recently_viewed_user_id ON recently_viewed (user_id);

CREATE TABLE recommendations (
    id SERIAL NOT NULL, 
    listing_id INTEGER NOT NULL, 
    recommended_listing_id INTEGER NOT NULL, 
    rank INTEGER NOT NULL, 
    created_at TIMESTAMP WITHOUT TIME ZONE, 
    PRIMARY KEY (id), 
    FOREIGN KEY(listing_id) REFERENCES listings (id) ON DELETE CASCADE, 
    FOREIGN KEY(recommended_listing_id) REFERENCES listings (id) ON DELETE CASCADE
);

CREATE INDEX ix_recommendations_id ON recommendations (id);

CREATE TABLE saved_listings (
    id SERIAL NOT NULL, 
    user_id INTEGER NOT NULL, 
    listing_id INTEGER NOT NULL, 
    created_at TIMESTAMP WITHOUT TIME ZONE, 
    PRIMARY KEY (id), 
    FOREIGN KEY(listing_id) REFERENCES listings (id) ON DELETE CASCADE, 
    FOREIGN KEY(user_id) REFERENCES users (id) ON DELETE CASCADE, 
    CONSTRAINT _user_listing_uc UNIQUE (user_id, listing_id)
);

CREATE INDEX ix_saved_listings_id ON saved_listings (id);

CREATE INDEX ix_saved_listings_listing_id ON saved_listings (listing_id);

CREATE INDEX ix_saved_listings_user_id ON saved_listings (user_id);

CREATE TABLE verification_documents (
    id SERIAL NOT NULL, 
    verification_id INTEGER NOT NULL, 
    file_path VARCHAR NOT NULL, 
    document_type VARCHAR NOT NULL, 
    uploaded_at TIMESTAMP WITHOUT TIME ZONE NOT NULL, 
    PRIMARY KEY (id), 
    FOREIGN KEY(verification_id) REFERENCES seller_verifications (id) ON DELETE CASCADE
);

CREATE INDEX ix_verification_documents_id ON verification_documents (id);

CREATE INDEX ix_verification_documents_verification_id ON verification_documents (verification_id);

CREATE TABLE messages (
    id SERIAL NOT NULL, 
    listing_id INTEGER NOT NULL, 
    sender_id INTEGER NOT NULL, 
    conversation_id INTEGER NOT NULL, 
    content TEXT, 
    message_type VARCHAR NOT NULL, 
    media_url VARCHAR, 
    is_delivered BOOLEAN NOT NULL, 
    is_read BOOLEAN NOT NULL, 
    reactions TEXT NOT NULL, 
    created_at TIMESTAMP WITHOUT TIME ZONE, 
    PRIMARY KEY (id), 
    FOREIGN KEY(conversation_id) REFERENCES conversations (id) ON DELETE CASCADE, 
    FOREIGN KEY(listing_id) REFERENCES listings (id) ON DELETE CASCADE, 
    FOREIGN KEY(sender_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE INDEX ix_messages_conversation_id ON messages (conversation_id);

CREATE INDEX ix_messages_id ON messages (id);

CREATE INDEX ix_messages_listing_id ON messages (listing_id);

CREATE INDEX ix_messages_sender_id ON messages (sender_id);

CREATE TABLE online_status (
    user_id INTEGER NOT NULL, 
    is_online BOOLEAN NOT NULL, 
    last_active_at TIMESTAMP WITHOUT TIME ZONE, 
    current_conversation_id INTEGER, 
    PRIMARY KEY (user_id), 
    FOREIGN KEY(current_conversation_id) REFERENCES conversations (id) ON DELETE SET NULL, 
    FOREIGN KEY(user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE INDEX ix_online_status_user_id ON online_status (user_id);

CREATE TABLE reports (
    id SERIAL NOT NULL, 
    reporter_id INTEGER NOT NULL, 
    reported_user_id INTEGER, 
    reported_listing_id INTEGER, 
    reported_conversation_id INTEGER, 
    reported_message_id INTEGER, 
    reason VARCHAR NOT NULL, 
    details TEXT, 
    status VARCHAR NOT NULL, 
    created_at TIMESTAMP WITHOUT TIME ZONE, 
    PRIMARY KEY (id), 
    FOREIGN KEY(reported_conversation_id) REFERENCES conversations (id) ON DELETE CASCADE, 
    FOREIGN KEY(reported_listing_id) REFERENCES listings (id) ON DELETE CASCADE, 
    FOREIGN KEY(reported_message_id) REFERENCES messages (id) ON DELETE CASCADE, 
    FOREIGN KEY(reported_user_id) REFERENCES users (id) ON DELETE CASCADE, 
    FOREIGN KEY(reporter_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE INDEX ix_reports_id ON reports (id);

INSERT INTO alembic_version (version_num) VALUES ('44f1ebcce96a') RETURNING alembic_version.version_num;

COMMIT;

