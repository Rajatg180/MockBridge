package com.mockbridge.user_service.repository;

import com.mockbridge.user_service.entity.Profile;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ProfileRepository extends JpaRepository<Profile, UUID> {

    @EntityGraph(attributePaths = "skills")
    Optional<Profile> findByUserId(UUID userId);

    @EntityGraph(attributePaths = "skills")
    Optional<Profile> findById(UUID id);

    List<Profile> findByRoleIgnoreCase(String role);
}