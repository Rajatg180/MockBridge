import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { addMySkill, deleteMySkill } from '../../features/profile/profileSlice';
import { useToast } from '../../components/ui/ToastProvider';
import { Modal } from '../../components/ui/Modal';
import { PageHeader } from '../../components/ui/PageHeader';
import { EmptyState } from '../../components/ui/EmptyState';
import { StatusBanner } from '../../components/ui/StatusBanner';
import { TextField, SelectField } from '../../components/ui/FormFields';

const proficiencyOptions = [
  { value: 'BEGINNER', label: 'Beginner' },
  { value: 'INTERMEDIATE', label: 'Intermediate' },
  { value: 'EXPERT', label: 'Expert' },
];

export function ProfilePage() {
  const dispatch = useAppDispatch();
  const { pushToast } = useToast();
  const { profile, error, mutationStatus } = useAppSelector((state) => state.profile);
  const [skillForm, setSkillForm] = useState({ skillName: '', proficiency: 'BEGINNER' });
  const [selectedSkill, setSelectedSkill] = useState(null);

  async function handleAddSkill(event) {
    event.preventDefault();
    if (!skillForm.skillName.trim()) {
      pushToast({ title: 'Skill required', description: 'Enter a skill name before saving.', variant: 'warning' });
      return;
    }

    try {
      await dispatch(addMySkill(skillForm)).unwrap();
      pushToast({ title: 'Skill added', description: `${skillForm.skillName} was added.`, variant: 'success' });
      setSkillForm({ skillName: '', proficiency: 'BEGINNER' });
    } catch (message) {
      pushToast({ title: 'Failed to add skill', description: String(message), variant: 'error' });
    }
  }

  async function handleDeleteSkill() {
    if (!selectedSkill) return;

    try {
      await dispatch(deleteMySkill(selectedSkill.id)).unwrap();
      pushToast({ title: 'Skill deleted', description: `${selectedSkill.skillName} was removed.`, variant: 'success' });
      setSelectedSkill(null);
    } catch (message) {
      pushToast({ title: 'Delete failed', description: String(message), variant: 'error' });
    }
  }

  return (
    <div className="stack-lg">
      <PageHeader
        title="My profile"
        description="Everything here is wired to `/users/me` and `/users/me/skills` endpoints."
        actions={<Link className="button button-primary" to="/profile/edit">Edit profile</Link>}
      />

      {error ? <StatusBanner variant="error">{error}</StatusBanner> : null}

      <section className="grid two-columns">
        <article className="card stack">
          <div className="section-title-row">
            <div>
              <h3>{profile?.fullName}</h3>
              <p className="muted">{profile?.headline || 'No headline added yet.'}</p>
            </div>
            <span className="chip">{profile?.role}</span>
          </div>
          <p>{profile?.bio || 'No bio added yet.'}</p>
          <div className="detail-list">
            <div><span>Email</span><strong>{profile?.email}</strong></div>
            <div><span>Experience</span><strong>{profile?.yearsOfExperience} years</strong></div>
            <div><span>Average rating</span><strong>{profile?.averageRating}</strong></div>
            <div><span>User ID</span><strong className="break-all">{profile?.userId}</strong></div>
          </div>
        </article>

        <article className="card stack">
          <div>
            <h3>Add skill</h3>
            <p className="muted">This posts to `/users/me/skills`.</p>
          </div>
          <form className="stack" onSubmit={handleAddSkill}>
            <TextField
              label="Skill name"
              value={skillForm.skillName}
              onChange={(event) => setSkillForm((current) => ({ ...current, skillName: event.target.value }))}
              placeholder="Spring Boot, Kafka, React"
            />
            <SelectField
              label="Proficiency"
              value={skillForm.proficiency}
              onChange={(event) => setSkillForm((current) => ({ ...current, proficiency: event.target.value }))}
              options={proficiencyOptions}
            />
            <button type="submit" className="button button-primary" disabled={mutationStatus === 'loading'}>
              {mutationStatus === 'loading' ? 'Saving...' : 'Add skill'}
            </button>
          </form>
        </article>
      </section>

      <section className="card stack">
        <div className="section-title-row">
          <div>
            <h3>Skills</h3>
            <p className="muted">Delete calls `DELETE /users/me/skills/{'{skillId}'}`.</p>
          </div>
        </div>

        {profile?.skills?.length ? (
          <div className="stack-sm">
            {profile.skills.map((skill) => (
              <div key={skill.id} className="list-item">
                <div>
                  <strong>{skill.skillName}</strong>
                  <p className="muted">{skill.proficiency}</p>
                </div>
                <button type="button" className="button button-ghost" onClick={() => setSelectedSkill(skill)}>
                  Delete
                </button>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState title="No skills yet" description="Add skills to make your profile discoverable." />
        )}
      </section>

      <Modal
        open={Boolean(selectedSkill)}
        title="Delete skill"
        description="This action removes the skill from your profile."
        onClose={() => setSelectedSkill(null)}
      >
        <div className="stack">
          <p>Are you sure you want to delete <strong>{selectedSkill?.skillName}</strong>?</p>
          <div className="inline-actions end">
            <button type="button" className="button button-secondary" onClick={() => setSelectedSkill(null)}>
              Cancel
            </button>
            <button type="button" className="button button-danger" onClick={handleDeleteSkill}>
              Delete skill
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
