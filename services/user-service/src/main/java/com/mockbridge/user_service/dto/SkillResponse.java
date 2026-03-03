package com.mockbridge.user_service.dto;

import java.util.UUID;

public class SkillResponse {
    private UUID id;
    private String skillName;
    private String proficiency;

    public SkillResponse(UUID id, String skillName, String proficiency) {
        this.id = id;
        this.skillName = skillName;
        this.proficiency = proficiency;
    }

    public UUID getId() {
        return id;
    }

    public String getSkillName() {
        return skillName;
    }

    public String getProficiency() {
        return proficiency;
    }
}