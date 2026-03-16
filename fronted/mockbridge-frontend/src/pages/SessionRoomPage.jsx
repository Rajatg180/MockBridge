import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import Loader from '../components/common/Loader';
import EmptyState from '../components/common/EmptyState';
import ErrorBlock from '../components/common/ErrorBlock';
import {
  clearSessionLookup,
  fetchBookingSession,
} from '../features/interview/interviewSlice';
import { addToast } from '../features/ui/uiSlice';
import { utcRangeToLocalLabel } from '../utils/date';
import { getErrorMessage } from '../utils/http';
import {
  disposeJitsiApi,
  getJitsiDomain,
  getJitsiMeetingUrl,
  loadJitsiExternalApi,
} from '../utils/jitsi';
import {
  buildSessionRoomPath,
  clearActiveSessionRoom,
  loadActiveSessionRoom,
  saveActiveSessionRoom,
} from '../utils/sessionRoomStorage';

function createContextFromRoute(roomId, storedContext) {
  if (!roomId) {
    return storedContext || null;
  }

  return {
    ...(storedContext || {}),
    roomId,
  };
}

export default function SessionRoomPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();

  const routeRoomId = decodeURIComponent(params.roomId || '');
  const authUser = useSelector((state) => state.auth.user);
  const profile = useSelector((state) => state.profile.profile);
  const sessionLookup = useSelector((state) => state.interview.sessionLookup);

  const [sessionContext, setSessionContext] = useState(() => {
    const incomingContext = location.state?.sessionContext || null;
    const storedContext = loadActiveSessionRoom();

    return incomingContext || createContextFromRoute(routeRoomId, storedContext);
  });
  const [meetingState, setMeetingState] = useState({
    status: 'idle',
    error: '',
  });
  const [meetingRetryKey, setMeetingRetryKey] = useState(0);

  const jitsiContainerRef = useRef(null);
  const jitsiApiRef = useRef(null);

  const bookingId = sessionContext?.bookingId || null;
  const effectiveRoomId = sessionContext?.roomId || routeRoomId;
  const domain = getJitsiDomain();
  const currentDisplayName = profile?.fullName || authUser?.email || 'MockBridge User';
  const currentEmail = profile?.email || authUser?.email || '';

  useEffect(() => {
    const incomingContext = location.state?.sessionContext || null;

    if (incomingContext) {
      setSessionContext(incomingContext);
      saveActiveSessionRoom(incomingContext);
      return;
    }

    if (routeRoomId) {
      const nextContext = createContextFromRoute(routeRoomId, loadActiveSessionRoom());
      setSessionContext(nextContext);
      saveActiveSessionRoom(nextContext);
    }
  }, [location.state, routeRoomId]);

  useEffect(() => {
    if (!bookingId) {
      return undefined;
    }

    let isMounted = true;

    dispatch(fetchBookingSession(bookingId))
      .unwrap()
      .then((session) => {
        if (!isMounted) {
          return;
        }

        setSessionContext((current) => {
          const nextContext = {
            ...(current || {}),
            bookingId,
            roomId: session.roomId,
            sessionStatus: session.sessionStatus,
          };

          saveActiveSessionRoom(nextContext);

          if (session.roomId && session.roomId !== routeRoomId) {
            navigate(buildSessionRoomPath(session.roomId), {
              replace: true,
              state: {
                sessionContext: nextContext,
              },
            });
          }

          return nextContext;
        });
      })
      .catch((error) => {
        if (!isMounted) {
          return;
        }

        dispatch(
          addToast({
            type: 'error',
            title: 'Session unavailable',
            message: getErrorMessage(error, 'Unable to load the session right now.'),
          }),
        );
      });

    return () => {
      isMounted = false;
    };
  }, [bookingId, dispatch, navigate, routeRoomId]);

  useEffect(() => {
    if (!effectiveRoomId || !jitsiContainerRef.current) {
      return undefined;
    }

    let cancelled = false;

    setMeetingState({
      status: 'loading',
      error: '',
    });

    loadJitsiExternalApi(domain)
      .then(() => {
        if (cancelled || !jitsiContainerRef.current) {
          return;
        }

        jitsiContainerRef.current.innerHTML = '';

        const api = new window.JitsiMeetExternalAPI(domain, {
          roomName: effectiveRoomId,
          parentNode: jitsiContainerRef.current,
          width: '100%',
          height: '100%',
          userInfo: {
            displayName: currentDisplayName,
            email: currentEmail,
          },
          configOverwrite: {
            disableDeepLinking: true,
            enableWelcomePage: false,
            prejoinConfig: {
              enabled: false,
            },
            startWithAudioMuted: false,
            startWithVideoMuted: false,
          },
          interfaceConfigOverwrite: {
            MOBILE_APP_PROMO: false,
            SHOW_JITSI_WATERMARK: false,
            SHOW_WATERMARK_FOR_GUESTS: false,
            DISPLAY_WELCOME_PAGE_CONTENT: false,
          },
        });

        jitsiApiRef.current = api;
        setMeetingState({
          status: 'ready',
          error: '',
        });

        api.addEventListener('readyToClose', () => {
          if (cancelled) {
            return;
          }

          clearActiveSessionRoom();
          dispatch(clearSessionLookup());
        });
      })
      .catch((error) => {
        if (cancelled) {
          return;
        }

        setMeetingState({
          status: 'failed',
          error: error?.message || 'Unable to load the Jitsi meeting.',
        });
      });

    return () => {
      cancelled = true;
      disposeJitsiApi(jitsiApiRef.current);
      jitsiApiRef.current = null;

      if (jitsiContainerRef.current) {
        jitsiContainerRef.current.innerHTML = '';
      }
    };
  }, [currentDisplayName, currentEmail, dispatch, domain, effectiveRoomId, meetingRetryKey]);

  const counterpartLabel = useMemo(() => {
    if (sessionContext?.role === 'interviewer') {
      return 'Candidate';
    }

    return 'Interviewer';
  }, [sessionContext?.role]);

  const backTo = sessionContext?.source === 'slots' ? '/slots' : '/bookings';
  const meetingUrl = effectiveRoomId ? getJitsiMeetingUrl(effectiveRoomId, domain) : '';

  const leaveSession = () => {
    clearActiveSessionRoom();
    dispatch(clearSessionLookup());
    navigate(backTo, { replace: true });
  };

  const refreshSession = async () => {
    if (!sessionContext?.bookingId) {
      return;
    }

    try {
      const session = await dispatch(fetchBookingSession(sessionContext.bookingId)).unwrap();
      const nextContext = {
        ...sessionContext,
        roomId: session.roomId,
        sessionStatus: session.sessionStatus,
      };

      setSessionContext(nextContext);
      saveActiveSessionRoom(nextContext);

      navigate(buildSessionRoomPath(session.roomId), {
        replace: true,
        state: {
          sessionContext: nextContext,
        },
      });

      dispatch(
        addToast({
          type: 'success',
          title: 'Session refreshed',
          message: 'The latest session status has been loaded.',
        }),
      );
    } catch (error) {
      dispatch(
        addToast({
          type: 'error',
          title: 'Refresh failed',
          message: getErrorMessage(error, 'Unable to refresh the session.'),
        }),
      );
    }
  };

  if (!effectiveRoomId) {
    return (
      <EmptyState
        title="No active session"
        description="Open a confirmed booking or confirmed request to enter the session room."
        action={
          <Link to="/bookings" className="button button--primary">
            Go to bookings
          </Link>
        }
      />
    );
  }

  if (sessionLookup.status === 'loading' && !sessionLookup.data && !bookingId && !effectiveRoomId) {
    return <Loader label="Opening your session room..." />;
  }

  return (
    <div className="stack-lg session-room">
      <section className="hero-card">
        <div>
          <p className="eyebrow">Live interview</p>
          <h1>Join session</h1>
          <p>Both interviewer and booked user can join this room from their dashboard.</p>
        </div>
        <div className="hero-card__actions">
          {sessionContext?.bookingId ? (
            <button type="button" className="button button--primary" onClick={refreshSession}>
              Refresh status
            </button>
          ) : null}
          {meetingUrl ? (
            <a
              href={meetingUrl}
              className="button button--ghost"
              target="_blank"
              rel="noreferrer"
            >
              Open in new tab
            </a>
          ) : null}
          <button type="button" className="button button--ghost" onClick={leaveSession}>
            Leave session
          </button>
        </div>
      </section>

      {meetingState.status === 'failed' ? (
        <ErrorBlock
          title="Unable to load the meeting"
          message={meetingState.error}
          action={
            <div className="button-row">
              <button
                type="button"
                className="button button--primary"
                onClick={() => {
                  setMeetingState({
                    status: 'idle',
                    error: '',
                  });
                  setMeetingRetryKey((current) => current + 1);
                }}
              >
                Retry
              </button>
              {meetingUrl ? (
                <a
                  href={meetingUrl}
                  className="button button--ghost"
                  target="_blank"
                  rel="noreferrer"
                >
                  Open in browser
                </a>
              ) : null}
            </div>
          }
        />
      ) : null}

      <section className="session-room__grid">
        <article className="card session-stage session-stage--live">
          <div className="card__header session-stage__header">
            <div>
              <p className="eyebrow">Meeting room</p>
              <h2>{sessionContext?.sessionStatus || sessionLookup.data?.sessionStatus || 'CREATED'}</h2>
            </div>
            <span className="badge">{effectiveRoomId}</span>
          </div>

          {meetingState.status === 'loading' ? (
            <Loader label="Loading Jitsi meeting..." />
          ) : null}

          <div ref={jitsiContainerRef} className="jitsi-container" />
        </article>

        <article className="card stack session-sidebar">
          <div>
            <p className="eyebrow">Participants</p>
            <h2>{counterpartLabel}</h2>
          </div>

          <div className="detail-tile">
            <strong>{sessionContext?.counterpartName || counterpartLabel}</strong>
            {sessionContext?.counterpartHeadline ? (
              <p>{sessionContext.counterpartHeadline}</p>
            ) : (
              <p>{counterpartLabel} details are available from the profile service.</p>
            )}
          </div>

          <div className="detail-tile">
            <strong>Your join code</strong>
            <p>{effectiveRoomId}</p>
          </div>

          <div className="detail-tile">
            <strong>Schedule</strong>
            <p>{utcRangeToLocalLabel(sessionContext?.startTimeUtc, sessionContext?.endTimeUtc)}</p>
          </div>

          <div className="inline-note">
            This room uses the shared Jitsi meeting for the confirmed booking.
          </div>
        </article>
      </section>
    </div>
  );
}
