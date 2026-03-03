package com.mockbridge.user_service.dto;

import jakarta.validation.constraints.NotBlank;

public class CreateSkillRequest {

    @NotBlank
    private String skillName;

    @NotBlank
    private String proficiency; // BEGINNER/INTERMEDIATE/EXPERT

    public String getSkillName() {
        return skillName;
    }

    public void setSkillName(String skillName) {
        this.skillName = skillName;
    }

    public String getProficiency() {
        return proficiency;
    }

    public void setProficiency(String proficiency) {
        this.proficiency = proficiency;
    }
}