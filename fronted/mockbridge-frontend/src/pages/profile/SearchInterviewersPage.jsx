import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { clearSearchResults, searchInterviewers } from '../../features/profile/profileSlice';
import { PageHeader } from '../../components/ui/PageHeader';
import { EmptyState } from '../../components/ui/EmptyState';
import { StatusBanner } from '../../components/ui/StatusBanner';
import { TextField } from '../../components/ui/FormFields';

export function SearchInterviewersPage() {
  const dispatch = useAppDispatch();
  const { searchResults, searchStatus, searchError } = useAppSelector((state) => state.profile);
  const [skill, setSkill] = useState('');

  async function handleSearch(event) {
    event.preventDefault();
    if (!skill.trim()) return;
    dispatch(searchInterviewers(skill.trim()));
  }

  return (
    <div className="stack-lg">
      <PageHeader
        title="Search interviewers by skill"
        description="Connected to `/users/search/interviewers?skill=...` from your user service."
        actions={
          <button type="button" className="button button-secondary" onClick={() => dispatch(clearSearchResults())}>
            Clear results
          </button>
        }
      />

      <form className="card inline-form" onSubmit={handleSearch}>
        <TextField
          label="Skill"
          value={skill}
          onChange={(event) => setSkill(event.target.value)}
          placeholder="Java, React, Kafka"
          className="grow"
        />
        <button type="submit" className="button button-primary" disabled={searchStatus === 'loading'}>
          {searchStatus === 'loading' ? 'Searching...' : 'Search'}
        </button>
      </form>

      {searchError ? <StatusBanner variant="error">{searchError}</StatusBanner> : null}

      {searchStatus === 'succeeded' && searchResults.length === 0 ? (
        <EmptyState title="No matches" description="Try a different skill keyword." />
      ) : null}

      <div className="grid two-columns">
        {searchResults.map((profile) => (
          <article key={profile.userId} className="card stack">
            <div className="section-title-row">
              <div>
                <h3>{profile.fullName}</h3>
                <p className="muted">{profile.headline || 'No headline'}</p>
              </div>
              <span className="chip">{profile.role}</span>
            </div>
            <p>{profile.bio || 'No bio provided.'}</p>
            <p className="muted">Experience: {profile.yearsOfExperience} years</p>
            <div className="chip-row">
              {(profile.skills || []).map((item) => (
                <span key={item.id} className="chip">{item.skillName} · {item.proficiency}</span>
              ))}
            </div>
            <div className="inline-actions">
              <Link className="button button-secondary" to={`/profiles/${profile.userId}`}>View profile</Link>
              <Link className="button button-primary" to={`/slots/open?interviewerId=${profile.userId}`}>Open slots</Link>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
