package com.mockbridge.user_service.repository;

import com.mockbridge.user_service.entity.Skill;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface SkillRepository extends JpaRepository<Skill, UUID> {

    List<Skill> findByProfile_Id(UUID profileId);

    Optional<Skill> findByProfile_IdAndSkillNameIgnoreCase(UUID profileId, String skillName);

    // search interviewers by skill: we’ll join from Skill -> Profile in service
    List<Skill> findBySkillNameIgnoreCase(String skillName);
}