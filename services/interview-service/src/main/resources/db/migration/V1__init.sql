CREATE TABLE availability_slots (
    id UUID PRIMARY KEY,
    interviewer_id UUID NOT NULL,
    start_time_utc TIMESTAMP NOT NULL,
    end_time_utc TIMESTAMP NOT NULL,
    status VARCHAR(30) NOT NULL, -- OPEN / BOOKED / CANCELLED
    created_at TIMESTAMP NOT NULL
);
CREATE INDEX idx_slots_interviewer_id ON availability_slots(interviewer_id);
CREATE INDEX idx_slots_start_time ON availability_slots(start_time_utc);

CREATE TABLE bookings (
    id UUID PRIMARY KEY,
    slot_id UUID NOT NULL UNIQUE,
    student_id UUID NOT NULL,
    status VARCHAR(30) NOT NULL, -- PENDING / CONFIRMED / CANCELLED / COMPLETED
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);

ALTER TABLE bookings
ADD CONSTRAINT fk_booking_slot
FOREIGN KEY (slot_id) REFERENCES availability_slots(id) ON DELETE CASCADE;

CREATE INDEX idx_bookings_student_id ON bookings(student_id);

CREATE TABLE sessions (
    id UUID PRIMARY KEY,
    booking_id UUID NOT NULL UNIQUE,
    room_id VARCHAR(200) NOT NULL,
    session_status VARCHAR(30) NOT NULL, -- CREATED / STARTED / ENDED
    started_at TIMESTAMP NULL,
    ended_at TIMESTAMP NULL
);

ALTER TABLE sessions
ADD CONSTRAINT fk_session_booking
FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE;