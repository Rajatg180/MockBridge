package com.mockbridge.user_service.repository;

import com.mockbridge.user_service.entity.Profile;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ProfileRepository extends JpaRepository<Profile, UUID> {
    Optional<Profile> findByUserId(UUID userId);
    List<Profile> findByRoleIgnoreCase(String role);
}