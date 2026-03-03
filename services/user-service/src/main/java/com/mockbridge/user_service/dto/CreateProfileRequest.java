package com.mockbridge.user_service.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.PositiveOrZero;

import java.util.List;

public class CreateProfileRequest {

    @NotBlank
    private String fullName;

    private String headline;

    private String bio;
    
    @PositiveOrZero
    private int yearsOfExperience;

    @Valid
    private List<CreateSkillRequest> skills;

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getHeadline() {
        return headline;
    }

    public void setHeadline(String headline) {
        this.headline = headline;
    }

    public String getBio() {
        return bio;
    }

    public void setBio(String bio) {
        this.bio = bio;
    }

    public int getYearsOfExperience() {
        return yearsOfExperience;
    }

    public void setYearsOfExperience(int yearsOfExperience) {
        this.yearsOfExperience = yearsOfExperience;
    }

    public List<CreateSkillRequest> getSkills() {
        return skills;
    }

    public void setSkills(List<CreateSkillRequest> skills) {
        this.skills = skills;
    }
}