export function createEmptySkill() {
  return { skillName: '', proficiency: 'BEGINNER' };
}

export function validateProfileForm(form, requireSkills = false) {
  const errors = {};

  if (!form.fullName.trim()) errors.fullName = 'Full name is required.';
  if (Number(form.yearsOfExperience) < 0) errors.yearsOfExperience = 'Experience cannot be negative.';

  const skillErrors = (form.skills || []).map((skill) => {
    const rowErrors = {};
    if (!skill.skillName.trim()) {
      return rowErrors;
    }
    if (!skill.proficiency.trim()) rowErrors.proficiency = 'Proficiency is required.';
    return rowErrors;
  });

  const hasSkillErrors = skillErrors.some((row) => Object.keys(row).length > 0);
  if (hasSkillErrors) errors.skills = skillErrors;

  if (requireSkills && (!form.skills || form.skills.length === 0)) {
    errors.skillsMessage = 'Add at least one skill to complete onboarding.';
  }

  return errors;
}
