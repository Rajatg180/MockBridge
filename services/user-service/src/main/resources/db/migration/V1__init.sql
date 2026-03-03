CREATE TABLE profiles (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL, -- STUDENT / INTERVIEWER / ADMIN (copied from JWT)
    full_name VARCHAR(200) NOT NULL,
    headline VARCHAR(200),
    bio TEXT,
    years_of_experience INT NOT NULL DEFAULT 0,
    average_rating DECIMAL(3,2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);

CREATE TABLE skills (
    id UUID PRIMARY KEY,
    profile_id UUID NOT NULL,
    skill_name VARCHAR(100) NOT NULL,
    proficiency VARCHAR(50) NOT NULL, -- BEGINNER / INTERMEDIATE / EXPERT
    CONSTRAINT fk_skills_profile
        FOREIGN KEY (profile_id)
        REFERENCES profiles(id)
        ON DELETE CASCADE
);

CREATE INDEX idx_skills_profile_id ON skills(profile_id);
CREATE INDEX idx_skills_skill_name ON skills(skill_name);