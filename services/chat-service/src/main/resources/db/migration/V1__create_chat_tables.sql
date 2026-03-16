CREATE TABLE chat_messages (
    id UUID PRIMARY KEY,
    booking_id UUID NOT NULL,
    sender_user_id UUID NOT NULL,
    sender_role VARCHAR(50) NOT NULL,
    sender_email VARCHAR(255),
    content TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL
);

CREATE INDEX idx_chat_messages_booking_id
ON chat_messages(booking_id);

CREATE INDEX idx_chat_messages_booking_created_at
ON chat_messages(booking_id, created_at);