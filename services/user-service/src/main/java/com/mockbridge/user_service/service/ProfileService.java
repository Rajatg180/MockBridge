package com.mockbridge.user_service.service;

import com.mockbridge.user_service.dto.*;
import com.mockbridge.user_service.entity.Profile;
import com.mockbridge.user_service.entity.Proficiency;
import com.mockbridge.user_service.entity.Skill;
import com.mockbridge.user_service.repository.ProfileRepository;
import com.mockbridge.user_service.repository.SkillRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ProfileService {

    private final ProfileRepository profileRepo;
    private final SkillRepository skillRepo;

    public ProfileService(ProfileRepository profileRepo, SkillRepository skillRepo) {
        this.profileRepo = profileRepo;
        this.skillRepo = skillRepo;
    }

    @Transactional
    public ProfileResponse createMyProfile(UUID userId, String email, String role, CreateProfileRequest req) {

        if (profileRepo.findByUserId(userId).isPresent()) {
            throw new IllegalArgumentException("Profile already exists");
        }

        // Interviewer rules (optional but strong for your platform)
        if ("INTERVIEWER".equalsIgnoreCase(role)) {
            if (req.getYearsOfExperience() <= 0) {
                throw new IllegalArgumentException("Interviewer must have yearsOfExperience > 0");
            }
            if (req.getSkills() == null || req.getSkills().isEmpty()) {
                throw new IllegalArgumentException("Interviewer must add at least 1 skill");
            }
        }

        LocalDateTime now = LocalDateTime.now();

        Profile profile = new Profile();
        profile.setId(UUID.randomUUID());
        profile.setUserId(userId);
        profile.setEmail(email);
        profile.setRole(role);
        profile.setFullName(req.getFullName().trim());
        profile.setHeadline(req.getHeadline());
        profile.setBio(req.getBio());
        profile.setYearsOfExperience(req.getYearsOfExperience());
        profile.setAverageRating(0.0);
        profile.setCreatedAt(now);
        profile.setUpdatedAt(now);

        // save profile first
        profileRepo.save(profile);

        // skills (optional)
        if (req.getSkills() != null) {
            for (CreateSkillRequest s : req.getSkills()) {
                addSkillInternal(profile, s);
            }
        }

        return toResponse(profileRepo.findByUserId(userId).orElseThrow());
    }

    @Transactional(readOnly = true)
    public ProfileResponse getMyProfile(UUID userId) {
        Profile profile = profileRepo.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("Profile not found. Create it first."));
        return toResponse(profile);
    }

    @Transactional
    public ProfileResponse updateMyProfile(UUID userId, String email, String role, UpdateProfileRequest req) {
        Profile profile = profileRepo.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("Profile not found. Create it first."));

        // keep role/email synced with JWT (important when admin promotes user later)
        profile.setEmail(email);
        profile.setRole(role);

        profile.setFullName(req.getFullName().trim());
        profile.setHeadline(req.getHeadline());
        profile.setBio(req.getBio());
        profile.setYearsOfExperience(req.getYearsOfExperience());
        profile.setUpdatedAt(LocalDateTime.now());

        profileRepo.save(profile);
        return toResponse(profile);
    }

    @Transactional
    public SkillResponse addMySkill(UUID userId, CreateSkillRequest req) {
        Profile profile = profileRepo.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("Profile not found. Create it first."));

        // prevent duplicates per profile
        String normalized = req.getSkillName().trim();
        if (skillRepo.findByProfile_IdAndSkillNameIgnoreCase(profile.getId(), normalized).isPresent()) {
            throw new IllegalArgumentException("Skill already exists");
        }

        Skill skill = addSkillInternal(profile, req);
        return new SkillResponse(skill.getId(), skill.getSkillName(), skill.getProficiency().name());
    }

    @Transactional
    public void deleteMySkill(UUID userId, UUID skillId) {
        Profile profile = profileRepo.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("Profile not found. Create it first."));

        Skill skill = skillRepo.findById(skillId)
                .orElseThrow(() -> new IllegalArgumentException("Skill not found"));

        if (!skill.getProfile().getId().equals(profile.getId())) {
            throw new IllegalArgumentException("You cannot delete someone else's skill");
        }

        skillRepo.delete(skill);
    }

    @Transactional(readOnly = true)
    public ProfileResponse getPublicProfile(UUID userId) {
        Profile profile = profileRepo.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("Profile not found"));
        return toResponse(profile);
    }

    @Transactional(readOnly = true)
    public List<ProfileResponse> searchInterviewersBySkill(String skill) {
        if (skill == null || skill.trim().isEmpty()) {
            throw new IllegalArgumentException("skill query param is required");
        }

        // Find all matching skills, then filter profiles that are INTERVIEWER
        List<Skill> matches = skillRepo.findBySkillNameIgnoreCase(skill.trim());

        // Avoid duplicates
        Map<UUID, Profile> uniqueProfiles = new LinkedHashMap<>();
        for (Skill s : matches) {
            Profile p = s.getProfile();
            if (p != null && "INTERVIEWER".equalsIgnoreCase(p.getRole())) {
                uniqueProfiles.putIfAbsent(p.getUserId(), p);
            }
        }

        return uniqueProfiles.values().stream().map(this::toResponse).toList();
    }

    // ----------------- helpers -----------------

    private Skill addSkillInternal(Profile profile, CreateSkillRequest req) {
        String name = req.getSkillName().trim();
        Proficiency proficiency;
        try {
            proficiency = Proficiency.valueOf(req.getProficiency().trim().toUpperCase());
        } catch (Exception e) {
            throw new IllegalArgumentException("Invalid proficiency. Use BEGINNER/INTERMEDIATE/EXPERT");
        }

        Skill skill = new Skill();
        skill.setId(UUID.randomUUID());
        skill.setProfile(profile);
        skill.setSkillName(name);
        skill.setProficiency(proficiency);

        return skillRepo.save(skill);
    }

    private ProfileResponse toResponse(Profile profile) {
        List<SkillResponse> skills = profile.getSkills() == null
                ? List.of()
                : profile.getSkills().stream()
                    .map(s -> new SkillResponse(s.getId(), s.getSkillName(), s.getProficiency().name()))
                    .collect(Collectors.toList());

        return new ProfileResponse(
                profile.getUserId(),
                profile.getEmail(),
                profile.getRole(),
                profile.getFullName(),
                profile.getHeadline(),
                profile.getBio(),
                profile.getYearsOfExperience(),
                profile.getAverageRating(),
                skills
        );
    }
}