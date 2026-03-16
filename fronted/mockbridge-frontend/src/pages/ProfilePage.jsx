import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import Loader from '../components/common/Loader';
import EmptyState from '../components/common/EmptyState';
import ErrorBlock from '../components/common/ErrorBlock';
import ConfirmDialog from '../components/common/ConfirmDialog';

import {
  addProfileSkill,
  deleteProfileSkill,
  fetchMyProfile,
  saveMyProfile,
} from '../features/profile/profileSlice';
import { addToast } from '../features/ui/uiSlice';
import { getErrorMessage } from '../utils/http';

const emptyProfileForm = {
  fullName: '',
  headline: '',
  bio: '',
  yearsOfExperience: 0,
};

const emptySkillForm = {
  skillName: '',
  proficiency: 'BEGINNER',
};

export default function ProfilePage() {
  const dispatch = useDispatch();
  const { profile, status, saveStatus, skillStatus, error, notFound } = useSelector(
    (state) => state.profile,
  );

  const [form, setForm] = useState(emptyProfileForm);
  const [skillForm, setSkillForm] = useState(emptySkillForm);
  const [skillToDelete, setSkillToDelete] = useState(null);

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchMyProfile());
    }
  }, [dispatch, status]);

  useEffect(() => {
    if (profile) {
      setForm({
        fullName: profile.fullName || '',
        headline: profile.headline || '',
        bio: profile.bio || '',
        yearsOfExperience: profile.yearsOfExperience || 0,
      });
    }
  }, [profile]);

  const isCreating = useMemo(() => !profile || notFound, [notFound, profile]);

  const profileStrength = useMemo(() => {
    if (!profile) {
      return 0;
    }

    let score = 0;

    if (profile.fullName) score += 25;
    if (profile.headline) score += 20;
    if (profile.bio) score += 20;
    if ((profile.skills || []).length) score += 20;
    if ((profile.yearsOfExperience || 0) > 0) score += 15;

    return score;
  }, [profile]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({
      ...current,
      [name]: name === 'yearsOfExperience' ? value : value,
    }));
  };

  const handleSkillChange = (event) => {
    const { name, value } = event.target;
    setSkillForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const payload = {
      fullName: form.fullName.trim(),
      headline: form.headline.trim(),
      bio: form.bio.trim(),
      yearsOfExperience: Number(form.yearsOfExperience) || 0,
    };

    try {
      await dispatch(saveMyProfile(payload)).unwrap();

      dispatch(
        addToast({
          type: 'success',
          title: isCreating ? 'Profile created' : 'Profile updated',
          message: isCreating
            ? 'Your onboarding profile is ready.'
            : 'Your profile changes have been saved.',
        }),
      );
    } catch (submitError) {
      dispatch(
        addToast({
          type: 'error',
          title: 'Profile save failed',
          message: getErrorMessage(submitError, 'Unable to save profile.'),
        }),
      );
    }
  };

  const handleAddSkill = async (event) => {
    event.preventDefault();

    try {
      await dispatch(
        addProfileSkill({
          skillName: skillForm.skillName.trim(),
          proficiency: skillForm.proficiency,
        }),
      ).unwrap();

      dispatch(
        addToast({
          type: 'success',
          title: 'Skill added',
          message: `${skillForm.skillName.trim()} has been added to your profile.`,
        }),
      );

      setSkillForm(emptySkillForm);
    } catch (submitError) {
      dispatch(
        addToast({
          type: 'error',
          title: 'Unable to add skill',
          message: getErrorMessage(submitError, 'Please check the skill details.'),
        }),
      );
    }
  };

  const confirmDeleteSkill = async () => {
    if (!skillToDelete) {
      return;
    }

    try {
      await dispatch(deleteProfileSkill(skillToDelete.id)).unwrap();

      dispatch(
        addToast({
          type: 'success',
          title: 'Skill removed',
          message: `${skillToDelete.skillName} was removed from your profile.`,
        }),
      );
    } catch (submitError) {
      dispatch(
        addToast({
          type: 'error',
          title: 'Unable to remove skill',
          message: getErrorMessage(submitError, 'Please try again.'),
        }),
      );
    } finally {
      setSkillToDelete(null);
    }
  };

  if (status === 'loading' && !profile && !notFound) {
    return <Loader label="Loading your profile..." />;
  }

  if (status === 'failed' && error) {
    return (
      <ErrorBlock
        title="Could not load profile"
        message={error.message}
        action={
          <button
            type="button"
            className="button button--primary"
            onClick={() => dispatch(fetchMyProfile())}
          >
            Retry
          </button>
        }
      />
    );
  }

  return (
    <div className="stack-lg">
      <section className="card">
        <div className="card__header">
          <div>
            <p className="eyebrow">Onboarding</p>
            <h1>{isCreating ? 'Create your profile' : 'Edit your profile'}</h1>
          </div>
          <span className="badge">{profile?.role || 'USER'}</span>
        </div>

        {isCreating ? (
          <EmptyState
            title="Profile not created yet"
            description="Fill the form below to create your profile in the user service."
          />
        ) : null}

        <form className="stack-lg" onSubmit={handleSubmit}>
          <div className="form-grid">
            <label className="field">
              <span>Full name</span>
              <input
                className="input"
                name="fullName"
                value={form.fullName}
                onChange={handleChange}
                placeholder="Enter your full name"
                required
              />
            </label>

            <label className="field">
              <span>Headline</span>
              <input
                className="input"
                name="headline"
                value={form.headline}
                onChange={handleChange}
                placeholder="Senior Java interviewer"
              />
            </label>

            <label className="field">
              <span>Years of experience</span>
              <input
                className="input"
                type="number"
                min="0"
                name="yearsOfExperience"
                value={form.yearsOfExperience}
                onChange={handleChange}
                placeholder="0"
                required
              />
            </label>

            <label className="field field--full">
              <span>Bio</span>
              <textarea
                className="textarea"
                name="bio"
                value={form.bio}
                onChange={handleChange}
                placeholder="Describe your background and interview strengths."
                rows={5}
              />
            </label>
          </div>

          <div className="button-row">
            <button
              type="submit"
              className="button button--primary"
              disabled={saveStatus === 'loading'}
            >
              {saveStatus === 'loading'
                ? 'Saving profile...'
                : isCreating
                  ? 'Create profile'
                  : 'Save changes'}
            </button>
          </div>
        </form>
      </section>

      <section className="content-grid">
        <article className="card">
          <div className="card__header">
            <div>
              <p className="eyebrow">Skills</p>
              <h2>Manage your skill list</h2>
            </div>
          </div>

          {!profile ? (
            <EmptyState
              title="Create your profile first"
              description="Skill management becomes available after your profile is saved."
            />
          ) : (
            <>
              <form className="stack" onSubmit={handleAddSkill}>
                <div className="form-grid form-grid--compact">
                  <label className="field">
                    <span>Skill name</span>
                    <input
                      className="input"
                      name="skillName"
                      value={skillForm.skillName}
                      onChange={handleSkillChange}
                      placeholder="Spring Boot"
                      required
                    />
                  </label>

                  <label className="field">
                    <span>Proficiency</span>
                    <select
                      className="input"
                      name="proficiency"
                      value={skillForm.proficiency}
                      onChange={handleSkillChange}
                    >
                      <option value="BEGINNER">BEGINNER</option>
                      <option value="INTERMEDIATE">INTERMEDIATE</option>
                      <option value="EXPERT">EXPERT</option>
                    </select>
                  </label>
                </div>

                <div className="button-row">
                  <button
                    type="submit"
                    className="button button--primary"
                    disabled={skillStatus === 'loading'}
                  >
                    {skillStatus === 'loading' ? 'Adding skill...' : 'Add skill'}
                  </button>
                </div>
              </form>

              <div className="skill-list">
                {(profile.skills || []).length ? (
                  profile.skills.map((skill) => (
                    <div key={skill.id} className="skill-chip">
                      <div>
                        <strong>{skill.skillName}</strong>
                        <span>{skill.proficiency}</span>
                      </div>
                      <button
                        type="button"
                        className="icon-button"
                        onClick={() => setSkillToDelete(skill)}
                        aria-label={`Remove ${skill.skillName}`}
                      >
                        ×
                      </button>
                    </div>
                  ))
                ) : (
                  <EmptyState
                    title="No skills yet"
                    description="Add at least one skill to enrich your public profile."
                  />
                )}
              </div>
            </>
          )}
        </article>

        <article className="card">
          <div className="card__header">
            <div>
              <p className="eyebrow">Profile insights</p>
              <h2>Strengthen your profile</h2>
            </div>
            <span className="badge">{profileStrength}% ready</span>
          </div>

          <div className="stack">
            <div className="list-row">
              <div>
                <strong>{profile?.fullName ? 'Name added' : 'Add your full name'}</strong>
                <p>
                  {profile?.fullName
                    ? 'Your identity is clearly visible across the platform.'
                    : 'A complete name improves trust and profile quality.'}
                </p>
              </div>
              <span>{profile?.fullName ? 'Done' : 'Pending'}</span>
            </div>

            <div className="list-row">
              <div>
                <strong>{profile?.headline ? 'Headline added' : 'Add a headline'}</strong>
                <p>
                  {profile?.headline
                    ? 'Your specialization is easier to understand at a glance.'
                    : 'A short headline helps users know your expertise quickly.'}
                </p>
              </div>
              <span>{profile?.headline ? 'Done' : 'Pending'}</span>
            </div>

            <div className="list-row">
              <div>
                <strong>
                  {(profile?.skills || []).length
                    ? `${profile.skills.length} skills listed`
                    : 'Add your first skill'}
                </strong>
                <p>
                  {(profile?.skills || []).length
                    ? 'Your skill set is visible and improves search discovery.'
                    : 'Skills help others find you in search and booking flows.'}
                </p>
              </div>
              <span>{(profile?.skills || []).length ? 'Ready' : 'Pending'}</span>
            </div>

            <div className="list-row">
              <div>
                <strong>
                  {(profile?.bio || '').trim() ? 'Bio completed' : 'Complete your bio'}
                </strong>
                <p>
                  {(profile?.bio || '').trim()
                    ? 'Your background and experience now add more credibility.'
                    : 'A clear bio makes your profile look more complete and professional.'}
                </p>
              </div>
              <span>{(profile?.bio || '').trim() ? 'Done' : 'Pending'}</span>
            </div>
          </div>
        </article>
      </section>

      <ConfirmDialog
        open={Boolean(skillToDelete)}
        title="Remove skill?"
        description={
          skillToDelete
            ? `Remove ${skillToDelete.skillName} from your profile?`
            : ''
        }
        confirmLabel="Remove skill"
        isLoading={skillStatus === 'loading'}
        onConfirm={confirmDeleteSkill}
        onClose={() => setSkillToDelete(null)}
      />
    </div>
  );
}