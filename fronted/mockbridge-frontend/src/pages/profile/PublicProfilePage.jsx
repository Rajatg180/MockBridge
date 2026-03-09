import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { fetchPublicProfile } from '../../features/profile/profileSlice';
import { PageHeader } from '../../components/ui/PageHeader';
import { EmptyState } from '../../components/ui/EmptyState';

export function PublicProfilePage() {
  const { userId } = useParams();
  const dispatch = useAppDispatch();
  const { publicProfile, publicProfileStatus } = useAppSelector((state) => state.profile);

  useEffect(() => {
    if (userId) {
      dispatch(fetchPublicProfile(userId));
    }
  }, [dispatch, userId]);

  return (
    <div className="stack-lg">
      <PageHeader title="Public profile" description="Loaded from `/users/{userId}`." />

      {publicProfileStatus === 'loading' ? (
        <EmptyState title="Loading profile" description="Fetching public profile information." />
      ) : publicProfile ? (
        <article className="card stack">
          <div className="section-title-row">
            <div>
              <h3>{publicProfile.fullName}</h3>
              <p className="muted">{publicProfile.headline || 'No headline'}</p>
            </div>
            <span className="chip">{publicProfile.role}</span>
          </div>
          <p>{publicProfile.bio || 'No bio available.'}</p>
          <div className="detail-list">
            <div><span>Email</span><strong>{publicProfile.email}</strong></div>
            <div><span>Experience</span><strong>{publicProfile.yearsOfExperience} years</strong></div>
            <div><span>Average rating</span><strong>{publicProfile.averageRating}</strong></div>
          </div>
          <div className="chip-row">
            {(publicProfile.skills || []).map((skill) => (
              <span key={skill.id} className="chip">{skill.skillName} · {skill.proficiency}</span>
            ))}
          </div>
          <Link className="button button-secondary" to={`/slots/open?interviewerId=${publicProfile.userId}`}>
            View matching open slots
          </Link>
        </article>
      ) : (
        <EmptyState title="Profile unavailable" description="The requested profile could not be loaded." />
      )}
    </div>
  );
}
