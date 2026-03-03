package com.mockbridge.user_service.dto;

import java.util.List;
import java.util.UUID;

public class ProfileResponse {

    private UUID userId;
    private String email;
    private String role;

    private String fullName;
    private String headline;
    private String bio;

    private int yearsOfExperience;
    private double averageRating;

    private List<SkillResponse> skills;

    public ProfileResponse(UUID userId, String email, String role,
            String fullName, String headline, String bio,
            int yearsOfExperience, double averageRating,
            List<SkillResponse> skills) {
        this.userId = userId;
        this.email = email;
        this.role = role;
        this.fullName = fullName;
        this.headline = headline;
        this.bio = bio;
        this.yearsOfExperience = yearsOfExperience;
        this.averageRating = averageRating;
        this.skills = skills;
    }

    public UUID getUserId() {
        return userId;
    }

    public String getEmail() {
        return email;
    }

    public String getRole() {
        return role;
    }

    public String getFullName() {
        return fullName;
    }

    public String getHeadline() {
        return headline;
    }

    public String getBio() {
        return bio;
    }

    public int getYearsOfExperience() {
        return yearsOfExperience;
    }

    public double getAverageRating() {
        return averageRating;
    }

    public List<SkillResponse> getSkills() {
        return skills;
    }
}