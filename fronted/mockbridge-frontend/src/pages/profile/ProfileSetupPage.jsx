import { useEffect, useMemo, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { createMyProfile } from '../../features/profile/profileSlice';
import { useToast } from '../../components/ui/ToastProvider';
import { PageHeader } from '../../components/ui/PageHeader';
import { StatusBanner } from '../../components/ui/StatusBanner';
import { TextAreaField, TextField, SelectField } from '../../components/ui/FormFields';
import { createEmptySkill, validateProfileForm } from './profileFormUtils';

const proficiencyOptions = [
  { value: 'BEGINNER', label: 'Beginner' },
  { value: 'INTERMEDIATE', label: 'Intermediate' },
  { value: 'EXPERT', label: 'Expert' },
];

export function ProfileSetupPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { pushToast } = useToast();
  const { profile, mutationStatus, error } = useAppSelector((state) => state.profile);
  const user = useAppSelector((state) => state.auth.user);

  const [form, setForm] = useState({
    fullName: '',
    headline: '',
    bio: '',
    yearsOfExperience: 0,
    skills: [createEmptySkill()],
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (profile) {
      navigate('/dashboard', { replace: true });
    }
  }, [profile, navigate]);

  const subtitle = useMemo(() => `Signed in as ${user?.email || 'user'}`, [user?.email]);

  function updateSkill(index, patch) {
    setForm((current) => ({
      ...current,
      skills: current.skills.map((skill, skillIndex) => (skillIndex === index ? { ...skill, ...patch } : skill)),
    }));
  }

  function addSkillRow() {
    setForm((current) => ({
      ...current,
      skills: [...current.skills, createEmptySkill()],
    }));
  }

  function removeSkillRow(index) {
    setForm((current) => ({
      ...current,
      skills: current.skills.filter((_, skillIndex) => skillIndex !== index),
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = validateProfileForm(form, false);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    try {
      await dispatch(createMyProfile({
        fullName: form.fullName.trim(),
        headline: form.headline.trim(),
        bio: form.bio.trim(),
        yearsOfExperience: Number(form.yearsOfExperience || 0),
        skills: form.skills.filter((skill) => skill.skillName.trim()),
      })).unwrap();

      pushToast({ title: 'Profile created', description: 'Onboarding is complete.', variant: 'success' });
      navigate('/dashboard', { replace: true });
    } catch (message) {
      pushToast({ title: 'Profile setup failed', description: String(message), variant: 'error' });
    }
  }

  if (profile) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="stack-lg narrow-page">
      <PageHeader title="Complete your profile" description={subtitle} />

      {error ? <StatusBanner variant="error">{error}</StatusBanner> : null}

      <form className="card stack" onSubmit={handleSubmit}>
        <div className="grid two-columns">
          <TextField
            label="Full name"
            value={form.fullName}
            error={errors.fullName}
            onChange={(event) => setForm((current) => ({ ...current, fullName: event.target.value }))}
            placeholder="Your name"
          />
          <TextField
            label="Years of experience"
            type="number"
            min="0"
            value={form.yearsOfExperience}
            error={errors.yearsOfExperience}
            onChange={(event) => setForm((current) => ({ ...current, yearsOfExperience: event.target.value }))}
          />
        </div>

        <TextField
          label="Headline"
          value={form.headline}
          onChange={(event) => setForm((current) => ({ ...current, headline: event.target.value }))}
          placeholder="Senior Java engineer, interviewer, etc."
        />

        <TextAreaField
          label="Bio"
          rows="5"
          value={form.bio}
          onChange={(event) => setForm((current) => ({ ...current, bio: event.target.value }))}
          placeholder="Share what you want people to know about you."
        />

        <div className="stack-sm">
          <div className="section-title-row">
            <div>
              <h3>Skills</h3>
              <p className="muted">Initial skills can be added here, and more later from profile management.</p>
            </div>
            <button type="button" className="button button-secondary" onClick={addSkillRow}>
              Add skill
            </button>
          </div>

          {errors.skillsMessage ? <StatusBanner variant="warning">{errors.skillsMessage}</StatusBanner> : null}

          {form.skills.map((skill, index) => (
            <div key={`skill-${index}`} className="skill-row">
              <TextField
                label={`Skill ${index + 1}`}
                value={skill.skillName}
                error={errors.skills?.[index]?.skillName}
                onChange={(event) => updateSkill(index, { skillName: event.target.value })}
                placeholder="Java, React, System Design"
              />
              <SelectField
                label="Proficiency"
                value={skill.proficiency}
                error={errors.skills?.[index]?.proficiency}
                onChange={(event) => updateSkill(index, { proficiency: event.target.value })}
                options={proficiencyOptions}
              />
              <button
                type="button"
                className="button button-ghost"
                onClick={() => removeSkillRow(index)}
                disabled={form.skills.length === 1}
              >
                Remove
              </button>
            </div>
          ))}
        </div>

        <button type="submit" className="button button-primary" disabled={mutationStatus === 'loading'}>
          {mutationStatus === 'loading' ? 'Creating profile...' : 'Create profile'}
        </button>
      </form>
    </div>
  );
}
