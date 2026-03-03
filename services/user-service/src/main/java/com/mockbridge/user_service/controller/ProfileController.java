package com.mockbridge.user_service.controller;

import com.mockbridge.user_service.dto.*;
import com.mockbridge.user_service.service.ProfileService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/users")
public class ProfileController {

    private final ProfileService service;

    public ProfileController(ProfileService service) {
        this.service = service;
    }

    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("User Service is healthy");
    }

    // ✅ Create profile once (onboarding)
    @PostMapping("/me")
    public ProfileResponse createMyProfile(@AuthenticationPrincipal Jwt jwt,
                                          @Valid @RequestBody CreateProfileRequest req) {
        UUID userId = UUID.fromString(jwt.getSubject());
        String email = jwt.getClaimAsString("email");
        String role = jwt.getClaimAsString("role");

        return service.createMyProfile(userId, email, role, req);
    }

    @GetMapping("/me")
    public ProfileResponse myProfile(@AuthenticationPrincipal Jwt jwt) {
        UUID userId = UUID.fromString(jwt.getSubject());
        return service.getMyProfile(userId);
    }

    @PutMapping("/me")
    public ProfileResponse updateMyProfile(@AuthenticationPrincipal Jwt jwt,
                                          @Valid @RequestBody UpdateProfileRequest req) {
        UUID userId = UUID.fromString(jwt.getSubject());
        String email = jwt.getClaimAsString("email");
        String role = jwt.getClaimAsString("role");

        return service.updateMyProfile(userId, email, role, req);
    }

    @PostMapping("/me/skills")
    public SkillResponse addSkill(@AuthenticationPrincipal Jwt jwt,
                                 @Valid @RequestBody CreateSkillRequest req) {
        UUID userId = UUID.fromString(jwt.getSubject());
        return service.addMySkill(userId, req);
    }

    @DeleteMapping("/me/skills/{skillId}")
    public ResponseEntity<Void> deleteSkill(@AuthenticationPrincipal Jwt jwt,
                                           @PathVariable UUID skillId) {
        UUID userId = UUID.fromString(jwt.getSubject());
        service.deleteMySkill(userId, skillId);
        return ResponseEntity.noContent().build();
    }

    //  Public profile (browsing interviewers later)
    @GetMapping("/{userId}")
    public ProfileResponse publicProfile(@PathVariable UUID userId) {
        return service.getPublicProfile(userId);
    }

    // Search interviewers by skill (for “browse interviewers” page later)
    @GetMapping("/search/interviewers")
    public List<ProfileResponse> searchInterviewers(@RequestParam String skill) {
        return service.searchInterviewersBySkill(skill);
    }
}