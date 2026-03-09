import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { updateMyProfile } from '../../features/profile/profileSlice';
import { PageHeader } from '../../components/ui/PageHeader';
import { StatusBanner } from '../../components/ui/StatusBanner';
import { TextAreaField, TextField } from '../../components/ui/FormFields';
import { useToast } from '../../components/ui/ToastProvider';

export function EditProfilePage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { pushToast } = useToast();
  const { profile, mutationStatus, error } = useAppSelector((state) => state.profile);

  const [form, setForm] = useState({
    fullName: '',
    headline: '',
    bio: '',
    yearsOfExperience: 0,
  });

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

  async function handleSubmit(event) {
    event.preventDefault();

    if (!form.fullName.trim()) {
      pushToast({ title: 'Full name required', description: 'Please provide your full name.', variant: 'warning' });
      return;
    }

    try {
      await dispatch(updateMyProfile({
        fullName: form.fullName.trim(),
        headline: form.headline.trim(),
        bio: form.bio.trim(),
        yearsOfExperience: Number(form.yearsOfExperience || 0),
      })).unwrap();

      pushToast({ title: 'Profile updated', description: 'Your profile changes have been saved.', variant: 'success' });
      navigate('/profile');
    } catch (message) {
      pushToast({ title: 'Update failed', description: String(message), variant: 'error' });
    }
  }

  return (
    <div className="stack-lg narrow-page">
      <PageHeader title="Edit profile" description="This updates `/users/me` with your latest profile values." />
      {error ? <StatusBanner variant="error">{error}</StatusBanner> : null}

      <form className="card stack" onSubmit={handleSubmit}>
        <TextField
          label="Full name"
          value={form.fullName}
          onChange={(event) => setForm((current) => ({ ...current, fullName: event.target.value }))}
        />
        <TextField
          label="Headline"
          value={form.headline}
          onChange={(event) => setForm((current) => ({ ...current, headline: event.target.value }))}
        />
        <TextAreaField
          label="Bio"
          rows="6"
          value={form.bio}
          onChange={(event) => setForm((current) => ({ ...current, bio: event.target.value }))}
        />
        <TextField
          label="Years of experience"
          type="number"
          min="0"
          value={form.yearsOfExperience}
          onChange={(event) => setForm((current) => ({ ...current, yearsOfExperience: event.target.value }))}
        />

        <div className="inline-actions end">
          <button type="button" className="button button-secondary" onClick={() => navigate('/profile')}>
            Cancel
          </button>
          <button type="submit" className="button button-primary" disabled={mutationStatus === 'loading'}>
            {mutationStatus === 'loading' ? 'Saving...' : 'Save changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
