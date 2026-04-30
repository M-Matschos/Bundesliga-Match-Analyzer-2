-- Phase C: Push Notifications Schema
-- Migration: Create notification-related tables for Firebase Cloud Messaging integration
-- Created: 2026-04-28

-- Table: device_tokens
-- Stores Firebase device tokens for push notification delivery
CREATE TABLE IF NOT EXISTS device_tokens (
    id BIGSERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    device_token VARCHAR(500) NOT NULL UNIQUE,
    platform VARCHAR(20) NOT NULL CHECK (platform IN ('ios', 'android', 'web')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_device_tokens_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_device_tokens_user_id ON device_tokens(user_id);
CREATE INDEX idx_device_tokens_platform ON device_tokens(platform);
CREATE INDEX idx_device_tokens_created_at ON device_tokens(created_at);


-- Table: notification_subscriptions
-- Links users to matches for targeted push notifications
CREATE TABLE IF NOT EXISTS notification_subscriptions (
    id BIGSERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    match_id INTEGER NOT NULL,
    subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    unsubscribed_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT uk_user_match_subscription UNIQUE (user_id, match_id),
    CONSTRAINT fk_notification_subs_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_notification_subs_match_id FOREIGN KEY (match_id) REFERENCES matches(id) ON DELETE CASCADE
);

CREATE INDEX idx_notification_subs_user_id ON notification_subscriptions(user_id);
CREATE INDEX idx_notification_subs_match_id ON notification_subscriptions(match_id);
CREATE INDEX idx_notification_subs_active ON notification_subscriptions(unsubscribed_at) WHERE unsubscribed_at IS NULL;


-- Table: notification_history
-- Complete audit trail of all push notifications sent to users
CREATE TABLE IF NOT EXISTS notification_history (
    id BIGSERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    match_id INTEGER NOT NULL,
    event_type VARCHAR(50) NOT NULL,
    firebase_message_id VARCHAR(255),
    title VARCHAR(200) NOT NULL,
    body VARCHAR(1000) NOT NULL,
    image_url VARCHAR(500),
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMP WITH TIME ZONE,
    delivery_status VARCHAR(20) DEFAULT 'sent' CHECK (delivery_status IN ('sent', 'failed', 'bounced')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_notification_history_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_notification_history_match_id FOREIGN KEY (match_id) REFERENCES matches(id) ON DELETE CASCADE
);

CREATE INDEX idx_notification_history_user_id ON notification_history(user_id);
CREATE INDEX idx_notification_history_match_id ON notification_history(match_id);
CREATE INDEX idx_notification_history_sent_at ON notification_history(sent_at DESC);
CREATE INDEX idx_notification_history_event_type ON notification_history(event_type);
CREATE INDEX idx_notification_history_read_status ON notification_history(read_at) WHERE read_at IS NULL;
CREATE INDEX idx_notification_history_firebase_msg_id ON notification_history(firebase_message_id) WHERE firebase_message_id IS NOT NULL;


-- Audit log trigger for device_tokens (optional but recommended)
CREATE OR REPLACE FUNCTION update_device_tokens_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_device_tokens_updated_at
    BEFORE UPDATE ON device_tokens
    FOR EACH ROW
    EXECUTE FUNCTION update_device_tokens_updated_at();
